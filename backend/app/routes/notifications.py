from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.notification import Notification, NotificationTemplate
from app.services.notification_service import NotificationService
from app.utils.decorators import get_current_user_id
from app import db

notifications_bp = Blueprint('notifications', __name__)

# Initialize notification service
notification_service = NotificationService()

@notifications_bp.route('/send', methods=['POST'])
@jwt_required()
def send_notification():
    """Send notification via SMS, email, or system"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['type', 'recipient', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate notification type
        valid_types = ['sms', 'email', 'system']
        if data['type'] not in valid_types:
            return jsonify({
                'success': False,
                'message': f'Invalid notification type. Valid types: {valid_types}'
            }), 400
        
        # Get user ID if provided
        user_id = data.get('user_id')
        if not user_id and data['type'] == 'system':
            return jsonify({
                'success': False,
                'message': 'user_id is required for system notifications'
            }), 400
        
        # Send notification based on type
        if data['type'] == 'sms':
            result = notification_service.send_sms(
                recipient=data['recipient'],
                message=data['message'],
                user_id=user_id,
                category=data.get('category', 'general'),
                priority=data.get('priority', 'medium'),
                reference_id=data.get('reference_id')
            )
        elif data['type'] == 'email':
            result = notification_service.send_email(
                recipient=data['recipient'],
                subject=data.get('subject', 'Smart School Notification'),
                message=data['message'],
                user_id=user_id,
                category=data.get('category', 'general'),
                priority=data.get('priority', 'medium'),
                reference_id=data.get('reference_id')
            )
        elif data['type'] == 'system':
            result = notification_service.send_system_notification(
                user_id=user_id,
                title=data.get('title', 'Notification'),
                message=data['message'],
                category=data.get('category', 'general'),
                priority=data.get('priority', 'medium'),
                reference_id=data.get('reference_id')
            )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error sending notification',
            'error': str(e)
        }), 500

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get notifications for current user"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = request.args.get('limit', 50, type=int)
        
        result = notification_service.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching notifications',
            'error': str(e)
        }), 500

@notifications_bp.route('/<notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        user_id = get_jwt_identity()['id']
        
        result = notification_service.mark_notification_read(
            notification_id=notification_id,
            user_id=user_id
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error marking notification as read',
            'error': str(e)
        }), 500

# Legacy endpoint for backward compatibility
@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def send_notification_legacy():
    """Legacy notification endpoint"""
    data = request.get_json()
    
    # Redirect to new send endpoint
    return send_notification()
