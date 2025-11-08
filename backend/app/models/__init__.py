# Core models
from app.models.user import User, AuditLog, SystemSettings
from app.models.attendance import Attendance
from app.models.payment import Payment, PaymentGatewayConfig
from app.models.notification import Notification, NotificationTemplate
from app.models.ai_analytics import AIAnalytics, PlagiarismCheck
from app.models.profile import UserProfile, Message, LessonPlan
from app.models.class_management import SchoolClass, StudentEnrollment, ClassSchedule
from app.models.fee_structure import FeeStructure, FeeStructureItem, FeeStatement, FeePayment

# Enhanced models
from app.models.exam import Exam, ExamQuestion, ExamSubmission, ExamTemplate
from app.models.course import Course, CourseClass, StudentCourse, CourseTopic
from app.models.grade import Grade, GradeScale, StudentProgress
from app.models.assignment import Assignment, AssignmentSubmission, AssignmentTemplate, StudyMaterial
from app.models.fraud_detection import FraudDetectionRule, FraudDetection, AnomalyDetection, UserBehaviorProfile
from app.models.cocurricular import (
    CocurricularActivity, CocurricularParticipation, CocurricularEvent, 
    CocurricularAttendance, CocurricularAchievement
)
from app.models.timetable import Timetable, TimetableEntry
from app.models.semesters import Semester
from app.models.complaint import Complaint
from app.models.payroll import PayrollEntry
from app.models.award import Award
from app.models.online_class import OnlineClass, OnlineClassParticipant
from app.models.biometric import BiometricData, BiometricAttendanceLog
from app.models.student_achievement import StudentAchievement
from app.models.ai_quiz import AIStudyQuiz, QuizQuestion

# Export all models for easy importing
__all__ = [
    # Core models
    'User', 'AuditLog', 'SystemSettings',
    'Attendance', 'Payment', 'PaymentGatewayConfig',
    'Notification', 'NotificationTemplate', 'AIAnalytics', 'PlagiarismCheck',
    'UserProfile', 'Message', 'LessonPlan', 'SchoolClass', 'StudentEnrollment', 'ClassSchedule',
    'FeeStructure', 'FeeStructureItem', 'FeeStatement', 'FeePayment',
    
    # Enhanced models
    'Exam', 'ExamQuestion', 'ExamSubmission', 'ExamTemplate',
    'Course', 'CourseClass', 'StudentCourse', 'CourseTopic',
    'Grade', 'GradeScale', 'StudentProgress',
    'Assignment', 'AssignmentSubmission', 'AssignmentTemplate', 'StudyMaterial',
    'FraudDetectionRule', 'FraudDetection', 'AnomalyDetection', 'UserBehaviorProfile',
    'CocurricularActivity', 'CocurricularParticipation', 'CocurricularEvent',
    'CocurricularAttendance', 'CocurricularAchievement',
    'Timetable', 'TimetableEntry', 'Semester',
    'Complaint', 'PayrollEntry', 'Award',
    'OnlineClass', 'OnlineClassParticipant', 'BiometricData', 'BiometricAttendanceLog',
    'StudentAchievement', 'AIStudyQuiz', 'QuizQuestion'
]
