from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.profile_service import ProfileService

profile_bp = Blueprint('profile', __name__)

# Initialize profile service
profile_service = ProfileService()

@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    try:
        user_id = get_jwt_identity()['id']
        result = profile_service.get_user_profile(user_id)
        
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching profile',
            'error': str(e)
        }), 500

@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile"""
    try:
        user_id = get_jwt_identity()['id']
        profile_data = request.get_json()
        
        result = profile_service.update_profile(user_id, profile_data)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error updating profile',
            'error': str(e)
        }), 500

@profile_bp.route('/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload profile photo"""
    try:
        user_id = get_jwt_identity()['id']
        
        if 'photo' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No photo file provided'
            }), 400
        
        file = request.files['photo']
        result = profile_service.upload_profile_photo(user_id, file)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error uploading photo',
            'error': str(e)
        }), 500

@profile_bp.route('/photo', methods=['DELETE'])
@jwt_required()
def delete_profile_photo():
    """Delete profile photo"""
    try:
        user_id = get_jwt_identity()['id']
        result = profile_service.delete_profile_photo(user_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error deleting photo',
            'error': str(e)
        }), 500

@profile_bp.route('/class/<class_level>', methods=['GET'])
@jwt_required()
def get_class_profiles(class_level):
    """Get profiles for a specific class"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        stream = request.args.get('stream')
        result = profile_service.get_class_profiles(class_level, stream)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching class profiles',
            'error': str(e)
        }), 500

@profile_bp.route('/staff', methods=['GET'])
@jwt_required()
def get_staff_profiles():
    """Get staff profiles"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        department = request.args.get('department')
        result = profile_service.get_staff_profiles(department)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching staff profiles',
            'error': str(e)
        }), 500

@profile_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    """Get specific user's profile"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization - users can view their own profile, admin/teachers can view others
        if current_user_id != user_id and current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        result = profile_service.get_user_profile(user_id)
        
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching user profile',
            'error': str(e)
        }), 500
