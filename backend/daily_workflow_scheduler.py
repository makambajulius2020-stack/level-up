#!/usr/bin/env python3
"""
Smart School System - Daily Workflow Scheduler

This script runs daily automated workflows for:
- Payment reminders
- Assignment deadline alerts
- Lesson plan reminders
- Attendance anomaly detection
- System health checks

Run this script daily via cron job or Windows Task Scheduler.
"""

import os
import sys
import logging
from datetime import datetime, timedelta, date
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import Flask app and services
from app import create_app, db
from app.models.user import User
from app.models.payment import Payment
from app.models.attendance import Attendance
from app.services.workflow_triggers import get_workflow_trigger_service
from app.services.n8n_service import get_n8n_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/daily_workflows.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class DailyWorkflowScheduler:
    """Scheduler for daily automated workflows"""
    
    def __init__(self):
        self.app = create_app()
        self.workflow_service = get_workflow_trigger_service()
        self.n8n_service = get_n8n_service()
        self.stats = {
            'payment_reminders': 0,
            'assignment_reminders': 0,
            'lesson_reminders': 0,
            'attendance_alerts': 0,
            'anomaly_alerts': 0,
            'errors': 0
        }
    
    def check_overdue_payments(self):
        """Check for overdue payments and send reminders"""
        logger.info("Checking for overdue payments...")
        
        try:
            with self.app.app_context():
                # Get payments that are overdue (due date passed)
                overdue_payments = Payment.query.filter(
                    Payment.status == 'pending',
                    Payment.due_date < date.today()
                ).all()
                
                logger.info(f"Found {len(overdue_payments)} overdue payments")
                
                for payment in overdue_payments:
                    try:
                        student = User.query.get(payment.user_id)
                        if not student:
                            continue
                        
                        # Get parent information
                        parent = None
                        if hasattr(student, 'parent_id') and student.parent_id:
                            parent = User.query.get(student.parent_id)
                        
                        # Prepare payment data for workflow
                        payment_data = {
                            'student_id': student.id,
                            'student_name': student.name,
                            'parent_phone': parent.phone if parent else None,
                            'parent_email': parent.email if parent else None,
                            'parent_name': parent.name if parent else None,
                            'amount': float(payment.amount),
                            'due_date': payment.due_date.isoformat(),
                            'payment_type': payment.type,
                            'status': payment.status,
                            'urgency': 'overdue',
                            'days_overdue': (date.today() - payment.due_date).days
                        }
                        
                        # Trigger payment reminder workflow
                        if self.workflow_service.trigger_payment_workflow(payment):
                            self.stats['payment_reminders'] += 1
                            logger.info(f"Payment reminder sent for student: {student.name}")
                        
                    except Exception as e:
                        logger.error(f"Error processing payment reminder for payment {payment.id}: {str(e)}")
                        self.stats['errors'] += 1
                
        except Exception as e:
            logger.error(f"Error checking overdue payments: {str(e)}")
            self.stats['errors'] += 1
    
    def check_upcoming_payment_dues(self):
        """Check for payments due in the next 7 days"""
        logger.info("Checking for upcoming payment dues...")
        
        try:
            with self.app.app_context():
                # Get payments due in the next 7 days
                upcoming_due_date = date.today() + timedelta(days=7)
                upcoming_payments = Payment.query.filter(
                    Payment.status == 'pending',
                    Payment.due_date >= date.today(),
                    Payment.due_date <= upcoming_due_date
                ).all()
                
                logger.info(f"Found {len(upcoming_payments)} payments due soon")
                
                for payment in upcoming_payments:
                    try:
                        student = User.query.get(payment.user_id)
                        if not student:
                            continue
                        
                        # Get parent information
                        parent = None
                        if hasattr(student, 'parent_id') and student.parent_id:
                            parent = User.query.get(student.parent_id)
                        
                        days_until_due = (payment.due_date - date.today()).days
                        
                        # Only send reminders for payments due in 1, 3, or 7 days
                        if days_until_due not in [1, 3, 7]:
                            continue
                        
                        payment_data = {
                            'student_id': student.id,
                            'student_name': student.name,
                            'parent_phone': parent.phone if parent else None,
                            'parent_email': parent.email if parent else None,
                            'parent_name': parent.name if parent else None,
                            'amount': float(payment.amount),
                            'due_date': payment.due_date.isoformat(),
                            'payment_type': payment.type,
                            'status': payment.status,
                            'urgency': 'due_soon',
                            'days_until_due': days_until_due
                        }
                        
                        if self.workflow_service.trigger_payment_workflow(payment):
                            self.stats['payment_reminders'] += 1
                            logger.info(f"Payment due reminder sent for student: {student.name} ({days_until_due} days)")
                        
                    except Exception as e:
                        logger.error(f"Error processing upcoming payment for payment {payment.id}: {str(e)}")
                        self.stats['errors'] += 1
                
        except Exception as e:
            logger.error(f"Error checking upcoming payment dues: {str(e)}")
            self.stats['errors'] += 1
    
    def check_attendance_anomalies(self):
        """Check for attendance anomalies and patterns"""
        logger.info("Checking for attendance anomalies...")
        
        try:
            with self.app.app_context():
                # Check for students with consecutive absences (3+ days)
                recent_date = date.today() - timedelta(days=7)
                
                # Get all students
                students = User.query.filter_by(role='student').all()
                
                for student in students:
                    try:
                        # Get recent attendance records
                        recent_attendance = Attendance.query.filter(
                            Attendance.user_id == student.id,
                            Attendance.date >= recent_date
                        ).order_by(Attendance.date.desc()).all()
                        
                        # Check for consecutive absences
                        consecutive_absences = 0
                        for record in recent_attendance:
                            if record.status == 'absent':
                                consecutive_absences += 1
                            else:
                                break
                        
                        # Trigger anomaly alert for 3+ consecutive absences
                        if consecutive_absences >= 3:
                            anomaly_data = {
                                'type': 'attendance_anomaly',
                                'user_id': student.id,
                                'user_name': student.name,
                                'user_role': 'student',
                                'description': f'Student has been absent for {consecutive_absences} consecutive days',
                                'severity': 'high' if consecutive_absences >= 5 else 'medium',
                                'timestamp': datetime.utcnow().isoformat(),
                                'additional_data': {
                                    'consecutive_absences': consecutive_absences,
                                    'recent_attendance': [r.status for r in recent_attendance[:7]]
                                }
                            }
                            
                            if self.workflow_service.trigger_anomaly_detection_workflow(anomaly_data):
                                self.stats['anomaly_alerts'] += 1
                                logger.info(f"Attendance anomaly alert sent for student: {student.name}")
                        
                    except Exception as e:
                        logger.error(f"Error checking attendance anomaly for student {student.id}: {str(e)}")
                        self.stats['errors'] += 1
                
        except Exception as e:
            logger.error(f"Error checking attendance anomalies: {str(e)}")
            self.stats['errors'] += 1
    
    def check_lesson_plan_reminders(self):
        """Check for lesson plans that need preparation"""
        logger.info("Checking for lesson plan reminders...")
        
        try:
            with self.app.app_context():
                # Get all teachers
                teachers = User.query.filter_by(role='teacher').all()
                tomorrow = date.today() + timedelta(days=1)
                
                for teacher in teachers:
                    try:
                        # TODO: Query lesson plan/timetable model to get actual lesson data
                        # This should query your Timetable and LessonPlan models
                        from app.models.timetable import Timetable
                        from app.models.profile import LessonPlan
                        
                        # Get lessons for this teacher tomorrow
                        lessons_tomorrow = Timetable.query.filter_by(
                            teacher_id=teacher.id,
                            day_of_week=tomorrow.strftime('%A')
                        ).all()
                        
                        for lesson in lessons_tomorrow:
                            # Check if lesson plan exists and is completed
                            lesson_plan = LessonPlan.query.filter_by(
                                teacher_id=teacher.id,
                                subject=lesson.subject,
                                class_name=lesson.class_name,
                                date=tomorrow
                            ).first()
                            
                            lesson_data = {
                                'teacher_id': teacher.id,
                                'teacher_name': teacher.name,
                                'teacher_email': teacher.email,
                                'subject': lesson.subject,
                                'class_name': lesson.class_name,
                                'lesson_date': tomorrow.isoformat(),
                                'lesson_time': lesson.start_time,
                                'topic': lesson_plan.topic if lesson_plan else '',
                                'status': lesson_plan.status if lesson_plan else 'pending'
                            }
                            
                            # Only send reminder if lesson plan is not prepared
                            if not lesson_plan or lesson_plan.status != 'completed':
                                if self.workflow_service.trigger_lesson_plan_reminder_workflow(lesson_data):
                                    self.stats['lesson_reminders'] += 1
                                    logger.info(f"Lesson plan reminder sent to teacher: {teacher.name}")
                        
                    except Exception as e:
                        logger.error(f"Error checking lesson plans for teacher {teacher.id}: {str(e)}")
                        self.stats['errors'] += 1
                
        except Exception as e:
            logger.error(f"Error checking lesson plan reminders: {str(e)}")
            self.stats['errors'] += 1
    
    def run_system_health_check(self):
        """Run system health check and alert if issues found"""
        logger.info("Running system health check...")
        
        try:
            with self.app.app_context():
                health_issues = []
                
                # Check database connectivity
                try:
                    db.session.execute('SELECT 1')
                    logger.info("✅ Database connection: OK")
                except Exception as e:
                    health_issues.append(f"Database connection failed: {str(e)}")
                
                # Check n8n connectivity
                if self.n8n_service.enabled:
                    try:
                        # This would be an async call in real implementation
                        # For now, just check if service is configured
                        if self.n8n_service.base_url and self.n8n_service.webhook_url:
                            logger.info("✅ n8n configuration: OK")
                        else:
                            health_issues.append("n8n configuration incomplete")
                    except Exception as e:
                        health_issues.append(f"n8n service check failed: {str(e)}")
                
                # Check for critical system metrics
                total_users = User.query.count()
                active_payments = Payment.query.filter_by(status='pending').count()
                
                logger.info(f"📊 System metrics: {total_users} users, {active_payments} pending payments")
                
                # Alert if critical issues found
                if health_issues:
                    anomaly_data = {
                        'type': 'system_health',
                        'user_id': None,
                        'user_name': 'System',
                        'user_role': 'system',
                        'description': f'System health check found {len(health_issues)} issues',
                        'severity': 'high',
                        'timestamp': datetime.utcnow().isoformat(),
                        'additional_data': {
                            'issues': health_issues,
                            'total_users': total_users,
                            'active_payments': active_payments
                        }
                    }
                    
                    if self.workflow_service.trigger_anomaly_detection_workflow(anomaly_data):
                        self.stats['anomaly_alerts'] += 1
                        logger.warning(f"System health alert sent: {len(health_issues)} issues found")
                
        except Exception as e:
            logger.error(f"Error running system health check: {str(e)}")
            self.stats['errors'] += 1
    
    def generate_daily_report(self):
        """Generate and send daily workflow report"""
        logger.info("Generating daily workflow report...")
        
        total_workflows = sum(self.stats.values()) - self.stats['errors']
        
        report = f"""
📊 SMART SCHOOL DAILY WORKFLOW REPORT
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*50}

Workflow Statistics:
• Payment Reminders Sent: {self.stats['payment_reminders']}
• Assignment Reminders Sent: {self.stats['assignment_reminders']}
• Lesson Plan Reminders Sent: {self.stats['lesson_reminders']}
• Attendance Alerts Sent: {self.stats['attendance_alerts']}
• Anomaly Alerts Sent: {self.stats['anomaly_alerts']}
• Total Workflows Triggered: {total_workflows}
• Errors Encountered: {self.stats['errors']}

Status: {'✅ SUCCESS' if self.stats['errors'] == 0 else '⚠️ COMPLETED WITH ERRORS'}

Next scheduled run: {(datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d 06:00:00')}
        """
        
        logger.info(report)
        
        # Send report to administrators (if configured)
        try:
            if total_workflows > 0 or self.stats['errors'] > 0:
                report_data = {
                    'type': 'daily_report',
                    'user_id': None,
                    'user_name': 'System Scheduler',
                    'user_role': 'system',
                    'description': f'Daily workflow report: {total_workflows} workflows triggered, {self.stats["errors"]} errors',
                    'severity': 'low' if self.stats['errors'] == 0 else 'medium',
                    'timestamp': datetime.utcnow().isoformat(),
                    'additional_data': self.stats
                }
                
                self.workflow_service.trigger_anomaly_detection_workflow(report_data)
        except Exception as e:
            logger.error(f"Error sending daily report: {str(e)}")
    
    def run_all_daily_workflows(self):
        """Run all daily workflows"""
        logger.info("🚀 Starting daily workflow scheduler...")
        start_time = datetime.now()
        
        try:
            # Run all workflow checks
            self.check_overdue_payments()
            self.check_upcoming_payment_dues()
            self.check_attendance_anomalies()
            self.check_lesson_plan_reminders()
            self.run_system_health_check()
            
            # Generate report
            self.generate_daily_report()
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"✅ Daily workflow scheduler completed in {duration:.2f} seconds")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in daily workflow scheduler: {str(e)}")
            raise

def main():
    """Main function"""
    try:
        scheduler = DailyWorkflowScheduler()
        scheduler.run_all_daily_workflows()
        return 0
    except Exception as e:
        logger.error(f"Scheduler failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
