from datetime import datetime
from app import db
from app.models.class_management import SchoolClass
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class Assignment(db.Model):
    __tablename__ = 'assignments'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Academic Details
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Assignment Configuration
    assignment_type = Column(String(50), nullable=False)  # homework, project, essay, research, practical
    max_score = Column(Float, default=100.0)
    weight_percentage = Column(Float, default=10.0)  # Weight in final grade
    
    # Timing
    assigned_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    late_submission_allowed = Column(Boolean, default=True)
    late_penalty_per_day = Column(Float, default=5.0)  # Percentage penalty per day
    
    # Submission Requirements
    submission_format = Column(JSON)  # List of allowed formats: pdf, doc, image, etc.
    max_file_size_mb = Column(Float, default=10.0)
    max_files = Column(Integer, default=3)
    plagiarism_check = Column(Boolean, default=True)
    
    # Instructions and Resources
    instructions = Column(Text)
    rubric = Column(JSON)  # Grading rubric
    resources = Column(JSON)  # List of helpful resources
    
    # AI Features
    ai_assistance_enabled = Column(Boolean, default=False)
    ai_feedback_enabled = Column(Boolean, default=True)
    auto_grading_enabled = Column(Boolean, default=False)
    
    # Status
    status = Column(String(20), default='active')  # draft, active, closed, archived
    is_published = Column(Boolean, default=False)
    
    # Statistics
    total_submissions = Column(Integer, default=0)
    graded_submissions = Column(Integer, default=0)
    average_score = Column(Float)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship('Course', backref='assignments')
    class_ref = relationship('SchoolClass', backref='assignments')
    teacher = relationship('User', backref='created_assignments')
    submissions = relationship('AssignmentSubmission', backref='assignment', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'class_id': self.class_id,
            'class_name': self.class_ref.name if self.class_ref else None,
            'teacher_id': self.teacher_id,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'assignment_type': self.assignment_type,
            'max_score': self.max_score,
            'weight_percentage': self.weight_percentage,
            'assigned_date': self.assigned_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'late_submission_allowed': self.late_submission_allowed,
            'late_penalty_per_day': self.late_penalty_per_day,
            'submission_format': self.submission_format,
            'max_file_size_mb': self.max_file_size_mb,
            'max_files': self.max_files,
            'plagiarism_check': self.plagiarism_check,
            'instructions': self.instructions,
            'rubric': self.rubric,
            'resources': self.resources,
            'ai_assistance_enabled': self.ai_assistance_enabled,
            'ai_feedback_enabled': self.ai_feedback_enabled,
            'auto_grading_enabled': self.auto_grading_enabled,
            'status': self.status,
            'is_published': self.is_published,
            'total_submissions': self.total_submissions,
            'graded_submissions': self.graded_submissions,
            'average_score': self.average_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AssignmentSubmission(db.Model):
    __tablename__ = 'assignment_submissions'
    
    id = Column(Integer, primary_key=True)
    assignment_id = Column(Integer, ForeignKey('assignments.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    
    # Submission Content
    submission_text = Column(Text)
    files = Column(JSON)  # List of uploaded file paths
    
    # Submission Details
    submitted_at = Column(DateTime, default=datetime.utcnow)
    is_late = Column(Boolean, default=False)
    days_late = Column(Integer, default=0)
    
    # Grading
    score = Column(Float)
    percentage = Column(Float)
    letter_grade = Column(String(5))
    late_penalty_applied = Column(Float, default=0.0)
    
    # Status
    status = Column(String(20), default='submitted')  # draft, submitted, graded, returned
    
    # Plagiarism Detection
    plagiarism_score = Column(Float)  # 0-100, higher = more likely plagiarized
    plagiarism_report = Column(JSON)  # Detailed plagiarism analysis
    plagiarism_checked = Column(Boolean, default=False)
    
    # AI Analysis
    ai_feedback = Column(Text)
    ai_score_suggestion = Column(Float)
    ai_analysis = Column(JSON)  # Detailed AI analysis
    
    # Teacher Feedback
    teacher_feedback = Column(Text)
    rubric_scores = Column(JSON)  # Scores for each rubric criterion
    strengths = Column(Text)
    improvements = Column(Text)
    
    # Grading Details
    graded_by = Column(Integer, ForeignKey('user.id'))
    graded_at = Column(DateTime)
    auto_graded = Column(Boolean, default=False)
    
    # Revision
    revision_requested = Column(Boolean, default=False)
    revision_notes = Column(Text)
    revision_deadline = Column(DateTime)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship('User', foreign_keys=[student_id], backref='assignment_submissions')
    grader = relationship('User', foreign_keys=[graded_by], backref='graded_assignments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'submission_text': self.submission_text,
            'files': self.files,
            'submitted_at': self.submitted_at.isoformat(),
            'is_late': self.is_late,
            'days_late': self.days_late,
            'score': self.score,
            'percentage': self.percentage,
            'letter_grade': self.letter_grade,
            'late_penalty_applied': self.late_penalty_applied,
            'status': self.status,
            'plagiarism_score': self.plagiarism_score,
            'plagiarism_report': self.plagiarism_report,
            'plagiarism_checked': self.plagiarism_checked,
            'ai_feedback': self.ai_feedback,
            'ai_score_suggestion': self.ai_score_suggestion,
            'ai_analysis': self.ai_analysis,
            'teacher_feedback': self.teacher_feedback,
            'rubric_scores': self.rubric_scores,
            'strengths': self.strengths,
            'improvements': self.improvements,
            'graded_by': self.graded_by,
            'grader_name': self.grader.full_name if self.grader else None,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
            'auto_graded': self.auto_graded,
            'revision_requested': self.revision_requested,
            'revision_notes': self.revision_notes,
            'revision_deadline': self.revision_deadline.isoformat() if self.revision_deadline else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AssignmentTemplate(db.Model):
    __tablename__ = 'assignment_templates'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Template Configuration
    subject_id = Column(Integer, ForeignKey('subjects.id'))
    assignment_type = Column(String(50), nullable=False)
    class_level = Column(String(10))  # S1-S6
    
    # Template Data
    template_data = Column(JSON)  # Complete assignment template
    instructions_template = Column(Text)
    rubric_template = Column(JSON)
    
    # Usage and Sharing
    is_public = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    tags = Column(String(500))  # Comma-separated tags
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    course = relationship('Course', backref='assignment_templates')
    creator = relationship('User', backref='created_assignment_templates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'assignment_type': self.assignment_type,
            'class_level': self.class_level,
            'template_data': self.template_data,
            'instructions_template': self.instructions_template,
            'rubric_template': self.rubric_template,
            'is_public': self.is_public,
            'usage_count': self.usage_count,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat()
        }

class StudyMaterial(db.Model):
    __tablename__ = 'study_materials'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Academic Classification
    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    topic = Column(String(200))
    class_level = Column(String(10), nullable=False)  # S1-S6
    
    # Material Details
    material_type = Column(String(50), nullable=False)  # notes, video, pdf, link, interactive
    content_url = Column(String(500))
    file_path = Column(String(500))
    content_text = Column(Text)
    
    # Difficulty and Prerequisites
    difficulty_level = Column(String(20), default='medium')  # easy, medium, hard
    prerequisites = Column(JSON)  # List of prerequisite topics
    learning_objectives = Column(JSON)  # List of learning objectives
    
    # UNEB Alignment
    uneb_topic_code = Column(String(50))
    exam_relevance = Column(String(20), default='high')  # high, medium, low
    
    # Access and Sharing
    is_public = Column(Boolean, default=True)
    access_level = Column(String(20), default='all')  # all, class, premium
    
    # Usage Statistics
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    
    # AI Enhancement
    ai_generated = Column(Boolean, default=False)
    ai_summary = Column(Text)
    ai_keywords = Column(JSON)  # AI-extracted keywords
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    course = relationship('Course', backref='study_materials')
    creator = relationship('User', backref='created_materials')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject_id': self.subject_id,
            'subject_name': self.course.name if self.course else None,
            'topic': self.topic,
            'class_level': self.class_level,
            'material_type': self.material_type,
            'content_url': self.content_url,
            'file_path': self.file_path,
            'content_text': self.content_text,
            'difficulty_level': self.difficulty_level,
            'prerequisites': self.prerequisites,
            'learning_objectives': self.learning_objectives,
            'uneb_topic_code': self.uneb_topic_code,
            'exam_relevance': self.exam_relevance,
            'is_public': self.is_public,
            'access_level': self.access_level,
            'view_count': self.view_count,
            'download_count': self.download_count,
            'rating': self.rating,
            'rating_count': self.rating_count,
            'ai_generated': self.ai_generated,
            'ai_summary': self.ai_summary,
            'ai_keywords': self.ai_keywords,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
