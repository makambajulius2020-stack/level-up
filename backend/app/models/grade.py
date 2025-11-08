from datetime import datetime
from app import db
from app.models.class_management import SchoolClass
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Grade(db.Model):
    __tablename__ = 'grades'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)  # Maps to Course model  # Maps to Course model (table name is 'subjects' for compatibility)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Assessment Details
    assessment_type = Column(String(50), nullable=False)  # exam, assignment, quiz, project, practical
    assessment_name = Column(String(200), nullable=False)
    assessment_id = Column(Integer)  # Reference to specific exam/assignment
    
    # Grade Information
    score = Column(Float, nullable=False)  # Raw score
    max_score = Column(Float, nullable=False)  # Maximum possible score
    percentage = Column(Float, nullable=False)  # Calculated percentage
    letter_grade = Column(String(5))  # A, B, C, D, F
    grade_points = Column(Float)  # GPA points (4.0 scale)
    
    # Academic Period
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(10), nullable=False)  # Semester 1, Semester 2, Semester 3
    week = Column(Integer)  # Week number in semester
    
    # Assessment Metadata
    assessment_date = Column(DateTime, nullable=False)
    submission_date = Column(DateTime)
    graded_date = Column(DateTime, default=datetime.utcnow)
    
    # Grading Details
    graded_by = Column(Integer, ForeignKey('user.id'))
    auto_graded = Column(Boolean, default=False)
    rubric_used = Column(String(200))
    
    # Feedback and Comments
    teacher_comments = Column(Text)
    feedback = Column(Text)
    strengths = Column(Text)
    areas_for_improvement = Column(Text)
    
    # Performance Analytics
    class_average = Column(Float)  # Class average for this assessment
    class_rank = Column(Integer)  # Student's rank in class
    percentile = Column(Float)  # Student's percentile in class
    
    # Flags and Status
    is_makeup = Column(Boolean, default=False)  # Makeup assessment
    is_bonus = Column(Boolean, default=False)  # Bonus points
    is_excused = Column(Boolean, default=False)  # Excused from assessment
    status = Column(String(20), default='final')  # draft, provisional, final
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', foreign_keys=[student_id], backref='grades')
    course = relationship('Course', backref='grades')
    class_ref = relationship('SchoolClass', backref='grades')
    teacher = relationship('User', foreign_keys=[teacher_id], backref='assigned_grades')
    grader = relationship('User', foreign_keys=[graded_by], backref='graded_assessments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'subject_code': self.course.code if self.course else None,
            'class_id': self.class_id,
            'class_name': self.class_ref.name if self.class_ref else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'assessment_type': self.assessment_type,
            'assessment_name': self.assessment_name,
            'assessment_id': self.assessment_id,
            'score': self.score,
            'max_score': self.max_score,
            'percentage': self.percentage,
            'letter_grade': self.letter_grade,
            'grade_points': self.grade_points,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'week': self.week,
            'assessment_date': self.assessment_date.isoformat(),
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'graded_date': self.graded_date.isoformat(),
            'graded_by': self.graded_by,
            'grader_name': self.grader.full_name if self.grader else None,
            'auto_graded': self.auto_graded,
            'rubric_used': self.rubric_used,
            'teacher_comments': self.teacher_comments,
            'feedback': self.feedback,
            'strengths': self.strengths,
            'areas_for_improvement': self.areas_for_improvement,
            'class_average': self.class_average,
            'class_rank': self.class_rank,
            'percentile': self.percentile,
            'is_makeup': self.is_makeup,
            'is_bonus': self.is_bonus,
            'is_excused': self.is_excused,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class GradeScale(db.Model):
    __tablename__ = 'grade_scales'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Scale Configuration
    min_percentage = Column(Float, nullable=False)
    max_percentage = Column(Float, nullable=False)
    letter_grade = Column(String(5), nullable=False)
    grade_points = Column(Float, nullable=False)
    
    # UNEB Grading System
    uneb_grade = Column(Integer)  # 1-9 for UNEB system
    interpretation = Column(String(100))  # Distinction, Credit, Pass, Fail
    
    # Academic Level
    class_level = Column(String(10))  # S1-S6, or 'all'
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    creator = relationship('User', backref='created_grade_scales')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'min_percentage': self.min_percentage,
            'max_percentage': self.max_percentage,
            'letter_grade': self.letter_grade,
            'grade_points': self.grade_points,
            'uneb_grade': self.uneb_grade,
            'interpretation': self.interpretation,
            'class_level': self.class_level,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat()
        }

