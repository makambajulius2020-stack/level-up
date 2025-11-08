from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.models.payment import Payment
from app.models.user import User
from app import db
from app.services.payment_gateways import PaymentGatewayService
from app.services.workflow_triggers import get_workflow_trigger_service

payments_bp = Blueprint('payments', __name__)

# Initialize payment service
payment_service = PaymentGatewayService()

@payments_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    """Initiate payment through various gateways"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Validate required fields
    required_fields = ['amount', 'method']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'{field} is required'
            }), 400
    
    # Validate payment method
    valid_methods = ['mtn_momo', 'airtel_money', 'stripe', 'bank']
    if data['method'] not in valid_methods:
        return jsonify({
            'success': False,
            'message': f'Invalid payment method. Valid methods: {valid_methods}'
        }), 400
    
    # Validate amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            raise ValueError("Amount must be positive")
    except (ValueError, TypeError):
        return jsonify({
            'success': False,
            'message': 'Invalid amount'
        }), 400
    
    result = payment_service.initiate_payment(
        user_id=user_id,
        amount=amount,
        method=data['method'],
        student_id=data.get('student_id'),
        fee_type=data.get('fee_type', 'tuition'),
        description=data.get('description'),
        course_id=data.get('course_id'),  # For course enrollment
        metadata=data.get('metadata', {})  # Additional metadata
    )
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@payments_bp.route('/webhook/mtn', methods=['POST'])
def mtn_webhook():
    """Handle MTN MoMo webhook"""
    payload = request.get_json()
    signature = request.headers.get('X-Signature')
    
    result = payment_service.handle_webhook('mtn_momo', payload, signature)
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@payments_bp.route('/webhook/airtel', methods=['POST'])
def airtel_webhook():
    """Handle Airtel Money webhook"""
    payload = request.get_json()
    signature = request.headers.get('X-Signature')
    
    result = payment_service.handle_webhook('airtel_money', payload, signature)
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@payments_bp.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook"""
    payload = request.get_json()
    signature = request.headers.get('Stripe-Signature')
    
    result = payment_service.handle_webhook('stripe', payload, signature)
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def payment_history():
    """Get enhanced payment history for current user with advanced filtering"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        # Enhanced filtering options
        status = request.args.get('status')
        method = request.args.get('method')
        fee_type = request.args.get('fee_type')
        academic_year = request.args.get('academic_year')
        academic_term = request.args.get('academic_term')
        search = request.args.get('search')  # Search in reference, description
        
        query = Payment.query.filter_by(user_id=user_id)
        
        # Apply filters
        if status and status != 'all':
            query = query.filter_by(status=status)
        
        if method and method != 'all':
            if method == 'mtn':
                query = query.filter(Payment.method.like('%MTN%'))
            elif method == 'airtel':
                query = query.filter(Payment.method.like('%Airtel%'))
            elif method == 'bank':
                query = query.filter(Payment.method.like('%Bank%'))
            elif method == 'cash':
                query = query.filter(Payment.method.like('%Cash%'))
            else:
                query = query.filter_by(method=method)
        
        if fee_type and fee_type != 'all':
            query = query.filter_by(fee_type=fee_type)
            
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
            
        if academic_term and academic_term != 'all':
            query = query.filter_by(academic_term=academic_term)
        
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    Payment.gateway_reference.like(search_pattern),
                    Payment.description.like(search_pattern),
                    Payment.fee_type.like(search_pattern)
                )
            )
        
        payments = query.order_by(Payment.created_at.desc()).limit(limit).all()
        
        # Calculate analytics
        total_paid = sum(p.amount for p in payments if p.status == 'completed')
        total_pending = sum(p.amount for p in payments if p.status == 'pending')
        success_rate = (len([p for p in payments if p.status == 'completed']) / len(payments) * 100) if payments else 0
        
        # Group by payment method for analytics
        method_stats = {}
        for payment in payments:
            method = payment.method
            if method not in method_stats:
                method_stats[method] = {'count': 0, 'total_amount': 0}
            method_stats[method]['count'] += 1
            method_stats[method]['total_amount'] += payment.amount
        
        return jsonify({
            'success': True,
            'payments': [payment.to_dict() for payment in payments],
            'total_count': len(payments),
            'analytics': {
                'total_paid': total_paid,
                'total_pending': total_pending,
                'success_rate': round(success_rate, 2),
                'method_stats': method_stats,
                'filters_applied': {
                    'status': status,
                    'method': method,
                    'fee_type': fee_type,
                    'academic_year': academic_year,
                    'academic_term': academic_term,
                    'search': search
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching payment history',
            'error': str(e)
        }), 500

@payments_bp.route('/student/<student_id>', methods=['GET'])
@jwt_required()
def student_payment_history(student_id):
    """Get payment history for a specific student (for admin)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Check authorization (admin only)
        if current_user.role not in ['admin']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        # Get payments for the student
        payments = Payment.query.filter_by(student_id=student_id).order_by(
            Payment.created_at.desc()
        ).limit(100).all()
        
        return jsonify({
            'success': True,
            'student_id': student_id,
            'payments': [payment.to_dict() for payment in payments],
            'total_count': len(payments)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching student payment history',
            'error': str(e)
        }), 500

