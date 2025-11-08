from flask import Blueprint, jsonify
from app.models.user import User
from app import db
from flask_jwt_extended import jwt_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# Add students endpoint for frontend compatibility
@users_bp.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    """Get student by ID"""
    try:
        student = User.query.filter_by(id=student_id, role='student').first()
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
        
        student_data = student.to_dict() if hasattr(student, 'to_dict') else {
            'id': student.id,
            'full_name': student.full_name,
            'email': student.email,
            'phone': student.phone,
            'role': student.role,
            'admission_number': getattr(student, 'admission_number', None),
            'student_id': getattr(student, 'student_id', None)
        }
        
        return jsonify({'success': True, 'student': student_data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500