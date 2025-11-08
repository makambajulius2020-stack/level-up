"""
n8n Webhook Routes for Smart School System

This module handles incoming webhooks from n8n workflows and provides
endpoints for workflow status updates and notifications.
"""

import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.n8n_service import get_n8n_service
from app.models.notification import Notification
from app.models.user import User
from app import db

logger = logging.getLogger(__name__)

n8n_bp = Blueprint('n8n', __name__, url_prefix='/api/n8n')

@n8n_bp.route('/webhook/attendance-processed', methods=['POST'])
def attendance_processed_webhook():
    """Handle attendance processing completion from n8n"""
    try:
        data = request.get_json()
        
        # Log the webhook receipt
        logger.info(f"Received attendance processed webhook: {data}")
        
        # Extract relevant information
        student_id = data.get('student_id')
        notification_status = data.get('notification_status')
        sms_sent = data.get('sms_sent', False)
        email_sent = data.get('email_sent', False)
        
        # Create notification record
        if student_id:
            notification = Notification(
                user_id=student_id,
                title="Attendance Alert Sent",
                message=f"Attendance notification processed - SMS: {sms_sent}, Email: {email_sent}",
                type="attendance_alert",
                status="sent" if notification_status == "success" else "failed",
                metadata=json.dumps(data)
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Attendance webhook processed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing attendance webhook: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process webhook'
        }), 500

@n8n_bp.route('/webhook/payment-processed', methods=['POST'])
def payment_processed_webhook():
    """Handle payment reminder processing completion from n8n"""
    try:
        data = request.get_json()
        
        logger.info(f"Received payment processed webhook: {data}")
        
        student_id = data.get('student_id')
        notification_status = data.get('notification_status')
        payment_method = data.get('payment_method')
        
        if student_id:
            notification = Notification(
                user_id=student_id,
                title="Payment Reminder Sent",
                message=f"Payment reminder processed via {payment_method}",
                type="payment_reminder",
                status="sent" if notification_status == "success" else "failed",
                metadata=json.dumps(data)
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Payment webhook processed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing payment webhook: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process webhook'
        }), 500

@n8n_bp.route('/webhook/fraud-alert-processed', methods=['POST'])
def fraud_alert_processed_webhook():
    """Handle fraud alert processing completion from n8n"""
    try:
        data = request.get_json()
        
        logger.info(f"Received fraud alert processed webhook: {data}")
        
        user_id = data.get('user_id')
        alert_type = data.get('alert_type')
        action_taken = data.get('action_taken')
        
        # Create admin notification for fraud alerts
        admin_users = User.query.filter_by(role='admin').all()
        for admin in admin_users:
            notification = Notification(
                user_id=admin.id,
                title="Fraud Alert Processed",
                message=f"Fraud alert ({alert_type}) processed. Action: {action_taken}",
                type="fraud_alert",
                status="sent",
                metadata=json.dumps(data)
            )
            db.session.add(notification)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Fraud alert webhook processed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing fraud alert webhook: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process webhook'
        }), 500

@n8n_bp.route('/webhook/grade-notification-processed', methods=['POST'])
def grade_notification_processed_webhook():
    """Handle grade notification processing completion from n8n"""
    try:
        data = request.get_json()
        
        logger.info(f"Received grade notification processed webhook: {data}")
        
        student_id = data.get('student_id')
        subject = data.get('subject')
        grade = data.get('grade')
        notification_status = data.get('notification_status')
        
        if student_id:
            notification = Notification(
                user_id=student_id,
                title="Grade Notification Sent",
                message=f"Grade notification for {subject} (Grade: {grade}) sent to parents",
                type="grade_notification",
                status="sent" if notification_status == "success" else "failed",
                metadata=json.dumps(data)
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Grade notification webhook processed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing grade notification webhook: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process webhook'
        }), 500

@n8n_bp.route('/webhook/assignment-reminder-processed', methods=['POST'])
def assignment_reminder_processed_webhook():
    """Handle assignment reminder processing completion from n8n"""
    try:
        data = request.get_json()
        
        logger.info(f"Received assignment reminder processed webhook: {data}")
        
        student_id = data.get('student_id')
        assignment_title = data.get('assignment_title')
        days_remaining = data.get('days_remaining')
        notification_status = data.get('notification_status')
        
        if student_id:
            notification = Notification(
                user_id=student_id,
                title="Assignment Reminder Sent",
                message=f"Reminder for '{assignment_title}' sent ({days_remaining} days remaining)",
                type="assignment_reminder",
                status="sent" if notification_status == "success" else "failed",
                metadata=json.dumps(data)
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment reminder webhook processed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing assignment reminder webhook: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process webhook'
        }), 500

