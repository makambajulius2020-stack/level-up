from app import db
from datetime import datetime

class OnlineClass(db.Model):
    """Online class model for virtual learning sessions"""
    __tablename__ = 'online_classes'
    
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    class_level = db.Column(db.String(10))
    scheduled_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=60)  # Duration in minutes
    description = db.Column(db.Text)
    meeting_link = db.Column(db.String(500))
    status = db.Column(db.String(20), default='scheduled')  # scheduled, live, completed, cancelled
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = db.relationship('User', backref='online_classes', foreign_keys=[teacher_id])
    participants = db.relationship('OnlineClassParticipant', backref='online_class', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<OnlineClass {self.title}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'teacher_id': self.teacher_id,
            'title': self.title,
            'subject': self.subject,
            'class_level': self.class_level,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'duration': self.duration,
            'description': self.description,
            'meeting_link': self.meeting_link,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'participants_count': len(self.participants) if self.participants else 0
        }


class OnlineClassParticipant(db.Model):
    """Participants in online classes"""
    __tablename__ = 'online_class_participants'
    
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('online_classes.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    joined_at = db.Column(db.DateTime)
    left_at = db.Column(db.DateTime)
    
    # Relationships
    student = db.relationship('User', backref='class_participations', foreign_keys=[student_id])
    
    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('class_id', 'student_id', name='unique_participant'),
    )
    
    def __repr__(self):
        return f'<OnlineClassParticipant class_id={self.class_id} student_id={self.student_id}>'
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'class_id': self.class_id,
            'student_id': self.student_id,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'left_at': self.left_at.isoformat() if self.left_at else None
        }