@payments_bp.route('/status/<payment_id>', methods=['GET'])
@jwt_required()
def payment_status(payment_id):
    """Get status of a specific payment"""
    try:
        user_id = get_jwt_identity()
        
        payment = Payment.query.filter_by(
            id=payment_id,
            user_id=user_id
        ).first()
        
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'payment': payment.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching payment status',
            'error': str(e)
        }), 500

@payments_bp.route('/bank-accounts', methods=['GET'])
@jwt_required()
def get_bank_accounts():
    """Get bank accounts for payments"""
    try:
        # TODO: Implement actual bank accounts from database
        # For now, return empty list or placeholder
        bank_accounts = []
        
        return jsonify({
            'success': True,
            'data': bank_accounts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching bank accounts',
            'error': str(e)
        }), 500

@payments_bp.route('/methods', methods=['GET'])
def payment_methods():
    """Get available payment methods and their configurations"""
    try:
        methods = [
            {
                'id': 'mtn_momo',
                'name': 'MTN Mobile Money',
                'description': 'Pay using MTN Mobile Money',
                'currency': 'UGX',
                'min_amount': 1000,
                'max_amount': 10000000,
                'fees': '1.5% + UGX 500',
                'processing_time': 'Instant'
            },
            {
                'id': 'airtel_money',
                'name': 'Airtel Money',
                'description': 'Pay using Airtel Money',
                'currency': 'UGX',
                'min_amount': 1000,
                'max_amount': 5000000,
                'fees': '1.2% + UGX 300',
                'processing_time': 'Instant'
            },
            {
                'id': 'stripe',
                'name': 'Credit/Debit Card',
                'description': 'Pay using Visa, Mastercard, or other cards',
                'currency': 'UGX',
                'min_amount': 5000,
                'max_amount': 50000000,
                'fees': '3.9% + UGX 150',
                'processing_time': 'Instant'
            },
            {
                'id': 'bank',
                'name': 'Bank Transfer',
                'description': 'Direct bank transfer',
                'currency': 'UGX',
                'min_amount': 10000,
                'max_amount': 100000000,
                'fees': 'Free',
                'processing_time': '1-2 business days'
            }
        ]
        
        return jsonify({
            'success': True,
            'payment_methods': methods
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching payment methods',
            'error': str(e)
        }), 500

@payments_bp.route('/summary', methods=['GET'])
@jwt_required()
def payment_summary():
    """Get payment summary for current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get payment statistics
        total_payments = Payment.query.filter_by(user_id=user_id).count()
        completed_payments = Payment.query.filter_by(
            user_id=user_id, 
            status='completed'
        ).count()
        
        # Calculate total amount paid
        completed_payment_records = Payment.query.filter_by(
            user_id=user_id,
            status='completed'
        ).all()
        
        total_amount_paid = sum(p.amount for p in completed_payment_records)
        
        # Get pending payments
        pending_payments = Payment.query.filter_by(
            user_id=user_id,
            status='pending'
        ).all()
        
        # Group by fee type
        fee_breakdown = {}
        for payment in completed_payment_records:
            fee_type = payment.fee_type or 'Other'
            if fee_type not in fee_breakdown:
                fee_breakdown[fee_type] = 0
            fee_breakdown[fee_type] += payment.amount
        
        return jsonify({
            'success': True,
            'summary': {
                'total_payments': total_payments,
                'completed_payments': completed_payments,
                'pending_payments': len(pending_payments),
                'total_amount_paid': total_amount_paid,
                'currency': 'UGX',
                'fee_breakdown': fee_breakdown,
                'recent_payments': [p.to_dict() for p in completed_payment_records[-5:]]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating payment summary',
            'error': str(e)
        }), 500

@payments_bp.route('/analytics', methods=['GET'])
@jwt_required()
def payment_analytics():
    """Get detailed payment analytics for current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get all payments for the user
        payments = Payment.query.filter_by(user_id=user_id).all()
        completed_payments = [p for p in payments if p.status == 'completed']
        
        if not payments:
            return jsonify({
                'success': True,
                'analytics': {
                    'total_spent': 0,
                    'average_payment': 0,
                    'payment_frequency': 'No payments',
                    'preferred_method': 'None',
                    'success_rate': 100,
                    'total_transactions': 0,
                    'monthly_trends': {}
                }
            })
        
        # Calculate analytics
        total_spent = sum(p.amount for p in completed_payments)
        average_payment = total_spent / len(completed_payments) if completed_payments else 0
        success_rate = (len(completed_payments) / len(payments) * 100)
        
        # Find preferred payment method
        method_counts = {}
        for payment in completed_payments:
            method_counts[payment.method] = method_counts.get(payment.method, 0) + 1
        preferred_method = max(method_counts.items(), key=lambda x: x[1])[0] if method_counts else 'None'
        
        # Monthly trends (last 12 months)
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)
        recent_payments = [p for p in completed_payments if p.completed_at and p.completed_at >= twelve_months_ago]
        
        monthly_trends = {}
        for payment in recent_payments:
            month_key = payment.completed_at.strftime('%Y-%m')
            monthly_trends[month_key] = monthly_trends.get(month_key, 0) + payment.amount
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_spent': total_spent,
                'average_payment': round(average_payment, 2),
                'preferred_method': preferred_method,
                'success_rate': round(success_rate, 2),
                'total_transactions': len(payments),
                'successful_transactions': len(completed_payments),
                'monthly_trends': monthly_trends
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating payment analytics',
            'error': str(e)
        }), 500

