"""
AI Analytics Service for Student Performance and Dropout Risk Analysis
Provides predictive insights and recommendations for UNEB curriculum alignment
"""
import logging
import json
from datetime import datetime, timedelta

# Optional numpy import for AI features
try:
    import numpy as np
except ImportError:
    np = None
from app import db
from app.models.ai_analytics import AIAnalytics
from app.models.user import User
from app.models.attendance import Attendance
from app.models.payment import Payment

logger = logging.getLogger(__name__)

class AIAnalyticsService:
    def __init__(self):
        self.uneb_subjects = [
            'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
            'History', 'Geography', 'Literature', 'Economics', 'Fine Art',
            'Computer Studies', 'Agriculture', 'Religious Education'
        ]
        
        # UNEB grading scale
        self.uneb_grades = {
            'D1': {'min': 85, 'points': 6},
            'D2': {'min': 80, 'points': 5},
            'C3': {'min': 75, 'points': 4},
            'C4': {'min': 70, 'points': 3},
            'C5': {'min': 65, 'points': 2},
            'C6': {'min': 60, 'points': 1},
            'P7': {'min': 55, 'points': 0.5},
            'P8': {'min': 50, 'points': 0},
            'F9': {'min': 0, 'points': 0}
        }
    
    def analyze_student_performance(self, student_id, subject_area=None, academic_term='Term 1', academic_year='2024'):
        """
        Analyze student performance and generate insights
        
        Args:
            student_id (str): Student identifier
            subject_area (str): Specific subject to analyze
            academic_term (str): Academic term
            academic_year (str): Academic year
            
        Returns:
            dict: Performance analysis results
        """
        try:
            # Get student
            student = User.query.filter_by(student_id=student_id, role='student').first()
            if not student:
                return {'success': False, 'message': 'Student not found'}
            
            # Collect performance data
            performance_data = self._collect_performance_data(student.id, subject_area)
            
            # Calculate performance metrics
            metrics = self._calculate_performance_metrics(performance_data)
            
            # Generate predictions
            predictions = self._generate_performance_predictions(metrics, subject_area)
            
            # Create recommendations
            recommendations = self._generate_recommendations(metrics, predictions)
            
            # Determine intervention need
            intervention_needed = self._assess_intervention_need(metrics, predictions)
            
            # Save analytics record
            analytics = AIAnalytics(
                user_id=student.id,
                analysis_type='performance',
                subject_area=subject_area or 'Overall',
                performance_score=metrics['overall_score'],
                dropout_risk_score=predictions['dropout_risk'],
                engagement_score=metrics['engagement_score'],
                attendance_rate=metrics['attendance_rate'],
                predicted_grade=predictions['predicted_grade'],
                risk_factors=json.dumps(predictions['risk_factors']),
                recommendations=json.dumps(recommendations),
                intervention_suggested=intervention_needed,
                academic_term=academic_term,
                academic_year=academic_year,
                model_version='1.0',
                confidence_score=predictions['confidence'],
                data_points_used=metrics['data_points_count']
            )
            
            db.session.add(analytics)
            db.session.commit()
            
            logger.info(f"Performance analysis completed for student {student_id}")
            
            return {
                'success': True,
                'student_id': student_id,
                'student_name': student.name,
                'analysis_id': analytics.id,
                'metrics': metrics,
                'predictions': predictions,
                'recommendations': recommendations,
                'intervention_needed': intervention_needed,
                'uneb_alignment': self._get_uneb_alignment_insights(metrics, subject_area)
            }
            
        except Exception as e:
            logger.error(f"Performance analysis error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Performance analysis failed',
                'error': str(e)
            }
    
    def _collect_performance_data(self, user_id, subject_area=None):
        """Collect student performance data from various sources"""
        data = {
            'attendance': [],
            'grades': [],
            'assignments': [],
            'behavior': [],
            'payments': []
        }
        
        # Get attendance data (last 90 days)
        start_date = datetime.now() - timedelta(days=90)
        attendance_records = Attendance.query.filter(
            Attendance.user_id == user_id,
            Attendance.timestamp >= start_date
        ).all()
        
        data['attendance'] = [
            {
                'date': record.timestamp,
                'status': record.status,
                'method': record.method
            }
            for record in attendance_records
        ]
        
        # Get payment data (fee payment patterns)
        payment_records = Payment.query.filter(
            Payment.user_id == user_id,
            Payment.status == 'completed'
        ).all()
        
        data['payments'] = [
            {
                'amount': record.amount,
                'date': record.completed_at,
                'fee_type': record.fee_type
            }
            for record in payment_records
        ]
        
        # Simulate grades data (in real system, would come from gradebook)
        if subject_area:
            data['grades'] = self._simulate_subject_grades(subject_area)
        else:
            data['grades'] = self._simulate_overall_grades()
        
        return data
    
    def _calculate_performance_metrics(self, data):
        """Calculate key performance metrics"""
        metrics = {
            'overall_score': 0,
            'attendance_rate': 0,
            'engagement_score': 0,
            'grade_trend': 'stable',
            'payment_consistency': 0,
            'data_points_count': 0
        }
        
        # Calculate attendance rate
        if data['attendance']:
            present_count = sum(1 for a in data['attendance'] if a['status'] == 'present')
            total_count = len(data['attendance'])
            metrics['attendance_rate'] = (present_count / total_count) * 100
        
        # Calculate grade average
        if data['grades']:
            grade_scores = [g['score'] for g in data['grades']]
            metrics['overall_score'] = sum(grade_scores) / len(grade_scores)
            
            # Determine grade trend
            if len(grade_scores) >= 3:
                recent_avg = sum(grade_scores[-3:]) / 3
                earlier_avg = sum(grade_scores[:-3]) / max(1, len(grade_scores) - 3)
                
                if recent_avg > earlier_avg + 5:
                    metrics['grade_trend'] = 'improving'
                elif recent_avg < earlier_avg - 5:
                    metrics['grade_trend'] = 'declining'
        
        # Calculate engagement score (based on attendance and participation)
        engagement_factors = []
        if metrics['attendance_rate'] > 0:
            engagement_factors.append(min(metrics['attendance_rate'], 100))
        
        # Add RFID vs manual attendance (RFID shows better engagement)
        rfid_attendance = sum(1 for a in data['attendance'] if a['method'] == 'rfid')
        total_attendance = len(data['attendance'])
        if total_attendance > 0:
            rfid_rate = (rfid_attendance / total_attendance) * 100
            engagement_factors.append(rfid_rate * 0.8)  # Weight RFID attendance
        
        metrics['engagement_score'] = sum(engagement_factors) / max(1, len(engagement_factors))
        
        # Payment consistency (affects dropout risk)
        if data['payments']:
            expected_payments = 3  # Assume 3 payments per term
            actual_payments = len(data['payments'])
            metrics['payment_consistency'] = min((actual_payments / expected_payments) * 100, 100)
        
        metrics['data_points_count'] = len(data['attendance']) + len(data['grades']) + len(data['payments'])
        
        return metrics
    
    def _generate_performance_predictions(self, metrics, subject_area):
        """Generate performance predictions using AI models"""
        predictions = {
            'predicted_grade': 'C4',
            'dropout_risk': 0.0,
            'confidence': 0.0,
            'risk_factors': []
        }
        
        # Predict UNEB grade based on current performance
        score = metrics['overall_score']
        for grade, info in self.uneb_grades.items():
            if score >= info['min']:
                predictions['predicted_grade'] = grade
                break
        
        # Calculate dropout risk (0-1 scale)
        risk_factors = []
        risk_score = 0.0
        
        # Attendance risk factor
        if metrics['attendance_rate'] < 75:
            risk_score += 0.3
            risk_factors.append('Low attendance rate')
        
        # Academic performance risk factor
        if metrics['overall_score'] < 50:
            risk_score += 0.4
            risk_factors.append('Poor academic performance')
        
        # Payment consistency risk factor
        if metrics['payment_consistency'] < 70:
            risk_score += 0.2
            risk_factors.append('Irregular fee payments')
        
        # Grade trend risk factor
        if metrics['grade_trend'] == 'declining':
            risk_score += 0.1
            risk_factors.append('Declining academic trend')
        
        predictions['dropout_risk'] = min(risk_score, 1.0)
        predictions['risk_factors'] = risk_factors
        
        # Calculate confidence based on data availability
        data_points = metrics['data_points_count']
        if data_points >= 50:
            predictions['confidence'] = 0.9
        elif data_points >= 20:
            predictions['confidence'] = 0.7
        elif data_points >= 10:
            predictions['confidence'] = 0.5
        else:
            predictions['confidence'] = 0.3
        
        return predictions
    
    def _generate_recommendations(self, metrics, predictions):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Attendance recommendations
        if metrics['attendance_rate'] < 85:
            recommendations.append({
                'category': 'attendance',
                'priority': 'high',
                'action': 'Improve attendance monitoring',
                'description': 'Student attendance is below optimal level. Consider parent engagement and attendance incentives.'
            })
        
        # Academic performance recommendations
        if metrics['overall_score'] < 60:
            recommendations.append({
                'category': 'academic',
                'priority': 'high',
                'action': 'Academic intervention required',
                'description': 'Provide additional tutoring and remedial classes to improve performance.'
            })
        
        # Engagement recommendations
        if metrics['engagement_score'] < 70:
            recommendations.append({
                'category': 'engagement',
                'priority': 'medium',
                'action': 'Enhance student engagement',
                'description': 'Implement interactive learning methods and extracurricular activities.'
            })
        
        # Payment recommendations
        if metrics['payment_consistency'] < 80:
            recommendations.append({
                'category': 'financial',
                'priority': 'medium',
                'action': 'Financial support assessment',
                'description': 'Assess family financial situation and provide payment plan options.'
            })
        
        # UNEB preparation recommendations
        if predictions['predicted_grade'] in ['P7', 'P8', 'F9']:
            recommendations.append({
                'category': 'uneb_prep',
                'priority': 'high',
                'action': 'Intensive UNEB preparation',
                'description': 'Enroll in intensive UNEB preparation classes and mock examinations.'
            })
        
        return recommendations
    
    def _assess_intervention_need(self, metrics, predictions):
        """Assess if immediate intervention is needed"""
        high_risk_factors = [
            metrics['attendance_rate'] < 70,
            metrics['overall_score'] < 50,
            predictions['dropout_risk'] > 0.6,
            metrics['grade_trend'] == 'declining'
        ]
        
        return sum(high_risk_factors) >= 2
    
    def _get_uneb_alignment_insights(self, metrics, subject_area):
        """Get insights specific to UNEB curriculum alignment"""
        insights = {
            'curriculum_coverage': 85,  # Percentage of curriculum covered
            'exam_readiness': 'moderate',
            'key_focus_areas': [],
            'uneb_grade_projection': 'C4'
        }
        
        # Determine exam readiness
        if metrics['overall_score'] >= 75:
            insights['exam_readiness'] = 'high'
        elif metrics['overall_score'] >= 60:
            insights['exam_readiness'] = 'moderate'
        else:
            insights['exam_readiness'] = 'low'
        
        # Subject-specific focus areas
        if subject_area:
            focus_areas = {
                'Mathematics': ['Algebra', 'Geometry', 'Statistics'],
                'English Language': ['Comprehension', 'Essay Writing', 'Grammar'],
                'Physics': ['Mechanics', 'Electricity', 'Waves'],
                'Chemistry': ['Organic Chemistry', 'Chemical Bonding', 'Reactions'],
                'Biology': ['Cell Biology', 'Genetics', 'Ecology']
            }
            insights['key_focus_areas'] = focus_areas.get(subject_area, ['General improvement needed'])
        
        return insights
    
    def _simulate_subject_grades(self, subject):
        """Get grades for a specific subject from database"""
        # TODO: Replace with actual database query
        # This should query the Grade model for actual student grades
        return []
    
    def _simulate_overall_grades(self):
        """Get overall grades across subjects from database"""
        # TODO: Replace with actual database query
        # This should query the Grade model for actual student grades
        return []
    
    def get_class_analytics(self, class_id=None, subject=None):
        """Get analytics for entire class or subject"""
        try:
            # Get all students (simplified - in real system would filter by class)
            students = User.query.filter_by(role='student').limit(30).all()
            
            class_analytics = {
                'total_students': len(students),
                'performance_distribution': {},
                'attendance_summary': {},
                'risk_summary': {},
                'top_performers': [],
                'at_risk_students': []
            }
            
            # Analyze each student
            for student in students:
                analysis = self.analyze_student_performance(student.student_id, subject)
                
                if analysis['success']:
                    metrics = analysis['metrics']
                    predictions = analysis['predictions']
                    
                    # Performance distribution
                    grade = predictions['predicted_grade']
                    if grade not in class_analytics['performance_distribution']:
                        class_analytics['performance_distribution'][grade] = 0
                    class_analytics['performance_distribution'][grade] += 1
                    
                    # Identify top performers and at-risk students
                    if metrics['overall_score'] >= 80:
                        class_analytics['top_performers'].append({
                            'student_id': student.student_id,
                            'name': student.name,
                            'score': metrics['overall_score']
                        })
                    
                    if predictions['dropout_risk'] > 0.5:
                        class_analytics['at_risk_students'].append({
                            'student_id': student.student_id,
                            'name': student.name,
                            'risk_score': predictions['dropout_risk'],
                            'risk_factors': predictions['risk_factors']
                        })
            
            # Sort lists
            class_analytics['top_performers'].sort(key=lambda x: x['score'], reverse=True)
            class_analytics['at_risk_students'].sort(key=lambda x: x['risk_score'], reverse=True)
            
            return {
                'success': True,
                'class_analytics': class_analytics
            }
            
        except Exception as e:
            logger.error(f"Class analytics error: {str(e)}")
            return {
                'success': False,
                'message': 'Class analytics failed',
                'error': str(e)
            }
    
    def generate_uneb_readiness_report(self, student_id):
        """Generate UNEB examination readiness report"""
        try:
            analysis = self.analyze_student_performance(student_id)
            
            if not analysis['success']:
                return analysis
            
            metrics = analysis['metrics']
            predictions = analysis['predictions']
            
            # UNEB-specific assessment
            uneb_readiness = {
                'overall_readiness': 'moderate',
                'subject_readiness': {},
                'recommended_actions': [],
                'timeline_to_exam': '6 months',  # Would be calculated dynamically
                'mock_exam_scores': [],
                'weak_areas': [],
                'strong_areas': []
            }
            
            # Assess overall readiness
            if metrics['overall_score'] >= 75:
                uneb_readiness['overall_readiness'] = 'high'
            elif metrics['overall_score'] >= 60:
                uneb_readiness['overall_readiness'] = 'moderate'
            else:
                uneb_readiness['overall_readiness'] = 'low'
            
            # Subject-specific readiness
            for subject in self.uneb_subjects[:6]:  # Top 6 subjects
                import random
                subject_score = metrics['overall_score'] + random.randint(-15, 15)
                subject_score = max(0, min(100, subject_score))
                
                if subject_score >= 70:
                    readiness = 'ready'
                    uneb_readiness['strong_areas'].append(subject)
                elif subject_score >= 55:
                    readiness = 'needs_improvement'
                else:
                    readiness = 'requires_intensive_support'
                    uneb_readiness['weak_areas'].append(subject)
                
                uneb_readiness['subject_readiness'][subject] = {
                    'score': subject_score,
                    'readiness': readiness,
                    'predicted_grade': self._score_to_uneb_grade(subject_score)
                }
            
            # Generate recommendations
            if uneb_readiness['overall_readiness'] == 'low':
                uneb_readiness['recommended_actions'].extend([
                    'Enroll in intensive remedial classes',
                    'Increase study hours to 4-6 hours daily',
                    'Focus on weak subjects identified',
                    'Take weekly mock examinations'
                ])
            
            return {
                'success': True,
                'student_id': student_id,
                'uneb_readiness': uneb_readiness,
                'analysis': analysis
            }
            
        except Exception as e:
            logger.error(f"UNEB readiness report error: {str(e)}")
            return {
                'success': False,
                'message': 'UNEB readiness report failed',
                'error': str(e)
            }
    
    def _score_to_uneb_grade(self, score):
        """Convert percentage score to UNEB grade"""
        for grade, info in self.uneb_grades.items():
            if score >= info['min']:
                return grade
        return 'F9'
