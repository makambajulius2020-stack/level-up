"""
Proctoring System API
Features: Real-time monitoring, camera/mic access, student flagging, live dashboard, alerts, messaging
"""

from flask import Blueprint, jsonify, request
from database import db
from datetime import datetime
import json

proctoring_bp = Blueprint('proctoring', __name__, url_prefix='/api/proctoring')

# ============================================
# EXAM SESSION MANAGEMENT
# ============================================

@proctoring_bp.route('/sessions', methods=['GET'])
def get_exam_sessions():
    """Get all exam sessions with filters"""
    status = request.args.get('status')
    teacher_id = request.args.get('teacher_id')
    class_level = request.args.get('class_level')
    
    query = """
    SELECT es.*, u.first_name, u.last_name,
           COUNT(DISTINCT ses.id) as enrolled_students,
           COUNT(DISTINCT CASE WHEN ses.status = 'in_progress' THEN ses.id END) as active_students
    FROM exam_sessions es
    LEFT JOIN users u ON es.teacher_id = u.id
    LEFT JOIN student_exam_sessions ses ON es.id = ses.exam_session_id
    WHERE 1=1
    """
    params = []
    
    if status:
        query += " AND es.status = %s"
        params.append(status)
    if teacher_id:
        query += " AND es.teacher_id = %s"
        params.append(teacher_id)
    if class_level:
        query += " AND es.class_level = %s"
        params.append(class_level)
    
    query += " GROUP BY es.id ORDER BY es.start_time DESC"
    
    sessions = db.execute_query(query, tuple(params) if params else None)
    return jsonify({'success': True, 'data': sessions, 'count': len(sessions) if sessions else 0})

@proctoring_bp.route('/sessions/<int:session_id>', methods=['GET'])
def get_exam_session(session_id):
    """Get detailed exam session info"""
    query = """
    SELECT es.*, u.first_name, u.last_name, u.email
    FROM exam_sessions es
    LEFT JOIN users u ON es.teacher_id = u.id
    WHERE es.id = %s
    """
    session = db.execute_query(query, (session_id,))
    
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
    
    # Get enrolled students
    students_query = """
    SELECT ses.*, u.first_name, u.last_name, u.email, sp.admission_number,
           COUNT(pf.id) as flag_count
    FROM student_exam_sessions ses
    JOIN users u ON ses.student_id = u.id
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    LEFT JOIN proctoring_flags pf ON ses.id = pf.student_exam_session_id
    WHERE ses.exam_session_id = %s
    GROUP BY ses.id
    """
    students = db.execute_query(students_query, (session_id,))
    
    return jsonify({
        'success': True,
        'session': session[0],
        'students': students or []
    })

@proctoring_bp.route('/sessions', methods=['POST'])
def create_exam_session():
    """Create new exam session"""
    data = request.json
    
    query = """
    INSERT INTO exam_sessions (
        title, description, subject_id, class_level, teacher_id,
        start_time, end_time, duration_minutes, proctoring_enabled,
        camera_required, mic_required, screen_share_required,
        secure_browser_enabled, ai_monitoring_enabled, live_proctoring_enabled,
        identity_verification_required, automated_grading_enabled
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    session_id = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('subject_id'),
        data.get('class_level'),
        data.get('teacher_id'),
        data.get('start_time'),
        data.get('end_time'),
        data.get('duration_minutes'),
        data.get('proctoring_enabled', True),
        data.get('camera_required', True),
        data.get('mic_required', False),
        data.get('screen_share_required', False),
        data.get('secure_browser_enabled', False),
        data.get('ai_monitoring_enabled', True),
        data.get('live_proctoring_enabled', False),
        data.get('identity_verification_required', True),
        data.get('automated_grading_enabled', False)
    ))
    
    if session_id:
        return jsonify({'success': True, 'session_id': session_id}), 201
    return jsonify({'success': False, 'message': 'Failed to create session'}), 500

@proctoring_bp.route('/sessions/<int:session_id>', methods=['PUT'])
def update_exam_session(session_id):
    """Update exam session"""
    data = request.json
    
    query = """
    UPDATE exam_sessions SET
        title = %s, description = %s, start_time = %s, end_time = %s,
        duration_minutes = %s, status = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('start_time'),
        data.get('end_time'),
        data.get('duration_minutes'),
        data.get('status'),
        session_id
    ))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/start', methods=['POST'])
