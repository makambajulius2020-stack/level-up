from datetime import datetime
from app import db
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

class FraudDetectionRule(db.Model):
    __tablename__ = 'fraud_detection_rules'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Rule Configuration
    rule_type = Column(String(50), nullable=False)  # onboarding, login, attendance, payment, academic
    detection_method = Column(String(50), nullable=False)  # pattern, threshold, ml, statistical
    
    # Rule Parameters
    parameters = Column(JSON, nullable=False)  # Rule-specific parameters
    thresholds = Column(JSON)  # Threshold values for detection
    
    # Scoring
    risk_score_weight = Column(Float, default=1.0)  # Weight in overall risk calculation
    severity_level = Column(String(20), default='medium')  # low, medium, high, critical
    
    # Actions
    auto_flag = Column(Boolean, default=True)
    auto_block = Column(Boolean, default=False)
    require_manual_review = Column(Boolean, default=True)
    notification_enabled = Column(Boolean, default=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('user.id'))
    
    # Relationships
    creator = relationship('User', backref='created_fraud_rules')
    detections = relationship('FraudDetection', backref='rule', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'rule_type': self.rule_type,
            'detection_method': self.detection_method,
            'parameters': self.parameters,
            'thresholds': self.thresholds,
            'risk_score_weight': self.risk_score_weight,
            'severity_level': self.severity_level,
            'auto_flag': self.auto_flag,
            'auto_block': self.auto_block,
            'require_manual_review': self.require_manual_review,
            'notification_enabled': self.notification_enabled,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class FraudDetection(db.Model):
    __tablename__ = 'fraud_detections'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    rule_id = Column(Integer, ForeignKey('fraud_detection_rules.id'), nullable=False)
    
    # Detection Details
    detection_type = Column(String(50), nullable=False)
    event_data = Column(JSON, nullable=False)  # Data that triggered the detection
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    confidence_level = Column(Float, nullable=False)  # 0.0 to 1.0
    
    # Context Information
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_fingerprint = Column(String(255))
    location_data = Column(JSON)  # Geolocation information
    session_id = Column(String(255))
    
    # Detection Results
    anomaly_indicators = Column(JSON)  # List of specific anomalies detected
    pattern_matches = Column(JSON)  # Patterns that matched
    statistical_deviations = Column(JSON)  # Statistical anomalies
    
    # Status and Actions
    status = Column(String(20), default='pending')  # pending, investigating, resolved, false_positive
    auto_flagged = Column(Boolean, default=False)
    auto_blocked = Column(Boolean, default=False)
    manual_review_required = Column(Boolean, default=True)
    
    # Investigation
    investigated_by = Column(Integer, ForeignKey('user.id'))
    investigated_at = Column(DateTime)
    investigation_notes = Column(Text)
    resolution = Column(String(50))  # confirmed_fraud, false_positive, inconclusive
    
    # Actions Taken
    actions_taken = Column(JSON)  # List of actions taken
    account_locked = Column(Boolean, default=False)
    notifications_sent = Column(JSON)  # List of notifications sent
    
    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', foreign_keys=[user_id], backref='fraud_detections')
    investigator = relationship('User', foreign_keys=[investigated_by], backref='investigated_frauds')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'rule_id': self.rule_id,
            'rule_name': self.rule.name if self.rule else None,
            'detection_type': self.detection_type,
            'event_data': self.event_data,
            'risk_score': self.risk_score,
            'confidence_level': self.confidence_level,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'device_fingerprint': self.device_fingerprint,
            'location_data': self.location_data,
            'session_id': self.session_id,
            'anomaly_indicators': self.anomaly_indicators,
            'pattern_matches': self.pattern_matches,
            'statistical_deviations': self.statistical_deviations,
            'status': self.status,
            'auto_flagged': self.auto_flagged,
            'auto_blocked': self.auto_blocked,
            'manual_review_required': self.manual_review_required,
            'investigated_by': self.investigated_by,
            'investigator_name': self.investigator.full_name if self.investigator else None,
            'investigated_at': self.investigated_at.isoformat() if self.investigated_at else None,
            'investigation_notes': self.investigation_notes,
            'resolution': self.resolution,
            'actions_taken': self.actions_taken,
            'account_locked': self.account_locked,
            'notifications_sent': self.notifications_sent,
            'detected_at': self.detected_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AnomalyDetection(db.Model):
    __tablename__ = 'anomaly_detections'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    
    # Anomaly Classification
    anomaly_type = Column(String(50), nullable=False)  # attendance, login, academic, behavioral
    category = Column(String(50), nullable=False)  # pattern, statistical, temporal, spatial
    
    # Detection Data
    baseline_data = Column(JSON)  # Normal behavior baseline
    anomalous_data = Column(JSON)  # Anomalous behavior data
    deviation_score = Column(Float, nullable=False)  # How much it deviates from normal
    anomaly_score = Column(Float, nullable=False)  # Overall anomaly score (0-1)
    
    # Context
    detection_period = Column(String(50))  # daily, weekly, monthly
    time_window = Column(JSON)  # Start and end time of anomalous period
    related_events = Column(JSON)  # Other events that might be related
    
    # Statistical Analysis
    z_score = Column(Float)  # Statistical z-score
    percentile = Column(Float)  # Percentile of the anomaly
    confidence_interval = Column(JSON)  # Statistical confidence interval
    
    # Machine Learning
    ml_model_used = Column(String(100))
    feature_importance = Column(JSON)  # Which features contributed most
    clustering_info = Column(JSON)  # Clustering analysis results
    
    # Impact Assessment
    severity = Column(String(20), default='medium')  # low, medium, high, critical
    impact_areas = Column(JSON)  # Areas affected by the anomaly
    potential_causes = Column(JSON)  # Potential causes identified
    
    # Status and Actions
    status = Column(String(20), default='detected')  # detected, investigating, resolved, ignored
    requires_action = Column(Boolean, default=True)
    auto_resolved = Column(Boolean, default=False)
    
    # Investigation
    investigated_by = Column(Integer, ForeignKey('user.id'))
    investigated_at = Column(DateTime)
    investigation_notes = Column(Text)
    root_cause = Column(String(200))
    
    # Resolution
    resolved_at = Column(DateTime)
    resolution_method = Column(String(100))
    preventive_measures = Column(JSON)
    
    # Metadata
    detected_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', foreign_keys=[user_id], backref='anomaly_detections')
    investigator = relationship('User', foreign_keys=[investigated_by], backref='investigated_anomalies')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'anomaly_type': self.anomaly_type,
            'category': self.category,
            'baseline_data': self.baseline_data,
            'anomalous_data': self.anomalous_data,
            'deviation_score': self.deviation_score,
            'anomaly_score': self.anomaly_score,
            'detection_period': self.detection_period,
            'time_window': self.time_window,
            'related_events': self.related_events,
            'z_score': self.z_score,
            'percentile': self.percentile,
            'confidence_interval': self.confidence_interval,
            'ml_model_used': self.ml_model_used,
            'feature_importance': self.feature_importance,
            'clustering_info': self.clustering_info,
            'severity': self.severity,
            'impact_areas': self.impact_areas,
            'potential_causes': self.potential_causes,
            'status': self.status,
            'requires_action': self.requires_action,
            'auto_resolved': self.auto_resolved,
            'investigated_by': self.investigated_by,
            'investigator_name': self.investigator.full_name if self.investigator else None,
            'investigated_at': self.investigated_at.isoformat() if self.investigated_at else None,
            'investigation_notes': self.investigation_notes,
            'root_cause': self.root_cause,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolution_method': self.resolution_method,
            'preventive_measures': self.preventive_measures,
            'detected_at': self.detected_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserBehaviorProfile(db.Model):
    __tablename__ = 'user_behavior_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False, unique=True)
    
    # Login Patterns
    typical_login_times = Column(JSON)  # Typical login time patterns
    typical_login_locations = Column(JSON)  # Typical login locations
    typical_devices = Column(JSON)  # Typical devices used
    login_frequency_pattern = Column(JSON)  # Login frequency patterns
    
    # Attendance Patterns
    typical_arrival_time = Column(String(8))  # HH:MM:SS format
    arrival_time_variance = Column(Float)  # Standard deviation in minutes
    typical_departure_time = Column(String(8))
    departure_time_variance = Column(Float)
    attendance_consistency_score = Column(Float)  # 0-1, higher = more consistent
    
    # Academic Patterns
    typical_submission_times = Column(JSON)  # When they usually submit assignments
    study_session_patterns = Column(JSON)  # Study session timing and duration
    performance_trends = Column(JSON)  # Academic performance trends
    engagement_patterns = Column(JSON)  # Platform engagement patterns
    
    # Communication Patterns
    messaging_frequency = Column(JSON)  # How often they send messages
    response_time_patterns = Column(JSON)  # How quickly they respond
    communication_style = Column(JSON)  # Communication style analysis
    
    # Behavioral Metrics
    risk_tolerance = Column(Float, default=0.5)  # 0-1, tolerance for flagging anomalies
    baseline_established = Column(Boolean, default=False)
    profile_confidence = Column(Float, default=0.0)  # 0-1, confidence in profile accuracy
    
    # Adaptation
    learning_rate = Column(Float, default=0.1)  # How quickly profile adapts to changes
    last_pattern_update = Column(DateTime)
    pattern_stability_score = Column(Float, default=0.5)  # How stable the patterns are
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship('User', backref='behavior_profile')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'typical_login_times': self.typical_login_times,
            'typical_login_locations': self.typical_login_locations,
            'typical_devices': self.typical_devices,
            'login_frequency_pattern': self.login_frequency_pattern,
            'typical_arrival_time': self.typical_arrival_time,
            'arrival_time_variance': self.arrival_time_variance,
            'typical_departure_time': self.typical_departure_time,
            'departure_time_variance': self.departure_time_variance,
            'attendance_consistency_score': self.attendance_consistency_score,
            'typical_submission_times': self.typical_submission_times,
            'study_session_patterns': self.study_session_patterns,
            'performance_trends': self.performance_trends,
            'engagement_patterns': self.engagement_patterns,
            'messaging_frequency': self.messaging_frequency,
            'response_time_patterns': self.response_time_patterns,
            'communication_style': self.communication_style,
            'risk_tolerance': self.risk_tolerance,
            'baseline_established': self.baseline_established,
            'profile_confidence': self.profile_confidence,
            'learning_rate': self.learning_rate,
            'last_pattern_update': self.last_pattern_update.isoformat() if self.last_pattern_update else None,
            'pattern_stability_score': self.pattern_stability_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
