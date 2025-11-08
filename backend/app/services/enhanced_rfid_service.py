import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import (
    RFIDReader, RFIDCard, RFIDCardRead, RFIDAccessRule,
    User, Attendance, AnomalyDetection
)
from app.services.notification_service import NotificationService
from app.services.n8n_service import N8NService

class EnhancedRFIDService:
    def __init__(self):
        self.notification_service = NotificationService()
        self.n8n_service = N8NService()

    def register_rfid_reader(self, reader_data: Dict[str, Any], installer_id: int) -> Dict[str, Any]:
        """Register a new RFID reader"""
        try:
            reader = RFIDReader(
                name=reader_data['name'],
                location=reader_data['location'],
                ip_address=reader_data['ip_address'],
                port=reader_data.get('port', 8080),
                mac_address=reader_data.get('mac_address', ''),
                model=reader_data.get('model', ''),
                serial_number=reader_data.get('serial_number', ''),
                firmware_version=reader_data.get('firmware_version', ''),
                read_range_meters=reader_data.get('read_range_meters', 1.0),
                read_frequency_hz=reader_data.get('read_frequency_hz', 10),
                auto_reconnect=reader_data.get('auto_reconnect', True),
                encryption_enabled=reader_data.get('encryption_enabled', True),
                created_by=installer_id
            )
            
            db.session.add(reader)
            db.session.flush()
            
            # Test connection to reader
            connection_test = self._test_reader_connection(reader)
            if connection_test['success']:
                reader.status = 'online'
                reader.last_heartbeat = datetime.utcnow()
            else:
                reader.status = 'offline'
            
            db.session.commit()
            
            # Send notification
            self.notification_service.create_notification(
                user_id=installer_id,
                title=f'RFID Reader Registered: {reader.name}',
                message=f'Reader at {reader.location} has been registered. Status: {reader.status}',
                notification_type='system'
            )
            
            return {
                'success': True,
                'reader': reader.to_dict(),
                'connection_test': connection_test,
                'message': 'RFID reader registered successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _test_reader_connection(self, reader: RFIDReader) -> Dict[str, Any]:
        """Test connection to RFID reader"""
        try:
            # Attempt to connect to reader
            url = f"http://{reader.ip_address}:{reader.port}/api/status"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'status': 'online',
                    'response_time': response.elapsed.total_seconds(),
                    'message': 'Connection successful'
                }
            else:
                return {
                    'success': False,
                    'status': 'error',
                    'error': f'HTTP {response.status_code}',
                    'message': 'Reader responded with error'
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'status': 'timeout',
                'error': 'Connection timeout',
                'message': 'Reader did not respond within timeout period'
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'status': 'offline',
                'error': 'Connection refused',
                'message': 'Cannot connect to reader'
            }
        except Exception as e:
            return {
                'success': False,
                'status': 'error',
                'error': str(e),
                'message': 'Unexpected error during connection test'
            }

    def register_rfid_card(self, card_data: Dict[str, Any], issuer_id: int) -> Dict[str, Any]:
        """Register a new RFID card for a student"""
        try:
            # Check if card ID already exists
            existing_card = RFIDCard.query.filter_by(card_id=card_data['card_id']).first()
            if existing_card:
                return {'success': False, 'error': 'Card ID already exists'}
            
            # Check if student already has an active card
            existing_student_card = RFIDCard.query.filter_by(
                student_id=card_data['student_id'],
                status='active'
            ).first()
            
            if existing_student_card:
                # Deactivate old card
                existing_student_card.status = 'replaced'
                existing_student_card.replacement_reason = 'New card issued'
            
            card = RFIDCard(
                card_id=card_data['card_id'],
                student_id=card_data['student_id'],
                card_type=card_data.get('card_type', 'student'),
                technology=card_data.get('technology', '125kHz'),
                expiry_date=datetime.fromisoformat(card_data['expiry_date']) if card_data.get('expiry_date') else None,
                encrypted=card_data.get('encrypted', True),
                access_level=card_data.get('access_level', 'basic'),
                previous_card_id=existing_student_card.card_id if existing_student_card else None,
                replacement_reason=card_data.get('replacement_reason', ''),
                issued_by=issuer_id
            )
            
            db.session.add(card)
            db.session.commit()
            
            # Send notification to student
            student = User.query.get(card_data['student_id'])
            if student:
                self.notification_service.create_notification(
                    user_id=student.id,
                    title='RFID Card Issued',
                    message=f'Your new RFID card ({card.card_id}) has been issued and is ready for use.',
                    notification_type='system'
                )
            
            return {
                'success': True,
                'card': card.to_dict(),
                'message': 'RFID card registered successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def process_card_read(self, read_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process an RFID card read event"""
        try:
            # Find the card
            card = RFIDCard.query.filter_by(card_id=read_data['card_id']).first()
            if not card:
                return {
                    'success': False,
                    'error': 'Card not found',
                    'action': 'deny_access'
                }
            
            # Find the reader
            reader = RFIDReader.query.get(read_data['reader_id'])
            if not reader:
                return {
                    'success': False,
                    'error': 'Reader not found',
                    'action': 'deny_access'
                }
            
            # Validate card status
            if card.status != 'active':
                return {
                    'success': False,
                    'error': f'Card is {card.status}',
                    'action': 'deny_access'
                }
            
            # Check expiry
            if card.expiry_date and card.expiry_date < datetime.utcnow():
                card.status = 'expired'
                db.session.commit()
                return {
                    'success': False,
                    'error': 'Card expired',
                    'action': 'deny_access'
                }
            
            # Create card read record
            card_read = RFIDCardRead(
                card_id=card.id,
                reader_id=reader.id,
                read_time=datetime.fromisoformat(read_data['read_time']) if read_data.get('read_time') else datetime.utcnow(),
                signal_strength=read_data.get('signal_strength'),
                read_duration_ms=read_data.get('read_duration_ms'),
                direction=read_data.get('direction', 'unknown'),
                purpose=read_data.get('purpose', 'attendance')
            )
            
            # Validate access rules
            access_validation = self._validate_access_rules(card, reader, card_read)
            card_read.is_valid_read = access_validation['valid']
            card_read.validation_status = access_validation['status']
            
            # Detect anomalies
            anomaly_check = self._detect_card_read_anomalies(card, reader, card_read)
            card_read.is_anomaly = anomaly_check['is_anomaly']
            card_read.anomaly_reason = anomaly_check.get('reason', '')
            card_read.anomaly_score = anomaly_check.get('score', 0.0)
            
            db.session.add(card_read)
            
            # Update card usage statistics
            card.total_uses += 1
            card.uses_today += 1
            card.last_used = card_read.read_time
            card.last_location = reader.location
            
            # Update reader statistics
            reader.total_reads_today += 1
            reader.total_reads_all_time += 1
            reader.last_seen = datetime.utcnow()
            
            # Process attendance if valid
            if card_read.is_valid_read and card_read.purpose == 'attendance':
                attendance_result = self._mark_attendance(card, card_read)
                card_read.attendance_marked = attendance_result.get('success', False)
            
            card_read.processed = True
            card_read.processed_at = datetime.utcnow()
            
            db.session.commit()
            
            # Send real-time notifications via n8n
            self._send_realtime_notifications(card, reader, card_read)
            
            # Handle anomalies
            if card_read.is_anomaly:
                self._handle_anomaly(card, reader, card_read, anomaly_check)
            
            return {
                'success': True,
                'card_read': card_read.to_dict(),
                'action': 'allow_access' if card_read.is_valid_read else 'deny_access',
                'message': 'Card read processed successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _validate_access_rules(self, card: RFIDCard, reader: RFIDReader, card_read: RFIDCardRead) -> Dict[str, Any]:
        """Validate card read against access rules"""
        try:
            # Get applicable access rules
            rules = RFIDAccessRule.query.filter(
                and_(
                    RFIDAccessRule.is_active == True,
                    RFIDAccessRule.reader_ids.contains([reader.id])
                )
            ).order_by(desc(RFIDAccessRule.priority)).all()
            
            current_time = card_read.read_time.time()
            current_day = card_read.read_time.weekday()  # 0=Monday, 6=Sunday
            
            for rule in rules:
                # Check user role
                if rule.user_roles and card.student.role not in rule.user_roles:
                    continue
                
                # Check access level
                if rule.access_levels and card.access_level not in rule.access_levels:
                    continue
                
                # Check time restrictions
                if rule.start_time and rule.end_time:
                    start_time = datetime.strptime(rule.start_time, '%H:%M:%S').time()
                    end_time = datetime.strptime(rule.end_time, '%H:%M:%S').time()
                    
                    if not (start_time <= current_time <= end_time):
                        continue
                
                # Check day restrictions
                if rule.allowed_days and current_day not in rule.allowed_days:
                    continue
                
                # Check date restrictions
                if rule.start_date and card_read.read_time < rule.start_date:
                    continue
                if rule.end_date and card_read.read_time > rule.end_date:
                    continue
                
                # Rule matched - access allowed
                return {
                    'valid': True,
                    'status': 'valid',
                    'rule_id': rule.id,
                    'rule_name': rule.name
                }
            
            # No matching rule found
            return {
                'valid': False,
                'status': 'no_matching_rule',
                'message': 'No access rule allows this card at this location and time'
            }
            
        except Exception as e:
            return {
                'valid': False,
                'status': 'validation_error',
                'error': str(e)
            }

    def _detect_card_read_anomalies(self, card: RFIDCard, reader: RFIDReader, card_read: RFIDCardRead) -> Dict[str, Any]:
        """Detect anomalies in card read patterns"""
        try:
            anomalies = []
            anomaly_score = 0.0
            
            # Get recent reads for this card
            recent_reads = RFIDCardRead.query.filter(
                and_(
                    RFIDCardRead.card_id == card.id,
                    RFIDCardRead.read_time > datetime.utcnow() - timedelta(hours=24)
                )
            ).order_by(desc(RFIDCardRead.read_time)).limit(10).all()
            
            # Check for duplicate reads (same location within short time)
            if recent_reads:
                last_read = recent_reads[0]
                time_diff = (card_read.read_time - last_read.read_time).total_seconds()
                
                if (last_read.reader_id == reader.id and time_diff < 30):
                    anomalies.append("Duplicate read within 30 seconds")
                    anomaly_score += 0.3
            
            # Check for impossible travel time
            if len(recent_reads) > 0:
                last_read = recent_reads[0]
                if last_read.reader_id != reader.id:
                    time_diff = (card_read.read_time - last_read.read_time).total_seconds()
                    if time_diff < 300:  # Less than 5 minutes between different locations
                        anomalies.append("Impossible travel time between locations")
                        anomaly_score += 0.5
            
            # Check for unusual time patterns
            current_hour = card_read.read_time.hour
            if current_hour < 6 or current_hour > 22:  # Outside normal school hours
                anomalies.append("Access outside normal hours")
                anomaly_score += 0.2
            
            # Check for weekend access (if not allowed)
            if card_read.read_time.weekday() >= 5:  # Saturday or Sunday
                anomalies.append("Weekend access")
                anomaly_score += 0.2
            
            # Check frequency anomalies
            today_reads = [r for r in recent_reads if r.read_time.date() == card_read.read_time.date()]
            if len(today_reads) > 20:  # More than 20 reads in one day
                anomalies.append("Excessive daily usage")
                anomaly_score += 0.3
            
            is_anomaly = anomaly_score > 0.5 or len(anomalies) > 2
            
            return {
                'is_anomaly': is_anomaly,
                'score': min(anomaly_score, 1.0),
                'reason': '; '.join(anomalies) if anomalies else '',
                'anomalies': anomalies
            }
            
        except Exception as e:
            return {
                'is_anomaly': False,
                'score': 0.0,
                'reason': f'Anomaly detection error: {str(e)}',
                'anomalies': []
            }

    def _mark_attendance(self, card: RFIDCard, card_read: RFIDCardRead) -> Dict[str, Any]:
        """Mark attendance based on RFID card read"""
        try:
            # Check if attendance already marked today
            today = card_read.read_time.date()
            existing_attendance = Attendance.query.filter(
                and_(
                    Attendance.student_id == card.student_id,
                    func.date(Attendance.date) == today
                )
            ).first()
            
            if existing_attendance:
                # Update existing attendance with RFID data
                if not existing_attendance.check_in_time and card_read.direction == 'in':
                    existing_attendance.check_in_time = card_read.read_time
                    existing_attendance.check_in_method = 'rfid'
                    existing_attendance.status = 'present'
                elif not existing_attendance.check_out_time and card_read.direction == 'out':
                    existing_attendance.check_out_time = card_read.read_time
                    existing_attendance.check_out_method = 'rfid'
                
                db.session.commit()
                return {'success': True, 'attendance_id': existing_attendance.id, 'action': 'updated'}
            else:
                # Create new attendance record
                attendance = Attendance(
                    student_id=card.student_id,
                    date=today,
                    status='present',
                    check_in_time=card_read.read_time if card_read.direction == 'in' else None,
                    check_out_time=card_read.read_time if card_read.direction == 'out' else None,
                    check_in_method='rfid',
                    check_out_method='rfid' if card_read.direction == 'out' else None,
                    notes=f'RFID scan at {card_read.reader.location}'
                )
                
                db.session.add(attendance)
                db.session.commit()
                return {'success': True, 'attendance_id': attendance.id, 'action': 'created'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _send_realtime_notifications(self, card: RFIDCard, reader: RFIDReader, card_read: RFIDCardRead):
        """Send real-time notifications via n8n workflows"""
        try:
            # Prepare notification data
            notification_data = {
                'student_id': card.student_id,
                'student_name': card.student.full_name if card.student else 'Unknown',
                'card_id': card.card_id,
                'reader_name': reader.name,
                'reader_location': reader.location,
                'read_time': card_read.read_time.isoformat(),
                'direction': card_read.direction,
                'is_valid': card_read.is_valid_read,
                'is_anomaly': card_read.is_anomaly
            }
            
            # Parent notifications removed - feature not available
            # if card.student and hasattr(card.student, 'parent_id') and card.student.parent_id:
            #     self.n8n_service.trigger_workflow(
            #         'parent_attendance_notification',
            #         notification_data
            #     )
            
            # Send to school administration workflow
            self.n8n_service.trigger_workflow(
                'attendance_monitoring',
                notification_data
            )
            
            # Send anomaly alerts if detected
            if card_read.is_anomaly:
                self.n8n_service.trigger_workflow(
                    'security_alert',
                    {**notification_data, 'anomaly_reason': card_read.anomaly_reason}
                )
                
        except Exception as e:
            print(f"Error sending real-time notifications: {e}")

    def _handle_anomaly(self, card: RFIDCard, reader: RFIDReader, card_read: RFIDCardRead, anomaly_data: Dict[str, Any]):
        """Handle detected anomalies"""
        try:
            # Create anomaly detection record
            anomaly = AnomalyDetection(
                user_id=card.student_id,
                anomaly_type='rfid_access',
                category='temporal',
                anomalous_data={
                    'card_id': card.card_id,
                    'reader_location': reader.location,
                    'read_time': card_read.read_time.isoformat(),
                    'anomalies': anomaly_data['anomalies']
                },
                anomaly_score=anomaly_data['score'],
                severity='medium' if anomaly_data['score'] > 0.7 else 'low',
                requires_action=anomaly_data['score'] > 0.7
            )
            
            db.session.add(anomaly)
            
            # Send alert to security team
            self.notification_service.create_notification(
                user_id=1,  # Security admin user
                title=f'RFID Anomaly Detected: {card.student.full_name if card.student else "Unknown"}',
                message=f'Anomalous RFID activity detected at {reader.location}. Reason: {anomaly_data["reason"]}',
                notification_type='security_alert'
            )
            
            db.session.commit()
            
        except Exception as e:
            print(f"Error handling anomaly: {e}")

    def get_reader_status(self, reader_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get status of RFID readers"""
        query = RFIDReader.query
        if reader_id:
            query = query.filter_by(id=reader_id)
        
        readers = query.all()
        reader_status = []
        
        for reader in readers:
            status_dict = reader.to_dict()
            
            # Test current connection
            connection_test = self._test_reader_connection(reader)
            status_dict['current_status'] = connection_test['status']
            status_dict['last_test'] = datetime.utcnow().isoformat()
            
            # Get today's statistics
            today_reads = RFIDCardRead.query.filter(
                and_(
                    RFIDCardRead.reader_id == reader.id,
                    func.date(RFIDCardRead.read_time) == datetime.utcnow().date()
                )
            ).count()
            
            unique_cards_today = db.session.query(RFIDCardRead.card_id).filter(
                and_(
                    RFIDCardRead.reader_id == reader.id,
                    func.date(RFIDCardRead.read_time) == datetime.utcnow().date()
                )
            ).distinct().count()
            
            status_dict['reads_today'] = today_reads
            status_dict['unique_cards_today'] = unique_cards_today
            
            reader_status.append(status_dict)
        
        return reader_status

    def get_card_usage_analytics(self, card_id: Optional[str] = None, student_id: Optional[int] = None, 
                                days: int = 30) -> Dict[str, Any]:
        """Get RFID card usage analytics"""
        try:
            # Build query
            query = RFIDCardRead.query.filter(
                RFIDCardRead.read_time > datetime.utcnow() - timedelta(days=days)
            )
            
            if card_id:
                card = RFIDCard.query.filter_by(card_id=card_id).first()
                if card:
                    query = query.filter_by(card_id=card.id)
            elif student_id:
                cards = RFIDCard.query.filter_by(student_id=student_id).all()
                card_ids = [c.id for c in cards]
                query = query.filter(RFIDCardRead.card_id.in_(card_ids))
            
            reads = query.order_by(RFIDCardRead.read_time).all()
            
            # Analyze usage patterns
            analytics = {
                'total_reads': len(reads),
                'unique_locations': len(set(r.reader.location for r in reads if r.reader)),
                'daily_usage': {},
                'hourly_pattern': [0] * 24,
                'location_usage': {},
                'anomaly_count': sum(1 for r in reads if r.is_anomaly),
                'attendance_marked': sum(1 for r in reads if r.attendance_marked)
            }
            
            # Daily usage breakdown
            for read in reads:
                date_str = read.read_time.date().isoformat()
                if date_str not in analytics['daily_usage']:
                    analytics['daily_usage'][date_str] = 0
                analytics['daily_usage'][date_str] += 1
                
                # Hourly pattern
                hour = read.read_time.hour
                analytics['hourly_pattern'][hour] += 1
                
                # Location usage
                location = read.reader.location if read.reader else 'Unknown'
                if location not in analytics['location_usage']:
                    analytics['location_usage'][location] = 0
                analytics['location_usage'][location] += 1
            
            return {
                'success': True,
                'analytics': analytics,
                'period_days': days
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def bulk_register_cards(self, cards_data: List[Dict[str, Any]], issuer_id: int) -> Dict[str, Any]:
        """Bulk register RFID cards from CSV data"""
        try:
            results = {
                'success_count': 0,
                'error_count': 0,
                'errors': [],
                'created_cards': []
            }
            
            for i, card_data in enumerate(cards_data):
                try:
                    result = self.register_rfid_card(card_data, issuer_id)
                    if result['success']:
                        results['success_count'] += 1
                        results['created_cards'].append(result['card'])
                    else:
                        results['error_count'] += 1
                        results['errors'].append({
                            'row': i + 1,
                            'error': result['error'],
                            'card_data': card_data
                        })
                except Exception as e:
                    results['error_count'] += 1
                    results['errors'].append({
                        'row': i + 1,
                        'error': str(e),
                        'card_data': card_data
                    })
            
            return {
                'success': True,
                'results': results,
                'message': f'Processed {len(cards_data)} cards. {results["success_count"]} successful, {results["error_count"]} errors.'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def deactivate_card(self, card_id: str, reason: str, deactivated_by: int) -> Dict[str, Any]:
        """Deactivate an RFID card"""
        try:
            card = RFIDCard.query.filter_by(card_id=card_id).first()
            if not card:
                return {'success': False, 'error': 'Card not found'}
            
            card.status = 'inactive'
            card.replacement_reason = reason
            card.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Send notification to student
            if card.student:
                self.notification_service.create_notification(
                    user_id=card.student.id,
                    title='RFID Card Deactivated',
                    message=f'Your RFID card has been deactivated. Reason: {reason}. Please contact administration.',
                    notification_type='system'
                )
            
            return {
                'success': True,
                'card': card.to_dict(),
                'message': 'Card deactivated successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
