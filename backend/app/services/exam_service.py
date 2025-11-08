import json
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func
from app import db
from app.models import (
    Exam, ExamQuestion, ExamSubmission, ExamTemplate,
    Course, SchoolClass, User, Grade, StudentProgress
)
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.notification_service import NotificationService

class ExamService:
    def __init__(self):
        self.ai_service = AIAnalyticsService()
        self.notification_service = NotificationService()

    def create_exam(self, exam_data: Dict[str, Any], teacher_id: int) -> Dict[str, Any]:
        """Create a new exam with AI assistance if requested"""
        try:
            # Create exam record
            exam = Exam(
                title=exam_data['title'],
                subject_id=exam_data['subject_id'],
                class_id=exam_data['class_id'],
                teacher_id=teacher_id,
                exam_type=exam_data['exam_type'],
                duration_minutes=exam_data['duration_minutes'],
                total_marks=exam_data.get('total_marks', 100.0),
                difficulty_level=exam_data.get('difficulty_level', 'medium'),
                ai_generated=exam_data.get('ai_assistance', False),
                ai_topics=exam_data.get('ai_topics', ''),
                question_count=exam_data.get('question_count', 0),
                scheduled_date=datetime.fromisoformat(exam_data['scheduled_date']) if exam_data.get('scheduled_date') else None,
                instructions=exam_data.get('instructions', ''),
                allow_calculator=exam_data.get('allow_calculator', False),
                randomize_questions=exam_data.get('randomize_questions', True),
                show_results_immediately=exam_data.get('show_results_immediately', False),
                created_by=teacher_id
            )
            
            db.session.add(exam)
            db.session.flush()  # Get the exam ID
            
            # Generate AI questions if requested
            if exam_data.get('ai_assistance', False):
                questions = self._generate_ai_questions(exam, exam_data)
                for question_data in questions:
                    question = ExamQuestion(
                        exam_id=exam.id,
                        question_number=question_data['question_number'],
                        question_text=question_data['question_text'],
                        question_type=question_data['question_type'],
                        marks=question_data['marks'],
                        options=question_data.get('options'),
                        correct_answer=question_data['correct_answer'],
                        explanation=question_data.get('explanation', ''),
                        ai_generated=True,
                        difficulty=question_data.get('difficulty', 'medium'),
                        topic=question_data.get('topic', '')
                    )
                    db.session.add(question)
            
            db.session.commit()
            
            # Send notifications to students
            self._notify_students_about_exam(exam)
            
            return {
                'success': True,
                'exam': exam.to_dict(),
                'message': 'Exam created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_ai_questions(self, exam: Exam, exam_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate exam questions using AI"""
        try:
            if not OPENAI_AVAILABLE:
                return self._generate_fallback_questions(exam_data)
            
            course = Course.query.get(exam.subject_id)
            
            prompt = f"""
            Generate {exam_data.get('question_count', 10)} exam questions for:
            Course: {course.name if course else 'Unknown'}
            Class Level: {exam_data.get('class_level', 'S6')}
            Exam Type: {exam.exam_type}
            Difficulty: {exam.difficulty_level}
            Topics: {exam_data.get('ai_topics', 'General curriculum')}
            Duration: {exam.duration_minutes} minutes
            Total Marks: {exam.total_marks}
            
            Requirements:
            - Questions should be appropriate for UNEB curriculum
            - Include a mix of difficulty levels
            - Provide clear, correct answers
            - Include explanations for complex questions
            - Format for {exam.exam_type} question type
            
            Return as JSON array with this structure:
            [{{
                "question_number": 1,
                "question_text": "Question text here",
                "question_type": "multiple-choice|essay|short-answer",
                "marks": 5,
                "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"] (for multiple choice),
                "correct_answer": "Correct answer or option letter",
                "explanation": "Explanation of the answer",
                "difficulty": "easy|medium|hard",
                "topic": "Specific topic covered"
            }}]
            """
            
            # Use AI service to generate questions
            response = self.ai_service.generate_content(prompt, max_tokens=2000)
            
            if response and response.get('success'):
                try:
                    questions = json.loads(response['content'])
                    return questions
                except json.JSONDecodeError:
                    # Fallback to manual question generation
                    return self._generate_fallback_questions(exam_data)
            else:
                return self._generate_fallback_questions(exam_data)
                
        except Exception as e:
            print(f"AI question generation error: {e}")
            return self._generate_fallback_questions(exam_data)

    def _generate_fallback_questions(self, exam_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fallback questions when AI fails"""
        questions = []
        question_count = exam_data.get('question_count', 5)
        marks_per_question = exam_data.get('total_marks', 100) / question_count
        
        for i in range(1, question_count + 1):
            if exam_data['exam_type'] == 'multiple-choice':
                question = {
                    'question_number': i,
                    'question_text': f'Question {i} - Please enter your question text here',
                    'question_type': 'multiple-choice',
                    'marks': marks_per_question,
                    'options': ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
                    'correct_answer': '',
                    'explanation': '',
                    'difficulty': 'medium',
                    'topic': 'General'
                }
            else:
                question = {
                    'question_number': i,
                    'question_text': f'Question {i} - Please enter your question text here',
                    'question_type': 'essay',
                    'marks': marks_per_question,
                    'correct_answer': '',
                    'explanation': '',
                    'difficulty': 'medium',
                    'topic': 'General'
                }
            questions.append(question)
        
        return questions

    def get_exam_templates(self, subject_id: Optional[int] = None, class_level: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available exam templates"""
        query = ExamTemplate.query.filter_by(is_public=True)
        
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if class_level:
            query = query.filter_by(class_level=class_level)
            
        templates = query.all()
        return [template.to_dict() for template in templates]

    def create_exam_from_template(self, template_id: int, exam_data: Dict[str, Any], teacher_id: int) -> Dict[str, Any]:
        """Create an exam from a template"""
        try:
            template = ExamTemplate.query.get(template_id)
            if not template:
                return {'success': False, 'error': 'Template not found'}
            
            # Update usage count
            template.usage_count += 1
            
            # Create exam from template
            exam = Exam(
                title=exam_data.get('title', template.name),
                subject_id=exam_data.get('subject_id', template.subject_id),
                class_id=exam_data['class_id'],
                teacher_id=teacher_id,
                exam_type=template.exam_type,
                duration_minutes=template.duration_minutes,
                total_marks=template.total_marks,
                difficulty_level=template.difficulty_level,
                question_count=template.question_count,
                scheduled_date=datetime.fromisoformat(exam_data['scheduled_date']) if exam_data.get('scheduled_date') else None,
                instructions=exam_data.get('instructions', ''),
                created_by=teacher_id
            )
            
            db.session.add(exam)
            db.session.flush()
            
            # Create questions from template
            if template.template_data and 'questions' in template.template_data:
                for question_data in template.template_data['questions']:
                    question = ExamQuestion(
                        exam_id=exam.id,
                        question_number=question_data['question_number'],
                        question_text=question_data['question_text'],
                        question_type=question_data['question_type'],
                        marks=question_data['marks'],
                        options=question_data.get('options'),
                        correct_answer=question_data['correct_answer'],
                        explanation=question_data.get('explanation', ''),
                        difficulty=question_data.get('difficulty', 'medium'),
                        topic=question_data.get('topic', '')
                    )
                    db.session.add(question)
            
            db.session.commit()
            
            return {
                'success': True,
                'exam': exam.to_dict(),
                'message': 'Exam created from template successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def submit_exam(self, exam_id: int, student_id: int, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Submit exam answers and auto-grade if possible"""
        try:
            exam = Exam.query.get(exam_id)
            if not exam:
                return {'success': False, 'error': 'Exam not found'}
            
            # Check if already submitted
            existing_submission = ExamSubmission.query.filter_by(
                exam_id=exam_id, student_id=student_id
            ).first()
            
            if existing_submission:
                return {'success': False, 'error': 'Exam already submitted'}
            
            # Create submission
            submission = ExamSubmission(
                exam_id=exam_id,
                student_id=student_id,
                answers=answers,
                submitted_at=datetime.utcnow(),
                status='submitted'
            )
            
            # Auto-grade if possible
            if exam.exam_type in ['multiple-choice', 'true-false']:
                grade_result = self._auto_grade_submission(submission, exam)
                submission.score = grade_result['score']
                submission.percentage = grade_result['percentage']
                submission.grade = grade_result['letter_grade']
                submission.auto_graded = True
                submission.status = 'graded'
                submission.feedback = grade_result['feedback']
            
            db.session.add(submission)
            
            # Update exam statistics
            exam.total_submissions += 1
            if submission.auto_graded:
                exam.graded_submissions += 1
                
            db.session.commit()
            
            # Create grade record if auto-graded
            if submission.auto_graded:
                self._create_grade_record(submission, exam)
            
            return {
                'success': True,
                'submission': submission.to_dict(),
                'message': 'Exam submitted successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _auto_grade_submission(self, submission: ExamSubmission, exam: Exam) -> Dict[str, Any]:
        """Auto-grade multiple choice and true/false questions"""
        questions = ExamQuestion.query.filter_by(exam_id=exam.id).all()
        total_marks = 0
        earned_marks = 0
        feedback = []
        
        for question in questions:
            total_marks += question.marks
            student_answer = submission.answers.get(str(question.id), '')
            
            if question.question_type in ['multiple-choice', 'true-false']:
                if student_answer.upper() == question.correct_answer.upper():
                    earned_marks += question.marks
                    feedback.append(f"Question {question.question_number}: Correct")
                else:
                    feedback.append(f"Question {question.question_number}: Incorrect. Correct answer: {question.correct_answer}")
        
        percentage = (earned_marks / total_marks * 100) if total_marks > 0 else 0
        letter_grade = self._calculate_letter_grade(percentage)
        
        return {
            'score': earned_marks,
            'percentage': percentage,
            'letter_grade': letter_grade,
            'feedback': '\n'.join(feedback)
        }

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

    def _create_grade_record(self, submission: ExamSubmission, exam: Exam):
        """Create a grade record from exam submission"""
        grade = Grade(
            student_id=submission.student_id,
            subject_id=exam.subject_id,
            class_id=exam.class_id,
            teacher_id=exam.teacher_id,
            assessment_type='exam',
            assessment_name=exam.title,
            assessment_id=exam.id,
            score=submission.score,
            max_score=exam.total_marks,
            percentage=submission.percentage,
            letter_grade=submission.grade,
            academic_year='2024',  # Should be dynamic
            term='Term 1',  # Should be dynamic
            assessment_date=exam.scheduled_date or datetime.utcnow(),
            graded_date=datetime.utcnow(),
            graded_by=exam.teacher_id,
            auto_graded=True,
            teacher_comments=submission.feedback
        )
        
        db.session.add(grade)

    def get_teacher_exams(self, teacher_id: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get exams created by a teacher"""
        query = Exam.query.filter_by(teacher_id=teacher_id)
        
        if status:
            query = query.filter_by(status=status)
            
        exams = query.order_by(Exam.created_at.desc()).all()
        return [exam.to_dict() for exam in exams]

    def get_student_exams(self, student_id: int, class_id: int) -> List[Dict[str, Any]]:
        """Get available exams for a student"""
        exams = Exam.query.filter(
            and_(
                Exam.class_id == class_id,
                Exam.status == 'active',
                Exam.is_published == True
            )
        ).all()
        
        exam_list = []
        for exam in exams:
            exam_dict = exam.to_dict()
            
            # Check if student has submitted
            submission = ExamSubmission.query.filter_by(
                exam_id=exam.id, student_id=student_id
            ).first()
            
            exam_dict['submitted'] = submission is not None
            if submission:
                exam_dict['submission'] = submission.to_dict()
                
            exam_list.append(exam_dict)
        
        return exam_list

    def grade_exam_manually(self, submission_id: int, grading_data: Dict[str, Any], teacher_id: int) -> Dict[str, Any]:
        """Manually grade an exam submission"""
        try:
            submission = ExamSubmission.query.get(submission_id)
            if not submission:
                return {'success': False, 'error': 'Submission not found'}
            
            submission.score = grading_data['score']
            submission.percentage = (grading_data['score'] / grading_data['max_score']) * 100
            submission.grade = self._calculate_letter_grade(submission.percentage)
            submission.teacher_feedback = grading_data.get('feedback', '')
            submission.teacher_comments = grading_data.get('comments', '')
            submission.graded_by = teacher_id
            submission.graded_at = datetime.utcnow()
            submission.status = 'graded'
            
            # Update exam statistics
            exam = Exam.query.get(submission.exam_id)
            if exam:
                exam.graded_submissions += 1
                
                # Recalculate average
                graded_submissions = ExamSubmission.query.filter(
                    and_(
                        ExamSubmission.exam_id == exam.id,
                        ExamSubmission.status == 'graded'
                    )
                ).all()
                
                if graded_submissions:
                    total_score = sum(s.percentage for s in graded_submissions)
                    exam.average_score = total_score / len(graded_submissions)
            
            db.session.commit()
            
            # Create grade record
            self._create_grade_record(submission, exam)
            
            # Send notification to student
            self.notification_service.create_notification(
                user_id=submission.student_id,
                title=f'Exam Graded: {exam.title}',
                message=f'Your exam has been graded. Score: {submission.percentage:.1f}%',
                notification_type='grade'
            )
            
            return {
                'success': True,
                'submission': submission.to_dict(),
                'message': 'Exam graded successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _notify_students_about_exam(self, exam: Exam):
        """Send notifications to students about new exam"""
        try:
            # Get students in the class
            students = User.query.join(StudentEnrollment).filter(
                and_(
                    StudentEnrollment.class_id == exam.class_id,
                    User.role == 'student'
                )
            ).all()
            
            for student in students:
                self.notification_service.create_notification(
                    user_id=student.id,
                    title=f'New Exam: {exam.title}',
                    message=f'A new exam has been scheduled for {exam.course.name if exam.course else "your course"}. Date: {exam.scheduled_date.strftime("%Y-%m-%d") if exam.scheduled_date else "TBD"}',
                    notification_type='exam'
                )
                
        except Exception as e:
            print(f"Error notifying students: {e}")

    def get_exam_analytics(self, exam_id: int) -> Dict[str, Any]:
        """Get comprehensive analytics for an exam"""
        try:
            exam = Exam.query.get(exam_id)
            if not exam:
                return {'success': False, 'error': 'Exam not found'}
            
            submissions = ExamSubmission.query.filter_by(exam_id=exam_id).all()
            graded_submissions = [s for s in submissions if s.status == 'graded']
            
            analytics = {
                'exam': exam.to_dict(),
                'total_submissions': len(submissions),
                'graded_submissions': len(graded_submissions),
                'pending_grading': len(submissions) - len(graded_submissions),
                'submission_rate': 0,
                'average_score': 0,
                'grade_distribution': {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0},
                'difficulty_analysis': {},
                'time_analysis': {}
            }
            
            if graded_submissions:
                scores = [s.percentage for s in graded_submissions]
                analytics['average_score'] = sum(scores) / len(scores)
                analytics['highest_score'] = max(scores)
                analytics['lowest_score'] = min(scores)
                
                # Grade distribution
                for submission in graded_submissions:
                    grade = submission.grade
                    if grade in analytics['grade_distribution']:
                        analytics['grade_distribution'][grade] += 1
                
                # Calculate submission rate (need total enrolled students)
                total_students = User.query.join(StudentEnrollment).filter(
                    and_(
                        StudentEnrollment.class_id == exam.class_id,
                        User.role == 'student'
                    )
                ).count()
                
                if total_students > 0:
                    analytics['submission_rate'] = (len(submissions) / total_students) * 100
            
            return {
                'success': True,
                'analytics': analytics
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
