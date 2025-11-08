from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.cocurricular_service import CocurricularService
from app.utils.decorators import role_required

cocurricular_bp = Blueprint('cocurricular', __name__)
cocurricular_service = CocurricularService()

@cocurricular_bp.route('/', methods=['GET'])
@jwt_required()
def activities_home():
    """List available activities for current user (frontend convenience)"""
    user_id = get_jwt_identity()
    activities = cocurricular_service.get_available_activities(user_id)
    return jsonify({'success': True, 'activities': activities})

@cocurricular_bp.route('/my-activities', methods=['GET'])
@jwt_required()
def my_activities():
    """Get current user's registered activities (frontend convenience)"""
    user_id = get_jwt_identity()
    result = cocurricular_service.get_student_activities(user_id)
    return jsonify({'success': True, 'activities': result})

@cocurricular_bp.route('/activities/create', methods=['POST'])
@jwt_required()
@role_required(['admin', 'teacher'])
def create_activity():
    """Create a new co-curricular activity"""
    try:
        current_user_id = get_jwt_identity()
        activity_data = request.get_json()
        
        result = cocurricular_service.create_activity(activity_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/activities/<int:activity_id>/register', methods=['POST'])
@jwt_required()
@role_required(['student'])
def register_for_activity(activity_id):
    """Register student for activity"""
    try:
        current_user_id = get_jwt_identity()
        registration_data = request.get_json()
        
        result = cocurricular_service.register_student(activity_id, current_user_id, registration_data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/attendance/mark', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def mark_attendance():
    """Mark attendance for co-curricular session"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        participation_id = data.get('participation_id')
        attendance_data = data.get('attendance_data', {})
        
        result = cocurricular_service.mark_attendance(participation_id, attendance_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/events/create', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_event():
    """Create a co-curricular event"""
    try:
        current_user_id = get_jwt_identity()
        event_data = request.get_json()
        
        result = cocurricular_service.create_event(event_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/achievements/record', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def record_achievement():
    """Record a co-curricular achievement"""
    try:
        current_user_id = get_jwt_identity()
        achievement_data = request.get_json()
        
        result = cocurricular_service.record_achievement(achievement_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/student/<int:student_id>/activities', methods=['GET'])
@jwt_required()
def get_student_activities(student_id):
    """Get student's co-curricular activities"""
    try:
        status = request.args.get('status')
        
        activities = cocurricular_service.get_student_activities(student_id, status)
        
        return jsonify({
            'success': True,
            'activities': activities
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/student/<int:student_id>/available-activities', methods=['GET'])
@jwt_required()
def get_available_activities(student_id):
    """Get activities available for student registration"""
    try:
        activities = cocurricular_service.get_available_activities(student_id)
        
        return jsonify({
            'success': True,
            'activities': activities
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/activities/<int:activity_id>/analytics', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_activity_analytics(activity_id):
    """Get activity analytics"""
    try:
        result = cocurricular_service.get_activity_analytics(activity_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@cocurricular_bp.route('/participation/<int:participation_id>/assess', methods=['PUT'])
@jwt_required()
@role_required(['teacher', 'admin'])
def update_participation_assessment(participation_id):
    """Update participant assessment"""
    try:
        current_user_id = get_jwt_identity()
        assessment_data = request.get_json()
        
        result = cocurricular_service.update_participation_assessment(participation_id, assessment_data, current_user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
