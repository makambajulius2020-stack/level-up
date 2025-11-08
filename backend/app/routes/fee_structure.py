from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, FeeStructure, FeeStructureItem, FeeStatement, FeePayment, SchoolClass, StudentEnrollment
from app.utils.decorators import admin_required
from datetime import datetime, timedelta
import logging
from decimal import Decimal
import uuid

logger = logging.getLogger(__name__)

fee_structure_bp = Blueprint('fee_structure', __name__)

# Fee Structure Management Routes

@fee_structure_bp.route('/fee-structures', methods=['GET'])
@jwt_required()
def get_fee_structures():
    """Get all fee structures with optional filtering"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Query parameters
        level = request.args.get('level')
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 3')
        
        # Build query
        query = FeeStructure.query.filter_by(is_active=True)
        
        if level:
            query = query.filter_by(level=level)
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
        if semester:
            query = query.filter_by(semester=semester)
            
        fee_structures = query.all()
        
        # Calculate student counts for each structure
        for structure in fee_structures:
            # Count students in classes of this level
            classes = SchoolClass.query.filter_by(
                level=structure.level,
                academic_year=structure.academic_year,
                semester=structure.semester,
                is_active=True
            ).all()
            
            student_count = 0
            for cls in classes:
                student_count += cls.student_count
            
            structure.students_enrolled = student_count
        
        return jsonify({
            'success': True,
            'fee_structures': [structure.to_dict() for structure in fee_structures],
            'total': len(fee_structures)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching fee structures: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch fee structures'}), 500

@fee_structure_bp.route('/fee-structures', methods=['POST'])
@jwt_required()
@admin_required
def create_fee_structure():
    """Create a new fee structure"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['level', 'academic_year', 'semester', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        # Create new fee structure
        fee_structure = FeeStructure(
            level=data['level'],
            academic_year=data['academic_year'],
            semester=data['semester'],
            name=data['name'],
            description=data.get('description')
        )
        
        db.session.add(fee_structure)
        db.session.flush()  # Get the ID
        
        # Add fee items if provided
        if 'fee_items' in data:
            for item_data in data['fee_items']:
                fee_item = FeeStructureItem(
                    fee_structure_id=fee_structure.id,
                    category=item_data['category'],
                    description=item_data.get('description'),
                    amount=Decimal(str(item_data['amount'])),
                    is_mandatory=item_data.get('is_mandatory', True)
                )
                db.session.add(fee_item)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fee structure created successfully',
            'fee_structure': fee_structure.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating fee structure: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create fee structure'}), 500

