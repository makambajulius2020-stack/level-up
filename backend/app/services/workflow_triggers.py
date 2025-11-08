"""
Workflow Trigger Service for Smart School System

This service automatically triggers n8n workflows based on system events
and integrates with existing models to provide real-time automation.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.services.n8n_service import get_n8n_service
from app.models.user import User
from app.models.attendance import Attendance
from app.models.payment import Payment
from app.models.notification import Notification
from app import db

logger = logging.getLogger(__name__)

class WorkflowTriggerService:
    """Service for automatically triggering workflows based on system events"""
    
    def __init__(self):
        self.n8n_service = get_n8n_service()
    
    def trigger_attendance_workflow(self, attendance_record: Attendance) -> bool:
        """
        Trigger attendance-related workflows
        
        Args:
            attendance_record: Attendance record that was created/updated
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            student = User.query.get(attendance_record.user_id)
            if not student or student.role != 'student':
                return False
            
            # Prepare workflow data
            workflow_data = {
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'attendance_status': attendance_record.status,
                'date': attendance_record.date.isoformat() if attendance_record.date else None,
                'time': attendance_record.time_in.isoformat() if attendance_record.time_in else None,
                'class_name': getattr(student, 'class_name', 'Unknown')
            }
            
            # Trigger different workflows based on attendance status
            if attendance_record.status in ['absent', 'late']:
                result = self.n8n_service.trigger_attendance_alert(workflow_data)
                if result:
                    logger.info(f"Attendance alert triggered for student {student.name}")
                    return True
                    
        except Exception as e:
            logger.error(f"Error triggering attendance workflow: {str(e)}")
            
        return False
    
    def trigger_payment_workflow(self, payment_record: Payment) -> bool:
        """
        Trigger payment-related workflows
        
        Args:
            payment_record: Payment record that was created/updated
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            student = User.query.get(payment_record.user_id)
            if not student or student.role != 'student':
                return False
            
            # Prepare workflow data
            workflow_data = {
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'amount': float(payment_record.amount),
                'due_date': payment_record.due_date.isoformat() if payment_record.due_date else None,
                'payment_type': payment_record.type,
                'status': payment_record.status,
                'semester': getattr(payment_record, 'semester', 'Current Semester')
            }
            
            # Trigger workflows based on payment status
            if payment_record.status == 'pending' and payment_record.due_date:
                # Check if payment is due soon or overdue
                days_until_due = (payment_record.due_date - datetime.now().date()).days
                
                if days_until_due <= 0:
                    workflow_data['urgency'] = 'overdue'
                elif days_until_due <= 7:
                    workflow_data['urgency'] = 'due_soon'
                else:
                    workflow_data['urgency'] = 'normal'
                
                result = self.n8n_service.trigger_payment_reminder(workflow_data)
                if result:
                    logger.info(f"Payment reminder triggered for student {student.name}")
                    return True
                    
        except Exception as e:
            logger.error(f"Error triggering payment workflow: {str(e)}")
            
        return False
    
    def trigger_grade_workflow(self, grade_data: Dict[str, Any]) -> bool:
        """
        Trigger grade notification workflows
        
        Args:
            grade_data: Dictionary containing grade information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            student_id = grade_data.get('student_id')
            student = User.query.get(student_id)
            
            if not student or student.role != 'student':
                return False
            
            # Get teacher information
            teacher_id = grade_data.get('teacher_id')
            teacher = User.query.get(teacher_id) if teacher_id else None
            
            # Prepare workflow data
            workflow_data = {
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'course': grade_data.get('course'),
                'grade': grade_data.get('grade'),
                'assignment_name': grade_data.get('assignment_name'),
                'teacher_name': teacher.name if teacher else 'Unknown',
                'date': grade_data.get('date', datetime.now().isoformat()),
                'comments': grade_data.get('comments', '')
            }
            
            result = self.n8n_service.trigger_grade_notification(workflow_data)
            if result:
                logger.info(f"Grade notification triggered for student {student.name}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering grade workflow: {str(e)}")
            
        return False
    
    def trigger_fraud_detection_workflow(self, fraud_data: Dict[str, Any]) -> bool:
        """
        Trigger fraud detection workflows
        
        Args:
            fraud_data: Dictionary containing fraud detection information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            user_id = fraud_data.get('user_id')
            user = User.query.get(user_id) if user_id else None
            
            # Prepare workflow data
            workflow_data = {
                'alert_type': fraud_data.get('type', 'unknown'),
                'user_id': user.id if user else None,
                'user_name': user.name if user else 'Unknown',
                'user_role': user.role if user else 'unknown',
                'suspicious_activity': fraud_data.get('activity'),
                'risk_score': fraud_data.get('risk_score', 0),
                'timestamp': fraud_data.get('timestamp', datetime.now().isoformat()),
                'ip_address': fraud_data.get('ip_address'),
                'location': fraud_data.get('location'),
                'additional_details': fraud_data.get('details', {})
            }
            
            result = self.n8n_service.trigger_fraud_alert(workflow_data)
            if result:
                logger.info(f"Fraud alert triggered for user {user.name if user else 'Unknown'}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering fraud detection workflow: {str(e)}")
            
        return False
    
    def trigger_assignment_reminder_workflow(self, assignment_data: Dict[str, Any]) -> bool:
        """
        Trigger assignment reminder workflows
        
        Args:
            assignment_data: Dictionary containing assignment information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            student_id = assignment_data.get('student_id')
            student = User.query.get(student_id)
            
            if not student or student.role != 'student':
                return False
            
            # Get teacher information
            teacher_id = assignment_data.get('teacher_id')
            teacher = User.query.get(teacher_id) if teacher_id else None
            
            # Calculate days remaining
            due_date_str = assignment_data.get('due_date')
            days_remaining = 0
            if due_date_str:
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    days_remaining = (due_date.date() - datetime.now().date()).days
                except:
                    pass
            
            # Prepare workflow data
            workflow_data = {
                'assignment_id': assignment_data.get('id'),
                'assignment_title': assignment_data.get('title'),
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'due_date': due_date_str,
                'subject': assignment_data.get('subject'),
                'teacher_name': teacher.name if teacher else 'Unknown',
                'days_remaining': days_remaining,
                'urgency': 'overdue' if days_remaining < 0 else 'due_soon' if days_remaining <= 2 else 'normal'
            }
            
            result = self.n8n_service.trigger_assignment_reminder(workflow_data)
            if result:
                logger.info(f"Assignment reminder triggered for student {student.name}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering assignment reminder workflow: {str(e)}")
            
        return False
    
    def trigger_anomaly_detection_workflow(self, anomaly_data: Dict[str, Any]) -> bool:
        """
        Trigger anomaly detection workflows
        
        Args:
            anomaly_data: Dictionary containing anomaly information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            user_id = anomaly_data.get('user_id')
            user = User.query.get(user_id) if user_id else None
            
            # Prepare workflow data
            workflow_data = {
                'anomaly_type': anomaly_data.get('type'),
                'user_id': user.id if user else None,
                'user_name': user.name if user else 'System',
                'user_role': user.role if user else 'system',
                'anomaly_description': anomaly_data.get('description'),
                'severity': anomaly_data.get('severity', 'medium'),
                'timestamp': anomaly_data.get('timestamp', datetime.now().isoformat()),
                'additional_data': anomaly_data.get('additional_data', {}),
                'confidence_score': anomaly_data.get('confidence_score', 0.5)
            }
            
            result = self.n8n_service.trigger_anomaly_alert(workflow_data)
            if result:
                logger.info(f"Anomaly alert triggered: {anomaly_data.get('type')}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering anomaly detection workflow: {str(e)}")
            
        return False
    
    def trigger_lesson_plan_reminder_workflow(self, lesson_data: Dict[str, Any]) -> bool:
        """
        Trigger lesson plan reminder workflows
        
        Args:
            lesson_data: Dictionary containing lesson plan information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            teacher_id = lesson_data.get('teacher_id')
            teacher = User.query.get(teacher_id)
            
            if not teacher or teacher.role != 'teacher':
                return False
            
            # Prepare workflow data
            workflow_data = {
                'teacher_id': teacher.id,
                'teacher_name': teacher.name,
                'teacher_email': teacher.email,
                'subject': lesson_data.get('subject'),
                'class_name': lesson_data.get('class_name'),
                'lesson_date': lesson_data.get('lesson_date'),
                'lesson_time': lesson_data.get('lesson_time'),
                'topic': lesson_data.get('topic'),
                'preparation_status': lesson_data.get('status', 'pending')
            }
            
            result = self.n8n_service.trigger_lesson_plan_reminder(workflow_data)
            if result:
                logger.info(f"Lesson plan reminder triggered for teacher {teacher.name}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering lesson plan reminder workflow: {str(e)}")
            
        return False
    
    def trigger_student_meeting_workflow(self, meeting_data: Dict[str, Any]) -> bool:
        """
        Trigger student meeting notification workflows
        
        Args:
            meeting_data: Dictionary containing meeting information
            
        Returns:
            True if workflow was triggered successfully
        """
        try:
            student_id = meeting_data.get('student_id')
            student = User.query.get(student_id)
            
            if not student or student.role != 'student':
                return False
            
            # Get teacher information
            teacher_id = meeting_data.get('teacher_id')
            teacher = User.query.get(teacher_id) if teacher_id else None
            
            # Prepare workflow data
            workflow_data = {
                'meeting_id': meeting_data.get('id'),
                'meeting_title': meeting_data.get('title'),
                'meeting_date': meeting_data.get('date'),
                'meeting_time': meeting_data.get('time'),
                'meeting_location': meeting_data.get('location'),
                'student_id': student.id,
                'student_name': student.name,
                'student_email': student.email,
                'teacher_name': teacher.name if teacher else 'School Staff',
                'meeting_purpose': meeting_data.get('purpose')
            }
            
            result = self.n8n_service.trigger_student_meeting_notification(workflow_data)
            if result:
                logger.info(f"Student meeting notification triggered for {student.name}")
                return True
                
        except Exception as e:
            logger.error(f"Error triggering student meeting workflow: {str(e)}")
            
        return False
    
    def check_and_trigger_daily_workflows(self) -> Dict[str, int]:
        """
        Check for conditions that require daily workflow triggers
        
        Returns:
            Dictionary with counts of triggered workflows
        """
        triggered_counts = {
            'payment_reminders': 0,
            'assignment_reminders': 0,
            'lesson_plan_reminders': 0
        }
        
        try:
            # Check for overdue payments
            overdue_payments = Payment.query.filter(
                Payment.status == 'pending',
                Payment.due_date <= datetime.now().date()
            ).all()
            
            for payment in overdue_payments:
                if self.trigger_payment_workflow(payment):
                    triggered_counts['payment_reminders'] += 1
            
            # Check for upcoming assignment deadlines (next 3 days)
            upcoming_deadline = datetime.now().date() + timedelta(days=3)
            # Note: This would need to be implemented based on your assignment model
            # assignments_due_soon = Assignment.query.filter(
            #     Assignment.due_date <= upcoming_deadline,
            #     Assignment.status == 'active'
            # ).all()
            
            # Check for lesson plans that need preparation (tomorrow's lessons)
            tomorrow = datetime.now().date() + timedelta(days=1)
            # Note: This would need to be implemented based on your lesson plan model
            # lessons_tomorrow = LessonPlan.query.filter(
            #     LessonPlan.lesson_date == tomorrow,
            #     LessonPlan.preparation_status != 'completed'
            # ).all()
            
            logger.info(f"Daily workflow check completed: {triggered_counts}")
            
        except Exception as e:
            logger.error(f"Error in daily workflow check: {str(e)}")
        
        return triggered_counts

# Global instance
workflow_trigger_service = WorkflowTriggerService()

def get_workflow_trigger_service() -> WorkflowTriggerService:
    """Get the global workflow trigger service instance"""
    return workflow_trigger_service
