from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.grade_service import GradeService
from app.utils.decorators import role_required

grades_bp = Blueprint('grades', __name__)
grade_service = GradeService()

@grades_bp.route('/', methods=['GET'])
@jwt_required()
def get_grades():
    """Get grades with optional filters"""
    try:
        semester = request.args.get('semester')
        subject_id = request.args.get('subject_id', type=int)
        student_id = request.args.get('student_id', type=int)
        class_id = request.args.get('class_id', type=int)
        
        from app.models.grade import Grade
        from app import db
        
        query = Grade.query
        
        if semester:
            query = query.filter(Grade.semester == semester)
        if subject_id:
            query = query.filter(Grade.subject_id == subject_id)
        if student_id:
            query = query.filter(Grade.student_id == student_id)
        if class_id:
            query = query.filter(Grade.class_id == class_id)
        
        grades = query.all()
        
        return jsonify({
            'success': True,
            'grades': [grade.to_dict() if hasattr(grade, 'to_dict') else {
                'id': grade.id,
                'student_id': grade.student_id,
                'subject_id': grade.subject_id,
                'class_id': grade.class_id,
                'percentage': grade.percentage,
                'semester': grade.semester,
                'assessment_type': grade.assessment_type if hasattr(grade, 'assessment_type') else None
            } for grade in grades]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_grade():
    """Create a new grade record"""
    try:
        grade_data = request.get_json()
        
        result = grade_service.create_grade(grade_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_grades(student_id):
    """Get grades for a student"""
    try:
        subject_id = request.args.get('subject_id', type=int)
        academic_year = request.args.get('academic_year')
        semester = request.args.get('semester')
        
        grades = grade_service.get_student_grades(student_id, subject_id, academic_year, semester)
        
        return jsonify({
            'success': True,
            'grades': grades
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_class_grades(class_id):
    """Get grades for a class"""
    try:
        subject_id = request.args.get('subject_id', type=int)
        assessment_type = request.args.get('assessment_type')
        
        grades = grade_service.get_class_grades(class_id, subject_id, assessment_type)
        
        return jsonify({
            'success': True,
            'grades': grades
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/student/<int:student_id>/gpa', methods=['GET'])
@jwt_required()
def calculate_student_gpa(student_id):
    """Calculate student GPA"""
    try:
        academic_year = request.args.get('academic_year', '2024')
        semester = request.args.get('semester')
        
        gpa_data = grade_service.calculate_student_gpa(student_id, academic_year, semester)
        
        return jsonify({
            'success': True,
            'gpa_data': gpa_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/student/<int:student_id>/subject/<int:subject_id>/progress', methods=['PUT'])
@jwt_required()
@role_required(['teacher', 'admin'])
def update_student_progress(student_id, subject_id):
    """Update student progress"""
    try:
        result = grade_service.update_student_progress(student_id, subject_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@grades_bp.route('/analytics/class/<int:class_id>/subject/<int:subject_id>', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_grade_analytics(class_id, subject_id):
    """Get grade analytics for class and subject"""
    try:
        assessment_type = request.args.get('assessment_type')
        
        result = grade_service.get_grade_analytics(class_id, subject_id, assessment_type)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