@fee_structure_bp.route('/fee-structures/<int:structure_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_fee_structure(structure_id):
    """Update a fee structure"""
    try:
        fee_structure = FeeStructure.query.get_or_404(structure_id)
        data = request.get_json()
        
        # Update basic fields
        for field in ['name', 'description']:
            if field in data:
                setattr(fee_structure, field, data[field])
        
        # Update fee items if provided
        if 'fee_items' in data:
            # Remove existing items
            FeeStructureItem.query.filter_by(fee_structure_id=structure_id).delete()
            
            # Add new items
            for item_data in data['fee_items']:
                fee_item = FeeStructureItem(
                    fee_structure_id=fee_structure.id,
                    category=item_data['category'],
                    description=item_data.get('description'),
                    amount=Decimal(str(item_data['amount'])),
                    is_mandatory=item_data.get('is_mandatory', True)
                )
                db.session.add(fee_item)
        
        fee_structure.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fee structure updated successfully',
            'fee_structure': fee_structure.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating fee structure: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update fee structure'}), 500

@fee_structure_bp.route('/fee-structures/<int:structure_id>/items', methods=['POST'])
@jwt_required()
@admin_required
def add_fee_item(structure_id):
    """Add a fee item to a structure"""
    try:
        fee_structure = FeeStructure.query.get_or_404(structure_id)
        data = request.get_json()
        
        required_fields = ['category', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        fee_item = FeeStructureItem(
            fee_structure_id=structure_id,
            category=data['category'],
            description=data.get('description'),
            amount=Decimal(str(data['amount'])),
            is_mandatory=data.get('is_mandatory', True)
        )
        
        db.session.add(fee_item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fee item added successfully',
            'fee_item': fee_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding fee item: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to add fee item'}), 500

# Fee Statements Routes

@fee_structure_bp.route('/fee-statements', methods=['GET'])
@jwt_required()
def get_fee_statements():
    """Get fee statements for current user or all (admin)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Query parameters
        student_id = request.args.get('student_id')
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester')
        status = request.args.get('status')
        
        # Build query based on user role
        if user.role == 'student':
            # Get own statements
            query = FeeStatement.query.filter_by(student_id=current_user_id)
        else:
            # Admin/teacher can see all or specific student
            query = FeeStatement.query
            if student_id:
                query = query.filter_by(student_id=student_id)
        
        # Apply filters
        query = query.filter_by(is_active=True)
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
        if semester:
            query = query.filter_by(semester=semester)
        if status:
            query = query.filter_by(status=status)
            
        statements = query.order_by(FeeStatement.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'statements': [statement.to_dict() for statement in statements],
            'total': len(statements)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching fee statements: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch fee statements'}), 500

@fee_structure_bp.route('/fee-statements/generate', methods=['POST'])
@jwt_required()
@admin_required
def generate_fee_statements():
    """Generate fee statements for students"""
    try:
        data = request.get_json()
        
        required_fields = ['fee_structure_id', 'student_ids', 'due_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        fee_structure = FeeStructure.query.get_or_404(data['fee_structure_id'])
        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        
        generated_statements = []
        
        for student_id in data['student_ids']:
            student = User.query.filter_by(id=student_id, role='student').first()
            if not student:
                continue
            
            # Check if statement already exists
            existing_statement = FeeStatement.query.filter_by(
                student_id=student_id,
                fee_structure_id=fee_structure.id,
                academic_year=fee_structure.academic_year,
                semester=fee_structure.semester
            ).first()
            
            if existing_statement:
                continue
            
            # Generate statement number
            statement_number = f"FS-{fee_structure.academic_year}-{fee_structure.semester}-{student_id}-{uuid.uuid4().hex[:8].upper()}"
            
            statement = FeeStatement(
                student_id=student_id,
                fee_structure_id=fee_structure.id,
                statement_number=statement_number,
                academic_year=fee_structure.academic_year,
                semester=fee_structure.semester,
                due_date=due_date,
                total_amount=fee_structure.total_fees,
                balance=fee_structure.total_fees
            )
            
            db.session.add(statement)
            generated_statements.append(statement)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Generated {len(generated_statements)} fee statements',
            'statements': [stmt.to_dict() for stmt in generated_statements]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error generating fee statements: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to generate fee statements'}), 500

# Payment Routes

@fee_structure_bp.route('/fee-statements/<int:statement_id>/payments', methods=['POST'])
@jwt_required()
def record_payment(statement_id):
    """Record a payment for a fee statement"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        statement = FeeStatement.query.get_or_404(statement_id)
        
        # Check permissions
        if user.role not in ['admin', 'teacher'] and statement.student_id != current_user_id:
            # Admin/teacher can create payments for any student
            if user.role in ['admin', 'teacher']:
                student = User.query.get(statement.student_id)
                if not student:
                    return jsonify({'success': False, 'message': 'Student not found'}), 404
            else:
                return jsonify({'success': False, 'message': 'Access denied'}), 403
        
        data = request.get_json()
        
        required_fields = ['amount', 'payment_method']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        amount = Decimal(str(data['amount']))
        
        # Validate amount
        if amount <= 0:
            return jsonify({'success': False, 'message': 'Payment amount must be positive'}), 400
        
        if amount > statement.balance:
            return jsonify({'success': False, 'message': 'Payment amount exceeds balance'}), 400
        
        # Generate payment reference
        payment_reference = f"PAY-{statement.statement_number}-{uuid.uuid4().hex[:8].upper()}"
        
        payment = FeePayment(
            fee_statement_id=statement_id,
            payment_reference=payment_reference,
            amount=amount,
            payment_method=data['payment_method'],
            transaction_id=data.get('transaction_id'),
            status='completed',  # Assume completed for now
            notes=data.get('notes')
        )
        
        # Update statement
        statement.paid_amount += amount
        statement.update_status()
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment recorded successfully',
            'payment': payment.to_dict(),
            'statement': statement.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error recording payment: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to record payment'}), 500

# Statistics Routes

@fee_structure_bp.route('/fee-structures/statistics', methods=['GET'])
@jwt_required()
def get_fee_statistics():
    """Get fee structure statistics"""
    try:
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester', 'Semester 3')
        
        # Get fee structures
        fee_structures = FeeStructure.query.filter_by(
            academic_year=academic_year,
            semester=semester,
            is_active=True
        ).all()
        
        total_students = 0
        total_expected_revenue = 0
        
        for structure in fee_structures:
            # Count students for this level
            classes = SchoolClass.query.filter_by(
                level=structure.level,
                academic_year=academic_year,
                semester=semester,
                is_active=True
            ).all()
            
            level_students = sum([cls.student_count for cls in classes])
            total_students += level_students
            total_expected_revenue += float(structure.total_fees) * level_students
        
        # Calculate average fee per student
        avg_fee_per_student = total_expected_revenue / total_students if total_students > 0 else 0
        
        # Count fee categories (from first structure)
        fee_categories = len(fee_structures[0].fee_items) if fee_structures else 0
        
        return jsonify({
            'success': True,
            'statistics': {
                'total_students': total_students,
                'total_expected_revenue': total_expected_revenue,
                'avg_fee_per_student': avg_fee_per_student,
                'fee_categories': fee_categories,
                'fee_structures_count': len(fee_structures)
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching fee statistics: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch statistics'}), 500


@fee_structure_bp.route('/fee-balance/<int:student_id>', methods=['GET'])
@jwt_required()
def get_fee_balance(student_id):
    """Get total fee balance and statements for a student"""
    try:
        statements = FeeStatement.query.filter_by(student_id=student_id, is_active=True).all()
        total_balance = sum([float(stmt.balance) for stmt in statements]) if statements else 0.0

        return jsonify({
            'success': True,
            'student_id': student_id,
            'total_balance': total_balance,
            'statements': [stmt.to_dict() for stmt in statements]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching fee balance: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch fee balance'}), 500
