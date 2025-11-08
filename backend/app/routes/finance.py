from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.payment import Payment
from app.models.expenses import Expense
from app.models.fee_structure import FeeStatement
from app.models.user import User
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_

finance_bp = Blueprint('finance', __name__)

@finance_bp.route('/finance/dashboard', methods=['GET'])
@jwt_required()
def get_finance_dashboard():
    """Get finance dashboard data"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Get date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Calculate date range (default to current month)
        if not start_date:
            start_date = datetime.utcnow().replace(day=1).date()
        else:
            start_date = datetime.fromisoformat(start_date).date()
        
        if not end_date:
            end_date = datetime.utcnow().date()
        else:
            end_date = datetime.fromisoformat(end_date).date()
        
        # Revenue statistics
        revenue_query = Payment.query.filter(
            and_(
                Payment.status == 'completed',
                func.date(Payment.created_at) >= start_date,
                func.date(Payment.created_at) <= end_date
            )
        )
        
        total_revenue = revenue_query.with_entities(func.sum(Payment.amount)).scalar() or 0
        
        # Expense statistics (if Expense model exists)
        total_expenses = 0
        if Expense:
            expense_query = Expense.query.filter(
                and_(
                    func.date(Expense.date) >= start_date,
                    func.date(Expense.date) <= end_date
                )
            )
            total_expenses = expense_query.with_entities(func.sum(Expense.amount)).scalar() or 0
        
        # Profit/Loss
        profit_loss = float(total_revenue) - float(total_expenses)
        
        # Payment methods breakdown
        payment_methods = db.session.query(
            Payment.method,
            func.sum(Payment.amount).label('total')
        ).filter(
            and_(
                Payment.status == 'completed',
                func.date(Payment.created_at) >= start_date,
                func.date(Payment.created_at) <= end_date
            )
        ).group_by(Payment.method).all()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'revenue': {
                    'total': float(total_revenue),
                    'currency': 'UGX'
                },
                'expenses': {
                    'total': float(total_expenses),
                    'currency': 'UGX'
                },
                'profit_loss': {
                    'amount': profit_loss,
                    'currency': 'UGX',
                    'type': 'profit' if profit_loss >= 0 else 'loss'
                },
                'payment_methods': [
                    {
                        'method': method,
                        'total': float(total),
                        'percentage': round((float(total) / float(total_revenue) * 100) if total_revenue > 0 else 0, 2)
                    }
                    for method, total in payment_methods
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@finance_bp.route('/financial/profits-losses', methods=['GET'])
@jwt_required()
def get_profits_losses():
    """Get profit and loss data"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Get date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        period = request.args.get('period', 'month')  # month, quarter, year
        
        # Calculate date range
        end_date_obj = datetime.fromisoformat(end_date).date() if end_date else datetime.utcnow().date()
        
        if period == 'month':
            start_date_obj = end_date_obj.replace(day=1)
        elif period == 'quarter':
            quarter_month = ((end_date_obj.month - 1) // 3) * 3 + 1
            start_date_obj = end_date_obj.replace(month=quarter_month, day=1)
        else:  # year
            start_date_obj = end_date_obj.replace(month=1, day=1)
        
        if start_date:
            start_date_obj = datetime.fromisoformat(start_date).date()
        
        # Revenue
        revenue = db.session.query(
            func.sum(Payment.amount).label('total')
        ).filter(
            and_(
                Payment.status == 'completed',
                func.date(Payment.created_at) >= start_date_obj,
                func.date(Payment.created_at) <= end_date_obj
            )
        ).scalar() or 0
        
        # Expenses (if Expense model exists)
        expenses = 0
        if Expense:
            expenses = db.session.query(
                func.sum(Expense.amount).label('total')
            ).filter(
                and_(
                    func.date(Expense.date) >= start_date_obj,
                    func.date(Expense.date) <= end_date_obj
                )
            ).scalar() or 0
        
        # Profit/Loss
        profit_loss = float(revenue) - float(expenses)
        
        return jsonify({
            'success': True,
            'period': {
                'start_date': start_date_obj.isoformat(),
                'end_date': end_date_obj.isoformat(),
                'type': period
            },
            'revenue': float(revenue),
            'expenses': float(expenses),
            'profit_loss': profit_loss,
            'profit_loss_percentage': round((profit_loss / float(revenue) * 100) if revenue > 0 else 0, 2)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@finance_bp.route('/financial/tax-management', methods=['GET'])
@jwt_required()
def get_tax_management():
    """Get tax management data"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        
        # Get date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        tax_rate = float(request.args.get('tax_rate', 0.18))  # Default 18% VAT
        
        # Calculate date range
        end_date_obj = datetime.fromisoformat(end_date).date() if end_date else datetime.utcnow().date()
        start_date_obj = datetime.fromisoformat(start_date).date() if start_date else end_date_obj.replace(day=1)
        
        # Get taxable revenue
        taxable_revenue = db.session.query(
            func.sum(Payment.amount).label('total')
        ).filter(
            and_(
                Payment.status == 'completed',
                func.date(Payment.created_at) >= start_date_obj,
                func.date(Payment.created_at) <= end_date_obj
            )
        ).scalar() or 0
        
        # Calculate tax
        tax_amount = float(taxable_revenue) * tax_rate
        revenue_after_tax = float(taxable_revenue) - tax_amount
        
        # Get expenses (may be tax-deductible) - if Expense model exists
        expenses = 0
        if Expense:
            expenses = db.session.query(
                func.sum(Expense.amount).label('total')
            ).filter(
                and_(
                    func.date(Expense.date) >= start_date_obj,
                    func.date(Expense.date) <= end_date_obj
                )
            ).scalar() or 0
        
        # Net profit after tax
        net_profit = revenue_after_tax - float(expenses)
        
        return jsonify({
            'success': True,
            'period': {
                'start_date': start_date_obj.isoformat(),
                'end_date': end_date_obj.isoformat()
            },
            'tax_settings': {
                'tax_rate': tax_rate,
                'tax_type': 'VAT'
            },
            'revenue': {
                'gross': float(taxable_revenue),
                'tax_amount': tax_amount,
                'after_tax': revenue_after_tax
            },
            'expenses': float(expenses),
            'net_profit': net_profit,
            'tax_liability': tax_amount
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

