from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.invoices import Invoice, InvoiceItem
from app.models.user import User
from app import db
from datetime import datetime, timedelta
import uuid

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    """Get all invoices with filtering"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get query parameters
        status = request.args.get('status', 'all')
        student_id = request.args.get('student_id')
        semester = request.args.get('semester')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Build query
        query = Invoice.query
        
        # Filter by student if provided
        if student_id:
            query = query.filter_by(student_id=student_id)
            
        # Filter by status
        if status != 'all':
            query = query.filter_by(status=status)
            
        # Filter by semester
        if semester:
            query = query.filter_by(semester=semester)
            
        # Order by issue date (newest first)
        query = query.order_by(Invoice.issue_date.desc())
        
        # Paginate
        invoices = query.paginate(page=page, per_page=per_page, error_out=False)
        
        invoices_data = []
        for invoice in invoices.items:
            # Get student info
            student = User.query.get(invoice.student_id)
            
            # Get invoice items
            items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
            items_data = [{
                'id': item.id,
                'description': item.description,
                'amount': float(item.amount)
            } for item in items]
            
            invoices_data.append({
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'student_id': invoice.student_id,
                'student_name': f"{student.first_name} {student.last_name}" if student else 'Unknown',
                'student_class': student.class_name if student else 'Unknown',
                'amount': float(invoice.amount),
                'paid_amount': float(invoice.paid_amount) if invoice.paid_amount else 0,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'issue_date': invoice.issue_date.isoformat() if invoice.issue_date else None,
                'status': invoice.status,
                'semester': invoice.semester,
                'items': items_data,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            })
            
        return jsonify({
            'success': True,
            'invoices': invoices_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': invoices.total,
                'pages': invoices.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    """Create a new invoice"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'amount', 'due_date', 'semester', 'items']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Validate student exists
        student = User.query.get(data['student_id'])
        if not student:
            return jsonify({'error': 'Student not found'}), 404
            
        # Parse due date
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid due date format'}), 400
            
        # Generate invoice number
        invoice_number = f"INV-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            student_id=data['student_id'],
            amount=data['amount'],
            paid_amount=0,
            due_date=due_date,
            issue_date=datetime.utcnow(),
            status='pending',
            semester=data['semester'],
            created_by=current_user_id
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Create invoice items
        total_items_amount = 0
        for item_data in data['items']:
            if 'description' not in item_data or 'amount' not in item_data:
                return jsonify({'error': 'Invalid item data'}), 400
                
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=item_data['description'],
                amount=item_data['amount']
            )
            db.session.add(item)
            total_items_amount += float(item_data['amount'])
            
        # Verify total amount matches items
        if abs(total_items_amount - float(data['amount'])) > 0.01:
            return jsonify({'error': 'Total amount does not match sum of items'}), 400
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invoice created successfully',
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'student_id': invoice.student_id,
                'amount': float(invoice.amount),
                'due_date': invoice.due_date.isoformat(),
                'status': invoice.status
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    """Get a specific invoice"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
            
        # Check permissions
        if user.role in ['admin', 'teacher']:
            student = User.query.get(invoice.student_id)
            if not student:
                return jsonify({'error': 'Student not found'}), 404
        elif user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get student info
        student = Student.query.get(invoice.student_id)
        
        # Get invoice items
        items = InvoiceItem.query.filter_by(invoice_id=invoice.id).all()
        items_data = [{
            'id': item.id,
            'description': item.description,
            'amount': float(item.amount)
        } for item in items]
        
        return jsonify({
            'success': True,
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'student_id': invoice.student_id,
                'student_name': f"{student.first_name} {student.last_name}" if student else 'Unknown',
                'student_class': student.class_name if student else 'Unknown',
                'amount': float(invoice.amount),
                'paid_amount': float(invoice.paid_amount) if invoice.paid_amount else 0,
                'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
                'issue_date': invoice.issue_date.isoformat() if invoice.issue_date else None,
                'status': invoice.status,
                'semester': invoice.semester,
                'items': items_data,
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/payment', methods=['POST'])
@jwt_required()
def record_payment(invoice_id):
    """Record a payment for an invoice"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
            
        data = request.get_json()
        
        if 'amount' not in data:
            return jsonify({'error': 'Payment amount is required'}), 400
            
        payment_amount = float(data['amount'])
        
        if payment_amount <= 0:
            return jsonify({'error': 'Payment amount must be positive'}), 400
            
        # Update invoice
        current_paid = float(invoice.paid_amount) if invoice.paid_amount else 0
        new_paid_amount = current_paid + payment_amount
        
        if new_paid_amount > float(invoice.amount):
            return jsonify({'error': 'Payment amount exceeds invoice total'}), 400
            
        invoice.paid_amount = new_paid_amount
        
        # Update status
        if new_paid_amount >= float(invoice.amount):
            invoice.status = 'paid'
        elif new_paid_amount > 0:
            invoice.status = 'partial'
            
        invoice.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment recorded successfully',
            'invoice': {
                'id': invoice.id,
                'paid_amount': float(invoice.paid_amount),
                'status': invoice.status,
                'outstanding': float(invoice.amount) - float(invoice.paid_amount)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    """Update an invoice"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
            
        data = request.get_json()
        
        # Update fields
        if 'due_date' in data:
            invoice.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        if 'status' in data:
            invoice.status = data['status']
        if 'semester' in data:
            invoice.semester = data['semester']
            
        invoice.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invoice updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    """Delete an invoice"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
            
        # Check if invoice has payments
        if invoice.paid_amount and float(invoice.paid_amount) > 0:
            return jsonify({'error': 'Cannot delete invoice with payments'}), 400
            
        # Delete invoice items first
        InvoiceItem.query.filter_by(invoice_id=invoice_id).delete()
        
        # Delete invoice
        db.session.delete(invoice)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invoice deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoices_bp.route('/invoices/statistics', methods=['GET'])
@jwt_required()
def get_invoice_statistics():
    """Get invoice statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        # Get statistics
        total_invoices = Invoice.query.count()
        total_amount = db.session.query(db.func.sum(Invoice.amount)).scalar() or 0
        total_paid = db.session.query(db.func.sum(Invoice.paid_amount)).scalar() or 0
        
        # Status counts
        status_counts = db.session.query(
            Invoice.status,
            db.func.count(Invoice.id)
        ).group_by(Invoice.status).all()
        
        status_data = {status: count for status, count in status_counts}
        
        # Overdue invoices
        overdue_count = Invoice.query.filter(
            Invoice.due_date < datetime.utcnow().date(),
            Invoice.status.in_(['pending', 'partial'])
        ).count()
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_invoices': total_invoices,
                'total_amount': float(total_amount),
                'total_paid': float(total_paid),
                'outstanding': float(total_amount) - float(total_paid),
                'collection_rate': round((float(total_paid) / float(total_amount)) * 100, 2) if total_amount > 0 else 0,
                'status_breakdown': status_data,
                'overdue_invoices': overdue_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
