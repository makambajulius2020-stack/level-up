from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.semesters import Semester
from app.models.user import User
from app import db
from datetime import datetime

semesters_bp = Blueprint('semesters', __name__)

@semesters_bp.route('/semesters', methods=['GET'])
@jwt_required()
def get_semesters():
    """Get all academic semesters"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        semesters = Semester.query.order_by(Semester.start_date.desc()).all()
        
        semesters_data = [semester.to_dict() for semester in semesters]
            
        return jsonify({
            'success': True,
            'semesters': semesters_data,
            'total': len(semesters_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@semesters_bp.route('/semesters', methods=['POST'])
@jwt_required()
def create_semester():
    """Create a new academic semester"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'start_date', 'end_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')).date()
            end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
            
        # Check for overlapping semesters
        existing_semester = Semester.query.filter(
            Semester.start_date <= end_date,
            Semester.end_date >= start_date
        ).first()
        
        if existing_semester:
            return jsonify({'error': 'Semester dates overlap with existing semester'}), 400
            
        # Create new semester
        semester = Semester(
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            status=data.get('status', 'upcoming'),
            total_students=data.get('total_students', 0),
            total_fees=data.get('total_fees', 0),
            collected_fees=0,
            courses=','.join(data.get('courses', [])),
            holidays=','.join(data.get('holidays', [])),
            exam_period=data.get('exam_period', ''),
            created_by=current_user_id
        )
        
        db.session.add(semester)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Semester created successfully',
            'semester': semester.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semesters_bp.route('/semesters/<int:semester_id>', methods=['PUT'])
@jwt_required()
def update_semester(semester_id):
    """Update an academic semester"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        semester = Semester.query.get(semester_id)
        if not semester:
            return jsonify({'error': 'Semester not found'}), 404
            
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            semester.name = data['name']
        if 'start_date' in data:
            semester.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')).date()
        if 'end_date' in data:
            semester.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00')).date()
        if 'status' in data:
            semester.status = data['status']
        if 'total_students' in data:
            semester.total_students = data['total_students']
        if 'total_fees' in data:
            semester.total_fees = data['total_fees']
        if 'courses' in data:
            semester.courses = ','.join(data['courses'])
        if 'holidays' in data:
            semester.holidays = ','.join(data['holidays'])
        if 'exam_period' in data:
            semester.exam_period = data['exam_period']
            
        semester.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Semester updated successfully',
            'semester': semester.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semesters_bp.route('/semesters/<int:semester_id>', methods=['DELETE'])
@jwt_required()
def delete_semester(semester_id):
    """Delete an academic semester"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        semester = Semester.query.get(semester_id)
        if not semester:
            return jsonify({'error': 'Semester not found'}), 404
        
        db.session.delete(semester)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Semester deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@semesters_bp.route('/semesters/current', methods=['GET'])
@jwt_required()
def get_current_semester():
    """Get the current active semester"""
    try:
        current_date = datetime.utcnow().date()
        
        # First, try to find active semester
        current_semester = Semester.query.filter(
            Semester.start_date <= current_date,
            Semester.end_date >= current_date,
            Semester.status == 'active'
        ).first()
        
        # If no active semester, try to find the most recent semester
        if not current_semester:
            current_semester = Semester.query.filter(
                Semester.start_date <= current_date
            ).order_by(Semester.start_date.desc()).first()
        
        # If still no semester, try to find any semester
        if not current_semester:
            current_semester = Semester.query.order_by(Semester.start_date.desc()).first()
        
        # If no semester exists at all, return a default
        if not current_semester:
            # Get current month and year for default name
            month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
            current_month = datetime.utcnow().month
            current_year = datetime.utcnow().year
            
            # Determine semester based on month (adjust for your academic calendar)
            if current_month in [1, 2, 3, 4]:
                semester_name = f"Semester 1 {current_year}"
            elif current_month in [5, 6, 7, 8]:
                semester_name = f"Semester 2 {current_year}"
            else:
                semester_name = f"Semester 3 {current_year}"
            
            return jsonify({
                'success': True,
                'semester': {
                    'id': None,
                    'name': semester_name,
                    'start_date': None,
                    'end_date': None,
                    'status': 'active'
                }
            }), 200
            
        return jsonify({
            'success': True,
            'semester': current_semester.to_dict()
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return a default semester on error
        current_year = datetime.utcnow().year
        current_month = datetime.utcnow().month
        if current_month in [1, 2, 3, 4]:
            default_semester_name = f'Semester 1 {current_year}'
        elif current_month in [5, 6, 7, 8]:
            default_semester_name = f'Semester 2 {current_year}'
        else:
            default_semester_name = f'Semester 3 {current_year}'
        return jsonify({
            'success': True,
            'semester': {
                'id': None,
                'name': default_semester_name,
                'start_date': None,
                'end_date': None,
                'status': 'active'
            }
        }), 200

@semesters_bp.route('/semesters/<int:semester_id>/financial-summary', methods=['GET'])
@jwt_required()
def get_semester_financial_summary(semester_id):
    """Get financial summary for a specific semester"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({'error': 'Unauthorized access'}), 403
            
        semester = Semester.query.get(semester_id)
        if not semester:
            return jsonify({'error': 'Semester not found'}), 404
            
        # Calculate collection rate
        collection_rate = 0
        if semester.total_fees and semester.total_fees > 0:
            collection_rate = (float(semester.collected_fees) / float(semester.total_fees)) * 100
            
        outstanding = float(semester.total_fees) - float(semester.collected_fees) if semester.total_fees and semester.collected_fees else 0
        
        return jsonify({
            'success': True,
            'summary': {
                'semester_name': semester.name,
                'total_expected': float(semester.total_fees) if semester.total_fees else 0,
                'total_collected': float(semester.collected_fees) if semester.collected_fees else 0,
                'outstanding': outstanding,
                'collection_rate': round(collection_rate, 2),
                'total_students': semester.total_students,
                'average_fee_per_student': round(float(semester.total_fees) / semester.total_students, 2) if semester.total_students > 0 and semester.total_fees else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