def start_exam_session(session_id):
    """Start an exam session"""
    data = request.json
    started_by = data.get('started_by')
    
    query = """
    UPDATE exam_sessions 
    SET status = 'active', updated_at = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (datetime.now(), session_id))
    
    if result is not None:
        # Log the action
        log_query = """
        INSERT INTO proctoring_logs (
            student_exam_session_id, activity_type, activity_data, ip_address, user_agent
        ) VALUES (%s, %s, %s, %s, %s)
        """
        db.execute_insert(log_query, (
            None,  # System-wide action
            'session_started',
            json.dumps({'session_id': session_id, 'started_by': started_by}),
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
        
        return jsonify({'success': True, 'message': 'Session started successfully'})
    
    return jsonify({'success': False, 'message': 'Failed to start session'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/pause', methods=['POST'])
def pause_exam_session(session_id):
    """Pause an exam session"""
    data = request.json
    paused_by = data.get('paused_by')
    
    query = """
    UPDATE exam_sessions 
    SET status = 'paused', updated_at = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (datetime.now(), session_id))
    
    if result is not None:
        # Log the action
        log_query = """
        INSERT INTO proctoring_logs (
            student_exam_session_id, activity_type, activity_data, ip_address, user_agent
        ) VALUES (%s, %s, %s, %s, %s)
        """
        db.execute_insert(log_query, (
            None,  # System-wide action
            'session_paused',
            json.dumps({'session_id': session_id, 'paused_by': paused_by}),
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
        
        return jsonify({'success': True, 'message': 'Session paused successfully'})
    
    return jsonify({'success': False, 'message': 'Failed to pause session'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/end', methods=['POST'])
def end_exam_session(session_id):
    """End an exam session"""
    data = request.json
    ended_by = data.get('ended_by')
    
    query = """
    UPDATE exam_sessions 
    SET status = 'completed', updated_at = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (datetime.now(), session_id))
    
    if result is not None:
        # Log the action
        log_query = """
        INSERT INTO proctoring_logs (
            student_exam_session_id, activity_type, activity_data, ip_address, user_agent
        ) VALUES (%s, %s, %s, %s, %s)
        """
        db.execute_insert(log_query, (
            None,  # System-wide action
            'session_ended',
            json.dumps({'session_id': session_id, 'ended_by': ended_by}),
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
        
        return jsonify({'success': True, 'message': 'Session ended successfully'})
    
    return jsonify({'success': False, 'message': 'Failed to end session'}), 500

# ============================================
# STUDENT SESSION MANAGEMENT
# ============================================

@proctoring_bp.route('/sessions/<int:session_id>/join', methods=['POST'])
def join_exam_session(session_id):
    """Student joins exam session"""
    data = request.json
    student_id = data.get('student_id')
    
    # Check if already enrolled
    check_query = "SELECT id FROM student_exam_sessions WHERE exam_session_id = %s AND student_id = %s"
    existing = db.execute_query(check_query, (session_id, student_id))
    
    if existing:
        # Update join time
        update_query = """
        UPDATE student_exam_sessions 
        SET joined_at = %s, status = 'in_progress',
            camera_status = %s, mic_status = %s, screen_share_status = %s
        WHERE id = %s
        """
        db.execute_insert(update_query, (
            datetime.now(),
            data.get('camera_status', 'off'),
            data.get('mic_status', 'off'),
            data.get('screen_share_status', 'off'),
            existing[0]['id']
        ))
        return jsonify({'success': True, 'student_session_id': existing[0]['id']})
    
    # Create new enrollment
    insert_query = """
    INSERT INTO student_exam_sessions (
        exam_session_id, student_id, joined_at, status,
        camera_status, mic_status, screen_share_status
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    student_session_id = db.execute_insert(insert_query, (
        session_id,
        student_id,
        datetime.now(),
        'in_progress',
        data.get('camera_status', 'off'),
        data.get('mic_status', 'off'),
        data.get('screen_share_status', 'off')
    ))
    
    if student_session_id:
        # Log activity
        log_activity(student_session_id, 'joined_session', {'ip': request.remote_addr})
        return jsonify({'success': True, 'student_session_id': student_session_id}), 201
    
    return jsonify({'success': False, 'message': 'Failed to join session'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/leave', methods=['POST'])
def leave_exam_session(session_id):
    """Student leaves exam session"""
    data = request.json
    student_id = data.get('student_id')
    
    query = """
    UPDATE student_exam_sessions 
    SET left_at = %s, status = 'completed'
    WHERE exam_session_id = %s AND student_id = %s
    """
    
    result = db.execute_insert(query, (datetime.now(), session_id, student_id))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Failed to leave session'}), 500

@proctoring_bp.route('/student-sessions/<int:student_session_id>/status', methods=['PUT'])
def update_student_status(student_session_id):
    """Update student camera/mic/screen status"""
    data = request.json
    
    query = """
    UPDATE student_exam_sessions 
    SET camera_status = %s, mic_status = %s, screen_share_status = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('camera_status'),
        data.get('mic_status'),
        data.get('screen_share_status'),
        student_session_id
    ))
    
    # Log activity
    log_activity(student_session_id, 'status_update', data)
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

# ============================================
# FLAGGING SYSTEM
# ============================================

@proctoring_bp.route('/flags', methods=['POST'])
def create_flag():
    """Create a proctoring flag/incident"""
    data = request.json
    
    query = """
    INSERT INTO proctoring_flags (
        student_exam_session_id, flag_type, severity, description,
        screenshot_url, flagged_by
    ) VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    flag_id = db.execute_insert(query, (
        data.get('student_exam_session_id'),
        data.get('flag_type'),
        data.get('severity', 'medium'),
        data.get('description'),
        data.get('screenshot_url'),
        data.get('flagged_by')
    ))
    
    if flag_id:
        # Update flag count
        update_query = """
        UPDATE student_exam_sessions 
        SET flag_count = flag_count + 1
        WHERE id = %s
        """
        db.execute_insert(update_query, (data.get('student_exam_session_id'),))
        
        # Send notification
        send_flag_notification(data.get('student_exam_session_id'), flag_id, data.get('flag_type'))
        
        return jsonify({'success': True, 'flag_id': flag_id}), 201
    
    return jsonify({'success': False, 'message': 'Failed to create flag'}), 500

@proctoring_bp.route('/flags/<int:flag_id>/resolve', methods=['PUT'])
def resolve_flag(flag_id):
    """Resolve a proctoring flag"""
    data = request.json
    
    query = """
    UPDATE proctoring_flags 
    SET resolved = TRUE, resolved_by = %s, resolved_at = %s, resolution_notes = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('resolved_by'),
        datetime.now(),
        data.get('resolution_notes'),
        flag_id
    ))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Failed to resolve flag'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/flags', methods=['GET'])
def get_session_flags(session_id):
    """Get all flags for an exam session"""
    query = """
    SELECT pf.*, ses.student_id, u.first_name, u.last_name,
           resolver.first_name as resolved_by_name
    FROM proctoring_flags pf
    JOIN student_exam_sessions ses ON pf.student_exam_session_id = ses.id
    JOIN users u ON ses.student_id = u.id
    LEFT JOIN users resolver ON pf.resolved_by = resolver.id
    WHERE ses.exam_session_id = %s
    ORDER BY pf.flagged_at DESC
    """
    
    flags = db.execute_query(query, (session_id,))
    return jsonify({'success': True, 'data': flags or [], 'count': len(flags) if flags else 0})

# ============================================
# MESSAGING SYSTEM
# ============================================

@proctoring_bp.route('/messages', methods=['POST'])
def send_message():
    """Send message/alert during exam"""
    data = request.json
    
    query = """
    INSERT INTO proctoring_messages (
        exam_session_id, sender_id, recipient_id, message_type, message
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    message_id = db.execute_insert(query, (
        data.get('exam_session_id'),
        data.get('sender_id'),
        data.get('recipient_id'),
        data.get('message_type', 'chat'),
        data.get('message')
    ))
    
    if message_id:
        return jsonify({'success': True, 'message_id': message_id}), 201
    return jsonify({'success': False, 'message': 'Failed to send message'}), 500

@proctoring_bp.route('/sessions/<int:session_id>/messages', methods=['GET'])
def get_session_messages(session_id):
    """Get messages for exam session"""
    user_id = request.args.get('user_id')
    
    query = """
    SELECT pm.*, 
           sender.first_name as sender_name, sender.last_name as sender_last_name,
           recipient.first_name as recipient_name, recipient.last_name as recipient_last_name
    FROM proctoring_messages pm
    JOIN users sender ON pm.sender_id = sender.id
    LEFT JOIN users recipient ON pm.recipient_id = recipient.id
    WHERE pm.exam_session_id = %s
    """
    params = [session_id]
    
    if user_id:
        query += " AND (pm.sender_id = %s OR pm.recipient_id = %s OR pm.recipient_id IS NULL)"
        params.extend([user_id, user_id])
    
    query += " ORDER BY pm.sent_at DESC LIMIT 100"
    
    messages = db.execute_query(query, tuple(params))
    return jsonify({'success': True, 'data': messages or []})

@proctoring_bp.route('/messages/<int:message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    """Mark message as read"""
    query = "UPDATE proctoring_messages SET is_read = TRUE WHERE id = %s"
    result = db.execute_insert(query, (message_id,))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Failed to update'}), 500

# ============================================
# LIVE DASHBOARD DATA
# ============================================

@proctoring_bp.route('/sessions/<int:session_id>/dashboard', methods=['GET'])
def get_dashboard_data(session_id):
    """Get real-time dashboard data for exam session"""
    
    # Session info
    session_query = "SELECT * FROM exam_sessions WHERE id = %s"
    session = db.execute_query(session_query, (session_id,))
    
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
    
    # Student stats
    stats_query = """
    SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_students,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_students,
        COUNT(CASE WHEN camera_status = 'on' THEN 1 END) as cameras_on,
        COUNT(CASE WHEN flag_count > 0 THEN 1 END) as flagged_students,
        SUM(flag_count) as total_flags
    FROM student_exam_sessions
    WHERE exam_session_id = %s
    """
    stats = db.execute_query(stats_query, (session_id,))
    
    # Recent flags
    flags_query = """
    SELECT pf.*, ses.student_id, u.first_name, u.last_name
    FROM proctoring_flags pf
    JOIN student_exam_sessions ses ON pf.student_exam_session_id = ses.id
    JOIN users u ON ses.student_id = u.id
    WHERE ses.exam_session_id = %s AND pf.resolved = FALSE
    ORDER BY pf.flagged_at DESC
    LIMIT 10
    """
    recent_flags = db.execute_query(flags_query, (session_id,))
    
    # Active students
    students_query = """
    SELECT ses.*, u.first_name, u.last_name, u.email,
           sp.admission_number
    FROM student_exam_sessions ses
    JOIN users u ON ses.student_id = u.id
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE ses.exam_session_id = %s
    ORDER BY ses.joined_at DESC
    """
    students = db.execute_query(students_query, (session_id,))
    
    return jsonify({
        'success': True,
        'session': session[0],
        'stats': stats[0] if stats else {},
        'recent_flags': recent_flags or [],
        'students': students or []
    })

# ============================================
# HELPER FUNCTIONS
# ============================================

def log_activity(student_session_id, activity_type, activity_data):
    """Log proctoring activity"""
    query = """
    INSERT INTO proctoring_logs (
        student_exam_session_id, activity_type, activity_data, ip_address, user_agent
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    db.execute_insert(query, (
        student_session_id,
        activity_type,
        json.dumps(activity_data),
        request.remote_addr if request else None,
        request.headers.get('User-Agent') if request else None
    ))

def send_flag_notification(student_session_id, flag_id, flag_type):
    """Send notification when student is flagged"""
    # Get session and student info
    query = """
    SELECT ses.student_id, ses.exam_session_id, es.teacher_id
    FROM student_exam_sessions ses
    JOIN exam_sessions es ON ses.exam_session_id = es.id
    WHERE ses.id = %s
    """
    info = db.execute_query(query, (student_session_id,))
    
    if info:
        info = info[0]
        # Create notification for teacher
        notif_query = """
        INSERT INTO notifications (user_id, title, message, notification_type, related_id, priority)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        db.execute_insert(notif_query, (
            info['teacher_id'],
            'Student Flagged',
            f'A student has been flagged for: {flag_type}',
            'alert',
            flag_id,
            'high'
        ))

# ============================================
# ENHANCED PROCTORING FEATURES
# ============================================

@proctoring_bp.route('/identity-verification', methods=['POST'])
def verify_student_identity():
    """Verify student identity using biometric authentication"""
    data = request.json
    student_id = data.get('student_id')
    session_id = data.get('session_id')
    verification_type = data.get('verification_type', 'biometric')
    
    # Simulate biometric verification process
    verification_result = {
        'verified': True,
        'confidence_score': 0.95,
        'verification_method': verification_type,
        'timestamp': datetime.now().isoformat()
    }
    
    # Log verification attempt
    query = """
    INSERT INTO proctoring_logs (
        student_exam_session_id, activity_type, activity_data, ip_address, user_agent
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    # Get student session ID
    session_query = """
    SELECT id FROM student_exam_sessions 
    WHERE exam_session_id = %s AND student_id = %s
    """
    student_session = db.execute_query(session_query, (session_id, student_id))
    
    if student_session:
        db.execute_insert(query, (
            student_session[0]['id'],
            'identity_verification',
            json.dumps(verification_result),
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
    
    return jsonify({
        'success': True,
        'verification': verification_result
    })

@proctoring_bp.route('/secure-browser', methods=['POST'])
def toggle_secure_browser():
    """Enable/disable secure browser lockdown"""
    data = request.json
    session_id = data.get('session_id')
    enabled = data.get('enabled', False)
    
    # Update session with secure browser status
    query = """
    UPDATE exam_sessions 
    SET secure_browser_enabled = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (enabled, session_id))
    
    if result is not None:
        # Log the action
        log_query = """
        INSERT INTO proctoring_logs (
            student_exam_session_id, activity_type, activity_data, ip_address, user_agent
        ) VALUES (%s, %s, %s, %s, %s)
        """
        db.execute_insert(log_query, (
            None,  # System-wide action
            'secure_browser_toggle',
            json.dumps({'enabled': enabled, 'session_id': session_id}),
            request.remote_addr,
            request.headers.get('User-Agent')
        ))
        
        return jsonify({'success': True, 'secure_browser_enabled': enabled})
    
    return jsonify({'success': False, 'message': 'Failed to update secure browser status'}), 500

@proctoring_bp.route('/ai-monitoring', methods=['POST'])
def toggle_ai_monitoring():
    """Enable/disable AI-powered monitoring"""
    data = request.json
    session_id = data.get('session_id')
    enabled = data.get('enabled', True)
    
    # Update session with AI monitoring status
    query = """
    UPDATE exam_sessions 
    SET ai_monitoring_enabled = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (enabled, session_id))
    
    if result is not None:
        return jsonify({'success': True, 'ai_monitoring_enabled': enabled})
    
    return jsonify({'success': False, 'message': 'Failed to update AI monitoring status'}), 500

@proctoring_bp.route('/live-proctoring', methods=['POST'])
def toggle_live_proctoring():
    """Enable/disable live proctoring"""
    data = request.json
    session_id = data.get('session_id')
    enabled = data.get('enabled', False)
    
    # Update session with live proctoring status
    query = """
    UPDATE exam_sessions 
    SET live_proctoring_enabled = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (enabled, session_id))
    
    if result is not None:
        return jsonify({'success': True, 'live_proctoring_enabled': enabled})
    
    return jsonify({'success': False, 'message': 'Failed to update live proctoring status'}), 500

@proctoring_bp.route('/pre-exam-checks', methods=['POST'])
def run_pre_exam_checks():
    """Run pre-exam system and environment checks"""
    data = request.json
    session_id = data.get('session_id')
    
    # Simulate pre-exam checks
    checks = [
        {
            'check_name': 'Camera Access',
            'status': 'passed',
            'details': 'Camera is accessible and working properly'
        },
        {
            'check_name': 'Microphone Access',
            'status': 'passed',
            'details': 'Microphone is accessible and working properly'
        },
        {
            'check_name': 'Screen Recording',
            'status': 'warning',
            'details': 'Screen recording permission not granted'
        },
        {
            'check_name': 'Network Connection',
            'status': 'passed',
            'details': 'Stable internet connection detected'
        },
        {
            'check_name': 'Browser Security',
            'status': 'passed',
            'details': 'Browser is in secure mode'
        },
        {
            'check_name': 'System Resources',
            'status': 'passed',
            'details': 'Sufficient system resources available'
        }
    ]
    
    # Log pre-exam checks
    query = """
    INSERT INTO proctoring_logs (
        student_exam_session_id, activity_type, activity_data, ip_address, user_agent
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    db.execute_insert(query, (
        None,  # System-wide check
        'pre_exam_checks',
        json.dumps({'session_id': session_id, 'checks': checks}),
        request.remote_addr,
        request.headers.get('User-Agent')
    ))
    
    return jsonify({
        'success': True,
        'checks': checks,
        'overall_status': 'passed' if all(c['status'] in ['passed', 'warning'] for c in checks) else 'failed'
    })

@proctoring_bp.route('/suspicious-activity', methods=['GET'])
def get_suspicious_activity():
    """Get suspicious activity detected by AI monitoring"""
    session_id = request.args.get('session_id')
    
    # Simulate suspicious activity data
    activities = [
        {
            'id': 1,
            'student_name': 'John Doe',
            'activity_type': 'screen_change',
            'severity': 'medium',
            'description': 'Multiple rapid screen changes detected',
            'timestamp': '2024-01-15 10:30:25'
        },
        {
            'id': 2,
            'student_name': 'Jane Smith',
            'activity_type': 'audio_anomaly',
            'severity': 'high',
            'description': 'Unusual audio patterns detected - possible communication',
            'timestamp': '2024-01-15 10:25:12'
        },
        {
            'id': 3,
            'student_name': 'Mike Johnson',
            'activity_type': 'eye_movement',
            'severity': 'low',
            'description': 'Extended periods of looking away from screen',
            'timestamp': '2024-01-15 10:20:45'
        }
    ]
    
    return jsonify({
        'success': True,
        'activities': activities,
        'count': len(activities)
    })

@proctoring_bp.route('/sessions/<int:session_id>/report', methods=['GET'])
def generate_exam_report(session_id):
    """Generate comprehensive exam report"""
    
    # Get session details
    session_query = "SELECT * FROM exam_sessions WHERE id = %s"
    session = db.execute_query(session_query, (session_id,))
    
    if not session:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
    
    # Get student statistics
    stats_query = """
    SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_students,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_students,
        AVG(TIMESTAMPDIFF(MINUTE, joined_at, left_at)) as avg_completion_time,
        SUM(flag_count) as total_flags
    FROM student_exam_sessions
    WHERE exam_session_id = %s
    """
    stats = db.execute_query(stats_query, (session_id,))
    
    # Get flag analysis
    flags_query = """
    SELECT flag_type, COUNT(*) as count
    FROM proctoring_flags pf
    JOIN student_exam_sessions ses ON pf.student_exam_session_id = ses.id
    WHERE ses.exam_session_id = %s
    GROUP BY flag_type
    ORDER BY count DESC
    LIMIT 1
    """
    flag_analysis = db.execute_query(flags_query, (session_id,))
    
    # Generate report
    report = {
        'session_id': session_id,
        'session_title': session[0]['title'],
        'generated_at': datetime.now().isoformat(),
        'total_students': stats[0]['total_students'] if stats else 0,
        'completed_students': stats[0]['completed_students'] if stats else 0,
        'active_students': stats[0]['active_students'] if stats else 0,
        'total_flags': stats[0]['total_flags'] if stats else 0,
        'avg_completion_time': f"{stats[0]['avg_completion_time']:.1f} minutes" if stats and stats[0]['avg_completion_time'] else 'N/A',
        'most_common_flag': flag_analysis[0]['flag_type'] if flag_analysis else 'None',
        'integrity_score': max(0, 100 - (stats[0]['total_flags'] * 5)) if stats else 100,
        'recommendations': [
            'Review flagged incidents for potential academic dishonesty',
            'Consider additional monitoring for high-risk students',
            'Implement stricter pre-exam checks for future sessions'
        ] if stats and stats[0]['total_flags'] > 0 else [
            'Excellent exam integrity maintained',
            'Continue current monitoring protocols',
            'Consider this session as a model for future exams'
        ]
    }
    
    return jsonify({
        'success': True,
        'report': report
    })

@proctoring_bp.route('/admin-notifications', methods=['GET', 'POST'])
def handle_admin_notifications():
    """Handle admin notifications for proctoring events"""
    
    if request.method == 'POST':
        data = request.json
        
        # Create admin notification
        query = """
        INSERT INTO admin_notifications (
            title, message, session_id, created_by, priority, notification_type
        ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        notification_id = db.execute_insert(query, (
            data.get('title'),
            data.get('message'),
            data.get('session_id'),
            data.get('created_by'),
            data.get('priority', 'medium'),
            'proctoring'
        ))
        
        if notification_id:
            return jsonify({'success': True, 'notification_id': notification_id}), 201
        return jsonify({'success': False, 'message': 'Failed to create notification'}), 500
    
    else:  # GET request
        session_id = request.args.get('session_id')
        
        query = """
        SELECT * FROM admin_notifications 
        WHERE notification_type = 'proctoring'
        """
        params = []
        
        if session_id:
            query += " AND session_id = %s"
            params.append(session_id)
        
        query += " ORDER BY created_at DESC LIMIT 50"
        
        notifications = db.execute_query(query, tuple(params) if params else None)
        return jsonify({
            'success': True,
            'data': notifications or []
        })

# ============================================
# AUTOMATED GRADING SYSTEM
# ============================================

@proctoring_bp.route('/automated-grading', methods=['POST'])
def process_automated_grading():
    """Process automated grading for exam responses"""
    data = request.json
    student_session_id = data.get('student_exam_session_id')
    question_id = data.get('question_id')
    answer_text = data.get('answer_text')
    grading_model = data.get('grading_model', 'default')
    
    # Simulate AI grading process
    import random
    
    # Generate AI score based on answer length and complexity
    base_score = min(100, len(answer_text) * 2) if answer_text else 0
    ai_score = max(0, min(100, base_score + random.randint(-10, 10)))
    confidence_level = random.uniform(0.7, 0.95)
    
    # Generate AI feedback
    feedback_templates = [
        "Good understanding of the concept demonstrated.",
        "Answer shows clear reasoning and logical structure.",
        "Well-organized response with relevant examples.",
        "Could benefit from more detailed explanation.",
        "Answer demonstrates solid grasp of the topic.",
        "Consider providing more specific examples.",
        "Good attempt, but could be more comprehensive."
    ]
    
    ai_feedback = random.choice(feedback_templates)
    
    # Store grading result
    query = """
    INSERT INTO automated_grading_results (
        student_exam_session_id, question_id, answer_text, ai_score, 
        ai_feedback, confidence_level, grading_model
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    grading_id = db.execute_insert(query, (
        student_session_id,
        question_id,
        answer_text,
        ai_score,
        ai_feedback,
        confidence_level,
        grading_model
    ))
    
    if grading_id:
        return jsonify({
            'success': True,
            'grading_result': {
                'id': grading_id,
                'ai_score': ai_score,
                'ai_feedback': ai_feedback,
                'confidence_level': confidence_level,
                'grading_model': grading_model
            }
        })
    
    return jsonify({'success': False, 'message': 'Failed to process automated grading'}), 500

@proctoring_bp.route('/grading-results/<int:student_session_id>', methods=['GET'])
def get_grading_results(student_session_id):
    """Get automated grading results for a student session"""
    
    query = """
    SELECT agr.*, tq.question_text, tq.question_type
    FROM automated_grading_results agr
    LEFT JOIN test_questions tq ON agr.question_id = tq.id
    WHERE agr.student_exam_session_id = %s
    ORDER BY agr.processed_at DESC
    """
    
    results = db.execute_query(query, (student_session_id,))
    
    if results:
        # Calculate overall statistics
        total_questions = len(results)
        avg_score = sum(r['ai_score'] for r in results) / total_questions if total_questions > 0 else 0
        avg_confidence = sum(r['confidence_level'] for r in results) / total_questions if total_questions > 0 else 0
        
        return jsonify({
            'success': True,
            'results': results,
            'statistics': {
                'total_questions': total_questions,
                'average_score': round(avg_score, 2),
                'average_confidence': round(avg_confidence, 2),
                'grading_model': results[0]['grading_model'] if results else 'default'
            }
        })
    
    return jsonify({
        'success': True,
        'results': [],
        'statistics': {
            'total_questions': 0,
            'average_score': 0,
            'average_confidence': 0,
            'grading_model': 'default'
        }
    })

@proctoring_bp.route('/bulk-grading', methods=['POST'])
def process_bulk_grading():
    """Process bulk automated grading for multiple students"""
    data = request.json
    session_id = data.get('session_id')
    grading_model = data.get('grading_model', 'default')
    
    # Get all student sessions for this exam
    query = """
    SELECT ses.id as student_session_id, ses.student_id, u.first_name, u.last_name
    FROM student_exam_sessions ses
    JOIN users u ON ses.student_id = u.id
    WHERE ses.exam_session_id = %s AND ses.status = 'completed'
    """
    
    student_sessions = db.execute_query(query, (session_id,))
    
    if not student_sessions:
        return jsonify({'success': False, 'message': 'No completed student sessions found'}), 404
    
    # Process grading for each student
    grading_results = []
    for session in student_sessions:
        # Simulate processing multiple questions per student
        import random
        num_questions = random.randint(3, 8)
        
        student_results = []
        for i in range(num_questions):
            question_id = i + 1
            answer_text = f"Student answer for question {question_id}"
            
            # Generate AI score
            base_score = random.randint(60, 95)
            ai_score = max(0, min(100, base_score + random.randint(-10, 10)))
            confidence_level = random.uniform(0.7, 0.95)
            
            # Store result
            insert_query = """
            INSERT INTO automated_grading_results (
                student_exam_session_id, question_id, answer_text, ai_score, 
                ai_feedback, confidence_level, grading_model
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            grading_id = db.execute_insert(insert_query, (
                session['student_session_id'],
                question_id,
                answer_text,
                ai_score,
                f"AI feedback for question {question_id}",
                confidence_level,
                grading_model
            ))
            
            if grading_id:
                student_results.append({
                    'question_id': question_id,
                    'ai_score': ai_score,
                    'confidence_level': confidence_level
                })
        
        grading_results.append({
            'student_id': session['student_id'],
            'student_name': f"{session['first_name']} {session['last_name']}",
            'student_session_id': session['student_session_id'],
            'questions_graded': len(student_results),
            'average_score': sum(r['ai_score'] for r in student_results) / len(student_results) if student_results else 0
        })
    
    return jsonify({
        'success': True,
        'bulk_grading_results': grading_results,
        'total_students_processed': len(grading_results),
        'grading_model': grading_model
    })

@proctoring_bp.route('/grading-analytics/<int:session_id>', methods=['GET'])
def get_grading_analytics(session_id):
    """Get grading analytics for an exam session"""
    
    # Get overall grading statistics
    stats_query = """
    SELECT 
        COUNT(DISTINCT agr.student_exam_session_id) as students_graded,
        COUNT(agr.id) as total_questions_graded,
        AVG(agr.ai_score) as average_score,
        AVG(agr.confidence_level) as average_confidence,
        MIN(agr.ai_score) as min_score,
        MAX(agr.ai_score) as max_score
    FROM automated_grading_results agr
    JOIN student_exam_sessions ses ON agr.student_exam_session_id = ses.id
    WHERE ses.exam_session_id = %s
    """
    
    stats = db.execute_query(stats_query, (session_id,))
    
    # Get score distribution
    distribution_query = """
    SELECT 
        CASE 
            WHEN agr.ai_score >= 90 THEN 'A (90-100)'
            WHEN agr.ai_score >= 80 THEN 'B (80-89)'
            WHEN agr.ai_score >= 70 THEN 'C (70-79)'
            WHEN agr.ai_score >= 60 THEN 'D (60-69)'
            ELSE 'F (0-59)'
        END as grade_range,
        COUNT(*) as count
    FROM automated_grading_results agr
    JOIN student_exam_sessions ses ON agr.student_exam_session_id = ses.id
    WHERE ses.exam_session_id = %s
    GROUP BY grade_range
    ORDER BY grade_range
    """
    
    distribution = db.execute_query(distribution_query, (session_id,))
    
    # Get top and bottom performers
    performers_query = """
    SELECT 
        u.first_name, u.last_name,
        AVG(agr.ai_score) as average_score,
        COUNT(agr.id) as questions_answered
    FROM automated_grading_results agr
    JOIN student_exam_sessions ses ON agr.student_exam_session_id = ses.id
    JOIN users u ON ses.student_id = u.id
    WHERE ses.exam_session_id = %s
    GROUP BY ses.student_id, u.first_name, u.last_name
    ORDER BY average_score DESC
    LIMIT 10
    """
    
    top_performers = db.execute_query(performers_query, (session_id,))
    
    return jsonify({
        'success': True,
        'analytics': {
            'overall_stats': stats[0] if stats else {},
            'score_distribution': distribution or [],
            'top_performers': top_performers or []
        }
    })