@payments_bp.route('/receipt/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_receipt(payment_id):
    """Generate payment receipt"""
    try:
        user_id = get_jwt_identity()
        
        payment = Payment.query.filter_by(id=payment_id, user_id=user_id).first()
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Payment not found'
            }), 404
        
        user = User.query.get(user_id)
        
        receipt = {
            'receipt_number': payment.receipt_number or f'RCP{payment.id:06d}',
            'payment_id': payment.id,
            'student_info': {
                'name': user.full_name if user else 'Unknown',
                'student_id': user_id,
                'email': user.email if user else '',
                'phone': user.phone if user else ''
            },
            'payment_details': {
                'amount': payment.amount,
                'currency': payment.currency,
                'method': payment.method,
                'status': payment.status,
                'fee_type': payment.fee_type,
                'academic_term': payment.academic_term,
                'academic_year': payment.academic_year,
                'description': payment.description,
                'transaction_id': payment.gateway_transaction_id,
                'reference': payment.gateway_reference
            },
            'dates': {
                'initiated_at': payment.initiated_at.isoformat(),
                'completed_at': payment.completed_at.isoformat() if payment.completed_at else None
            },
            'school_info': {
                'name': 'Smart School Uganda',
                'address': 'Kampala, Uganda',
                'phone': '+256700000000',
                'email': 'info@smartschool.ug'
            },
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'receipt': receipt
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating receipt',
            'error': str(e)
        }), 500

@payments_bp.route('/download-statement/<int:statement_id>', methods=['GET'])
@jwt_required()
def download_statement(statement_id):
    """Download fee statement as PDF"""
    try:
        from app.models.fee_structure import FeeStatement
        from flask import make_response
        import io
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        statement = FeeStatement.query.get(statement_id)
        if not statement:
            return jsonify({'success': False, 'message': 'Statement not found'}), 404
        
        # Check authorization
        if user.role == 'student' and statement.student_id != current_user_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        # Create PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "Fee Statement")
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 80, f"Statement Number: {statement.statement_number}")
        p.drawString(50, height - 100, f"Student ID: {statement.student_id}")
        p.drawString(50, height - 120, f"Academic Year: {statement.academic_year}")
        p.drawString(50, height - 140, f"Semester: {statement.semester}")
        p.drawString(50, height - 160, f"Total Amount: {statement.total_amount}")
        p.drawString(50, height - 180, f"Status: {statement.status}")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        
        response = make_response(buffer.read())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=statement_{statement.statement_number}.pdf'
        
        return response
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating PDF',
            'error': str(e)
        }), 500

@payments_bp.route('/export', methods=['GET'])
@jwt_required()
def export_payment_history():
    """Export payment history in CSV format"""
    try:
        user_id = get_jwt_identity()
        format_type = request.args.get('format', 'csv')
        
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.created_at.desc()).all()
        
        if format_type == 'csv':
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            headers = ['Date', 'Amount', 'Currency', 'Method', 'Fee Type', 'Status', 'Reference', 'Academic Term']
            writer.writerow(headers)
            
            # Write data
            for payment in payments:
                row = [
                    payment.initiated_at.strftime('%Y-%m-%d'),
                    payment.amount,
                    payment.currency,
                    payment.method,
                    payment.fee_type or '',
                    payment.status,
                    payment.gateway_reference or '',
                    f"{payment.academic_year} - {payment.academic_term}" if payment.academic_year else ''
                ]
                writer.writerow(row)
            
            csv_content = output.getvalue()
            output.close()
            
            from flask import make_response
            response = make_response(csv_content)
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] = f'attachment; filename=payment_history_{user_id}_{datetime.utcnow().strftime("%Y%m%d")}.csv'
            return response
        
        else:
            # JSON export
            return jsonify({
                'success': True,
                'format': 'json',
                'payments': [payment.to_dict() for payment in payments],
                'exported_at': datetime.utcnow().isoformat()
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error exporting payment history',
            'error': str(e)
        }), 500

# Legacy endpoint for backward compatibility
@payments_bp.route('/pay', methods=['POST'])
@jwt_required()
def pay():
    """Legacy payment endpoint"""
    data = request.get_json()
    
    # Redirect to new initiate endpoint
    return initiate_payment()