@n8n_bp.route('/trigger-workflow', methods=['POST'])
@jwt_required()
def trigger_workflow():
    """Manually trigger an n8n workflow"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Only allow admin and teacher roles to trigger workflows
        if user.role not in ['admin', 'teacher']:
            return jsonify({
                'status': 'error',
                'message': 'Insufficient permissions'
            }), 403
        
        data = request.get_json()
        workflow_name = data.get('workflow_name')
        workflow_data = data.get('data', {})
        
        if not workflow_name:
            return jsonify({
                'status': 'error',
                'message': 'Workflow name is required'
            }), 400
        
        # Add user context to workflow data
        workflow_data['triggered_by'] = {
            'user_id': user.id,
            'user_name': user.name,
            'user_role': user.role,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        n8n_service = get_n8n_service()
        result = n8n_service.trigger_workflow_sync(workflow_name, workflow_data)
        
        if result:
            return jsonify({
                'status': 'success',
                'message': f'Workflow {workflow_name} triggered successfully',
                'result': result
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': f'Failed to trigger workflow {workflow_name}'
            }), 500
            
    except Exception as e:
        logger.error(f"Error triggering workflow: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to trigger workflow'
        }), 500

@n8n_bp.route('/workflows', methods=['GET'])
@jwt_required()
def list_workflows():
    """List available n8n workflows"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Only allow admin role to list workflows
        if user.role != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Insufficient permissions'
            }), 403
        
        n8n_service = get_n8n_service()
        
        # Since we can't easily get async result in Flask route, return predefined workflows
        available_workflows = [
            {
                'name': 'attendance_alert',
                'description': 'Send attendance alerts to parents via SMS/Email',
                'triggers': ['student_absent', 'student_late']
            },
            {
                'name': 'payment_reminder',
                'description': 'Send payment reminders to parents',
                'triggers': ['payment_due', 'payment_overdue']
            },
            {
                'name': 'grade_notification',
                'description': 'Notify parents about new grades',
                'triggers': ['grade_published', 'assignment_graded']
            },
            {
                'name': 'fraud_alert',
                'description': 'Alert administrators about suspicious activities',
                'triggers': ['suspicious_login', 'unusual_activity']
            },
            {
                'name': 'assignment_reminder',
                'description': 'Remind students about upcoming assignment deadlines',
                'triggers': ['assignment_due_soon', 'assignment_overdue']
            },
            {
                'name': 'anomaly_alert',
                'description': 'Alert about system anomalies and unusual patterns',
                'triggers': ['attendance_anomaly', 'grade_anomaly']
            },
            {
                'name': 'lesson_plan_reminder',
                'description': 'Remind teachers about lesson plan preparation',
                'triggers': ['lesson_tomorrow', 'lesson_unprepared']
            },
            {
                'name': 'parent_meeting_notification',
                'description': 'Notify parents about scheduled meetings',
                'triggers': ['meeting_scheduled', 'meeting_reminder']
            }
        ]
        
        return jsonify({
            'status': 'success',
            'workflows': available_workflows
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing workflows: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to list workflows'
        }), 500

@n8n_bp.route('/status', methods=['GET'])
@jwt_required()
def n8n_status():
    """Get n8n integration status"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Only allow admin role to check status
        if user.role != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Insufficient permissions'
            }), 403
        
        n8n_service = get_n8n_service()
        
        return jsonify({
            'status': 'success',
            'n8n_status': {
                'enabled': n8n_service.enabled,
                'base_url': n8n_service.base_url,
                'webhook_url': n8n_service.webhook_url,
                'api_key_configured': bool(n8n_service.api_key),
                'timeout': n8n_service.timeout,
                'retry_attempts': n8n_service.retry_attempts
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting n8n status: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to get n8n status'
        }), 500

@n8n_bp.route('/test-connection', methods=['POST'])
@jwt_required()
def test_n8n_connection():
    """Test connection to n8n instance"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Only allow admin role to test connection
        if user.role != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Insufficient permissions'
            }), 403
        
        n8n_service = get_n8n_service()
        
        # Test with a simple workflow trigger
        test_data = {
            'test': True,
            'timestamp': datetime.utcnow().isoformat(),
            'user': user.name
        }
        
        result = n8n_service.trigger_workflow_sync('test_connection', test_data)
        
        if result:
            return jsonify({
                'status': 'success',
                'message': 'n8n connection test successful',
                'result': result
            }), 200
        else:
            return jsonify({
                'status': 'warning',
                'message': 'n8n connection test failed - check configuration'
            }), 200
            
    except Exception as e:
        logger.error(f"Error testing n8n connection: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to test n8n connection'
        }), 500
