"""
Biometric Service for Staff Attendance
Handles fingerprint/facial recognition for staff check-in
"""
import logging
import hashlib
import base64
from datetime import datetime
from app import db
from app.models.user import User
from app.models.attendance import Attendance

logger = logging.getLogger(__name__)

class BiometricService:
    def __init__(self):
        self.similarity_threshold = 0.85  # 85% similarity required for match
    
    def process_biometric_scan(self, employee_id=None, biometric_data=None, device_id=None, location=None):
        """
        Process biometric scan for staff attendance
        
        Args:
            employee_id (str): Employee ID (optional if using biometric matching)
            biometric_data (str): Base64 encoded biometric template
            device_id (str): Biometric device ID
            location (str): Office/classroom location
            
        Returns:
            dict: Response with success status and user info
        """
        try:
            user = None
            
            # Method 1: Direct employee ID lookup
            if employee_id:
                user = User.query.filter_by(employee_id=employee_id).first()
                
                if not user:
                    logger.warning(f"Unknown employee ID: {employee_id}")
                    return {
                        'success': False,
                        'message': 'Employee ID not found',
                        'employee_id': employee_id
                    }
            
            # Method 2: Biometric template matching (simplified simulation)
            elif biometric_data:
                user = self._match_biometric_template(biometric_data)
                
                if not user:
                    logger.warning("Biometric match failed")
                    return {
                        'success': False,
                        'message': 'Biometric authentication failed',
                        'match_confidence': 0.0
                    }
            
            else:
                return {
                    'success': False,
                    'message': 'Either employee_id or biometric_data required'
                }
            
            # Verify user is staff member
            if user.role not in ['teacher', 'admin']:
                logger.warning(f"Non-staff biometric scan: {user.email}")
                return {
                    'success': False,
                    'message': 'Biometric access restricted to staff members',
                    'user': user.to_dict()
                }
            
            # Check for duplicate attendance within time window
            recent_attendance = Attendance.query.filter_by(
                user_id=user.id,
                method='biometric'
            ).filter(
                Attendance.timestamp >= datetime.now().replace(hour=0, minute=0, second=0)
            ).first()
            
            if recent_attendance:
                return {
                    'success': True,
                    'message': 'Attendance already marked today',
                    'user': user.to_dict(),
                    'attendance': recent_attendance.to_dict(),
                    'duplicate': True
                }
            
            # Determine attendance status
            current_time = datetime.now().time()
            work_start = datetime.strptime("08:00", "%H:%M").time()
            late_threshold = datetime.strptime("08:15", "%H:%M").time()
            
            if current_time <= work_start:
                status = 'present'
            elif current_time <= late_threshold:
                status = 'late'
            else:
                status = 'very_late'
            
            # Create attendance record
            attendance = Attendance(
                user_id=user.id,
                timestamp=datetime.utcnow(),
                type='staff',
                status=status,
                method='biometric',
                biometric_verified=True,
                location=location or 'Staff Office',
                device_id=device_id
            )
            
            db.session.add(attendance)
            
            # Update user's last login
            user.last_login = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Biometric attendance marked: {user.email} - {status}")
            
            return {
                'success': True,
                'message': f'Staff attendance marked: {status}',
                'user': user.to_dict(),
                'attendance': attendance.to_dict(),
                'biometric_verified': True
            }
            
        except Exception as e:
            logger.error(f"Biometric processing error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'System error processing biometric scan',
                'error': str(e)
            }
    
    def _match_biometric_template(self, biometric_data):
        """
        Match biometric template against stored templates
        In production, this would use proper biometric matching algorithms
        """
        try:
            # Simplified simulation - in reality would use specialized biometric libraries
            data_hash = hashlib.sha256(biometric_data.encode()).hexdigest()
            
            # Find users with biometric templates
            staff_users = User.query.filter(
                User.role.in_(['teacher', 'admin']),
                User.biometric_template.isnot(None)
            ).all()
            
            for user in staff_users:
                # Simulate biometric matching
                stored_hash = hashlib.sha256(user.biometric_template.encode()).hexdigest()
                
                # Simple hash comparison (in reality would use proper biometric algorithms)
                if self._calculate_similarity(data_hash, stored_hash) >= self.similarity_threshold:
                    logger.info(f"Biometric match found: {user.email}")
                    return user
            
            return None
            
        except Exception as e:
            logger.error(f"Biometric matching error: {str(e)}")
            return None
    
    def _calculate_similarity(self, hash1, hash2):
        """
        Calculate similarity between two hashes (simplified simulation)
        In production, would use proper biometric similarity algorithms
        """
        if hash1 == hash2:
            return 1.0
        
        # Simple character-based similarity for demo
        matches = sum(1 for a, b in zip(hash1, hash2) if a == b)
        return matches / len(hash1)
    
    def register_biometric_template(self, user_id, biometric_data):
        """Register biometric template for a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            if user.role not in ['teacher', 'admin']:
                return {'success': False, 'message': 'Biometric registration only for staff members'}
            
            # In production, would encrypt the biometric template
            user.biometric_template = base64.b64encode(biometric_data.encode()).decode()
            db.session.commit()
            
            logger.info(f"Biometric template registered: {user.email}")
            
            return {
                'success': True,
                'message': 'Biometric template registered successfully',
                'user': user.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Biometric registration error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error registering biometric template',
                'error': str(e)
            }
    
    def get_staff_attendance_summary(self, days=30):
        """Get staff attendance summary"""
        try:
            from datetime import timedelta
            
            start_date = datetime.now() - timedelta(days=days)
            
            # Get all staff attendance records
            records = Attendance.query.join(User).filter(
                User.role.in_(['teacher', 'admin']),
                Attendance.method == 'biometric',
                Attendance.timestamp >= start_date
            ).all()
            
            # Group by user
            summary = {}
            for record in records:
                user_id = record.user_id
                if user_id not in summary:
                    summary[user_id] = {
                        'user': record.user.to_dict(),
                        'total_days': 0,
                        'present_days': 0,
                        'late_days': 0,
                        'attendance_rate': 0
                    }
                
                summary[user_id]['total_days'] += 1
                if record.status == 'present':
                    summary[user_id]['present_days'] += 1
                elif record.status in ['late', 'very_late']:
                    summary[user_id]['late_days'] += 1
            
            # Calculate attendance rates
            for user_data in summary.values():
                if user_data['total_days'] > 0:
                    user_data['attendance_rate'] = (user_data['present_days'] / user_data['total_days']) * 100
            
            return {
                'success': True,
                'summary': list(summary.values()),
                'period_days': days
            }
            
        except Exception as e:
            logger.error(f"Error generating staff attendance summary: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating attendance summary',
                'error': str(e)
            }
