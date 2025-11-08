from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.profile_service import ProfileService
from app.utils.decorators import role_required
from werkzeug.utils import secure_filename

enhanced_profiles_bp = Blueprint('enhanced_profiles', __name__)
profile_service = ProfileService()

@enhanced_profiles_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get current user's profile"""
    try:
        user_id = get_jwt_identity()['id']
        result = profile_service.get_user_profile(user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update current user's profile"""
    try:
        user_id = get_jwt_identity()['id']
        profile_data = request.get_json()
        
        result = profile_service.update_profile(user_id, profile_data)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profile/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload profile photo"""
    try:
        user_id = get_jwt_identity()['id']
        
        if 'photo' not in request.files:
            return jsonify({'success': False, 'message': 'No photo file provided'}), 400
        
        file = request.files['photo']
        result = profile_service.upload_profile_photo(user_id, file)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profile/photo', methods=['DELETE'])
@jwt_required()
def delete_profile_photo():
    """Delete profile photo"""
    try:
        user_id = get_jwt_identity()['id']
        result = profile_service.delete_profile_photo(user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profiles/class/<class_level>', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_class_profiles(class_level):
    """Get profiles for a specific class"""
    try:
        stream = request.args.get('stream')
        result = profile_service.get_class_profiles(class_level, stream)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profiles/staff', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_staff_profiles():
    """Get staff profiles"""
    try:
        department = request.args.get('department')
        result = profile_service.get_staff_profiles(department)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@enhanced_profiles_bp.route('/profile/<int:user_id>', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_specific_user_profile(user_id):
    """Get specific user's profile (for teachers/admin)"""
    try:
        result = profile_service.get_user_profile(user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
