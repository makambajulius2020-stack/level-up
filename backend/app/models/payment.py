from app import db
from datetime import datetime

class Payment(db.Model):
    """Payment records for school fees and other charges"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    student_id = db.Column(db.String(20))  # For parent payments
    
    # Payment details
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='UGX')  # Uganda Shillings
    method = db.Column(db.String(50), nullable=False)  # mtn_momo, airtel_money, stripe, bank
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    
    # Payment gateway details
    gateway_transaction_id = db.Column(db.String(100))
    gateway_reference = db.Column(db.String(100))
    gateway_response = db.Column(db.Text)  # JSON response from gateway
    
    # Fee details
    fee_type = db.Column(db.String(50))  # tuition, transport, meals, etc.
    academic_term = db.Column(db.String(20))
    academic_year = db.Column(db.String(10))
    
    # Timestamps
    initiated_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Metadata
    description = db.Column(db.String(255))
    notes = db.Column(db.Text)  # JSON string for additional data like course_id, stored as JSON
    receipt_number = db.Column(db.String(50), unique=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'student_id': self.student_id,
            'amount': self.amount,
            'currency': self.currency,
            'method': self.method,
            'status': self.status,
            'gateway_transaction_id': self.gateway_transaction_id,
            'fee_type': self.fee_type,
            'academic_term': self.academic_term,
            'academic_year': self.academic_year,
            'initiated_at': self.initiated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'description': self.description,
            'receipt_number': self.receipt_number
        }

class PaymentGatewayConfig(db.Model):
    """Configuration for payment gateways"""
    id = db.Column(db.Integer, primary_key=True)
    gateway_name = db.Column(db.String(50), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Configuration (encrypted in production)
    api_key = db.Column(db.String(255))
    secret_key = db.Column(db.String(255))
    webhook_url = db.Column(db.String(255))
    callback_url = db.Column(db.String(255))
    
    # Settings
    min_amount = db.Column(db.Float, default=1000)  # Minimum 1000 UGX
    max_amount = db.Column(db.Float, default=10000000)  # Maximum 10M UGX
    currency = db.Column(db.String(3), default='UGX')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'gateway_name': self.gateway_name,
            'is_active': self.is_active,
            'min_amount': self.min_amount,
            'max_amount': self.max_amount,
            'currency': self.currency
        }
