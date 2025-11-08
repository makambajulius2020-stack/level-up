"""
Secure Messaging Service
Handles communication between teachers, students, and parents
"""
import logging
from datetime import datetime
from app import db
from app.models.profile import Message
from app.models.user import User
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class MessagingService:
    def __init__(self):
        self.notification_service = NotificationService()
    
    def send_message(self, sender_id, recipient_id, subject, content, message_type='text', attachment_path=None, attachment_name=None, is_urgent=False):
        """
        Send a message between users
        
        Args:
            sender_id (int): Sender user ID
            recipient_id (int): Recipient user ID
            subject (str): Message subject
            content (str): Message content
            message_type (str): Type of message
            attachment_path (str): Path to attachment file
            attachment_name (str): Name of attachment
            is_urgent (bool): Whether message is urgent
            
        Returns:
            dict: Send result
        """
        try:
            # Validate users exist
            sender = User.query.get(sender_id)
            recipient = User.query.get(recipient_id)
            
            if not sender or not recipient:
                return {'success': False, 'message': 'Invalid sender or recipient'}
            
            # Check if communication is allowed
            if not self._is_communication_allowed(sender, recipient):
                return {'success': False, 'message': 'Communication not allowed between these users'}
            
            # Create message
            message = Message(
                sender_id=sender_id,
                recipient_id=recipient_id,
                subject=subject,
                content=content,
                message_type=message_type,
                attachment_path=attachment_path,
                attachment_name=attachment_name,
                is_urgent=is_urgent
            )
            
            db.session.add(message)
            db.session.commit()
            
            # Send notification to recipient
            self._notify_new_message(message)
            
            logger.info(f"Message sent from {sender_id} to {recipient_id}")
            
            return {
                'success': True,
                'message': 'Message sent successfully',
                'message_id': message.id
            }
            
        except Exception as e:
            logger.error(f"Message sending error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error sending message',
                'error': str(e)
            }
    
    def get_inbox(self, user_id, page=1, per_page=20, unread_only=False):
        """Get user's inbox messages"""
        try:
            query = Message.query.filter_by(
                recipient_id=user_id,
                is_deleted_by_recipient=False
            )
            
            if unread_only:
                query = query.filter_by(is_read=False)
            
            messages = query.order_by(Message.sent_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'messages': [msg.to_dict() for msg in messages.items],
                'total': messages.total,
                'pages': messages.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching inbox: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching messages',
                'error': str(e)
            }
    
    def get_sent_messages(self, user_id, page=1, per_page=20):
        """Get user's sent messages"""
        try:
            messages = Message.query.filter_by(
                sender_id=user_id,
                is_deleted_by_sender=False
            ).order_by(Message.sent_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'messages': [msg.to_dict() for msg in messages.items],
                'total': messages.total,
                'pages': messages.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching sent messages: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching sent messages',
                'error': str(e)
            }
    
    def mark_as_read(self, message_id, user_id):
        """Mark message as read"""
        try:
            message = Message.query.filter_by(
                id=message_id,
                recipient_id=user_id
            ).first()
            
            if not message:
                return {'success': False, 'message': 'Message not found'}
            
            if not message.is_read:
                message.is_read = True
                message.read_at = datetime.utcnow()
                db.session.commit()
            
            return {
                'success': True,
                'message': 'Message marked as read'
            }
            
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error updating message',
                'error': str(e)
            }
    
    def delete_message(self, message_id, user_id):
        """Delete message (soft delete)"""
        try:
            message = Message.query.get(message_id)
            if not message:
                return {'success': False, 'message': 'Message not found'}
            
            # Soft delete based on user role
            if message.sender_id == user_id:
                message.is_deleted_by_sender = True
            elif message.recipient_id == user_id:
                message.is_deleted_by_recipient = True
            else:
                return {'success': False, 'message': 'Unauthorized to delete this message'}
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Message deleted successfully'
            }
            
        except Exception as e:
            logger.error(f"Error deleting message: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error deleting message',
                'error': str(e)
            }
    
    def get_conversation(self, user1_id, user2_id, page=1, per_page=50):
        """Get conversation between two users"""
        try:
            messages = Message.query.filter(
                ((Message.sender_id == user1_id) & (Message.recipient_id == user2_id)) |
                ((Message.sender_id == user2_id) & (Message.recipient_id == user1_id))
            ).filter(
                ~((Message.sender_id == user1_id) & (Message.is_deleted_by_sender == True)) &
                ~((Message.recipient_id == user1_id) & (Message.is_deleted_by_recipient == True))
            ).order_by(Message.sent_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'messages': [msg.to_dict() for msg in messages.items],
                'total': messages.total,
                'pages': messages.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching conversation: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching conversation',
                'error': str(e)
            }
    
    def get_unread_count(self, user_id):
        """Get count of unread messages"""
        try:
            count = Message.query.filter_by(
                recipient_id=user_id,
                is_read=False,
                is_deleted_by_recipient=False
            ).count()
            
            return {
                'success': True,
                'unread_count': count
            }
            
        except Exception as e:
            logger.error(f"Error getting unread count: {str(e)}")
            return {
                'success': False,
                'unread_count': 0,
                'error': str(e)
            }
    
    def broadcast_message(self, sender_id, recipient_role, subject, content, class_level=None, department=None):
        """Broadcast message to multiple users"""
        try:
            sender = User.query.get(sender_id)
            if not sender or sender.role not in ['admin', 'teacher']:
                return {'success': False, 'message': 'Unauthorized to broadcast messages'}
            
            # Build recipient query
            query = User.query.filter_by(role=recipient_role)
            
            if class_level and recipient_role == 'student':
                query = query.join(UserProfile).filter(UserProfile.class_level == class_level)
            
            if department and recipient_role in ['teacher', 'admin']:
                query = query.join(UserProfile).filter(UserProfile.department == department)
            
            recipients = query.all()
            
            sent_count = 0
            for recipient in recipients:
                try:
                    message = Message(
                        sender_id=sender_id,
                        recipient_id=recipient.id,
                        subject=subject,
                        content=content,
                        message_type='announcement'
                    )
                    db.session.add(message)
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Error sending to {recipient.id}: {str(e)}")
            
            db.session.commit()
            
            logger.info(f"Broadcast message sent to {sent_count} recipients")
            
            return {
                'success': True,
                'message': f'Message broadcast to {sent_count} recipients',
                'sent_count': sent_count
            }
            
        except Exception as e:
            logger.error(f"Broadcast message error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error broadcasting message',
                'error': str(e)
            }
    
    def _is_communication_allowed(self, sender, recipient):
        """Check if communication is allowed between users"""
        # Admin can message anyone
        if sender.role == 'admin':
            return True
        
        # Teachers can message students, parents, and other teachers
        if sender.role == 'teacher':
            return recipient.role in ['student', 'teacher', 'admin']
        
        # Students can message teachers and admin
        if sender.role == 'student':
            return recipient.role in ['teacher', 'admin']
        
        # Parent role removed - feature not available
        
        return False
    
    def _notify_new_message(self, message):
        """Send notification for new message"""
        try:
            recipient = message.recipient
            sender = message.sender
            
            if recipient.email:
                # Send email notification
                email_subject = f"New message from {sender.name}"
                email_content = f"""
                You have received a new message from {sender.name}.
                
                Subject: {message.subject}
                
                Please log in to the Smart School system to read the full message.
                
                Smart School Team
                """
                
                self.notification_service.send_email(
                    recipient=recipient.email,
                    subject=email_subject,
                    message=email_content,
                    user_id=recipient.id,
                    category='messaging',
                    priority='high' if message.is_urgent else 'medium'
                )
            
            # Send system notification
            self.notification_service.send_system_notification(
                user_id=recipient.id,
                title=f"New message from {sender.name}",
                message=f"Subject: {message.subject}",
                category='messaging',
                priority='high' if message.is_urgent else 'medium'
            )
            
        except Exception as e:
            logger.error(f"Error sending message notification: {str(e)}")
    
    def get_contacts(self, user_id):
        """Get list of contacts for a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            contacts = []
            
            if user.role == 'admin':
                # Admin can contact everyone
                contacts = User.query.filter(User.id != user_id).all()
            elif user.role == 'teacher':
                # Teachers can contact students, other teachers, and admin
                contacts = User.query.filter(
                    User.id != user_id,
                    User.role.in_(['student', 'teacher', 'admin'])
                ).all()
            elif user.role == 'student':
                # Students can contact teachers and admin
                contacts = User.query.filter(
                    User.id != user_id,
                    User.role.in_(['teacher', 'admin'])
                ).all()
            # Parent role removed - feature not available
            
            contact_list = []
            for contact in contacts:
                contact_data = contact.to_dict()
                # Add profile photo if available
                if hasattr(contact, 'profile') and contact.profile and contact.profile.profile_photo_url:
                    contact_data['profile_photo_url'] = contact.profile.profile_photo_url
                contact_list.append(contact_data)
            
            return {
                'success': True,
                'contacts': contact_list
            }
            
        except Exception as e:
            logger.error(f"Error fetching contacts: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching contacts',
                'error': str(e)
            }
