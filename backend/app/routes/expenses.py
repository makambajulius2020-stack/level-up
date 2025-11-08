from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.expenses import Expense
from app.models.user import User
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func, extract

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    """Get all expenses with filtering"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get query parameters
        category = request.args.get('category', 'all')
        status = request.args.get('status', 'all')
        department = request.args.get('department')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Build query
        query = Expense.query
        
        # Filter by category
        if category != 'all':
            query = query.filter_by(category=category)
            
        # Filter by status
        if status != 'all':
            query = query.filter_by(status=status)
            
        # Filter by department
        if department:
            query = query.filter_by(department=department)
            
        # Filter by date range
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Expense.date >= start_dt)
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Expense.date <= end_dt)
            
        # Order by date (newest first)
        query = query.order_by(Expense.date.desc())
        
        # Paginate
        expenses = query.paginate(page=page, per_page=per_page, error_out=False)
        
        expenses_data = []
        for expense in expenses.items:
            expenses_data.append({
                'id': expense.id,
                'description': expense.description,
                'category': expense.category,
                'amount': float(expense.amount),
                'date': expense.date.isoformat() if expense.date else None,
                'payment_method': expense.payment_method,
                'vendor': expense.vendor,
                'department': expense.department,
                'receipt_number': expense.receipt_number,
                'status': expense.status,
                'approved_by': expense.approved_by,
                'created_at': expense.created_at.isoformat() if expense.created_at else None
            })
            
        return jsonify({
            'success': True,
            'expenses': expenses_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': expenses.total,
                'pages': expenses.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses', methods=['POST'])
@jwt_required()
def create_expense():
    """Create a new expense"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['description', 'category', 'amount', 'date', 'vendor', 'department']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Parse date
        try:
            expense_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
            
        # Generate receipt number if not provided
        receipt_number = data.get('receipt_number')
        if not receipt_number:
            receipt_number = f"RCP-{datetime.now().year}-{Expense.query.count() + 1:03d}"
            
        # Create expense
        expense = Expense(
            description=data['description'],
            category=data['category'],
            amount=data['amount'],
            date=expense_date,
            payment_method=data.get('payment_method', 'Bank Transfer'),
            vendor=data['vendor'],
            department=data['department'],
            receipt_number=receipt_number,
            status='pending',
            approved_by=user.first_name + ' ' + user.last_name if hasattr(user, 'first_name') else user.email,
            created_by=current_user_id
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Expense created successfully',
            'expense': {
                'id': expense.id,
                'description': expense.description,
                'category': expense.category,
                'amount': float(expense.amount),
                'receipt_number': expense.receipt_number,
                'status': expense.status
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    """Update an expense"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
            
        data = request.get_json()
        
        # Update fields
        if 'description' in data:
            expense.description = data['description']
        if 'category' in data:
            expense.category = data['category']
        if 'amount' in data:
            expense.amount = data['amount']
        if 'date' in data:
            expense.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
        if 'payment_method' in data:
            expense.payment_method = data['payment_method']
        if 'vendor' in data:
            expense.vendor = data['vendor']
        if 'department' in data:
            expense.department = data['department']
        if 'receipt_number' in data:
            expense.receipt_number = data['receipt_number']
        if 'status' in data:
            expense.status = data['status']
            
        expense.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Expense updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    """Delete an expense"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
            
        # Check if expense is already paid (optional business rule)
        if expense.status == 'paid':
            return jsonify({'error': 'Cannot delete paid expense'}), 400
            
        db.session.delete(expense)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Expense deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/categories', methods=['GET'])
@jwt_required()
def get_expense_categories():
    """Get all expense categories"""
    try:
        categories = [
            'Salaries',
            'Equipment',
            'Utilities',
            'Maintenance',
            'Educational Materials',
            'Transport',
            'Administration',
            'Other'
        ]
        
        return jsonify({
            'success': True,
            'categories': categories
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/statistics', methods=['GET'])
@jwt_required()
def get_expense_statistics():
    """Get expense statistics"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get current month and year
        current_date = datetime.utcnow()
        current_month = current_date.month
        current_year = current_date.year
        
        # Total expenses
        total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0
        
        # Paid expenses
        paid_expenses = db.session.query(func.sum(Expense.amount)).filter_by(status='paid').scalar() or 0
        
        # Pending expenses
        pending_expenses = db.session.query(func.sum(Expense.amount)).filter(
            Expense.status.in_(['pending', 'approved'])
        ).scalar() or 0
        
        # Current month expenses
        current_month_expenses = db.session.query(func.sum(Expense.amount)).filter(
            extract('month', Expense.date) == current_month,
            extract('year', Expense.date) == current_year
        ).scalar() or 0
        
        # Last month expenses
        last_month = current_month - 1 if current_month > 1 else 12
        last_month_year = current_year if current_month > 1 else current_year - 1
        
        last_month_expenses = db.session.query(func.sum(Expense.amount)).filter(
            extract('month', Expense.date) == last_month,
            extract('year', Expense.date) == last_month_year
        ).scalar() or 0
        
        # Calculate monthly change
        monthly_change = 0
        if last_month_expenses > 0:
            monthly_change = ((current_month_expenses - last_month_expenses) / last_month_expenses) * 100
            
        # Category breakdown
        category_stats = db.session.query(
            Expense.category,
            func.sum(Expense.amount),
            func.count(Expense.id)
        ).group_by(Expense.category).all()
        
        category_data = {}
        for category, total, count in category_stats:
            category_data[category] = {
                'total': float(total),
                'count': count
            }
            
        # Status breakdown
        status_stats = db.session.query(
            Expense.status,
            func.count(Expense.id)
        ).group_by(Expense.status).all()
        
        status_data = {status: count for status, count in status_stats}
        
        # Department breakdown
        department_stats = db.session.query(
            Expense.department,
            func.sum(Expense.amount)
        ).group_by(Expense.department).all()
        
        department_data = {}
        for department, total in department_stats:
            department_data[department] = float(total)
            
        return jsonify({
            'success': True,
            'statistics': {
                'total_expenses': float(total_expenses),
                'paid_expenses': float(paid_expenses),
                'pending_expenses': float(pending_expenses),
                'current_month_expenses': float(current_month_expenses),
                'monthly_change': round(monthly_change, 2),
                'category_breakdown': category_data,
                'status_breakdown': status_data,
                'department_breakdown': department_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/monthly-report', methods=['GET'])
@jwt_required()
def get_monthly_report():
    """Get monthly expense report"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get query parameters
        year = int(request.args.get('year', datetime.utcnow().year))
        
        # Get monthly data for the year
        monthly_data = []
        
        for month in range(1, 13):
            month_total = db.session.query(func.sum(Expense.amount)).filter(
                extract('month', Expense.date) == month,
                extract('year', Expense.date) == year
            ).scalar() or 0
            
            month_count = db.session.query(func.count(Expense.id)).filter(
                extract('month', Expense.date) == month,
                extract('year', Expense.date) == year
            ).scalar() or 0
            
            monthly_data.append({
                'month': month,
                'month_name': datetime(year, month, 1).strftime('%B'),
                'total_amount': float(month_total),
                'expense_count': month_count
            })
            
        return jsonify({
            'success': True,
            'year': year,
            'monthly_report': monthly_data,
            'yearly_total': sum(month['total_amount'] for month in monthly_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/approve/<int:expense_id>', methods=['POST'])
@jwt_required()
def approve_expense(expense_id):
    """Approve an expense"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
            
        if expense.status != 'pending':
            return jsonify({'error': 'Only pending expenses can be approved'}), 400
            
        expense.status = 'approved'
        expense.approved_by = user.first_name + ' ' + user.last_name if hasattr(user, 'first_name') else user.email
        expense.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Expense approved successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@expenses_bp.route('/expenses/reject/<int:expense_id>', methods=['POST'])
@jwt_required()
def reject_expense(expense_id):
    """Reject an expense"""
    try:
        current_user_id = get_jwt_identity()['id']
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        expense = Expense.query.get(expense_id)
        if not expense:
            return jsonify({'error': 'Expense not found'}), 404
            
        if expense.status not in ['pending', 'approved']:
            return jsonify({'error': 'Cannot reject paid expense'}), 400
            
        expense.status = 'rejected'
        expense.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Expense rejected successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
