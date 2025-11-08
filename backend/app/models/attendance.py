from app import db
from datetime import datetime

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    type = db.Column(db.String(20), nullable=False)  # 'student', 'teacher', 'staff'
    status = db.Column(db.String(20), nullable=False)  # 'present', 'absent', 'late', etc.
    
    # Enhanced fields for RFID and biometric tracking
    method = db.Column(db.String(20))  # 'rfid', 'biometric', 'manual'
    rfid_card_id = db.Column(db.String(50))  # RFID card used
    biometric_verified = db.Column(db.Boolean, default=False)
    location = db.Column(db.String(100))  # Gate/classroom location
    device_id = db.Column(db.String(50))  # RFID reader or biometric device ID
    
    # Geolocation for mobile check-ins (optional)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Additional metadata
    notes = db.Column(db.Text)
    verified_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # Manual verification
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'timestamp': self.timestamp.isoformat(),
            'type': self.type,
            'status': self.status,
            'method': self.method,
            'rfid_card_id': self.rfid_card_id,
            'biometric_verified': self.biometric_verified,
            'location': self.location,
            'device_id': self.device_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
