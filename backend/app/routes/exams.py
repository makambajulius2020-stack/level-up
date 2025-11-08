from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.exam_service import ExamService
from app.utils.decorators import role_required

exams_bp = Blueprint('exams', __name__)
exam_service = ExamService()

@exams_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_exam():
    """Create a new exam"""
    try:
        current_user_id = get_jwt_identity()
        exam_data = request.get_json()
        
        result = exam_service.create_exam(exam_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_exam_templates():
    """Get available exam templates"""
    try:
        subject_id = request.args.get('subject_id', type=int)
        class_level = request.args.get('class_level')
        
        templates = exam_service.get_exam_templates(subject_id, class_level)
        
        return jsonify({
            'success': True,
            'templates': templates
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/submit', methods=['POST'])
@jwt_required()
@role_required(['student'])
def submit_exam():
    """Submit exam answers"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        exam_id = data.get('exam_id')
        answers = data.get('answers', {})
        
        result = exam_service.submit_exam(exam_id, current_user_id, answers)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/teacher', methods=['GET'])
@jwt_required()
def get_teacher_exams():
    """Get exams created by current teacher"""
    try:
        current_user_id = get_jwt_identity()
        status = request.args.get('status')
        exams = exam_service.get_teacher_exams(current_user_id, status)
        
        return jsonify({
            'success': True,
            'exams': exams
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/teacher/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_exams_by_id(teacher_id):
    """Get exams created by specific teacher"""
    try:
        status = request.args.get('status')
        exams = exam_service.get_teacher_exams(teacher_id, status)
        
        return jsonify({
            'success': True,
            'exams': exams
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/generate-ai', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def generate_ai_exam():
    """Generate exam using AI"""
    try:
        current_user_id = get_jwt_identity()
        exam_data = request.get_json()
        
        result = exam_service.generate_exam_with_ai(exam_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/student/<int:student_id>/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_student_exams(student_id, class_id):
    """Get available exams for student"""
    try:
        exams = exam_service.get_student_exams(student_id, class_id)
        
        return jsonify({
            'success': True,
            'exams': exams
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/grade', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def grade_exam():
    """Manually grade an exam submission"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        submission_id = data.get('submission_id')
        grading_data = data.get('grading_data', {})
        
        result = exam_service.grade_exam_manually(submission_id, grading_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@exams_bp.route('/<int:exam_id>/analytics', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_exam_analytics(exam_id):
    """Get exam analytics"""
    try:
        result = exam_service.get_exam_analytics(exam_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

