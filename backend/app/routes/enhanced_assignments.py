from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.enhanced_assignment_service import EnhancedAssignmentService
from app.utils.decorators import role_required

enhanced_assignments_bp = Blueprint('enhanced_assignments', __name__)
assignment_service = EnhancedAssignmentService()

@enhanced_assignments_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_assignment():
    """Create a new assignment"""
    try:
        current_user_id = get_jwt_identity()
        assignment_data = request.get_json()
        
        result = assignment_service.create_assignment(assignment_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_assignments_bp.route('/submit', methods=['POST'])
@jwt_required()
@role_required(['student'])
def submit_assignment():
    """Submit assignment with files"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        assignment_id = data.get('assignment_id')
        submission_data = data.get('submission_data', {})
        
        result = assignment_service.submit_assignment(assignment_id, current_user_id, submission_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_assignments_bp.route('/grade', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def grade_assignment():
    """Grade assignment manually"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        submission_id = data.get('submission_id')
        grading_data = data.get('grading_data', {})
        
        result = assignment_service.grade_assignment_manually(submission_id, grading_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_assignments_bp.route('/student/<int:student_id>/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_student_assignments(student_id, class_id):
    """Get assignments for student"""
    try:
        status = request.args.get('status')
        
        assignments = assignment_service.get_student_assignments(student_id, class_id, status)
        
        return jsonify({
            'success': True,
            'assignments': assignments
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_assignments_bp.route('/teacher/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_assignments(teacher_id):
    """Get assignments created by teacher"""
    try:
        status = request.args.get('status')
        
        assignments = assignment_service.get_teacher_assignments(teacher_id, status)
        
        return jsonify({
            'success': True,
            'assignments': assignments
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_assignments_bp.route('/study-materials/create', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_study_material():
    """Create study material"""
    try:
        current_user_id = get_jwt_identity()
        material_data = request.get_json()
        
        result = assignment_service.create_study_material(material_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
