from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.enhanced_payment_service import EnhancedPaymentService
from app.utils.decorators import role_required

enhanced_payments_bp = Blueprint('enhanced_payments', __name__)
payment_service = EnhancedPaymentService()

@enhanced_payments_bp.route('/student/history', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_student_payment_history():
    """Get comprehensive payment history for a student"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get student ID from query params or use current user
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        # Build filters from query parameters
        filters = {}
        
        if request.args.get('academic_year'):
            filters['academic_year'] = request.args.get('academic_year')
        if request.args.get('academic_term'):
            filters['academic_term'] = request.args.get('academic_term')
        if request.args.get('fee_type'):
            filters['fee_type'] = request.args.get('fee_type')
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        if request.args.get('method'):
            filters['method'] = request.args.get('method')
        if request.args.get('start_date'):
            filters['start_date'] = request.args.get('start_date')
        if request.args.get('end_date'):
            filters['end_date'] = request.args.get('end_date')
        
        result = payment_service.get_student_payment_history(student_id, filters)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/analytics', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_payment_analytics():
    """Get payment analytics for student dashboard"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        result = payment_service.get_payment_analytics(student_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/receipt/<int:payment_id>', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_payment_receipt(payment_id):
    """Get detailed payment receipt"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        result = payment_service.get_payment_receipt(payment_id, student_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/export', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def export_payment_history():
    """Export payment history in various formats"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        format_type = request.args.get('format', 'json')
        
        result = payment_service.export_payment_history(student_id, format_type)
        
        if result['success']:
            if format_type == 'csv':
                response = make_response(result['content'])
                response.headers['Content-Type'] = 'text/csv'
                response.headers['Content-Disposition'] = f'attachment; filename={result["filename"]}'
                return response
            else:
                return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/reminders', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_payment_reminders():
    """Get upcoming payment reminders"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        result = payment_service.get_payment_reminders(student_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/outstanding', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_outstanding_fees():
    """Get outstanding fees for student"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        # Get payment history which includes outstanding fees
        result = payment_service.get_student_payment_history(student_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'outstanding_fees': result['outstanding_fees']
            }), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/methods/available', methods=['GET'])
@jwt_required()
def get_available_payment_methods():
    """Get available payment methods for student"""
    try:
        # Return available payment methods in Uganda
        methods = [
            {
                'id': 'mtn_momo',
                'name': 'MTN Mobile Money',
                'description': 'Pay using MTN Mobile Money',
                'icon': 'phone',
                'min_amount': 1000,
                'max_amount': 5000000,
                'currency': 'UGX',
                'is_active': True,
                'processing_fee': 0.02  # 2%
            },
            {
                'id': 'airtel_money',
                'name': 'Airtel Money',
                'description': 'Pay using Airtel Money',
                'icon': 'phone',
                'min_amount': 1000,
                'max_amount': 3000000,
                'currency': 'UGX',
                'is_active': True,
                'processing_fee': 0.02  # 2%
            },
            {
                'id': 'stripe',
                'name': 'Credit/Debit Card',
                'description': 'Pay using Visa, Mastercard',
                'icon': 'credit-card',
                'min_amount': 1000,
                'max_amount': 10000000,
                'currency': 'UGX',
                'is_active': True,
                'processing_fee': 0.035  # 3.5%
            },
            {
                'id': 'bank_transfer',
                'name': 'Bank Transfer',
                'description': 'Direct bank transfer',
                'icon': 'bank',
                'min_amount': 10000,
                'max_amount': 50000000,
                'currency': 'UGX',
                'is_active': True,
                'processing_fee': 0.01  # 1%
            }
        ]
        
        return jsonify({
            'success': True,
            'payment_methods': methods
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_payments_bp.route('/student/summary', methods=['GET'])
@jwt_required()
@role_required(['student', 'admin'])
def get_payment_summary():
    """Get payment summary for student dashboard"""
    try:
        current_user_id = get_jwt_identity()
        student_id = request.args.get('student_id', current_user_id, type=int)
        
        # Get payment history and analytics
        history_result = payment_service.get_student_payment_history(student_id)
        analytics_result = payment_service.get_payment_analytics(student_id)
        reminders_result = payment_service.get_payment_reminders(student_id)
        
        if history_result['success'] and analytics_result['success']:
            summary = {
                'success': True,
                'summary': {
                    'total_paid_this_year': history_result['summary']['total_paid'],
                    'pending_payments': history_result['summary']['total_pending'],
                    'outstanding_fees': history_result['outstanding_fees']['total_outstanding'],
                    'payment_success_rate': history_result['summary']['payment_success_rate'],
                    'preferred_method': analytics_result['analytics']['preferred_method'],
                    'upcoming_reminders': reminders_result.get('total_upcoming', 0) if reminders_result['success'] else 0,
                    'recent_payments': analytics_result['analytics']['recent_activity'][:3],  # Last 3 payments
                    'monthly_trend': analytics_result['analytics']['monthly_spending_trend']
                }
            }
            
            return jsonify(summary), 200
        else:
            return jsonify({'success': False, 'error': 'Failed to get payment summary'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
