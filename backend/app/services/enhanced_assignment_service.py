import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import (
    Assignment, AssignmentSubmission, AssignmentTemplate, StudyMaterial,
    Course, SchoolClass, User, Grade
)
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.plagiarism_service import PlagiarismService
from app.services.notification_service import NotificationService

class EnhancedAssignmentService:
    def __init__(self):
        self.ai_service = AIAnalyticsService()
        self.plagiarism_service = PlagiarismService()
        self.notification_service = NotificationService()

    def create_assignment(self, assignment_data: Dict[str, Any], teacher_id: int) -> Dict[str, Any]:
        """Create a new assignment with AI assistance"""
        try:
            # Generate AI rubric if requested
            rubric = assignment_data.get('rubric', {})
            if assignment_data.get('generate_ai_rubric', False):
                rubric = self._generate_ai_rubric(assignment_data)
            
            assignment = Assignment(
                title=assignment_data['title'],
                description=assignment_data['description'],
                subject_id=assignment_data['subject_id'],
                class_id=assignment_data['class_id'],
                teacher_id=teacher_id,
                assignment_type=assignment_data['assignment_type'],
                max_score=assignment_data.get('max_score', 100.0),
                weight_percentage=assignment_data.get('weight_percentage', 10.0),
                due_date=datetime.fromisoformat(assignment_data['due_date']),
                late_submission_allowed=assignment_data.get('late_submission_allowed', True),
                late_penalty_per_day=assignment_data.get('late_penalty_per_day', 5.0),
                submission_format=assignment_data.get('submission_format', ['pdf', 'doc']),
                max_file_size_mb=assignment_data.get('max_file_size_mb', 10.0),
                max_files=assignment_data.get('max_files', 3),
                plagiarism_check=assignment_data.get('plagiarism_check', True),
                instructions=assignment_data.get('instructions', ''),
                rubric=rubric,
                resources=assignment_data.get('resources', []),
                ai_assistance_enabled=assignment_data.get('ai_assistance_enabled', False),
                ai_feedback_enabled=assignment_data.get('ai_feedback_enabled', True),
                auto_grading_enabled=assignment_data.get('auto_grading_enabled', False),
                is_published=assignment_data.get('is_published', True)
            )
            
            db.session.add(assignment)
            db.session.commit()
            
            # Send notifications to students
            self._notify_students_about_assignment(assignment)
            
            return {
                'success': True,
                'assignment': assignment.to_dict(),
                'message': 'Assignment created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _generate_ai_rubric(self, assignment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered grading rubric"""
        try:
            prompt = f"""
            Create a detailed grading rubric for this assignment:
            Title: {assignment_data['title']}
            Type: {assignment_data['assignment_type']}
            Description: {assignment_data['description']}
            Max Score: {assignment_data.get('max_score', 100)}
            
            Create a rubric with 4-6 criteria, each with 4 performance levels (Excellent, Good, Satisfactory, Needs Improvement).
            
            Return as JSON:
            {{
                "criteria": [
                    {{
                        "name": "Content Quality",
                        "weight": 30,
                        "levels": {{
                            "excellent": {{"score": 90-100, "description": "..."}},
                            "good": {{"score": 80-89, "description": "..."}},
                            "satisfactory": {{"score": 70-79, "description": "..."}},
                            "needs_improvement": {{"score": 0-69, "description": "..."}}
                        }}
                    }}
                ]
            }}
            """
            
            response = self.ai_service.generate_content(prompt, max_tokens=1000)
            
            if response and response.get('success'):
                try:
                    return json.loads(response['content'])
                except json.JSONDecodeError:
                    pass
            
            # Fallback rubric
            return self._generate_fallback_rubric(assignment_data)
            
        except Exception:
            return self._generate_fallback_rubric(assignment_data)

    def _generate_fallback_rubric(self, assignment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback rubric when AI is unavailable"""
        assignment_type = assignment_data['assignment_type']
        max_score = assignment_data.get('max_score', 100)
        
        if assignment_type == 'essay':
            return {
                "criteria": [
                    {
                        "name": "Content and Ideas",
                        "weight": 40,
                        "levels": {
                            "excellent": {"score_range": "90-100", "description": "Exceptional content with original ideas"},
                            "good": {"score_range": "80-89", "description": "Good content with clear ideas"},
                            "satisfactory": {"score_range": "70-79", "description": "Adequate content"},
                            "needs_improvement": {"score_range": "0-69", "description": "Weak content"}
                        }
                    },
                    {
                        "name": "Organization and Structure",
                        "weight": 30,
                        "levels": {
                            "excellent": {"score_range": "90-100", "description": "Clear, logical organization"},
                            "good": {"score_range": "80-89", "description": "Generally well organized"},
                            "satisfactory": {"score_range": "70-79", "description": "Basic organization"},
                            "needs_improvement": {"score_range": "0-69", "description": "Poor organization"}
                        }
                    },
                    {
                        "name": "Language and Grammar",
                        "weight": 30,
                        "levels": {
                            "excellent": {"score_range": "90-100", "description": "Excellent language use"},
                            "good": {"score_range": "80-89", "description": "Good language use"},
                            "satisfactory": {"score_range": "70-79", "description": "Adequate language"},
                            "needs_improvement": {"score_range": "0-69", "description": "Poor language use"}
                        }
                    }
                ]
            }
        else:
            return {
                "criteria": [
                    {
                        "name": "Completion",
                        "weight": 50,
                        "levels": {
                            "excellent": {"score_range": "90-100", "description": "All requirements met excellently"},
                            "good": {"score_range": "80-89", "description": "Most requirements met well"},
                            "satisfactory": {"score_range": "70-79", "description": "Basic requirements met"},
                            "needs_improvement": {"score_range": "0-69", "description": "Requirements not met"}
                        }
                    },
                    {
                        "name": "Quality",
                        "weight": 50,
                        "levels": {
                            "excellent": {"score_range": "90-100", "description": "Exceptional quality work"},
                            "good": {"score_range": "80-89", "description": "Good quality work"},
                            "satisfactory": {"score_range": "70-79", "description": "Adequate quality"},
                            "needs_improvement": {"score_range": "0-69", "description": "Poor quality"}
                        }
                    }
                ]
            }

    def submit_assignment(self, assignment_id: int, student_id: int, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit assignment with file handling and plagiarism check"""
        try:
            assignment = Assignment.query.get(assignment_id)
            if not assignment:
                return {'success': False, 'error': 'Assignment not found'}
            
            # Check if already submitted
            existing = AssignmentSubmission.query.filter_by(
                assignment_id=assignment_id,
                student_id=student_id
            ).first()
            
            if existing and existing.status != 'draft':
                return {'success': False, 'error': 'Assignment already submitted'}
            
            # Check deadline
            is_late = datetime.utcnow() > assignment.due_date
            if is_late and not assignment.late_submission_allowed:
                return {'success': False, 'error': 'Late submission not allowed'}
            
            # Calculate late penalty
            days_late = 0
            if is_late:
                days_late = (datetime.utcnow() - assignment.due_date).days
            
            # Create or update submission
            if existing:
                submission = existing
            else:
                submission = AssignmentSubmission(
                    assignment_id=assignment_id,
                    student_id=student_id
                )
                db.session.add(submission)
            
            submission.submission_text = submission_data.get('submission_text', '')
            submission.files = submission_data.get('files', [])
            submission.submitted_at = datetime.utcnow()
            submission.is_late = is_late
            submission.days_late = days_late
            submission.status = 'submitted'
            
            # Calculate late penalty
            if is_late and assignment.late_penalty_per_day > 0:
                submission.late_penalty_applied = min(
                    days_late * assignment.late_penalty_per_day,
                    100  # Maximum 100% penalty
                )
            
            db.session.flush()
            
            # Run plagiarism check if enabled
            if assignment.plagiarism_check and submission.submission_text:
                plagiarism_result = self.plagiarism_service.check_plagiarism(
                    submission.submission_text,
                    student_id,
                    assignment.subject_id
                )
                submission.plagiarism_score = plagiarism_result.get('similarity_score', 0)
                submission.plagiarism_report = plagiarism_result.get('detailed_report', {})
                submission.plagiarism_checked = True
            
            # Generate AI feedback if enabled
            if assignment.ai_feedback_enabled:
                ai_feedback = self._generate_ai_feedback(submission, assignment)
                submission.ai_feedback = ai_feedback.get('feedback', '')
                submission.ai_score_suggestion = ai_feedback.get('suggested_score', 0)
                submission.ai_analysis = ai_feedback.get('analysis', {})
            
            # Auto-grade if enabled and possible
            if assignment.auto_grading_enabled:
                auto_grade_result = self._auto_grade_submission(submission, assignment)
                if auto_grade_result.get('success'):
                    submission.score = auto_grade_result['score']
                    submission.percentage = auto_grade_result['percentage']
                    submission.letter_grade = auto_grade_result['letter_grade']
                    submission.status = 'graded'
                    submission.auto_graded = True
            
            # Update assignment statistics
            assignment.total_submissions += 1
            
            db.session.commit()
            
            # Send notifications
            self._notify_submission_received(submission, assignment)
            
            return {
                'success': True,
                'submission': submission.to_dict(),
                'message': 'Assignment submitted successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _generate_ai_feedback(self, submission: AssignmentSubmission, assignment: Assignment) -> Dict[str, Any]:
        """Generate AI feedback for assignment submission"""
        try:
            prompt = f"""
            Provide detailed feedback for this assignment submission:
            
            Assignment: {assignment.title}
            Type: {assignment.assignment_type}
            Instructions: {assignment.instructions}
            Max Score: {assignment.max_score}
            
            Student Submission: {submission.submission_text[:1000]}...
            
            Provide feedback in JSON format:
            {{
                "feedback": "Detailed constructive feedback",
                "suggested_score": <score out of {assignment.max_score}>,
                "strengths": ["strength 1", "strength 2"],
                "improvements": ["improvement 1", "improvement 2"],
                "analysis": {{
                    "content_quality": <1-10>,
                    "organization": <1-10>,
                    "creativity": <1-10>,
                    "adherence_to_instructions": <1-10>
                }}
            }}
            """
            
            response = self.ai_service.generate_content(prompt, max_tokens=800)
            
            if response and response.get('success'):
                try:
                    return json.loads(response['content'])
                except json.JSONDecodeError:
                    pass
            
            return {
                'feedback': 'AI feedback temporarily unavailable',
                'suggested_score': assignment.max_score * 0.7,
                'analysis': {}
            }
            
        except Exception:
            return {
                'feedback': 'AI feedback temporarily unavailable',
                'suggested_score': assignment.max_score * 0.7,
                'analysis': {}
            }

    def _auto_grade_submission(self, submission: AssignmentSubmission, assignment: Assignment) -> Dict[str, Any]:
        """Auto-grade submission using AI and rubric"""
        try:
            if not assignment.rubric or not submission.submission_text:
                return {'success': False, 'error': 'Cannot auto-grade without rubric or content'}
            
            # Use AI to evaluate against rubric
            prompt = f"""
            Grade this assignment submission using the provided rubric:
            
            Assignment: {assignment.title}
            Max Score: {assignment.max_score}
            Rubric: {json.dumps(assignment.rubric)}
            
            Submission: {submission.submission_text}
            
            Provide grading in JSON format:
            {{
                "total_score": <score out of {assignment.max_score}>,
                "percentage": <percentage>,
                "letter_grade": "<A/B/C/D/F>",
                "rubric_scores": {{
                    "criterion_1": <score>,
                    "criterion_2": <score>
                }},
                "justification": "Brief explanation of grading"
            }}
            """
            
            response = self.ai_service.generate_content(prompt, max_tokens=500)
            
            if response and response.get('success'):
                try:
                    result = json.loads(response['content'])
                    return {
                        'success': True,
                        'score': result.get('total_score', 0),
                        'percentage': result.get('percentage', 0),
                        'letter_grade': result.get('letter_grade', 'F'),
                        'rubric_scores': result.get('rubric_scores', {}),
                        'justification': result.get('justification', '')
                    }
                except json.JSONDecodeError:
                    pass
            
            return {'success': False, 'error': 'AI grading failed'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def grade_assignment_manually(self, submission_id: int, grading_data: Dict[str, Any], teacher_id: int) -> Dict[str, Any]:
        """Manually grade an assignment submission"""
        try:
            submission = AssignmentSubmission.query.get(submission_id)
            if not submission:
                return {'success': False, 'error': 'Submission not found'}
            
            assignment = Assignment.query.get(submission.assignment_id)
            
            # Apply late penalty if applicable
            base_score = grading_data['score']
            final_score = base_score
            
            if submission.is_late and submission.late_penalty_applied > 0:
                penalty = (submission.late_penalty_applied / 100) * base_score
                final_score = max(0, base_score - penalty)
            
            submission.score = final_score
            submission.percentage = (final_score / assignment.max_score) * 100
            submission.letter_grade = self._calculate_letter_grade(submission.percentage)
            submission.teacher_feedback = grading_data.get('teacher_feedback', '')
            submission.rubric_scores = grading_data.get('rubric_scores', {})
            submission.strengths = grading_data.get('strengths', '')
            submission.improvements = grading_data.get('improvements', '')
            submission.graded_by = teacher_id
            submission.graded_at = datetime.utcnow()
            submission.status = 'graded'
            
            # Update assignment statistics
            assignment.graded_submissions += 1
            
            # Recalculate average
            graded_submissions = AssignmentSubmission.query.filter(
                and_(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.status == 'graded'
                )
            ).all()
            
            if graded_submissions:
                total_score = sum(s.percentage for s in graded_submissions)
                assignment.average_score = total_score / len(graded_submissions)
            
            db.session.commit()
            
            # Create grade record
            self._create_grade_record(submission, assignment)
            
            # Send notification
            self._notify_assignment_graded(submission, assignment)
            
            return {
                'success': True,
                'submission': submission.to_dict(),
                'message': 'Assignment graded successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _calculate_letter_grade(self, percentage: float) -> str:
        """Calculate letter grade from percentage"""
        if percentage >= 90:
            return 'A'
        elif percentage >= 80:
            return 'B'
        elif percentage >= 70:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'

    def _create_grade_record(self, submission: AssignmentSubmission, assignment: Assignment):
        """Create a grade record from assignment submission"""
        grade = Grade(
            student_id=submission.student_id,
            subject_id=assignment.subject_id,
            class_id=assignment.class_id,
            teacher_id=assignment.teacher_id,
            assessment_type='assignment',
            assessment_name=assignment.title,
            assessment_id=assignment.id,
            score=submission.score,
            max_score=assignment.max_score,
            percentage=submission.percentage,
            letter_grade=submission.letter_grade,
            academic_year='2024',
            semester='Semester 1',
            assessment_date=assignment.due_date,
            submission_date=submission.submitted_at,
            graded_date=submission.graded_at,
            graded_by=submission.graded_by,
            auto_graded=submission.auto_graded,
            teacher_comments=submission.teacher_feedback,
            feedback=submission.ai_feedback,
            late_penalty_applied=submission.late_penalty_applied
        )
        
        db.session.add(grade)

    def get_student_assignments(self, student_id: int, class_id: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get assignments for a student"""
        query = Assignment.query.filter(
            and_(
                Assignment.class_id == class_id,
                Assignment.is_published == True
            )
        )
        
        if status:
            if status == 'pending':
                query = query.filter(Assignment.due_date > datetime.utcnow())
            elif status == 'overdue':
                query = query.filter(Assignment.due_date < datetime.utcnow())
        
        assignments = query.order_by(Assignment.due_date).all()
        
        assignment_list = []
        for assignment in assignments:
            assignment_dict = assignment.to_dict()
            
            # Check submission status
            submission = AssignmentSubmission.query.filter_by(
                assignment_id=assignment.id,
                student_id=student_id
            ).first()
            
            if submission:
                assignment_dict['submission'] = submission.to_dict()
                assignment_dict['submitted'] = True
                assignment_dict['submission_status'] = submission.status
            else:
                assignment_dict['submitted'] = False
                assignment_dict['submission_status'] = 'not_submitted'
            
            # Add time remaining
            if assignment.due_date > datetime.utcnow():
                time_remaining = assignment.due_date - datetime.utcnow()
                assignment_dict['days_remaining'] = time_remaining.days
                assignment_dict['hours_remaining'] = time_remaining.seconds // 3600
            else:
                assignment_dict['days_remaining'] = 0
                assignment_dict['hours_remaining'] = 0
                assignment_dict['is_overdue'] = True
            
            assignment_list.append(assignment_dict)
        
        return assignment_list

    def get_teacher_assignments(self, teacher_id: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get assignments created by a teacher"""
        query = Assignment.query.filter_by(teacher_id=teacher_id)
        
        if status:
            query = query.filter_by(status=status)
        
        assignments = query.order_by(desc(Assignment.created_at)).all()
        
        assignment_list = []
        for assignment in assignments:
            assignment_dict = assignment.to_dict()
            
            # Add submission statistics
            total_students = User.query.join(StudentEnrollment).filter(
                and_(
                    StudentEnrollment.class_id == assignment.class_id,
                    User.role == 'student'
                )
            ).count()
            
            submitted_count = AssignmentSubmission.query.filter_by(
                assignment_id=assignment.id
            ).filter(AssignmentSubmission.status != 'draft').count()
            
            graded_count = AssignmentSubmission.query.filter_by(
                assignment_id=assignment.id,
                status='graded'
            ).count()
            
            assignment_dict['total_students'] = total_students
            assignment_dict['submitted_count'] = submitted_count
            assignment_dict['graded_count'] = graded_count
            assignment_dict['pending_grading'] = submitted_count - graded_count
            assignment_dict['submission_rate'] = (submitted_count / total_students * 100) if total_students > 0 else 0
            
            assignment_list.append(assignment_dict)
        
        return assignment_list

    def create_study_material(self, material_data: Dict[str, Any], creator_id: int) -> Dict[str, Any]:
        """Create study material with AI enhancement"""
        try:
            # Generate AI summary and keywords if content is provided
            ai_summary = ''
            ai_keywords = []
            
            if material_data.get('content_text') and material_data.get('ai_enhance', False):
                ai_analysis = self._analyze_study_material(material_data['content_text'])
                ai_summary = ai_analysis.get('summary', '')
                ai_keywords = ai_analysis.get('keywords', [])
            
            material = StudyMaterial(
                title=material_data['title'],
                description=material_data.get('description', ''),
                subject_id=material_data['subject_id'],
                topic=material_data.get('topic', ''),
                class_level=material_data['class_level'],
                material_type=material_data['material_type'],
                content_url=material_data.get('content_url', ''),
                file_path=material_data.get('file_path', ''),
                content_text=material_data.get('content_text', ''),
                difficulty_level=material_data.get('difficulty_level', 'medium'),
                prerequisites=material_data.get('prerequisites', []),
                learning_objectives=material_data.get('learning_objectives', []),
                uneb_topic_code=material_data.get('uneb_topic_code', ''),
                exam_relevance=material_data.get('exam_relevance', 'high'),
                ai_generated=material_data.get('ai_generated', False),
                ai_summary=ai_summary,
                ai_keywords=ai_keywords,
                created_by=creator_id
            )
            
            db.session.add(material)
            db.session.commit()
            
            return {
                'success': True,
                'material': material.to_dict(),
                'message': 'Study material created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _analyze_study_material(self, content: str) -> Dict[str, Any]:
        """Analyze study material content using AI"""
        try:
            prompt = f"""
            Analyze this study material content and provide:
            1. A concise summary (2-3 sentences)
            2. Key topics/keywords (5-10 items)
            
            Content: {content[:1500]}...
            
            Return as JSON:
            {{
                "summary": "Brief summary of the content",
                "keywords": ["keyword1", "keyword2", "keyword3"]
            }}
            """
            
            response = self.ai_service.generate_content(prompt, max_tokens=300)
            
            if response and response.get('success'):
                try:
                    return json.loads(response['content'])
                except json.JSONDecodeError:
                    pass
            
            return {'summary': '', 'keywords': []}
            
        except Exception:
            return {'summary': '', 'keywords': []}

    def _notify_students_about_assignment(self, assignment: Assignment):
        """Send notifications to students about new assignment"""
        try:
            students = User.query.join(StudentEnrollment).filter(
                and_(
                    StudentEnrollment.class_id == assignment.class_id,
                    User.role == 'student'
                )
            ).all()
            
            for student in students:
                self.notification_service.create_notification(
                    user_id=student.id,
                    title=f'New Assignment: {assignment.title}',
                    message=f'A new {assignment.assignment_type} has been assigned in {assignment.course.name if assignment.course else "your course"}. Due: {assignment.due_date.strftime("%Y-%m-%d")}',
                    notification_type='assignment'
                )
                
        except Exception as e:
            print(f"Error notifying students: {e}")

    def _notify_submission_received(self, submission: AssignmentSubmission, assignment: Assignment):
        """Notify teacher about assignment submission"""
        try:
            self.notification_service.create_notification(
                user_id=assignment.teacher_id,
                title=f'Assignment Submitted: {assignment.title}',
                message=f'{submission.student.full_name if submission.student else "A student"} has submitted their assignment.',
                notification_type='submission'
            )
        except Exception as e:
            print(f"Error notifying teacher: {e}")

    def _notify_assignment_graded(self, submission: AssignmentSubmission, assignment: Assignment):
        """Notify student about graded assignment"""
        try:
            self.notification_service.create_notification(
                user_id=submission.student_id,
                title=f'Assignment Graded: {assignment.title}',
                message=f'Your assignment has been graded. Score: {submission.percentage:.1f}%',
                notification_type='grade'
            )
        except Exception as e:
            print(f"Error notifying student: {e}")
