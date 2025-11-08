from app import db
from datetime import datetime

class StudentAchievement(db.Model):
    """Student achievements and awards model"""
    __tablename__ = 'student_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    award_level = db.Column(db.String(20), default='school')
    achievement_date = db.Column(db.Date, nullable=False)
    academic_year = db.Column(db.String(20))
    semester = db.Column(db.String(50))
    points_awarded = db.Column(db.Integer, default=0)
    certificate_issued = db.Column(db.Boolean, default=False)
    certificate_number = db.Column(db.String(100))
    certificate_url = db.Column(db.String(500))
    awarded_by = db.Column(db.String(255))
    verified = db.Column(db.Boolean, default=False)
    verified_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    display_on_profile = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = db.relationship('User', foreign_keys=[student_id], backref='achievements')
    verifier = db.relationship('User', foreign_keys=[verified_by])
    
    def __repr__(self):
        return f'<StudentAchievement {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'achievement_type': self.achievement_type,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'award_level': self.award_level,
            'achievement_date': self.achievement_date.isoformat() if self.achievement_date else None,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'points_awarded': self.points_awarded,
            'certificate_issued': self.certificate_issued,
            'certificate_number': self.certificate_number,
            'certificate_url': self.certificate_url,
            'awarded_by': self.awarded_by,
            'verified': self.verified,
            'display_on_profile': self.display_on_profile,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
