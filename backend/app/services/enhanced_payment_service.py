from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import Payment, PaymentGatewayConfig, User, FeeStructure
from app.services.notification_service import NotificationService
from app.services.n8n_service import N8NService

class EnhancedPaymentService:
    def __init__(self):
        self.notification_service = NotificationService()
        self.n8n_service = N8NService()

    def get_student_payment_history(self, student_id: int, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get comprehensive payment history for a student"""
        try:
            query = Payment.query.filter_by(user_id=student_id)
            
            # Apply filters
            if filters:
                if filters.get('academic_year'):
                    query = query.filter_by(academic_year=filters['academic_year'])
                if filters.get('academic_term'):
                    query = query.filter_by(academic_term=filters['academic_term'])
                if filters.get('fee_type'):
                    query = query.filter_by(fee_type=filters['fee_type'])
                if filters.get('status'):
                    query = query.filter_by(status=filters['status'])
                if filters.get('method'):
                    query = query.filter_by(method=filters['method'])
                
                # Date range filter
                if filters.get('start_date'):
                    start_date = datetime.fromisoformat(filters['start_date'])
                    query = query.filter(Payment.initiated_at >= start_date)
                if filters.get('end_date'):
                    end_date = datetime.fromisoformat(filters['end_date'])
                    query = query.filter(Payment.initiated_at <= end_date)
            
            payments = query.order_by(desc(Payment.initiated_at)).all()
            
            # Calculate statistics
            total_paid = sum(p.amount for p in payments if p.status == 'completed')
            total_pending = sum(p.amount for p in payments if p.status == 'pending')
            total_failed = sum(p.amount for p in payments if p.status == 'failed')
            
            # Group by fee type
            fee_type_summary = {}
            for payment in payments:
                fee_type = payment.fee_type or 'Other'
                if fee_type not in fee_type_summary:
                    fee_type_summary[fee_type] = {
                        'total_amount': 0,
                        'paid_amount': 0,
                        'pending_amount': 0,
                        'payment_count': 0
                    }
                
                fee_type_summary[fee_type]['total_amount'] += payment.amount
                fee_type_summary[fee_type]['payment_count'] += 1
                
                if payment.status == 'completed':
                    fee_type_summary[fee_type]['paid_amount'] += payment.amount
                elif payment.status == 'pending':
                    fee_type_summary[fee_type]['pending_amount'] += payment.amount
            
            # Group by academic term
            term_summary = {}
            for payment in payments:
                term_key = f"{payment.academic_year} - {payment.academic_term}"
                if term_key not in term_summary:
                    term_summary[term_key] = {
                        'total_amount': 0,
                        'paid_amount': 0,
                        'pending_amount': 0,
                        'payment_count': 0
                    }
                
                term_summary[term_key]['total_amount'] += payment.amount
                term_summary[term_key]['payment_count'] += 1
                
                if payment.status == 'completed':
                    term_summary[term_key]['paid_amount'] += payment.amount
                elif payment.status == 'pending':
                    term_summary[term_key]['pending_amount'] += payment.amount
            
            # Payment method analysis
            method_summary = {}
            for payment in payments:
                method = payment.method
                if method not in method_summary:
                    method_summary[method] = {
                        'count': 0,
                        'total_amount': 0,
                        'success_rate': 0
                    }
                
                method_summary[method]['count'] += 1
                method_summary[method]['total_amount'] += payment.amount
            
            # Calculate success rates
            for method in method_summary:
                method_payments = [p for p in payments if p.method == method]
                successful = len([p for p in method_payments if p.status == 'completed'])
                method_summary[method]['success_rate'] = (successful / len(method_payments)) * 100 if method_payments else 0
            
            # Recent payment trends (last 6 months)
            six_months_ago = datetime.utcnow() - timedelta(days=180)
            recent_payments = [p for p in payments if p.initiated_at >= six_months_ago]
            
            monthly_trends = {}
            for payment in recent_payments:
                month_key = payment.initiated_at.strftime('%Y-%m')
                if month_key not in monthly_trends:
                    monthly_trends[month_key] = {
                        'total_amount': 0,
                        'payment_count': 0,
                        'completed_amount': 0
                    }
                
                monthly_trends[month_key]['total_amount'] += payment.amount
                monthly_trends[month_key]['payment_count'] += 1
                
                if payment.status == 'completed':
                    monthly_trends[month_key]['completed_amount'] += payment.amount
            
            # Outstanding fees calculation
            outstanding_fees = self._calculate_outstanding_fees(student_id)
            
            return {
                'success': True,
                'payments': [payment.to_dict() for payment in payments],
                'summary': {
                    'total_payments': len(payments),
                    'total_paid': total_paid,
                    'total_pending': total_pending,
                    'total_failed': total_failed,
                    'payment_success_rate': (len([p for p in payments if p.status == 'completed']) / len(payments) * 100) if payments else 0
                },
                'fee_type_summary': fee_type_summary,
                'term_summary': term_summary,
                'method_summary': method_summary,
                'monthly_trends': monthly_trends,
                'outstanding_fees': outstanding_fees,
                'filters_applied': filters or {}
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _calculate_outstanding_fees(self, student_id: int) -> Dict[str, Any]:
        """Calculate outstanding fees for a student"""
        try:
            # Get current academic year and term
            current_year = "2024"
            current_term = "Term 1"
            
            # Get all fee structures for the student's class
            student = User.query.get(student_id)
            if not student:
                return {'total_outstanding': 0, 'breakdown': []}
            
            # Get fee structures (this would need to be implemented based on your fee structure model)
            # TODO: Implement actual fee structure query
            outstanding_fees = {
                'total_outstanding': 0,
                'breakdown': []
            }
            
            outstanding_fees['total_outstanding'] = sum(item['outstanding'] for item in outstanding_fees['breakdown'])
            
            return outstanding_fees
            
        except Exception as e:
            return {'total_outstanding': 0, 'breakdown': [], 'error': str(e)}

    def get_payment_receipt(self, payment_id: int, student_id: int) -> Dict[str, Any]:
        """Generate detailed payment receipt"""
        try:
            payment = Payment.query.filter_by(id=payment_id, user_id=student_id).first()
            
            if not payment:
                return {'success': False, 'error': 'Payment not found'}
            
            student = User.query.get(student_id)
            
            receipt_data = {
                'receipt_number': payment.receipt_number,
                'payment_id': payment.id,
                'student_info': {
                    'name': student.full_name if student else 'Unknown',
                    'student_id': student_id,
                    'email': student.email if student else '',
                    'phone': student.phone if student else ''
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
                    'transaction_id': payment.gateway_transaction_id
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
            
            return {
                'success': True,
                'receipt': receipt_data
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_payment_analytics(self, student_id: int) -> Dict[str, Any]:
        """Get payment analytics for student dashboard"""
        try:
            # Get all payments for the student
            payments = Payment.query.filter_by(user_id=student_id).all()
            
            if not payments:
                return {
                    'success': True,
                    'analytics': {
                        'total_spent': 0,
                        'average_payment': 0,
                        'payment_frequency': 'No payments',
                        'preferred_method': 'None',
                        'on_time_percentage': 100,
                        'recent_activity': []
                    }
                }
            
            # Calculate analytics
            total_spent = sum(p.amount for p in payments if p.status == 'completed')
            completed_payments = [p for p in payments if p.status == 'completed']
            average_payment = total_spent / len(completed_payments) if completed_payments else 0
            
            # Payment frequency analysis
            if len(completed_payments) > 1:
                date_diffs = []
                sorted_payments = sorted(completed_payments, key=lambda x: x.completed_at)
                for i in range(1, len(sorted_payments)):
                    diff = (sorted_payments[i].completed_at - sorted_payments[i-1].completed_at).days
                    date_diffs.append(diff)
                
                avg_frequency = sum(date_diffs) / len(date_diffs)
                if avg_frequency <= 30:
                    frequency = 'Monthly'
                elif avg_frequency <= 90:
                    frequency = 'Quarterly'
                else:
                    frequency = 'Irregular'
            else:
                frequency = 'Insufficient data'
            
            # Preferred payment method
            method_counts = {}
            for payment in completed_payments:
                method_counts[payment.method] = method_counts.get(payment.method, 0) + 1
            
            preferred_method = max(method_counts.items(), key=lambda x: x[1])[0] if method_counts else 'None'
            
            # Recent activity (last 5 payments)
            recent_payments = sorted(payments, key=lambda x: x.initiated_at, reverse=True)[:5]
            recent_activity = []
            
            for payment in recent_payments:
                activity = {
                    'date': payment.initiated_at.strftime('%Y-%m-%d'),
                    'amount': payment.amount,
                    'fee_type': payment.fee_type,
                    'status': payment.status,
                    'method': payment.method
                }
                recent_activity.append(activity)
            
            # Payment trends (last 12 months)
            twelve_months_ago = datetime.utcnow() - timedelta(days=365)
            recent_payments_trend = [p for p in payments if p.initiated_at >= twelve_months_ago]
            
            monthly_spending = {}
            for payment in recent_payments_trend:
                if payment.status == 'completed':
                    month_key = payment.completed_at.strftime('%Y-%m')
                    monthly_spending[month_key] = monthly_spending.get(month_key, 0) + payment.amount
            
            return {
                'success': True,
                'analytics': {
                    'total_spent': total_spent,
                    'average_payment': round(average_payment, 2),
                    'payment_frequency': frequency,
                    'preferred_method': preferred_method,
                    'total_transactions': len(payments),
                    'successful_transactions': len(completed_payments),
                    'success_rate': (len(completed_payments) / len(payments) * 100) if payments else 0,
                    'recent_activity': recent_activity,
                    'monthly_spending_trend': monthly_spending
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def export_payment_history(self, student_id: int, format_type: str = 'json') -> Dict[str, Any]:
        """Export payment history in various formats"""
        try:
            payment_history = self.get_student_payment_history(student_id)
            
            if not payment_history['success']:
                return payment_history
            
            if format_type == 'csv':
                # Convert to CSV format
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write headers
                headers = ['Date', 'Receipt Number', 'Fee Type', 'Amount', 'Currency', 'Method', 'Status', 'Academic Term']
                writer.writerow(headers)
                
                # Write data
                for payment in payment_history['payments']:
                    row = [
                        payment['initiated_at'][:10],  # Date only
                        payment['receipt_number'] or '',
                        payment['fee_type'] or '',
                        payment['amount'],
                        payment['currency'],
                        payment['method'],
                        payment['status'],
                        f"{payment['academic_year']} - {payment['academic_term']}"
                    ]
                    writer.writerow(row)
                
                csv_content = output.getvalue()
                output.close()
                
                return {
                    'success': True,
                    'format': 'csv',
                    'content': csv_content,
                    'filename': f'payment_history_{student_id}_{datetime.now().strftime("%Y%m%d")}.csv'
                }
            
            else:  # JSON format
                return {
                    'success': True,
                    'format': 'json',
                    'content': payment_history,
                    'filename': f'payment_history_{student_id}_{datetime.now().strftime("%Y%m%d")}.json'
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_payment_reminders(self, student_id: int) -> Dict[str, Any]:
        """Get upcoming payment reminders for student"""
        try:
            # This would integrate with fee structure to get upcoming dues
            # TODO: Implement actual payment reminder query from fee structure
            
            reminders = []
            
            return {
                'success': True,
                'reminders': reminders,
                'total_upcoming': 0,
                'total_amount_due': 0
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
