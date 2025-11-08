import json
import hashlib
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import (
    FraudDetectionRule, FraudDetection, AnomalyDetection, UserBehaviorProfile,
    User, Attendance, Grade, Assignment, AssignmentSubmission
)
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.notification_service import NotificationService

class FraudDetectionService:
    def __init__(self):
        self.ai_service = AIAnalyticsService()
        self.notification_service = NotificationService()

    def create_fraud_rule(self, rule_data: Dict[str, Any], creator_id: int) -> Dict[str, Any]:
        """Create a new fraud detection rule"""
        try:
            rule = FraudDetectionRule(
                name=rule_data['name'],
                description=rule_data.get('description', ''),
                rule_type=rule_data['rule_type'],
                detection_method=rule_data['detection_method'],
                parameters=rule_data['parameters'],
                thresholds=rule_data.get('thresholds', {}),
                risk_score_weight=rule_data.get('risk_score_weight', 1.0),
                severity_level=rule_data.get('severity_level', 'medium'),
                auto_flag=rule_data.get('auto_flag', True),
                auto_block=rule_data.get('auto_block', False),
                require_manual_review=rule_data.get('require_manual_review', True),
                notification_enabled=rule_data.get('notification_enabled', True),
                created_by=creator_id
            )
            
            db.session.add(rule)
            db.session.commit()
            
            return {
                'success': True,
                'rule': rule.to_dict(),
                'message': 'Fraud detection rule created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def check_onboarding_fraud(self, user_data: Dict[str, Any], request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for fraud during user onboarding"""
        try:
            fraud_indicators = []
            risk_score = 0.0
            
            # Check for duplicate information
            duplicate_checks = self._check_duplicate_information(user_data)
            if duplicate_checks['duplicates_found']:
                fraud_indicators.extend(duplicate_checks['indicators'])
                risk_score += 0.3
            
            # Check device fingerprint
            device_check = self._analyze_device_fingerprint(request_data)
            if device_check['suspicious']:
                fraud_indicators.extend(device_check['indicators'])
                risk_score += device_check['risk_score']
            
            # Check IP reputation
            ip_check = self._check_ip_reputation(request_data.get('ip_address', ''))
            if ip_check['suspicious']:
                fraud_indicators.extend(ip_check['indicators'])
                risk_score += ip_check['risk_score']
            
            # Check document authenticity (if photos provided)
            if user_data.get('id_document_path'):
                doc_check = self._verify_document_authenticity(user_data['id_document_path'])
                if doc_check['suspicious']:
                    fraud_indicators.extend(doc_check['indicators'])
                    risk_score += doc_check['risk_score']
            
            # Check behavioral patterns
            behavior_check = self._analyze_onboarding_behavior(request_data)
            if behavior_check['suspicious']:
                fraud_indicators.extend(behavior_check['indicators'])
                risk_score += behavior_check['risk_score']
            
            # Determine action based on risk score
            action = 'approve'
            if risk_score > 0.8:
                action = 'block'
            elif risk_score > 0.5:
                action = 'manual_review'
            elif risk_score > 0.3:
                action = 'flag'
            
            # Create fraud detection record if suspicious
            if risk_score > 0.3:
                fraud_detection = FraudDetection(
                    user_id=user_data.get('user_id'),
                    rule_id=None,  # Multiple rules applied
                    detection_type='onboarding',
                    event_data=user_data,
                    risk_score=risk_score,
                    confidence_level=min(risk_score * 1.2, 1.0),
                    ip_address=request_data.get('ip_address'),
                    user_agent=request_data.get('user_agent'),
                    device_fingerprint=request_data.get('device_fingerprint'),
                    anomaly_indicators=fraud_indicators,
                    auto_flagged=True,
                    auto_blocked=(action == 'block'),
                    manual_review_required=(action in ['manual_review', 'block'])
                )
                
                db.session.add(fraud_detection)
                db.session.commit()
                
                # Send notifications
                if fraud_detection.manual_review_required:
                    self._send_fraud_alert(fraud_detection)
            
            return {
                'success': True,
                'risk_score': risk_score,
                'action': action,
                'fraud_indicators': fraud_indicators,
                'requires_review': (action in ['manual_review', 'block']),
                'message': f'Onboarding fraud check completed. Action: {action}'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _check_duplicate_information(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for duplicate user information"""
        duplicates_found = False
        indicators = []
        
        try:
            # Check for duplicate email
            if user_data.get('email'):
                existing_email = User.query.filter_by(email=user_data['email']).first()
                if existing_email:
                    duplicates_found = True
                    indicators.append(f"Email already registered: {user_data['email']}")
            
            # Check for duplicate phone number
            if user_data.get('phone'):
                existing_phone = User.query.filter_by(phone=user_data['phone']).first()
                if existing_phone:
                    duplicates_found = True
                    indicators.append(f"Phone number already registered: {user_data['phone']}")
            
            # Check for duplicate national ID
            if user_data.get('national_id'):
                existing_id = User.query.filter_by(national_id=user_data['national_id']).first()
                if existing_id:
                    duplicates_found = True
                    indicators.append(f"National ID already registered: {user_data['national_id']}")
            
            # Check for similar names (fuzzy matching)
            if user_data.get('full_name'):
                similar_names = self._find_similar_names(user_data['full_name'])
                if similar_names:
                    indicators.extend([f"Similar name found: {name}" for name in similar_names])
            
            return {
                'duplicates_found': duplicates_found,
                'indicators': indicators
            }
            
        except Exception as e:
            return {
                'duplicates_found': False,
                'indicators': [f"Error checking duplicates: {str(e)}"]
            }

    def _find_similar_names(self, name: str) -> List[str]:
        """Find similar names using fuzzy matching"""
        try:
            # Simple similarity check (in production, use proper fuzzy matching library)
            name_words = set(name.lower().split())
            similar_names = []
            
            users = User.query.all()
            for user in users:
                if user.full_name:
                    user_words = set(user.full_name.lower().split())
                    # Check if names share significant words
                    common_words = name_words.intersection(user_words)
                    if len(common_words) >= 2 and len(common_words) / len(name_words) > 0.6:
                        similar_names.append(user.full_name)
            
            return similar_names[:5]  # Return top 5 similar names
            
        except Exception:
            return []

    def _analyze_device_fingerprint(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze device fingerprint for suspicious patterns"""
        try:
            suspicious = False
            indicators = []
            risk_score = 0.0
            
            device_fingerprint = request_data.get('device_fingerprint', '')
            user_agent = request_data.get('user_agent', '')
            
            # Check for common fraud indicators
            if 'headless' in user_agent.lower():
                suspicious = True
                indicators.append("Headless browser detected")
                risk_score += 0.4
            
            if 'bot' in user_agent.lower() or 'crawler' in user_agent.lower():
                suspicious = True
                indicators.append("Bot or crawler detected")
                risk_score += 0.5
            
            # Check for suspicious browser configurations
            if device_fingerprint:
                fingerprint_hash = hashlib.md5(device_fingerprint.encode()).hexdigest()
                
                # Check if this fingerprint has been used by multiple accounts
                recent_users = db.session.query(FraudDetection.user_id).filter(
                    and_(
                        FraudDetection.device_fingerprint == device_fingerprint,
                        FraudDetection.detected_at > datetime.utcnow() - timedelta(days=30)
                    )
                ).distinct().count()
                
                if recent_users > 3:
                    suspicious = True
                    indicators.append(f"Device used by {recent_users} different accounts recently")
                    risk_score += 0.3
            
            return {
                'suspicious': suspicious,
                'indicators': indicators,
                'risk_score': risk_score
            }
            
        except Exception as e:
            return {
                'suspicious': False,
                'indicators': [f"Device analysis error: {str(e)}"],
                'risk_score': 0.0
            }

    def _check_ip_reputation(self, ip_address: str) -> Dict[str, Any]:
        """Check IP address reputation"""
        try:
            suspicious = False
            indicators = []
            risk_score = 0.0
            
            if not ip_address:
                return {'suspicious': False, 'indicators': [], 'risk_score': 0.0}
            
            # Check if IP is from known VPN/proxy services (simplified check)
            vpn_indicators = ['vpn', 'proxy', 'tor', 'anonymous']
            
            # In production, use proper IP reputation services
            # For now, do basic checks
            
            # Check for private/local IPs being suspicious in production
            if ip_address.startswith(('127.', '192.168.', '10.', '172.')):
                if not self._is_development_environment():
                    suspicious = True
                    indicators.append("Private IP address in production environment")
                    risk_score += 0.2
            
            # Check recent activity from this IP
            recent_activity = FraudDetection.query.filter(
                and_(
                    FraudDetection.ip_address == ip_address,
                    FraudDetection.detected_at > datetime.utcnow() - timedelta(hours=24)
                )
            ).count()
            
            if recent_activity > 5:
                suspicious = True
                indicators.append(f"High fraud activity from IP: {recent_activity} incidents in 24h")
                risk_score += 0.4
            
            return {
                'suspicious': suspicious,
                'indicators': indicators,
                'risk_score': risk_score
            }
            
        except Exception as e:
            return {
                'suspicious': False,
                'indicators': [f"IP reputation check error: {str(e)}"],
                'risk_score': 0.0
            }

    def _is_development_environment(self) -> bool:
        """Check if running in development environment"""
        # Simple check - in production, use proper environment detection
        import os
        return os.environ.get('FLASK_ENV') == 'development'

    def _verify_document_authenticity(self, document_path: str) -> Dict[str, Any]:
        """Verify document authenticity using AI"""
        try:
            suspicious = False
            indicators = []
            risk_score = 0.0
            
            # Use AI service to analyze document
            prompt = f"""
            Analyze this identity document for signs of tampering or forgery:
            Document path: {document_path}
            
            Check for:
            1. Image quality inconsistencies
            2. Font irregularities
            3. Alignment issues
            4. Digital manipulation signs
            5. Standard format compliance
            
            Return JSON with:
            {{
                "authentic": true/false,
                "confidence": 0.0-1.0,
                "issues": ["list of issues found"],
                "risk_score": 0.0-1.0
            }}
            """
            
            response = self.ai_service.analyze_image(document_path, prompt)
            
            if response and response.get('success'):
                try:
                    analysis = json.loads(response['content'])
                    if not analysis.get('authentic', True):
                        suspicious = True
                        indicators.extend(analysis.get('issues', []))
                        risk_score = analysis.get('risk_score', 0.5)
                except json.JSONDecodeError:
                    # Fallback to basic checks
                    risk_score = 0.1
                    indicators.append("Document analysis inconclusive")
            
            return {
                'suspicious': suspicious,
                'indicators': indicators,
                'risk_score': risk_score
            }
            
        except Exception as e:
            return {
                'suspicious': False,
                'indicators': [f"Document verification error: {str(e)}"],
                'risk_score': 0.0
            }

    def _analyze_onboarding_behavior(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze behavioral patterns during onboarding"""
        try:
            suspicious = False
            indicators = []
            risk_score = 0.0
            
            # Check form completion speed
            form_start_time = request_data.get('form_start_time')
            form_submit_time = request_data.get('form_submit_time')
            
            if form_start_time and form_submit_time:
                start_time = datetime.fromisoformat(form_start_time)
                submit_time = datetime.fromisoformat(form_submit_time)
                completion_time = (submit_time - start_time).total_seconds()
                
                # Too fast (likely bot)
                if completion_time < 30:
                    suspicious = True
                    indicators.append(f"Form completed too quickly: {completion_time}s")
                    risk_score += 0.4
                
                # Too slow (possible fraud preparation)
                elif completion_time > 3600:  # 1 hour
                    indicators.append(f"Unusually long completion time: {completion_time/60:.1f} minutes")
                    risk_score += 0.1
            
            # Check for copy-paste patterns
            paste_events = request_data.get('paste_events', 0)
            if paste_events > 5:
                suspicious = True
                indicators.append(f"Excessive copy-paste activity: {paste_events} events")
                risk_score += 0.2
            
            # Check mouse/keyboard patterns
            mouse_movements = request_data.get('mouse_movements', 0)
            if mouse_movements < 10:
                suspicious = True
                indicators.append("Minimal mouse interaction (possible automation)")
                risk_score += 0.3
            
            return {
                'suspicious': suspicious,
                'indicators': indicators,
                'risk_score': risk_score
            }
            
        except Exception as e:
            return {
                'suspicious': False,
                'indicators': [f"Behavior analysis error: {str(e)}"],
                'risk_score': 0.0
            }

    def detect_login_anomalies(self, user_id: int, login_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in login patterns"""
        try:
            # Get or create user behavior profile
            profile = UserBehaviorProfile.query.filter_by(user_id=user_id).first()
            if not profile:
                profile = UserBehaviorProfile(user_id=user_id)
                db.session.add(profile)
                db.session.flush()
            
            anomalies = []
            anomaly_score = 0.0
            
            current_time = datetime.fromisoformat(login_data['login_time'])
            current_location = login_data.get('location', {})
            current_device = login_data.get('device_info', {})
            
            # Check time-based anomalies
            if profile.typical_login_times:
                time_anomaly = self._check_time_anomaly(current_time, profile.typical_login_times)
                if time_anomaly['is_anomaly']:
                    anomalies.append(time_anomaly['description'])
                    anomaly_score += 0.3
            
            # Check location-based anomalies
            if profile.typical_login_locations and current_location:
                location_anomaly = self._check_location_anomaly(current_location, profile.typical_login_locations)
                if location_anomaly['is_anomaly']:
                    anomalies.append(location_anomaly['description'])
                    anomaly_score += location_anomaly['score']
            
            # Check device anomalies
            if profile.typical_devices and current_device:
                device_anomaly = self._check_device_anomaly(current_device, profile.typical_devices)
                if device_anomaly['is_anomaly']:
                    anomalies.append(device_anomaly['description'])
                    anomaly_score += 0.4
            
            # Update behavior profile
            self._update_behavior_profile(profile, login_data)
            
            # Create anomaly detection record if significant
            if anomaly_score > 0.5:
                anomaly_detection = AnomalyDetection(
                    user_id=user_id,
                    anomaly_type='login',
                    category='behavioral',
                    baseline_data=profile.to_dict(),
                    anomalous_data=login_data,
                    anomaly_score=anomaly_score,
                    severity='high' if anomaly_score > 0.8 else 'medium',
                    requires_action=anomaly_score > 0.7
                )
                
                db.session.add(anomaly_detection)
                
                # Send alert if high risk
                if anomaly_score > 0.7:
                    self._send_anomaly_alert(anomaly_detection)
            
            db.session.commit()
            
            return {
                'success': True,
                'anomaly_detected': anomaly_score > 0.5,
                'anomaly_score': anomaly_score,
                'anomalies': anomalies,
                'action_required': anomaly_score > 0.7,
                'recommended_action': 'verify_identity' if anomaly_score > 0.7 else 'monitor'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _check_time_anomaly(self, current_time: datetime, typical_times: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check for time-based login anomalies"""
        try:
            current_hour = current_time.hour
            current_day = current_time.weekday()
            
            # Check if current time is within typical patterns
            for time_pattern in typical_times:
                if (time_pattern.get('day') == current_day and 
                    abs(time_pattern.get('hour', 12) - current_hour) <= 2):
                    return {'is_anomaly': False}
            
            # Check if it's an unusual time (very early or very late)
            if current_hour < 6 or current_hour > 22:
                return {
                    'is_anomaly': True,
                    'description': f"Login at unusual hour: {current_hour}:00"
                }
            
            return {
                'is_anomaly': True,
                'description': f"Login time differs from typical pattern"
            }
            
        except Exception:
            return {'is_anomaly': False}

    def _check_location_anomaly(self, current_location: Dict[str, Any], typical_locations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check for location-based anomalies"""
        try:
            current_country = current_location.get('country', '')
            current_city = current_location.get('city', '')
            
            # Check if location is in typical patterns
            for location in typical_locations:
                if (location.get('country') == current_country and 
                    location.get('city') == current_city):
                    return {'is_anomaly': False}
            
            # Check for impossible travel
            if typical_locations:
                last_location = typical_locations[-1]
                if last_location.get('country') != current_country:
                    return {
                        'is_anomaly': True,
                        'description': f"Login from new country: {current_country}",
                        'score': 0.6
                    }
                elif last_location.get('city') != current_city:
                    return {
                        'is_anomaly': True,
                        'description': f"Login from new city: {current_city}",
                        'score': 0.3
                    }
            
            return {'is_anomaly': False, 'score': 0.0}
            
        except Exception:
            return {'is_anomaly': False, 'score': 0.0}

    def _check_device_anomaly(self, current_device: Dict[str, Any], typical_devices: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check for device-based anomalies"""
        try:
            current_os = current_device.get('os', '')
            current_browser = current_device.get('browser', '')
            
            # Check if device is in typical patterns
            for device in typical_devices:
                if (device.get('os') == current_os and 
                    device.get('browser') == current_browser):
                    return {'is_anomaly': False}
            
            return {
                'is_anomaly': True,
                'description': f"Login from new device: {current_os} / {current_browser}"
            }
            
        except Exception:
            return {'is_anomaly': False}

    def _update_behavior_profile(self, profile: UserBehaviorProfile, login_data: Dict[str, Any]):
        """Update user behavior profile with new login data"""
        try:
            login_time = datetime.fromisoformat(login_data['login_time'])
            
            # Update login times
            if not profile.typical_login_times:
                profile.typical_login_times = []
            
            time_entry = {
                'hour': login_time.hour,
                'day': login_time.weekday(),
                'timestamp': login_time.isoformat()
            }
            profile.typical_login_times.append(time_entry)
            
            # Keep only recent entries (last 30 logins)
            profile.typical_login_times = profile.typical_login_times[-30:]
            
            # Update locations
            if login_data.get('location'):
                if not profile.typical_login_locations:
                    profile.typical_login_locations = []
                profile.typical_login_locations.append(login_data['location'])
                profile.typical_login_locations = profile.typical_login_locations[-10:]
            
            # Update devices
            if login_data.get('device_info'):
                if not profile.typical_devices:
                    profile.typical_devices = []
                profile.typical_devices.append(login_data['device_info'])
                profile.typical_devices = profile.typical_devices[-5:]
            
            profile.last_pattern_update = datetime.utcnow()
            profile.updated_at = datetime.utcnow()
            
        except Exception as e:
            print(f"Error updating behavior profile: {e}")

    def _send_fraud_alert(self, fraud_detection: FraudDetection):
        """Send fraud alert notifications"""
        try:
            # Send to security team
            self.notification_service.create_notification(
                user_id=1,  # Security admin
                title=f'Fraud Detection Alert: {fraud_detection.detection_type}',
                message=f'High-risk fraud detected. Score: {fraud_detection.risk_score:.2f}. Manual review required.',
                notification_type='security_alert'
            )
            
            # Send to user if account exists
            if fraud_detection.user_id:
                self.notification_service.create_notification(
                    user_id=fraud_detection.user_id,
                    title='Security Alert',
                    message='Unusual activity detected on your account. Please verify your identity.',
                    notification_type='security_alert'
                )
                
        except Exception as e:
            print(f"Error sending fraud alert: {e}")

    def _send_anomaly_alert(self, anomaly_detection: AnomalyDetection):
        """Send anomaly alert notifications"""
        try:
            user = User.query.get(anomaly_detection.user_id)
            user_name = user.full_name if user else 'Unknown User'
            
            self.notification_service.create_notification(
                user_id=1,  # Security admin
                title=f'Anomaly Detected: {user_name}',
                message=f'{anomaly_detection.anomaly_type} anomaly detected. Score: {anomaly_detection.anomaly_score:.2f}',
                notification_type='security_alert'
            )
            
        except Exception as e:
            print(f"Error sending anomaly alert: {e}")

    def get_fraud_dashboard(self) -> Dict[str, Any]:
        """Get fraud detection dashboard data"""
        try:
            # Get recent fraud detections
            recent_frauds = FraudDetection.query.filter(
                FraudDetection.detected_at > datetime.utcnow() - timedelta(days=30)
            ).order_by(desc(FraudDetection.detected_at)).limit(50).all()
            
            # Get recent anomalies
            recent_anomalies = AnomalyDetection.query.filter(
                AnomalyDetection.detected_at > datetime.utcnow() - timedelta(days=30)
            ).order_by(desc(AnomalyDetection.detected_at)).limit(50).all()
            
            # Calculate statistics
            total_frauds = len(recent_frauds)
            high_risk_frauds = sum(1 for f in recent_frauds if f.risk_score > 0.7)
            pending_reviews = sum(1 for f in recent_frauds if f.status == 'pending')
            
            fraud_by_type = {}
            for fraud in recent_frauds:
                fraud_type = fraud.detection_type
                fraud_by_type[fraud_type] = fraud_by_type.get(fraud_type, 0) + 1
            
            return {
                'success': True,
                'dashboard': {
                    'total_frauds_30d': total_frauds,
                    'high_risk_frauds': high_risk_frauds,
                    'pending_reviews': pending_reviews,
                    'fraud_by_type': fraud_by_type,
                    'recent_frauds': [f.to_dict() for f in recent_frauds[:10]],
                    'recent_anomalies': [a.to_dict() for a in recent_anomalies[:10]],
                    'fraud_trend': self._calculate_fraud_trend()
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _calculate_fraud_trend(self) -> List[Dict[str, Any]]:
        """Calculate fraud detection trend over time"""
        try:
            trend_data = []
            for i in range(7):  # Last 7 days
                date = datetime.utcnow().date() - timedelta(days=i)
                fraud_count = FraudDetection.query.filter(
                    func.date(FraudDetection.detected_at) == date
                ).count()
                
                trend_data.append({
                    'date': date.isoformat(),
                    'fraud_count': fraud_count
                })
            
            return list(reversed(trend_data))
            
        except Exception:
            return []
