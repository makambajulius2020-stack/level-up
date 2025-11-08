from app import db
from datetime import datetime

class BiometricData(db.Model):
    """Biometric data model for fingerprint authentication"""
    __tablename__ = 'biometric_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    biometric_type = db.Column(db.String(20), nullable=False, default='fingerprint')
    biometric_hash = db.Column(db.Text, nullable=False)
    template_data = db.Column(db.LargeBinary, nullable=False)
    finger_position = db.Column(db.String(20))
    quality_score = db.Column(db.Integer, default=0)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_verified = db.Column(db.DateTime)
    verification_count = db.Column(db.Integer, default=0)
    failed_attempts = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    enrolled_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    device_id = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='biometric_data')
    enrolled_by_user = db.relationship('User', foreign_keys=[enrolled_by])
    
    def __repr__(self):
        return f'<BiometricData user_id={self.user_id} type={self.biometric_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'biometric_type': self.biometric_type,
            'finger_position': self.finger_position,
            'quality_score': self.quality_score,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'last_verified': self.last_verified.isoformat() if self.last_verified else None,
            'verification_count': self.verification_count,
            'failed_attempts': self.failed_attempts,
            'is_active': self.is_active,
            'device_id': self.device_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BiometricAttendanceLog(db.Model):
    """Biometric attendance log model"""
    __tablename__ = 'biometric_attendance_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    biometric_id = db.Column(db.Integer, db.ForeignKey('biometric_data.id'), nullable=False)
    scan_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    scan_type = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(255))
    device_id = db.Column(db.String(100))
    match_score = db.Column(db.Integer, default=0)
    verification_status = db.Column(db.String(20), nullable=False)
    failure_reason = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='biometric_logs')
    biometric = db.relationship('BiometricData', foreign_keys=[biometric_id])
    
    def __repr__(self):
        return f'<BiometricAttendanceLog user_id={self.user_id} status={self.verification_status}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scan_timestamp': self.scan_timestamp.isoformat() if self.scan_timestamp else None,
            'scan_type': self.scan_type,
            'location': self.location,
            'match_score': self.match_score,
            'verification_status': self.verification_status,
            'failure_reason': self.failure_reason
        }
