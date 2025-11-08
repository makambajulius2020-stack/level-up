from app import db
from datetime import datetime

class User(db.Model):
    """
    User model with email-based role detection.
    
    Email patterns for automatic role assignment:
    - .admin@gmail.com → admin role
    - .teacher@gmail.com → teacher role
    - .student@gmail.com → student role
    - Other emails → default to student role
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)  # admin, teacher, student
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Enhanced fields for Uganda compliance and functionality
    phone_number = db.Column(db.String(20))
    student_id = db.Column(db.String(20), unique=True)  # For students: STU001, etc.
    employee_id = db.Column(db.String(20), unique=True)  # For staff: TCH/2024/001, etc.
    rfid_card_id = db.Column(db.String(50), unique=True)  # For RFID attendance
    biometric_template = db.Column(db.Text)  # Encrypted biometric data
    
    # Compliance fields for Uganda Data Protection Act
    consent_given = db.Column(db.Boolean, default=False)
    consent_date = db.Column(db.DateTime)
    data_retention_until = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    attendance_records = db.relationship('Attendance', foreign_keys='Attendance.user_id', backref='user', lazy=True)
    verified_attendance = db.relationship('Attendance', foreign_keys='Attendance.verified_by', backref='verifier', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone_number': self.phone_number,
            'student_id': self.student_id,
            'employee_id': self.employee_id,
            'rfid_card_id': self.rfid_card_id,
            'consent_given': self.consent_given,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class AuditLog(db.Model):
    """Audit trail for compliance with Uganda Data Protection Act"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action = db.Column(db.String(100), nullable=False)  # CREATE, READ, UPDATE, DELETE
    table_name = db.Column(db.String(50), nullable=False)
    record_id = db.Column(db.Integer)
    old_values = db.Column(db.Text)  # JSON string of old values
    new_values = db.Column(db.Text)  # JSON string of new values
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'table_name': self.table_name,
            'record_id': self.record_id,
            'timestamp': self.timestamp.isoformat()
        }

class SystemSettings(db.Model):
    """System configuration and settings"""
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    description = db.Column(db.String(255))
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'description': self.description,
            'updated_at': self.updated_at.isoformat()
        }
