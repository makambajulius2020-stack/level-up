"""
Notification Service for SMS, Email, and System notifications
Supports Uganda SMS providers and email delivery
"""
import logging
import smtplib
import requests
import json
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app import db
from app.models.notification import Notification, NotificationTemplate

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        # SMS Gateway Configuration (Africa's Talking - popular in Uganda)
        self.sms_api_key = "your_africas_talking_api_key"
        self.sms_username = "your_africas_talking_username"
        self.sms_base_url = "https://api.africastalking.com/version1/messaging"
        
        # Email Configuration
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email_username = "school@smartschool.ug"
        self.email_password = "your_email_password"
        self.email_from = "Smart School <school@smartschool.ug>"
    
    def send_sms(self, recipient, message, user_id=None, category='general', priority='medium', reference_id=None):
        """
        Send SMS notification
        
        Args:
            recipient (str): Phone number in format 256XXXXXXXXX
            message (str): SMS message content
            user_id (int): User ID receiving the notification
            category (str): Notification category
            priority (str): Priority level
            reference_id (str): Reference to related record
            
        Returns:
            dict: Delivery status
        """
        try:
            # Create notification record
            notification = Notification(
                user_id=user_id,
                type='sms',
                title='SMS Notification',
                message=message,
                priority=priority,
                category=category,
                recipient=recipient,
                reference_id=reference_id,
                delivery_method='africas_talking'
            )
            
            db.session.add(notification)
            db.session.flush()
            
            # Format phone number for Uganda
            if not recipient.startswith('+'):
                if recipient.startswith('0'):
                    recipient = '+256' + recipient[1:]
                elif recipient.startswith('256'):
                    recipient = '+' + recipient
                else:
                    recipient = '+256' + recipient
            
            # Send SMS via Africa's Talking
            result = self._send_africas_talking_sms(recipient, message)
            
            # Update notification status
            notification.gateway_response = json.dumps(result)
            
            if result.get('success'):
                notification.status = 'sent'
                notification.sent_at = datetime.utcnow()
            else:
                notification.status = 'failed'
            
            db.session.commit()
            
            logger.info(f"SMS sent to {recipient}: {result.get('message', 'Unknown status')}")
            
            return {
                'success': result.get('success', False),
                'notification_id': notification.id,
                'message': result.get('message'),
                'cost': result.get('cost', 0)
            }
            
        except Exception as e:
            logger.error(f"SMS sending error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'SMS sending failed',
                'error': str(e)
            }
    
    def _send_africas_talking_sms(self, recipient, message):
        """Send SMS via Africa's Talking API"""
        try:
            headers = {
                'apiKey': self.sms_api_key,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
            
            data = {
                'username': self.sms_username,
                'to': recipient,
                'message': message,
                'from': 'SmartSchool'  # Sender ID (must be registered)
            }
            
            response = requests.post(
                self.sms_base_url,
                headers=headers,
                data=data,
                timeout=30
            )
            
            if response.status_code == 201:
                result = response.json()
                sms_data = result.get('SMSMessageData', {})
                recipients = sms_data.get('Recipients', [])
                
                if recipients and recipients[0].get('status') == 'Success':
                    return {
                        'success': True,
                        'message': 'SMS sent successfully',
                        'cost': recipients[0].get('cost'),
                        'message_id': recipients[0].get('messageId')
                    }
                else:
                    return {
                        'success': False,
                        'message': recipients[0].get('status', 'Unknown error') if recipients else 'No recipients'
                    }
            else:
                logger.error(f"Africa's Talking API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'message': 'SMS gateway error',
                    'error': response.text
                }
                
        except Exception as e:
            logger.error(f"Africa's Talking SMS error: {str(e)}")
            return {
                'success': False,
                'message': 'SMS service unavailable',
                'error': str(e)
            }
    
    def send_email(self, recipient, subject, message, user_id=None, category='general', priority='medium', reference_id=None):
        """
        Send email notification
        
        Args:
            recipient (str): Email address
            subject (str): Email subject
            message (str): Email content (can be HTML)
            user_id (int): User ID receiving the notification
            category (str): Notification category
            priority (str): Priority level
            reference_id (str): Reference to related record
            
        Returns:
            dict: Delivery status
        """
        try:
            # Create notification record
            notification = Notification(
                user_id=user_id,
                type='email',
                title=subject,
                message=message,
                priority=priority,
                category=category,
                recipient=recipient,
                reference_id=reference_id,
                delivery_method='smtp'
            )
            
            db.session.add(notification)
            db.session.flush()
            
            # Send email via SMTP
            result = self._send_smtp_email(recipient, subject, message)
            
            # Update notification status
            notification.gateway_response = json.dumps(result)
            
            if result.get('success'):
                notification.status = 'sent'
                notification.sent_at = datetime.utcnow()
            else:
                notification.status = 'failed'
            
            db.session.commit()
            
            logger.info(f"Email sent to {recipient}: {result.get('message', 'Unknown status')}")
            
            return {
                'success': result.get('success', False),
                'notification_id': notification.id,
                'message': result.get('message')
            }
            
        except Exception as e:
            logger.error(f"Email sending error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Email sending failed',
                'error': str(e)
            }
    
    def _send_smtp_email(self, recipient, subject, message):
        """Send email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.email_from
            msg['To'] = recipient
            
            # Add HTML and plain text parts
            text_part = MIMEText(message, 'plain', 'utf-8')
            html_part = MIMEText(f"<html><body>{message}</body></html>", 'html', 'utf-8')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_username, self.email_password)
            server.send_message(msg)
            server.quit()
            
            return {
                'success': True,
                'message': 'Email sent successfully'
            }
            
        except Exception as e:
            logger.error(f"SMTP email error: {str(e)}")
            return {
                'success': False,
                'message': 'Email delivery failed',
                'error': str(e)
            }
    
    def send_system_notification(self, user_id, title, message, category='general', priority='medium', reference_id=None):
        """
        Send in-app system notification
        
        Args:
            user_id (int): User ID receiving the notification
            title (str): Notification title
            message (str): Notification content
            category (str): Notification category
            priority (str): Priority level
            reference_id (str): Reference to related record
            
        Returns:
            dict: Creation status
        """
        try:
            notification = Notification(
                user_id=user_id,
                type='system',
                title=title,
                message=message,
                priority=priority,
                category=category,
                status='delivered',
                delivery_method='system',
                reference_id=reference_id,
                sent_at=datetime.utcnow(),
                delivered_at=datetime.utcnow()
            )
            
            db.session.add(notification)
            db.session.commit()
            
            logger.info(f"System notification created for user {user_id}: {title}")
            
            return {
                'success': True,
                'notification_id': notification.id,
                'message': 'System notification created'
            }
            
        except Exception as e:
            logger.error(f"System notification error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'System notification creation failed',
                'error': str(e)
            }
    
    def send_from_template(self, template_name, user_id, recipient, variables=None, delivery_type='auto'):
        """
        Send notification using a template
        
        Args:
            template_name (str): Template name
            user_id (int): User ID
            recipient (str): Phone number or email
            variables (dict): Variables to replace in template
            delivery_type (str): 'sms', 'email', 'system', or 'auto'
            
        Returns:
            dict: Delivery status
        """
        try:
            # Get template
            template = NotificationTemplate.query.filter_by(
                name=template_name,
                is_active=True
            ).first()
            
            if not template:
                return {
                    'success': False,
                    'message': f'Template {template_name} not found'
                }
            
            # Replace variables in template
            message = template.message_template
            subject = template.subject_template or template.name
            
            if variables:
                for key, value in variables.items():
                    message = message.replace(f'{{{key}}}', str(value))
                    if subject:
                        subject = subject.replace(f'{{{key}}}', str(value))
            
            # Determine delivery method
            if delivery_type == 'auto':
                delivery_type = template.type
            
            # Send notification
            if delivery_type == 'sms':
                return self.send_sms(
                    recipient=recipient,
                    message=message,
                    user_id=user_id,
                    category=template.category,
                    priority=template.priority
                )
            elif delivery_type == 'email':
                return self.send_email(
                    recipient=recipient,
                    subject=subject,
                    message=message,
                    user_id=user_id,
                    category=template.category,
                    priority=template.priority
                )
            elif delivery_type == 'system':
                return self.send_system_notification(
                    user_id=user_id,
                    title=subject,
                    message=message,
                    category=template.category,
                    priority=template.priority
                )
            else:
                return {
                    'success': False,
                    'message': f'Invalid delivery type: {delivery_type}'
                }
                
        except Exception as e:
            logger.error(f"Template notification error: {str(e)}")
            return {
                'success': False,
                'message': 'Template notification failed',
                'error': str(e)
            }
    
    def get_user_notifications(self, user_id, unread_only=False, limit=50):
        """Get notifications for a user"""
        try:
            query = Notification.query.filter_by(user_id=user_id)
            
            if unread_only:
                query = query.filter(Notification.read_at.is_(None))
            
            notifications = query.order_by(
                Notification.created_at.desc()
            ).limit(limit).all()
            
            return {
                'success': True,
                'notifications': [n.to_dict() for n in notifications],
                'total_count': len(notifications)
            }
            
        except Exception as e:
            logger.error(f"Error fetching notifications: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching notifications',
                'error': str(e)
            }
    
    def mark_notification_read(self, notification_id, user_id):
        """Mark notification as read"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if not notification:
                return {
                    'success': False,
                    'message': 'Notification not found'
                }
            
            notification.read_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Notification marked as read'
            }
            
        except Exception as e:
            logger.error(f"Error marking notification read: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error updating notification',
                'error': str(e)
            }
    
    def schedule_notification(self, scheduled_at, **kwargs):
        """Schedule a notification for future delivery"""
        try:
            # Create notification with scheduled time
            notification_data = kwargs.copy()
            notification_data['scheduled_at'] = scheduled_at
            notification_data['status'] = 'pending'
            
            notification = Notification(**notification_data)
            db.session.add(notification)
            db.session.commit()
            
            return {
                'success': True,
                'notification_id': notification.id,
                'message': 'Notification scheduled successfully'
            }
            
        except Exception as e:
            logger.error(f"Error scheduling notification: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error scheduling notification',
                'error': str(e)
            }
    
    def process_scheduled_notifications(self):
        """Process pending scheduled notifications (called by background task)"""
        try:
            now = datetime.utcnow()
            
            # Get notifications ready to be sent
            pending_notifications = Notification.query.filter(
                Notification.status == 'pending',
                Notification.scheduled_at <= now
            ).all()
            
            processed_count = 0
            
            for notification in pending_notifications:
                try:
                    if notification.type == 'sms':
                        result = self._send_africas_talking_sms(
                            notification.recipient,
                            notification.message
                        )
                    elif notification.type == 'email':
                        result = self._send_smtp_email(
                            notification.recipient,
                            notification.title,
                            notification.message
                        )
                    else:
                        # System notifications are immediately delivered
                        result = {'success': True}
                    
                    # Update notification status
                    if result.get('success'):
                        notification.status = 'sent'
                        notification.sent_at = datetime.utcnow()
                        if notification.type == 'system':
                            notification.delivered_at = datetime.utcnow()
                    else:
                        notification.status = 'failed'
                        notification.retry_count += 1
                    
                    notification.gateway_response = json.dumps(result)
                    processed_count += 1
                    
                except Exception as e:
                    logger.error(f"Error processing notification {notification.id}: {str(e)}")
                    notification.status = 'failed'
                    notification.retry_count += 1
            
            db.session.commit()
            
            logger.info(f"Processed {processed_count} scheduled notifications")
            
            return {
                'success': True,
                'processed_count': processed_count
            }
            
        except Exception as e:
            logger.error(f"Error processing scheduled notifications: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
