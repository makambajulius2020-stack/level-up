from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import (
    Grade, GradeScale, StudentProgress, User, Course, SchoolClass,
    Assignment, AssignmentSubmission, Exam, ExamSubmission
)
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.notification_service import NotificationService

class GradeService:
    def __init__(self):
        self.ai_service = AIAnalyticsService()
        self.notification_service = NotificationService()

    def create_grade(self, grade_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new grade record"""
        try:
            # Calculate percentage and letter grade
            percentage = (grade_data['score'] / grade_data['max_score']) * 100
            letter_grade = self._calculate_letter_grade(percentage, grade_data.get('class_level', 'S6'))
            grade_points = self._calculate_grade_points(letter_grade)
            
            # Calculate class statistics
            class_stats = self._calculate_class_statistics(
                grade_data['subject_id'], 
                grade_data['class_id'], 
                grade_data['assessment_type']
            )
            
            grade = Grade(
                student_id=grade_data['student_id'],
                subject_id=grade_data['subject_id'],
                class_id=grade_data['class_id'],
                teacher_id=grade_data['teacher_id'],
                assessment_type=grade_data['assessment_type'],
                assessment_name=grade_data['assessment_name'],
                assessment_id=grade_data.get('assessment_id'),
                score=grade_data['score'],
                max_score=grade_data['max_score'],
                percentage=percentage,
                letter_grade=letter_grade,
                grade_points=grade_points,
                academic_year=grade_data.get('academic_year', '2024'),
                semester=grade_data.get('semester', 'Semester 1'),
                week=grade_data.get('week'),
                assessment_date=datetime.fromisoformat(grade_data['assessment_date']),
                graded_by=grade_data.get('graded_by', grade_data['teacher_id']),
                auto_graded=grade_data.get('auto_graded', False),
                teacher_comments=grade_data.get('teacher_comments', ''),
                feedback=grade_data.get('feedback', ''),
                class_average=class_stats.get('average', 0),
                class_rank=class_stats.get('rank', 0),
                percentile=class_stats.get('percentile', 0)
            )
            
            db.session.add(grade)
            db.session.commit()
            
            # Update student progress
            self._update_student_progress(grade)
            
            # Send notification to student
            self._notify_grade_created(grade)
            
            return {
                'success': True,
                'grade': grade.to_dict(),
                'message': 'Grade created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _calculate_letter_grade(self, percentage: float, class_level: str = 'S6') -> str:
        """Calculate letter grade based on percentage and class level"""
        # Get grade scale for class level
        grade_scale = GradeScale.query.filter(
            and_(
                GradeScale.is_active == True,
                or_(
                    GradeScale.class_level == class_level,
                    GradeScale.class_level == 'all'
                ),
                GradeScale.min_percentage <= percentage,
                GradeScale.max_percentage >= percentage
            )
        ).first()
        
        if grade_scale:
            return grade_scale.letter_grade
        
        # Fallback to standard grading
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

    def _calculate_grade_points(self, letter_grade: str) -> float:
        """Calculate grade points for GPA calculation"""
        grade_points = {
            'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
        }
        return grade_points.get(letter_grade, 0.0)

    def _calculate_class_statistics(self, subject_id: int, class_id: int, assessment_type: str) -> Dict[str, Any]:
        """Calculate class statistics for ranking and percentile"""
        try:
            # Get all grades for this subject, class, and assessment type
            grades = Grade.query.filter(
                and_(
                    Grade.subject_id == subject_id,
                    Grade.class_id == class_id,
                    Grade.assessment_type == assessment_type
                )
            ).all()
            
            if not grades:
                return {'average': 0, 'rank': 1, 'percentile': 100}
            
            percentages = [g.percentage for g in grades]
            average = sum(percentages) / len(percentages)
            
            return {
                'average': round(average, 2),
                'rank': 1,  # Will be calculated after insertion
                'percentile': 50  # Will be calculated after insertion
            }
            
        except Exception:
            return {'average': 0, 'rank': 1, 'percentile': 100}

    def get_student_grades(self, student_id: int, subject_id: Optional[int] = None, 
                          academic_year: Optional[str] = None, semester: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get grades for a student with optional filters"""
        query = Grade.query.filter_by(student_id=student_id)
        
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
        if semester:
            query = query.filter_by(semester=semester)
            
        grades = query.order_by(desc(Grade.assessment_date)).all()
        return [grade.to_dict() for grade in grades]

    def get_class_grades(self, class_id: int, subject_id: Optional[int] = None, 
                        assessment_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get grades for a class with optional filters"""
        query = Grade.query.filter_by(class_id=class_id)
        
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        if assessment_type:
            query = query.filter_by(assessment_type=assessment_type)
            
        grades = query.order_by(desc(Grade.assessment_date)).all()
        return [grade.to_dict() for grade in grades]

    def calculate_student_gpa(self, student_id: int, academic_year: str, semester: Optional[str] = None) -> Dict[str, Any]:
        """Calculate student's GPA for a given period"""
        try:
            query = Grade.query.filter(
                and_(
                    Grade.student_id == student_id,
                    Grade.academic_year == academic_year
                )
            )
            
            if semester:
                query = query.filter_by(semester=semester)
                
            grades = query.all()
            
            if not grades:
                return {
                    'gpa': 0.0,
                    'total_credits': 0,
                    'grade_distribution': {},
                    'total_assessments': 0
                }
            
            # Group by subject to get weighted GPA
            subject_grades = {}
            for grade in grades:
                if grade.subject_id not in subject_grades:
                    subject_grades[grade.subject_id] = []
                subject_grades[grade.subject_id].append(grade)
            
            total_grade_points = 0
            total_credits = 0
            grade_distribution = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
            
            for subject_id, subject_grade_list in subject_grades.items():
                # Calculate subject average
                total_percentage = sum(g.percentage for g in subject_grade_list)
                avg_percentage = total_percentage / len(subject_grade_list)
                
                # Get course credits
                course = Course.query.get(subject_id)
                credits = course.credits if course else 4
                
                # Calculate grade points
                letter_grade = self._calculate_letter_grade(avg_percentage)
                grade_points = self._calculate_grade_points(letter_grade)
                
                total_grade_points += grade_points * credits
                total_credits += credits
                
                if letter_grade in grade_distribution:
                    grade_distribution[letter_grade] += 1
            
            gpa = total_grade_points / total_credits if total_credits > 0 else 0.0
            
            return {
                'gpa': round(gpa, 2),
                'total_credits': total_credits,
                'grade_distribution': grade_distribution,
                'total_assessments': len(grades),
                'academic_year': academic_year,
                'semester': semester
            }
            
        except Exception as e:
            return {'error': str(e)}

    def update_student_progress(self, student_id: int, subject_id: int) -> Dict[str, Any]:
        """Update comprehensive student progress analytics"""
        try:
            # Get or create progress record
            progress = StudentProgress.query.filter_by(
                student_id=student_id,
                subject_id=subject_id,
                academic_year='2024',
                semester='Semester 1'
            ).first()
            
            if not progress:
                progress = StudentProgress(
                    student_id=student_id,
                    subject_id=subject_id,
                    academic_year='2024',
                    semester='Semester 1'
                )
                db.session.add(progress)
            
            # Calculate current performance
            current_grades = Grade.query.filter(
                and_(
                    Grade.student_id == student_id,
                    Grade.subject_id == subject_id,
                    Grade.academic_year == '2024',
                    Grade.semester == 'Semester 1'
                )
            ).all()
            
            if current_grades:
                # Calculate weighted average
                ca_grades = [g for g in current_grades if g.assessment_type in ['assignment', 'quiz', 'project']]
                exam_grades = [g for g in current_grades if g.assessment_type == 'exam']
                
                ca_avg = sum(g.percentage for g in ca_grades) / len(ca_grades) if ca_grades else 0
                exam_avg = sum(g.percentage for g in exam_grades) / len(exam_grades) if exam_grades else 0
                
                progress.continuous_assessment_score = ca_avg
                progress.exam_score = exam_avg
                progress.current_grade = (ca_avg * 0.4) + (exam_avg * 0.6)  # 40% CA, 60% Exam
                
                # Calculate improvement
                if progress.previous_grade:
                    progress.improvement = progress.current_grade - progress.previous_grade
                    if progress.improvement > 5:
                        progress.trend = 'up'
                    elif progress.improvement < -5:
                        progress.trend = 'down'
                    else:
                        progress.trend = 'stable'
                
                # Calculate class comparison
                class_grades = Grade.query.filter(
                    and_(
                        Grade.subject_id == subject_id,
                        Grade.class_id == current_grades[0].class_id,
                        Grade.academic_year == '2024',
                        Grade.semester == 'Semester 1'
                    )
                ).all()
                
                if class_grades:
                    student_scores = {}
                    for grade in class_grades:
                        if grade.student_id not in student_scores:
                            student_scores[grade.student_id] = []
                        student_scores[grade.student_id].append(grade.percentage)
                    
                    class_averages = [sum(scores)/len(scores) for scores in student_scores.values()]
                    progress.class_average = sum(class_averages) / len(class_averages)
                    
                    # Calculate rank
                    student_avg = progress.current_grade
                    better_students = sum(1 for avg in class_averages if avg > student_avg)
                    progress.class_rank = better_students + 1
                    progress.class_size = len(class_averages)
                    progress.percentile = ((len(class_averages) - better_students) / len(class_averages)) * 100
                
                # AI-powered predictions and recommendations
                ai_analysis = self._generate_ai_progress_analysis(progress, current_grades)
                progress.predicted_final_grade = ai_analysis.get('predicted_grade', progress.current_grade)
                progress.uneb_readiness_score = ai_analysis.get('uneb_readiness', 50)
                progress.recommended_actions = ai_analysis.get('recommendations', [])
                progress.performance_alerts = ai_analysis.get('alerts', [])
                
                # Risk assessment
                if progress.current_grade < 50 or progress.trend == 'down':
                    progress.at_risk = True
                    progress.needs_intervention = True
                else:
                    progress.at_risk = False
                    progress.needs_intervention = False
            
            progress.last_updated = datetime.utcnow()
            db.session.commit()
            
            return {
                'success': True,
                'progress': progress.to_dict(),
                'message': 'Student progress updated successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _generate_ai_progress_analysis(self, progress: StudentProgress, grades: List[Grade]) -> Dict[str, Any]:
        """Generate AI-powered progress analysis and predictions"""
        try:
            # Prepare data for AI analysis
            grade_data = [g.percentage for g in grades]
            assessment_types = [g.assessment_type for g in grades]
            
            prompt = f"""
            Analyze student academic progress and provide predictions:
            
            Current Grade: {progress.current_grade}%
            Recent Scores: {grade_data}
            Assessment Types: {assessment_types}
            Class Average: {progress.class_average}%
            Trend: {progress.trend}
            
            Provide analysis in JSON format:
            {{
                "predicted_grade": <predicted final grade 0-100>,
                "uneb_readiness": <UNEB readiness score 0-100>,
                "recommendations": [<list of specific recommendations>],
                "alerts": [<list of performance alerts>],
                "strengths": [<list of academic strengths>],
                "areas_for_improvement": [<list of areas needing work>]
            }}
            """
            
            response = self.ai_service.generate_content(prompt, max_tokens=500)
            
            if response and response.get('success'):
                try:
                    import json
                    return json.loads(response['content'])
                except json.JSONDecodeError:
                    pass
            
            # Fallback analysis
            return self._generate_fallback_analysis(progress, grades)
            
        except Exception:
            return self._generate_fallback_analysis(progress, grades)

    def _generate_fallback_analysis(self, progress: StudentProgress, grades: List[Grade]) -> Dict[str, Any]:
        """Generate fallback analysis when AI is unavailable"""
        recommendations = []
        alerts = []
        
        if progress.current_grade < 50:
            alerts.append("Student is at risk of failing")
            recommendations.append("Schedule additional tutoring sessions")
            recommendations.append("Review fundamental concepts")
        elif progress.current_grade < 70:
            recommendations.append("Focus on exam preparation")
            recommendations.append("Complete more practice exercises")
        
        if progress.trend == 'down':
            alerts.append("Performance is declining")
            recommendations.append("Investigate potential causes of decline")
        
        # Simple prediction based on trend
        predicted_grade = progress.current_grade
        if progress.trend == 'up':
            predicted_grade = min(100, progress.current_grade + 5)
        elif progress.trend == 'down':
            predicted_grade = max(0, progress.current_grade - 5)
        
        return {
            'predicted_grade': predicted_grade,
            'uneb_readiness': max(0, min(100, progress.current_grade - 10)),
            'recommendations': recommendations,
            'alerts': alerts,
            'strengths': ["Consistent attendance"] if len(grades) > 3 else [],
            'areas_for_improvement': ["Exam performance"] if progress.exam_score < progress.continuous_assessment_score else []
        }

    def _update_student_progress(self, grade: Grade):
        """Update student progress after new grade"""
        self.update_student_progress(grade.student_id, grade.subject_id)

    def _notify_grade_created(self, grade: Grade):
        """Send notifications about new grade"""
        try:
            # Notify student
            self.notification_service.create_notification(
                user_id=grade.student_id,
                title=f'New Grade: {grade.assessment_name}',
                message=f'You received {grade.percentage:.1f}% ({grade.letter_grade}) in {grade.course.name if grade.course else "your course"}',
                notification_type='grade'
            )
            
            # Notify parents if student is under 18
            student = User.query.get(grade.student_id)
            # Parent notifications removed - feature not available
            # if student and hasattr(student, 'parent_id') and student.parent_id:
            #     self.notification_service.create_notification(
            #         user_id=student.parent_id,
            #         title=f'Grade Update: {student.full_name}',
            #         message=f'{student.full_name} received {grade.percentage:.1f}% in {grade.assessment_name}',
            #         notification_type='grade'
            #     )
                
        except Exception as e:
            print(f"Error sending grade notifications: {e}")

    def get_grade_analytics(self, class_id: int, subject_id: int, assessment_type: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive grade analytics for a class"""
        try:
            query = Grade.query.filter(
                and_(
                    Grade.class_id == class_id,
                    Grade.subject_id == subject_id
                )
            )
            
            if assessment_type:
                query = query.filter_by(assessment_type=assessment_type)
                
            grades = query.all()
            
            if not grades:
                return {'success': False, 'error': 'No grades found'}
            
            percentages = [g.percentage for g in grades]
            
            analytics = {
                'total_grades': len(grades),
                'average': sum(percentages) / len(percentages),
                'highest': max(percentages),
                'lowest': min(percentages),
                'median': sorted(percentages)[len(percentages)//2],
                'grade_distribution': {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0},
                'pass_rate': 0,
                'improvement_trend': 'stable'
            }
            
            # Grade distribution
            for grade in grades:
                if grade.letter_grade in analytics['grade_distribution']:
                    analytics['grade_distribution'][grade.letter_grade] += 1
            
            # Pass rate (assuming 60% is passing)
            passing_grades = [p for p in percentages if p >= 60]
            analytics['pass_rate'] = (len(passing_grades) / len(percentages)) * 100
            
            return {
                'success': True,
                'analytics': analytics
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
