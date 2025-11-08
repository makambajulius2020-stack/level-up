from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.messaging_service import MessagingService

messaging_bp = Blueprint('messaging', __name__)

# Initialize messaging service
messaging_service = MessagingService()

@messaging_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message"""
    try:
        sender_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['recipient_id', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = messaging_service.send_message(
            sender_id=sender_id,
            recipient_id=data['recipient_id'],
            subject=data.get('subject', 'No Subject'),
            content=data['content'],
            message_type=data.get('message_type', 'text'),
            attachment_path=data.get('attachment_path'),
            attachment_name=data.get('attachment_name'),
            is_urgent=data.get('is_urgent', False)
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error sending message',
            'error': str(e)
        }), 500

@messaging_bp.route('/inbox', methods=['GET'])
@jwt_required()
def get_inbox():
    """Get user's inbox"""
    try:
        user_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        result = messaging_service.get_inbox(user_id, page, per_page, unread_only)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching inbox',
            'error': str(e)
        }), 500

@messaging_bp.route('/sent', methods=['GET'])
@jwt_required()
def get_sent_messages():
    """Get user's sent messages"""
    try:
        user_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = messaging_service.get_sent_messages(user_id, page, per_page)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching sent messages',
            'error': str(e)
        }), 500

@messaging_bp.route('/<int:message_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(message_id):
    """Mark message as read"""
    try:
        user_id = get_jwt_identity()['id']
        result = messaging_service.mark_as_read(message_id, user_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error marking message as read',
            'error': str(e)
        }), 500

@messaging_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Delete message"""
    try:
        user_id = get_jwt_identity()['id']
        result = messaging_service.delete_message(message_id, user_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error deleting message',
            'error': str(e)
        }), 500

@messaging_bp.route('/conversation/<int:other_user_id>', methods=['GET'])
@jwt_required()
def get_conversation(other_user_id):
    """Get conversation with another user"""
    try:
        user_id = get_jwt_identity()['id']
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        result = messaging_service.get_conversation(user_id, other_user_id, page, per_page)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching conversation',
            'error': str(e)
        }), 500

@messaging_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread messages"""
    try:
        user_id = get_jwt_identity()['id']
        result = messaging_service.get_unread_count(user_id)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'unread_count': 0,
            'error': str(e)
        }), 500

@messaging_bp.route('/broadcast', methods=['POST'])
@jwt_required()
def broadcast_message():
    """Broadcast message to multiple users"""
    try:
        sender_id = get_jwt_identity()['id']
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['recipient_role', 'subject', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = messaging_service.broadcast_message(
            sender_id=sender_id,
            recipient_role=data['recipient_role'],
            subject=data['subject'],
            content=data['content'],
            class_level=data.get('class_level'),
            department=data.get('department')
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error broadcasting message',
            'error': str(e)
        }), 500

@messaging_bp.route('/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    """Get list of contacts for messaging"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        result = messaging_service.get_contacts(user_id)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching contacts',
            'error': str(e)
        }), 500
