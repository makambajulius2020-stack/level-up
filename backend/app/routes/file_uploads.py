from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.file_upload_service import FileUploadService
from app.utils.decorators import role_required

file_uploads_bp = Blueprint('file_uploads', __name__)
file_service = FileUploadService()

@file_uploads_bp.route('/profile-photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload profile photo"""
    try:
        current_user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        result = file_service.upload_profile_photo(file, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/assignment-files', methods=['POST'])
@jwt_required()
@role_required(['student'])
def upload_assignment_files():
    """Upload assignment submission files"""
    try:
        current_user_id = get_jwt_identity()
        assignment_id = request.form.get('assignment_id', type=int)
        
        if not assignment_id:
            return jsonify({'success': False, 'error': 'Assignment ID required'}), 400
        
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'success': False, 'error': 'No files provided'}), 400
        
        result = file_service.upload_assignment_files(files, assignment_id, current_user_id)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/document', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload general document"""
    try:
        current_user_id = get_jwt_identity()
        category = request.form.get('category', 'general')
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Get metadata from form
        metadata = {}
        for key in request.form:
            if key not in ['category']:
                metadata[key] = request.form[key]
        
        result = file_service.upload_document(file, category, current_user_id, metadata)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_file():
    """Delete a file"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        file_path = data.get('file_path')
        
        if not file_path:
            return jsonify({'success': False, 'error': 'File path required'}), 400
        
        result = file_service.delete_file(file_path, current_user_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/info', methods=['GET'])
@jwt_required()
def get_file_info():
    """Get file information"""
    try:
        file_path = request.args.get('file_path')
        
        if not file_path:
            return jsonify({'success': False, 'error': 'File path required'}), 400
        
        result = file_service.get_file_info(file_path)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/storage/usage', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_storage_usage():
    """Get storage usage statistics"""
    try:
        result = file_service.get_storage_usage()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@file_uploads_bp.route('/cleanup-temp', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def cleanup_temp_files():
    """Clean up temporary files"""
    try:
        data = request.get_json()
        older_than_hours = data.get('older_than_hours', 24)
        
        result = file_service.cleanup_temp_files(older_than_hours)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
