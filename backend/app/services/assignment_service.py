"""
Assignment Management Service
Handles digital assignment creation, submission, and AI-powered grading
"""
import os
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from app import db
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.user import User
from app.services.plagiarism_service import PlagiarismService
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class AssignmentService:
    def __init__(self):
        self.upload_folder = 'uploads/assignments'
        self.allowed_extensions = {'pdf', 'doc', 'docx', 'txt', 'rtf'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.plagiarism_service = PlagiarismService()
        self.notification_service = NotificationService()
        
        # Ensure upload directory exists
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def create_assignment(self, teacher_id, title, description, subject, class_level, due_date, 
                         max_marks=100, submission_format='pdf', plagiarism_check=True, ai_grading=False):
        """
        Create a new assignment
        
        Args:
            teacher_id (int): Teacher creating the assignment
            title (str): Assignment title
            description (str): Assignment description
            subject (str): Subject name
            class_level (str): Class level (S1-S6)
            due_date (datetime): Due date
            max_marks (int): Maximum marks
            submission_format (str): Allowed submission format
            plagiarism_check (bool): Enable plagiarism checking
            ai_grading (bool): Enable AI grading
            
        Returns:
            dict: Creation result
        """
        try:
            teacher = User.query.get(teacher_id)
            if not teacher or teacher.role != 'teacher':
                return {'success': False, 'message': 'Invalid teacher'}
            
            assignment = Assignment(
                title=title,
                description=description,
                teacher_id=teacher_id,
                subject=subject,
                class_level=class_level,
                due_date=due_date,
                max_marks=max_marks,
                submission_format=submission_format,
                plagiarism_check_enabled=plagiarism_check,
                ai_grading_enabled=ai_grading
            )
            
            db.session.add(assignment)
            db.session.commit()
            
            logger.info(f"Assignment created: {title} by teacher {teacher_id}")
            
            return {
                'success': True,
                'message': 'Assignment created successfully',
                'assignment': assignment.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Assignment creation error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error creating assignment',
                'error': str(e)
            }
    
    def publish_assignment(self, assignment_id, teacher_id):
        """Publish assignment to students"""
        try:
            assignment = Assignment.query.filter_by(
                id=assignment_id,
                teacher_id=teacher_id
            ).first()
            
            if not assignment:
                return {'success': False, 'message': 'Assignment not found'}
            
            assignment.is_published = True
            db.session.commit()
            
            # Notify students
            self._notify_students_new_assignment(assignment)
            
            logger.info(f"Assignment published: {assignment_id}")
            
            return {
                'success': True,
                'message': 'Assignment published successfully'
            }
            
        except Exception as e:
            logger.error(f"Assignment publishing error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error publishing assignment',
                'error': str(e)
            }
    
    def submit_assignment(self, assignment_id, student_id, submission_text=None, file=None):
        """
        Submit assignment by student
        
        Args:
            assignment_id (int): Assignment ID
            student_id (int): Student ID
            submission_text (str): Text submission
            file: File upload
            
        Returns:
            dict: Submission result
        """
        try:
            assignment = Assignment.query.get(assignment_id)
            if not assignment or not assignment.is_published:
                return {'success': False, 'message': 'Assignment not found or not published'}
            
            student = User.query.get(student_id)
            if not student or student.role != 'student':
                return {'success': False, 'message': 'Invalid student'}
            
            # Check if already submitted
            existing_submission = AssignmentSubmission.query.filter_by(
                assignment_id=assignment_id,
                student_id=student_id
            ).first()
            
            if existing_submission:
                return {'success': False, 'message': 'Assignment already submitted'}
            
            # Check due date
            is_late = datetime.utcnow() > assignment.due_date
            
            # Handle file upload
            file_path = None
            file_name = None
            file_size = None
            
            if file:
                upload_result = self._handle_file_upload(file, assignment_id, student_id)
                if not upload_result['success']:
                    return upload_result
                
                file_path = upload_result['file_path']
                file_name = upload_result['file_name']
                file_size = upload_result['file_size']
            
            # Create submission
            submission = AssignmentSubmission(
                assignment_id=assignment_id,
                student_id=student_id,
                submission_text=submission_text,
                file_path=file_path,
                file_name=file_name,
                file_size=file_size,
                is_late=is_late
            )
            
            db.session.add(submission)
            db.session.flush()
            
            # Run plagiarism check if enabled
            if assignment.plagiarism_check_enabled and (submission_text or file_path):
                self._run_plagiarism_check(submission)
            
            db.session.commit()
            
            # Notify teacher
            self._notify_teacher_new_submission(assignment, submission)
            
            logger.info(f"Assignment submitted: {assignment_id} by student {student_id}")
            
            return {
                'success': True,
                'message': 'Assignment submitted successfully',
                'submission': submission.to_dict(),
                'is_late': is_late
            }
            
        except Exception as e:
            logger.error(f"Assignment submission error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error submitting assignment',
                'error': str(e)
            }
    
    def grade_assignment(self, submission_id, teacher_id, marks, grade, feedback):
        """Grade assignment submission"""
        try:
            submission = AssignmentSubmission.query.get(submission_id)
            if not submission:
                return {'success': False, 'message': 'Submission not found'}
            
            assignment = submission.assignment
            if assignment.teacher_id != teacher_id:
                return {'success': False, 'message': 'Unauthorized to grade this assignment'}
            
            # Validate marks
            if marks > assignment.max_marks:
                return {'success': False, 'message': f'Marks cannot exceed {assignment.max_marks}'}
            
            submission.marks_obtained = marks
            submission.grade = grade
            submission.teacher_feedback = feedback
            submission.status = 'graded'
            submission.graded_at = datetime.utcnow()
            submission.graded_by = teacher_id
            
            db.session.commit()
            
            # Notify student
            self._notify_student_graded(submission)
            
            logger.info(f"Assignment graded: {submission_id} by teacher {teacher_id}")
            
            return {
                'success': True,
                'message': 'Assignment graded successfully',
                'submission': submission.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Assignment grading error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error grading assignment',
                'error': str(e)
            }
    
    def get_teacher_assignments(self, teacher_id, page=1, per_page=20):
        """Get assignments created by teacher"""
        try:
            assignments = Assignment.query.filter_by(
                teacher_id=teacher_id
            ).order_by(Assignment.created_date.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            result = []
            for assignment in assignments.items:
                assignment_data = assignment.to_dict()
                # Add submission count
                submission_count = AssignmentSubmission.query.filter_by(
                    assignment_id=assignment.id
                ).count()
                assignment_data['submission_count'] = submission_count
                result.append(assignment_data)
            
            return {
                'success': True,
                'assignments': result,
                'total': assignments.total,
                'pages': assignments.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching teacher assignments: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching assignments',
                'error': str(e)
            }
    
    def get_student_assignments(self, student_id, class_level, page=1, per_page=20):
        """Get assignments for student"""
        try:
            assignments = Assignment.query.filter_by(
                class_level=class_level,
                is_published=True,
                is_active=True
            ).order_by(Assignment.due_date.asc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            result = []
            for assignment in assignments.items:
                assignment_data = assignment.to_dict()
                
                # Check if student has submitted
                submission = AssignmentSubmission.query.filter_by(
                    assignment_id=assignment.id,
                    student_id=student_id
                ).first()
                
                assignment_data['submitted'] = submission is not None
                if submission:
                    assignment_data['submission'] = submission.to_dict()
                
                result.append(assignment_data)
            
            return {
                'success': True,
                'assignments': result,
                'total': assignments.total,
                'pages': assignments.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching student assignments: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching assignments',
                'error': str(e)
            }
    
    def get_assignment_submissions(self, assignment_id, teacher_id, page=1, per_page=20):
        """Get submissions for an assignment"""
        try:
            assignment = Assignment.query.filter_by(
                id=assignment_id,
                teacher_id=teacher_id
            ).first()
            
            if not assignment:
                return {'success': False, 'message': 'Assignment not found'}
            
            submissions = AssignmentSubmission.query.filter_by(
                assignment_id=assignment_id
            ).order_by(AssignmentSubmission.submitted_at.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'assignment': assignment.to_dict(),
                'submissions': [sub.to_dict() for sub in submissions.items],
                'total': submissions.total,
                'pages': submissions.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching assignment submissions: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching submissions',
                'error': str(e)
            }
    
    def _handle_file_upload(self, file, assignment_id, student_id):
        """Handle assignment file upload"""
        try:
            if not file or file.filename == '':
                return {'success': False, 'message': 'No file selected'}
            
            if not self._allowed_file(file.filename):
                return {'success': False, 'message': 'Invalid file type'}
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > self.max_file_size:
                return {'success': False, 'message': 'File too large. Maximum size is 10MB'}
            
            # Generate secure filename
            filename = secure_filename(file.filename)
            unique_filename = f"assignment_{assignment_id}_student_{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            
            file_path = os.path.join(self.upload_folder, unique_filename)
            file.save(file_path)
            
            return {
                'success': True,
                'file_path': file_path,
                'file_name': filename,
                'file_size': file_size
            }
            
        except Exception as e:
            logger.error(f"File upload error: {str(e)}")
            return {
                'success': False,
                'message': 'Error uploading file',
                'error': str(e)
            }
    
    def _allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def _run_plagiarism_check(self, submission):
        """Run plagiarism check on submission"""
        try:
            content = submission.submission_text or ""
            
            # If file submission, extract text (simplified)
            if submission.file_path and not content:
                content = f"File submission: {submission.file_name}"
            
            if content:
                result = self.plagiarism_service.check_plagiarism(
                    student_id=submission.student_id,
                    assignment_id=f"ASSIGN_{submission.assignment_id}",
                    submission_title=submission.assignment.title,
                    submission_content=content,
                    subject=submission.assignment.subject
                )
                
                if result['success']:
                    submission.plagiarism_score = result['plagiarism_score']
                    submission.plagiarism_report = str(result)
                    
        except Exception as e:
            logger.error(f"Plagiarism check error: {str(e)}")
    
    def _notify_students_new_assignment(self, assignment):
        """Notify students about new assignment"""
        try:
            # Get students in the class
            from app.models.profile import UserProfile
            students = User.query.join(UserProfile).filter(
                User.role == 'student',
                UserProfile.class_level == assignment.class_level
            ).all()
            
            for student in students:
                self.notification_service.send_system_notification(
                    user_id=student.id,
                    title=f"New Assignment: {assignment.title}",
                    message=f"Subject: {assignment.subject}\nDue: {assignment.due_date.strftime('%Y-%m-%d %H:%M')}",
                    category='academic',
                    priority='medium'
                )
                
        except Exception as e:
            logger.error(f"Error notifying students: {str(e)}")
    
    def _notify_teacher_new_submission(self, assignment, submission):
        """Notify teacher about new submission"""
        try:
            self.notification_service.send_system_notification(
                user_id=assignment.teacher_id,
                title=f"New Submission: {assignment.title}",
                message=f"Student: {submission.student.name}\nSubmitted: {submission.submitted_at.strftime('%Y-%m-%d %H:%M')}",
                category='academic',
                priority='medium'
            )
            
        except Exception as e:
            logger.error(f"Error notifying teacher: {str(e)}")
    
    def _notify_student_graded(self, submission):
        """Notify student about graded assignment"""
        try:
            self.notification_service.send_system_notification(
                user_id=submission.student_id,
                title=f"Assignment Graded: {submission.assignment.title}",
                message=f"Grade: {submission.grade}\nMarks: {submission.marks_obtained}/{submission.assignment.max_marks}",
                category='academic',
                priority='medium'
            )
            
        except Exception as e:
            logger.error(f"Error notifying student: {str(e)}")
    
    def get_assignment_analytics(self, assignment_id, teacher_id):
        """Get analytics for an assignment"""
        try:
            assignment = Assignment.query.filter_by(
                id=assignment_id,
                teacher_id=teacher_id
            ).first()
            
            if not assignment:
                return {'success': False, 'message': 'Assignment not found'}
            
            submissions = AssignmentSubmission.query.filter_by(
                assignment_id=assignment_id
            ).all()
            
            total_submissions = len(submissions)
            graded_submissions = len([s for s in submissions if s.status == 'graded'])
            late_submissions = len([s for s in submissions if s.is_late])
            
            # Calculate average marks
            graded_marks = [s.marks_obtained for s in submissions if s.marks_obtained is not None]
            average_marks = sum(graded_marks) / len(graded_marks) if graded_marks else 0
            
            # Plagiarism statistics
            plagiarism_scores = [s.plagiarism_score for s in submissions if s.plagiarism_score is not None]
            avg_plagiarism = sum(plagiarism_scores) / len(plagiarism_scores) if plagiarism_scores else 0
            
            return {
                'success': True,
                'analytics': {
                    'assignment': assignment.to_dict(),
                    'total_submissions': total_submissions,
                    'graded_submissions': graded_submissions,
                    'pending_grading': total_submissions - graded_submissions,
                    'late_submissions': late_submissions,
                    'on_time_submissions': total_submissions - late_submissions,
                    'average_marks': round(average_marks, 2),
                    'average_plagiarism_score': round(avg_plagiarism, 2),
                    'submission_rate': round((total_submissions / 30) * 100, 2)  # Assuming 30 students per class
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating assignment analytics: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating analytics',
                'error': str(e)
            }