class StudentProgress(db.Model):
    __tablename__ = 'student_progress'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)  # Maps to Course model
    
    # Academic Period
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(10), nullable=False)
    
    # Overall Performance
    current_grade = Column(Float)  # Current overall percentage
    previous_grade = Column(Float)  # Previous semester/assessment grade
    improvement = Column(Float)  # Improvement percentage
    trend = Column(String(20), default='stable')  # up, down, stable
    
    # Detailed Metrics
    continuous_assessment_score = Column(Float)  # CA score (40%)
    exam_score = Column(Float)  # Exam score (60%)
    final_grade = Column(Float)  # Weighted final grade
    
    # Class Comparison
    class_average = Column(Float)
    class_rank = Column(Integer)
    class_size = Column(Integer)
    percentile = Column(Float)
    
    # Attendance Impact
    attendance_percentage = Column(Float)
    attendance_impact_score = Column(Float)  # How attendance affects performance
    
    # Assignment Tracking
    assignments_completed = Column(Integer, default=0)
    assignments_pending = Column(Integer, default=0)
    assignment_completion_rate = Column(Float, default=0.0)
    average_assignment_score = Column(Float)
    
    # Topic Mastery
    topics_mastered = Column(JSON)  # List of mastered topics with scores
    topics_struggling = Column(JSON)  # List of topics needing improvement
    mastery_percentage = Column(Float, default=0.0)
    
    # Predictions and Recommendations
    predicted_final_grade = Column(Float)  # AI prediction
    uneb_readiness_score = Column(Float)  # UNEB exam readiness (0-100)
    recommended_actions = Column(JSON)  # List of recommended actions
    
    # Alerts and Flags
    performance_alerts = Column(JSON)  # List of performance alerts
    at_risk = Column(Boolean, default=False)
    needs_intervention = Column(Boolean, default=False)
    
    # Metadata
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship('User', backref='progress_records')
    course = relationship('Course', backref='student_progress')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'subject_code': self.course.code if self.course else None,
            'academic_year': self.academic_year,
            'semester': self.semester,
            'current_grade': self.current_grade,
            'previous_grade': self.previous_grade,
            'improvement': self.improvement,
            'trend': self.trend,
            'continuous_assessment_score': self.continuous_assessment_score,
            'exam_score': self.exam_score,
            'final_grade': self.final_grade,
            'class_average': self.class_average,
            'class_rank': self.class_rank,
            'class_size': self.class_size,
            'percentile': self.percentile,
            'attendance_percentage': self.attendance_percentage,
            'attendance_impact_score': self.attendance_impact_score,
            'assignments_completed': self.assignments_completed,
            'assignments_pending': self.assignments_pending,
            'assignment_completion_rate': self.assignment_completion_rate,
            'average_assignment_score': self.average_assignment_score,
            'topics_mastered': self.topics_mastered,
            'topics_struggling': self.topics_struggling,
            'mastery_percentage': self.mastery_percentage,
            'predicted_final_grade': self.predicted_final_grade,
            'uneb_readiness_score': self.uneb_readiness_score,
            'recommended_actions': self.recommended_actions,
            'performance_alerts': self.performance_alerts,
            'at_risk': self.at_risk,
            'needs_intervention': self.needs_intervention,
            'last_updated': self.last_updated.isoformat(),
            'calculated_at': self.calculated_at.isoformat()
        }
