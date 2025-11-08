from datetime import datetime
from app import db
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class CocurricularActivity(db.Model):
    __tablename__ = 'cocurricular_activities'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Activity Classification
    category = Column(String(50), nullable=False)  # sports, arts, clubs, community_service, leadership
    subcategory = Column(String(100))  # football, debate, music, drama, etc.
    activity_type = Column(String(50), default='regular')  # regular, competition, event, workshop
    
    # Scheduling
    schedule_type = Column(String(20), default='weekly')  # daily, weekly, monthly, seasonal, event
    meeting_days = Column(JSON)  # List of days (0=Monday, 6=Sunday)
    start_time = Column(String(8))  # HH:MM:SS format
    end_time = Column(String(8))  # HH:MM:SS format
    venue = Column(String(200))
    
    # Academic Integration
    academic_credit = Column(Boolean, default=False)
    credit_hours = Column(Float, default=0.0)
    grade_level_requirement = Column(JSON)  # List of grade levels (S1, S2, etc.)
    
    # Capacity and Requirements
    max_participants = Column(Integer, default=50)
    min_participants = Column(Integer, default=5)
    skill_level_required = Column(String(20), default='beginner')  # beginner, intermediate, advanced
    prerequisites = Column(JSON)  # List of prerequisites
    
    # Supervision
    supervisor_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    assistant_supervisors = Column(JSON)  # List of assistant supervisor IDs
    
    # Resources and Budget
    equipment_needed = Column(JSON)  # List of equipment/resources needed
    budget_allocated = Column(Float, default=0.0)
    budget_spent = Column(Float, default=0.0)
    
    # Status and Dates
    status = Column(String(20), default='active')  # active, inactive, suspended, completed
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    registration_deadline = Column(DateTime)
    
    # Performance Tracking
    total_participants = Column(Integer, default=0)
    active_participants = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    satisfaction_rating = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    supervisor = relationship('User', foreign_keys=[supervisor_id], backref='supervised_activities')
    creator = relationship('User', foreign_keys=[created_by], backref='created_activities')
    participations = relationship('CocurricularParticipation', backref='activity', cascade='all, delete-orphan')
    events = relationship('CocurricularEvent', backref='activity', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'subcategory': self.subcategory,
            'activity_type': self.activity_type,
            'schedule_type': self.schedule_type,
            'meeting_days': self.meeting_days,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'venue': self.venue,
            'academic_credit': self.academic_credit,
            'credit_hours': self.credit_hours,
            'grade_level_requirement': self.grade_level_requirement,
            'max_participants': self.max_participants,
            'min_participants': self.min_participants,
            'skill_level_required': self.skill_level_required,
            'prerequisites': self.prerequisites,
            'supervisor_id': self.supervisor_id,
            'supervisor_name': self.supervisor.full_name if self.supervisor else None,
            'assistant_supervisors': self.assistant_supervisors,
            'equipment_needed': self.equipment_needed,
            'budget_allocated': self.budget_allocated,
            'budget_spent': self.budget_spent,
            'status': self.status,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'registration_deadline': self.registration_deadline.isoformat() if self.registration_deadline else None,
            'total_participants': self.total_participants,
            'active_participants': self.active_participants,
            'completion_rate': self.completion_rate,
            'satisfaction_rating': self.satisfaction_rating,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CocurricularParticipation(db.Model):
    __tablename__ = 'cocurricular_participations'
    
    id = Column(Integer, primary_key=True)
    activity_id = Column(Integer, ForeignKey('cocurricular_activities.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Participation Details
    role = Column(String(50), default='member')  # member, leader, captain, secretary, treasurer
    participation_level = Column(String(20), default='regular')  # regular, competitive, leadership
    
    # Dates
    joined_date = Column(DateTime, default=datetime.utcnow)
    left_date = Column(DateTime)
    expected_completion_date = Column(DateTime)
    
    # Performance Tracking
    attendance_count = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    attendance_percentage = Column(Float, default=0.0)
    
    # Skills and Achievements
    skills_developed = Column(JSON)  # List of skills developed
    achievements = Column(JSON)  # List of achievements/awards
    certifications = Column(JSON)  # List of certifications earned
    
    # Assessment
    performance_rating = Column(Float, default=0.0)  # 0-5 scale
    leadership_score = Column(Float, default=0.0)  # Leadership assessment
    teamwork_score = Column(Float, default=0.0)  # Teamwork assessment
    commitment_score = Column(Float, default=0.0)  # Commitment assessment
    
    # Feedback
    supervisor_feedback = Column(Text)
    peer_feedback = Column(Text)
    self_reflection = Column(Text)
    
    # Status
    status = Column(String(20), default='active')  # active, inactive, completed, dropped
    completion_certificate = Column(String(500))  # Path to completion certificate
    
    # Academic Impact
    academic_improvement = Column(Float)  # Impact on academic performance
    discipline_improvement = Column(Float)  # Impact on discipline
    social_skills_improvement = Column(Float)  # Impact on social skills
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', backref='cocurricular_participations_list')
    attendance_records = relationship('CocurricularAttendance', backref='participation', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'activity_name': self.activity.name if self.activity else None,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'role': self.role,
            'participation_level': self.participation_level,
            'joined_date': self.joined_date.isoformat(),
            'left_date': self.left_date.isoformat() if self.left_date else None,
            'expected_completion_date': self.expected_completion_date.isoformat() if self.expected_completion_date else None,
            'attendance_count': self.attendance_count,
            'total_sessions': self.total_sessions,
            'attendance_percentage': self.attendance_percentage,
            'skills_developed': self.skills_developed,
            'achievements': self.achievements,
            'certifications': self.certifications,
            'performance_rating': self.performance_rating,
            'leadership_score': self.leadership_score,
            'teamwork_score': self.teamwork_score,
            'commitment_score': self.commitment_score,
            'supervisor_feedback': self.supervisor_feedback,
            'peer_feedback': self.peer_feedback,
            'self_reflection': self.self_reflection,
            'status': self.status,
            'completion_certificate': self.completion_certificate,
            'academic_improvement': self.academic_improvement,
            'discipline_improvement': self.discipline_improvement,
            'social_skills_improvement': self.social_skills_improvement,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CocurricularEvent(db.Model):
    __tablename__ = 'cocurricular_events'
    
    id = Column(Integer, primary_key=True)
    activity_id = Column(Integer, ForeignKey('cocurricular_activities.id'), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Event Details
    event_type = Column(String(50), nullable=False)  # practice, competition, performance, workshop, trip
    event_date = Column(DateTime, nullable=False)
    start_time = Column(String(8))  # HH:MM:SS format
    end_time = Column(String(8))  # HH:MM:SS format
    venue = Column(String(200))
    
    # Participation
    required_attendance = Column(Boolean, default=False)
    max_participants = Column(Integer)
    registered_participants = Column(Integer, default=0)
    actual_participants = Column(Integer, default=0)
    
    # Resources
    equipment_needed = Column(JSON)
    budget_required = Column(Float, default=0.0)
    budget_approved = Column(Float, default=0.0)
    
    # External Details
    external_participants = Column(JSON)  # Other schools/organizations participating
    competition_level = Column(String(20))  # school, district, regional, national, international
    
    # Results and Outcomes
    results = Column(JSON)  # Competition results, rankings, scores
    achievements = Column(JSON)  # Awards, recognitions earned
    media_coverage = Column(JSON)  # Photos, videos, news coverage
    
    # Feedback and Assessment
    participant_feedback = Column(JSON)  # Feedback from participants
    supervisor_assessment = Column(Text)
    lessons_learned = Column(Text)
    improvement_suggestions = Column(Text)
    
    # Status
    status = Column(String(20), default='planned')  # planned, ongoing, completed, cancelled
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    creator = relationship('User', backref='created_events')
    attendance_records = relationship('CocurricularAttendance', backref='event', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'activity_id': self.activity_id,
            'activity_name': self.activity.name if self.activity else None,
            'name': self.name,
            'description': self.description,
            'event_type': self.event_type,
            'event_date': self.event_date.isoformat(),
            'start_time': self.start_time,
            'end_time': self.end_time,
            'venue': self.venue,
            'required_attendance': self.required_attendance,
            'max_participants': self.max_participants,
            'registered_participants': self.registered_participants,
            'actual_participants': self.actual_participants,
            'equipment_needed': self.equipment_needed,
            'budget_required': self.budget_required,
            'budget_approved': self.budget_approved,
            'external_participants': self.external_participants,
            'competition_level': self.competition_level,
            'results': self.results,
            'achievements': self.achievements,
            'media_coverage': self.media_coverage,
            'participant_feedback': self.participant_feedback,
            'supervisor_assessment': self.supervisor_assessment,
            'lessons_learned': self.lessons_learned,
            'improvement_suggestions': self.improvement_suggestions,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CocurricularAttendance(db.Model):
    __tablename__ = 'cocurricular_attendance'
    
    id = Column(Integer, primary_key=True)
    participation_id = Column(Integer, ForeignKey('cocurricular_participations.id'), nullable=False)
    event_id = Column(Integer, ForeignKey('cocurricular_events.id'))
    
    # Attendance Details
    attendance_date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False)  # present, absent, late, excused, partial
    arrival_time = Column(DateTime)
    departure_time = Column(DateTime)
    
    # Performance During Session
    participation_quality = Column(String(20))  # excellent, good, fair, poor
    engagement_level = Column(Float, default=0.0)  # 0-5 scale
    behavior_rating = Column(Float, default=0.0)  # 0-5 scale
    
    # Notes and Feedback
    supervisor_notes = Column(Text)
    achievements_today = Column(Text)
    areas_for_improvement = Column(Text)
    
    # Excuse and Reasons
    excuse_reason = Column(String(200))
    excuse_documentation = Column(String(500))  # Path to excuse letter/document
    
    # Metadata
    recorded_by = Column(Integer, ForeignKey('user.id'))
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    recorder = relationship('User', backref='recorded_cocurricular_attendance')
    
    def to_dict(self):
        return {
            'id': self.id,
            'participation_id': self.participation_id,
            'student_name': self.participation.student.full_name if self.participation and self.participation.student else None,
            'activity_name': self.participation.activity.name if self.participation and self.participation.activity else None,
            'event_id': self.event_id,
            'event_name': self.event.name if self.event else None,
            'attendance_date': self.attendance_date.isoformat(),
            'status': self.status,
            'arrival_time': self.arrival_time.isoformat() if self.arrival_time else None,
            'departure_time': self.departure_time.isoformat() if self.departure_time else None,
            'participation_quality': self.participation_quality,
            'engagement_level': self.engagement_level,
            'behavior_rating': self.behavior_rating,
            'supervisor_notes': self.supervisor_notes,
            'achievements_today': self.achievements_today,
            'areas_for_improvement': self.areas_for_improvement,
            'excuse_reason': self.excuse_reason,
            'excuse_documentation': self.excuse_documentation,
            'recorded_by': self.recorded_by,
            'recorder_name': self.recorder.full_name if self.recorder else None,
            'recorded_at': self.recorded_at.isoformat()
        }

class CocurricularAchievement(db.Model):
    __tablename__ = 'cocurricular_achievements'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    activity_id = Column(Integer, ForeignKey('cocurricular_activities.id'), nullable=False)
    
    # Achievement Details
    achievement_type = Column(String(50), nullable=False)  # award, certificate, recognition, skill, leadership
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Achievement Level
    level = Column(String(20), nullable=False)  # school, district, regional, national, international
    category = Column(String(100))  # First place, participation, excellence, etc.
    
    # Date and Context
    achievement_date = Column(DateTime, nullable=False)
    event_context = Column(String(200))  # Competition, performance, etc.
    
    # Verification
    certificate_path = Column(String(500))  # Path to certificate/document
    verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey('user.id'))
    verified_at = Column(DateTime)
    
    # Impact Assessment
    skill_impact = Column(JSON)  # Skills developed/demonstrated
    academic_impact = Column(Float)  # Impact on academic performance
    leadership_impact = Column(Float)  # Leadership development impact
    
    # Recognition
    public_recognition = Column(Boolean, default=False)
    media_coverage = Column(JSON)  # Media coverage details
    school_announcement = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    student = relationship('User', foreign_keys=[student_id], backref='cocurricular_achievements')
    verifier = relationship('User', foreign_keys=[verified_by], backref='verified_achievements')
    creator = relationship('User', foreign_keys=[created_by], backref='recorded_achievements')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'activity_id': self.activity_id,
            'activity_name': self.activity.name if self.activity else None,
            'achievement_type': self.achievement_type,
            'title': self.title,
            'description': self.description,
            'level': self.level,
            'category': self.category,
            'achievement_date': self.achievement_date.isoformat(),
            'event_context': self.event_context,
            'certificate_path': self.certificate_path,
            'verified': self.verified,
            'verified_by': self.verified_by,
            'verifier_name': self.verifier.full_name if self.verifier else None,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'skill_impact': self.skill_impact,
            'academic_impact': self.academic_impact,
            'leadership_impact': self.leadership_impact,
            'public_recognition': self.public_recognition,
            'media_coverage': self.media_coverage,
            'school_announcement': self.school_announcement,
            'created_at': self.created_at.isoformat()
        }
