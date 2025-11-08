"""
n8n Workflow Automation Service for Smart School System

This service handles integration with n8n for automated workflows including:
- Real-time attendance alerts
- Parent communication automation
- Fraud detection notifications
- Assignment deadline reminders
- Payment due notifications
- Anomaly detection alerts
- Plagiarism detection alerts
- AI-powered student recommendations
- Performance alerts and trends
- Biometric enrollment notifications
- Exam schedule notifications
- Library overdue book alerts
- Co-curricular event reminders
- Lesson plan reminders
- Parent meeting notifications
- Grade notifications
"""

import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import httpx
from flask import current_app

logger = logging.getLogger(__name__)

class N8NService:
    """Service for integrating with n8n workflow automation platform"""
    
    def __init__(self):
        self.base_url = os.getenv('N8N_BASE_URL', 'http://localhost:5678')
        self.api_key = os.getenv('N8N_API_KEY')
        self.webhook_url = os.getenv('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook')
        self.enabled = os.getenv('N8N_ENABLED', 'true').lower() == 'true'
        self.timeout = int(os.getenv('WORKFLOW_TIMEOUT', '30'))
        self.retry_attempts = int(os.getenv('WORKFLOW_RETRY_ATTEMPTS', '3'))
        
        if not self.enabled:
            logger.info("n8n integration is disabled")
            return
            
        if not self.api_key:
            logger.warning("N8N_API_KEY not configured - some features may not work")
    
    async def trigger_workflow(self, workflow_name: str, data: Dict[str, Any]) -> Optional[Dict]:
        """
        Trigger an n8n workflow with the provided data
        
        Args:
            workflow_name: Name of the workflow to trigger
            data: Data to send to the workflow
            
        Returns:
            Response from n8n or None if failed
        """
        if not self.enabled:
            logger.debug(f"n8n disabled - would trigger workflow: {workflow_name}")
            return None
            
        webhook_url = f"{self.webhook_url}/{workflow_name}"
        
        payload = {
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'smart_school_system',
            'workflow': workflow_name,
            'data': data
        }
        
        for attempt in range(self.retry_attempts):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        webhook_url,
                        json=payload,
                        headers={
                            'Content-Type': 'application/json',
                            'X-API-Key': self.api_key if self.api_key else ''
                        }
                    )
                    
                    if response.status_code == 200:
                        logger.info(f"Successfully triggered workflow: {workflow_name}")
                        return response.json()
                    else:
                        logger.error(f"Workflow trigger failed: {response.status_code} - {response.text}")
                        
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed for workflow {workflow_name}: {str(e)}")
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    
        return None
    
    def trigger_workflow_sync(self, workflow_name: str, data: Dict[str, Any]) -> Optional[Dict]:
        """Synchronous wrapper for trigger_workflow"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.trigger_workflow(workflow_name, data))
        except RuntimeError:
            # Create new event loop if none exists
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(self.trigger_workflow(workflow_name, data))
            finally:
                loop.close()
    
    # School-specific workflow triggers
    
    def trigger_attendance_alert(self, student_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger attendance alert workflow for students"""
        workflow_data = {
            'student_id': student_data.get('student_id') or student_data.get('id'),
            'student_name': student_data.get('student_name') or student_data.get('name'),
            'student_email': student_data.get('student_email'),
            'attendance_status': student_data.get('attendance_status') or student_data.get('status'),
            'date': student_data.get('date'),
            'time': student_data.get('time'),
            'class': student_data.get('class_name')
        }
        
        return self.trigger_workflow_sync('attendance_alert', workflow_data)
    
    def trigger_payment_reminder(self, payment_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger payment reminder workflow"""
        workflow_data = {
            'student_id': payment_data.get('student_id'),
            'student_name': payment_data.get('student_name'),
            'student_email': payment_data.get('student_email'),
            'amount_due': payment_data.get('amount'),
            'due_date': payment_data.get('due_date'),
            'payment_type': payment_data.get('payment_type') or payment_data.get('type'),
            'status': payment_data.get('status'),
            'semester': payment_data.get('semester'),
            'urgency': payment_data.get('urgency')
        }
        
        return self.trigger_workflow_sync('payment_reminder', workflow_data)
    
    def trigger_grade_notification(self, grade_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger grade notification workflow for students"""
        workflow_data = {
            'student_id': grade_data.get('student_id'),
            'student_name': grade_data.get('student_name'),
            'student_email': grade_data.get('student_email'),
            'course': grade_data.get('course') or grade_data.get('subject'),
            'grade': grade_data.get('grade'),
            'assignment_name': grade_data.get('assignment_name'),
            'teacher_name': grade_data.get('teacher_name'),
            'date': grade_data.get('date'),
            'comments': grade_data.get('comments')
        }
        
        return self.trigger_workflow_sync('grade_notification', workflow_data)
    
    def trigger_fraud_alert(self, fraud_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger fraud detection alert workflow"""
        workflow_data = {
            'alert_type': fraud_data.get('type'),
            'user_id': fraud_data.get('user_id'),
            'user_name': fraud_data.get('user_name'),
            'user_role': fraud_data.get('user_role'),
            'suspicious_activity': fraud_data.get('activity'),
            'risk_score': fraud_data.get('risk_score'),
            'timestamp': fraud_data.get('timestamp'),
            'ip_address': fraud_data.get('ip_address'),
            'location': fraud_data.get('location')
        }
        
        return self.trigger_workflow_sync('fraud_alert', workflow_data)
    
    def trigger_assignment_reminder(self, assignment_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger assignment deadline reminder workflow"""
        workflow_data = {
            'assignment_id': assignment_data.get('id'),
            'assignment_title': assignment_data.get('title'),
            'student_id': assignment_data.get('student_id'),
            'student_name': assignment_data.get('student_name'),
            'student_email': assignment_data.get('student_email'),
            'due_date': assignment_data.get('due_date'),
            'subject': assignment_data.get('subject'),
            'teacher_name': assignment_data.get('teacher_name'),
            'days_remaining': assignment_data.get('days_remaining')
        }
        
        return self.trigger_workflow_sync('assignment_reminder', workflow_data)
    
    def trigger_anomaly_alert(self, anomaly_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger anomaly detection alert workflow"""
        workflow_data = {
            'anomaly_type': anomaly_data.get('type'),
            'user_id': anomaly_data.get('user_id'),
            'user_name': anomaly_data.get('user_name'),
            'user_role': anomaly_data.get('user_role'),
            'anomaly_description': anomaly_data.get('description'),
            'severity': anomaly_data.get('severity'),
            'timestamp': anomaly_data.get('timestamp'),
            'additional_data': anomaly_data.get('additional_data', {})
        }
        
        return self.trigger_workflow_sync('anomaly_alert', workflow_data)
    
    def trigger_lesson_plan_reminder(self, lesson_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger lesson plan preparation reminder workflow"""
        workflow_data = {
            'teacher_id': lesson_data.get('teacher_id'),
            'teacher_name': lesson_data.get('teacher_name'),
            'teacher_email': lesson_data.get('teacher_email'),
            'subject': lesson_data.get('subject'),
            'class_name': lesson_data.get('class_name'),
            'lesson_date': lesson_data.get('lesson_date'),
            'lesson_time': lesson_data.get('lesson_time'),
            'topic': lesson_data.get('topic'),
            'preparation_status': lesson_data.get('status')
        }
        
        return self.trigger_workflow_sync('lesson_plan_reminder', workflow_data)
    
    def trigger_student_meeting_notification(self, meeting_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger student meeting notification workflow"""
        workflow_data = {
            'meeting_id': meeting_data.get('meeting_id') or meeting_data.get('id'),
            'meeting_title': meeting_data.get('meeting_title') or meeting_data.get('title'),
            'meeting_date': meeting_data.get('meeting_date') or meeting_data.get('date'),
            'meeting_time': meeting_data.get('meeting_time') or meeting_data.get('time'),
            'meeting_location': meeting_data.get('meeting_location') or meeting_data.get('location'),
            'student_id': meeting_data.get('student_id'),
            'student_name': meeting_data.get('student_name'),
            'student_email': meeting_data.get('student_email'),
            'teacher_name': meeting_data.get('teacher_name'),
            'meeting_purpose': meeting_data.get('meeting_purpose') or meeting_data.get('purpose')
        }
        
        return self.trigger_workflow_sync('student_meeting_notification', workflow_data)
    
    def trigger_plagiarism_detection(self, plagiarism_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger plagiarism detection workflow"""
        workflow_data = {
            'assignment_id': plagiarism_data.get('assignment_id'),
            'student_id': plagiarism_data.get('student_id'),
            'student_name': plagiarism_data.get('student_name'),
            'similarity_score': plagiarism_data.get('similarity_score'),
            'matched_sources': plagiarism_data.get('matched_sources'),
            'teacher_email': plagiarism_data.get('teacher_email'),
            'assignment_title': plagiarism_data.get('assignment_title'),
            'detection_date': plagiarism_data.get('detection_date')
        }
        
        return self.trigger_workflow_sync('plagiarism_detection', workflow_data)
    
    def trigger_ai_recommendation(self, recommendation_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger AI recommendation workflow for students"""
        workflow_data = {
            'student_id': recommendation_data.get('student_id'),
            'student_name': recommendation_data.get('student_name'),
            'student_email': recommendation_data.get('student_email'),
            'recommendation_type': recommendation_data.get('type'),
            'subject': recommendation_data.get('subject'),
            'recommendation_text': recommendation_data.get('recommendation'),
            'priority': recommendation_data.get('priority'),
            'action_items': recommendation_data.get('action_items', [])
        }
        
        return self.trigger_workflow_sync('ai_recommendation', workflow_data)
    
    def trigger_performance_alert(self, performance_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger student performance alert workflow"""
        workflow_data = {
            'student_id': performance_data.get('student_id'),
            'student_name': performance_data.get('student_name'),
            'student_email': performance_data.get('student_email'),
            'course': performance_data.get('course') or performance_data.get('subject'),
            'current_grade': performance_data.get('current_grade'),
            'trend': performance_data.get('trend'),
            'teacher_name': performance_data.get('teacher_name'),
            'recommendations': performance_data.get('recommendations', [])
        }
        
        return self.trigger_workflow_sync('performance_alert', workflow_data)
    
    def trigger_biometric_enrollment(self, biometric_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger biometric enrollment notification workflow"""
        workflow_data = {
            'student_id': biometric_data.get('student_id'),
            'student_name': biometric_data.get('student_name'),
            'student_email': biometric_data.get('student_email'),
            'enrollment_status': biometric_data.get('status'),
            'enrollment_date': biometric_data.get('date'),
            'device_id': biometric_data.get('device_id')
        }
        
        return self.trigger_workflow_sync('biometric_enrollment', workflow_data)
    
    def trigger_exam_schedule_notification(self, exam_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger exam schedule notification workflow"""
        workflow_data = {
            'exam_id': exam_data.get('exam_id') or exam_data.get('id'),
            'exam_title': exam_data.get('exam_title') or exam_data.get('title'),
            'course': exam_data.get('course') or exam_data.get('subject'),
            'exam_date': exam_data.get('exam_date') or exam_data.get('date'),
            'exam_time': exam_data.get('exam_time') or exam_data.get('time'),
            'duration': exam_data.get('duration'),
            'venue': exam_data.get('venue'),
            'student_id': exam_data.get('student_id'),
            'student_name': exam_data.get('student_name'),
            'student_email': exam_data.get('student_email')
        }
        
        return self.trigger_workflow_sync('exam_schedule_notification', workflow_data)
    
    def trigger_library_overdue_alert(self, library_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger library book overdue alert workflow"""
        workflow_data = {
            'student_id': library_data.get('student_id'),
            'student_name': library_data.get('student_name'),
            'student_email': library_data.get('student_email'),
            'book_title': library_data.get('book_title'),
            'book_isbn': library_data.get('isbn'),
            'due_date': library_data.get('due_date'),
            'days_overdue': library_data.get('days_overdue'),
            'fine_amount': library_data.get('fine_amount')
        }
        
        return self.trigger_workflow_sync('library_overdue_alert', workflow_data)
    
    def trigger_cocurricular_event_reminder(self, event_data: Dict[str, Any]) -> Optional[Dict]:
        """Trigger co-curricular event reminder workflow"""
        workflow_data = {
            'event_id': event_data.get('id'),
            'event_name': event_data.get('name'),
            'event_type': event_data.get('type'),
            'event_date': event_data.get('date'),
            'event_time': event_data.get('time'),
            'venue': event_data.get('venue'),
            'student_id': event_data.get('student_id'),
            'student_name': event_data.get('student_name'),
            'student_email': event_data.get('student_email'),
            'coordinator_name': event_data.get('coordinator_name')
        }
        
        return self.trigger_workflow_sync('cocurricular_event_reminder', workflow_data)
    
    async def get_workflow_status(self, execution_id: str) -> Optional[Dict]:
        """Get the status of a workflow execution"""
        if not self.enabled or not self.api_key:
            return None
            
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/executions/{execution_id}",
                    headers={'X-N8N-API-KEY': self.api_key}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get workflow status: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error getting workflow status: {str(e)}")
            
        return None
    
    async def list_active_workflows(self) -> List[Dict]:
        """List all active workflows"""
        if not self.enabled or not self.api_key:
            return []
            
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/workflows",
                    headers={'X-N8N-API-KEY': self.api_key}
                )
                
                if response.status_code == 200:
                    return response.json().get('data', [])
                else:
                    logger.error(f"Failed to list workflows: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error listing workflows: {str(e)}")
            
        return []

# Global instance
n8n_service = N8NService()

def get_n8n_service() -> N8NService:
    """Get the global n8n service instance"""
    return n8n_service
