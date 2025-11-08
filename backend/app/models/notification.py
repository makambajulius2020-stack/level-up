from app import db
from datetime import datetime

class Notification(db.Model):
    """Notification system for SMS, Email, and System notifications"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Notification details
    type = db.Column(db.String(20), nullable=False)  # sms, email, system, push
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(10), default='medium')  # low, medium, high, urgent
    
    # Delivery details
    status = db.Column(db.String(20), default='pending')  # pending, sent, delivered, failed
    delivery_method = db.Column(db.String(50))  # sms_gateway, email_smtp, firebase, etc.
    recipient = db.Column(db.String(255))  # phone number or email
    
    # Scheduling
    scheduled_at = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    read_at = db.Column(db.DateTime)
    
    # Metadata
    category = db.Column(db.String(50))  # attendance, payment, academic, emergency
    reference_id = db.Column(db.String(100))  # Reference to related record
    reference_type = db.Column(db.String(50))  # payment, attendance, etc.
    
    # Response tracking
    gateway_response = db.Column(db.Text)  # JSON response from SMS/Email gateway
    retry_count = db.Column(db.Integer, default=0)
    max_retries = db.Column(db.Integer, default=3)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'priority': self.priority,
            'status': self.status,
            'recipient': self.recipient,
            'category': self.category,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat()
        }

class NotificationTemplate(db.Model):
    """Templates for common notifications"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # sms, email, system
    
    # Template content
    subject_template = db.Column(db.String(255))
    message_template = db.Column(db.Text, nullable=False)
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    auto_send = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(10), default='medium')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'type': self.type,
            'subject_template': self.subject_template,
            'message_template': self.message_template,
            'is_active': self.is_active,
            'auto_send': self.auto_send,
            'priority': self.priority
        }
