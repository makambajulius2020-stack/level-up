from app import db
from datetime import datetime

class AIAnalytics(db.Model):
    """AI-powered analytics and insights"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Analytics type and data
    analysis_type = db.Column(db.String(50), nullable=False)  # performance, dropout_risk, behavior
    subject_area = db.Column(db.String(100))  # Mathematics, English, Science, etc.
    
    # Scores and metrics
    performance_score = db.Column(db.Float)  # 0-100 scale
    dropout_risk_score = db.Column(db.Float)  # 0-1 probability
    engagement_score = db.Column(db.Float)  # 0-100 scale
    attendance_rate = db.Column(db.Float)  # 0-100 percentage
    
    # Predictions and recommendations
    predicted_grade = db.Column(db.String(5))  # A, B+, B, etc.
    risk_factors = db.Column(db.Text)  # JSON array of risk factors
    recommendations = db.Column(db.Text)  # JSON array of recommendations
    intervention_suggested = db.Column(db.Boolean, default=False)
    
    # Academic period
    academic_term = db.Column(db.String(20))
    academic_year = db.Column(db.String(10))
    
    # AI model details
    model_version = db.Column(db.String(20))
    confidence_score = db.Column(db.Float)  # Model confidence 0-1
    data_points_used = db.Column(db.Integer)  # Number of data points in analysis
    
    # Timestamps
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'analysis_type': self.analysis_type,
            'subject_area': self.subject_area,
            'performance_score': self.performance_score,
            'dropout_risk_score': self.dropout_risk_score,
            'engagement_score': self.engagement_score,
            'attendance_rate': self.attendance_rate,
            'predicted_grade': self.predicted_grade,
            'risk_factors': self.risk_factors,
            'recommendations': self.recommendations,
            'intervention_suggested': self.intervention_suggested,
            'academic_term': self.academic_term,
            'academic_year': self.academic_year,
            'confidence_score': self.confidence_score,
            'analysis_date': self.analysis_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }

class PlagiarismCheck(db.Model):
    """Plagiarism detection for student submissions"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Submission details
    assignment_id = db.Column(db.String(50))
    submission_title = db.Column(db.String(255))
    submission_content = db.Column(db.Text)  # Or file path
    file_path = db.Column(db.String(500))
    file_hash = db.Column(db.String(64))  # SHA-256 hash of file
    
    # Plagiarism analysis
    plagiarism_score = db.Column(db.Float)  # 0-100 percentage
    similarity_threshold = db.Column(db.Float, default=25.0)  # Threshold for flagging
    is_flagged = db.Column(db.Boolean, default=False)
    
    # Detection details
    sources_found = db.Column(db.Text)  # JSON array of similar sources
    similar_submissions = db.Column(db.Text)  # JSON array of similar student work
    detection_method = db.Column(db.String(50))  # turnitin, copyleaks, custom
    
    # Review process
    reviewed_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # Teacher who reviewed
    review_status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    review_notes = db.Column(db.Text)
    reviewed_at = db.Column(db.DateTime)
    
    # Academic context
    subject = db.Column(db.String(100))
    academic_term = db.Column(db.String(20))
    academic_year = db.Column(db.String(10))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'assignment_id': self.assignment_id,
            'submission_title': self.submission_title,
            'plagiarism_score': self.plagiarism_score,
            'similarity_threshold': self.similarity_threshold,
            'is_flagged': self.is_flagged,
            'detection_method': self.detection_method,
            'review_status': self.review_status,
            'subject': self.subject,
            'academic_term': self.academic_term,
            'academic_year': self.academic_year,
            'created_at': self.created_at.isoformat(),
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None
        }
