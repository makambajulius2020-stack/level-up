"""
Online Classes API - Backend endpoints for conducting and managing online classes
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import mysql.connector
from functools import wraps
import jwt
import os

online_classes_bp = Blueprint('online_classes', __name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'smart_school'
}

def get_db_connection():
    """Create and return a database connection"""
    return mysql.connector.connect(**DB_CONFIG)

def token_required(f):
    """Decorator to verify JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Extract user info from token
            # TODO: Use proper JWT secret key from environment variables
            data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_role = data['role']
        except:
            return jsonify({'success': False, 'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated


@online_classes_bp.route('/api/online-classes/teacher', methods=['GET'])
@token_required
def get_teacher_classes():
    """Get all online classes for a teacher"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get teacher's online classes
        query = """
            SELECT 
                oc.*,
                COUNT(DISTINCT ocp.student_id) as participants_count
            FROM online_classes oc
            LEFT JOIN online_class_participants ocp ON oc.id = ocp.class_id
            WHERE oc.teacher_id = %s
            GROUP BY oc.id
            ORDER BY oc.scheduled_time DESC
        """
        
        cursor.execute(query, (request.user_id,))
        classes = cursor.fetchall()
        
        # Format datetime objects
        for cls in classes:
            if cls['scheduled_time']:
                cls['scheduled_time'] = cls['scheduled_time'].isoformat()
            if cls['started_at']:
                cls['started_at'] = cls['started_at'].isoformat()
            if cls['ended_at']:
                cls['ended_at'] = cls['ended_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'classes': classes
        })
    
    except Exception as e:
        print(f"Error fetching teacher classes: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@online_classes_bp.route('/api/online-classes/student', methods=['GET'])
@token_required
def get_student_classes():
    """Get all online classes for a student"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get student's online classes
        query = """
            SELECT 
                oc.*,
                t.name as teacher_name,
                COUNT(DISTINCT ocp.student_id) as participants_count
            FROM online_classes oc
            INNER JOIN online_class_participants ocp ON oc.id = ocp.class_id
            LEFT JOIN users t ON oc.teacher_id = t.id
            WHERE ocp.student_id = %s
            GROUP BY oc.id
            ORDER BY oc.scheduled_time DESC
        """
        
        cursor.execute(query, (request.user_id,))
        classes = cursor.fetchall()
        
        # Format datetime objects
        for cls in classes:
            if cls['scheduled_time']:
                cls['scheduled_time'] = cls['scheduled_time'].isoformat()
            if cls['started_at']:
                cls['started_at'] = cls['started_at'].isoformat()
            if cls['ended_at']:
                cls['ended_at'] = cls['ended_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'classes': classes
        })
    
    except Exception as e:
        print(f"Error fetching student classes: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@online_classes_bp.route('/api/online-classes/create', methods=['POST'])
@token_required
def create_online_class():
    """Create a new online class"""
    try:
        if request.user_role != 'teacher':
            return jsonify({
                'success': False,
                'message': 'Only teachers can create online classes'
            }), 403
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'subject', 'scheduled_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert online class
        query = """
            INSERT INTO online_classes 
            (teacher_id, title, subject, class_level, scheduled_time, duration, 
             description, meeting_link, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            request.user_id,
            data['title'],
            data['subject'],
            data.get('class_level', ''),
            data['scheduled_time'],
            data.get('duration', 60),
            data.get('description', ''),
            data.get('meeting_link', ''),
            'scheduled',
            datetime.now()
        )
        
        cursor.execute(query, values)
        class_id = cursor.lastrowid
        
        # If class_level is specified, add all students from that class
        if data.get('class_level'):
            student_query = """
                INSERT INTO online_class_participants (class_id, student_id, joined_at)
                SELECT %s, id, NULL
                FROM users
                WHERE role = 'student' AND class_level = %s
            """
            cursor.execute(student_query, (class_id, data['class_level']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Online class created successfully',
            'class_id': class_id
        })
    
    except Exception as e:
        print(f"Error creating online class: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@online_classes_bp.route('/api/online-classes/<int:class_id>/start', methods=['POST'])
@token_required
def start_class(class_id):
    """Start an online class session"""
    try:
        if request.user_role != 'teacher':
            return jsonify({
                'success': False,
                'message': 'Only teachers can start classes'
            }), 403
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify teacher owns this class
        cursor.execute(
            "SELECT * FROM online_classes WHERE id = %s AND teacher_id = %s",
            (class_id, request.user_id)
        )
        online_class = cursor.fetchone()
        
        if not online_class:
            return jsonify({
                'success': False,
                'message': 'Class not found or unauthorized'
            }), 404
        
        # Update class status to live
        cursor.execute(
            """UPDATE online_classes 
               SET status = 'live', started_at = %s 
               WHERE id = %s""",
            (datetime.now(), class_id)
        )
        
        conn.commit()
        
        # Get updated class info
        cursor.execute(
            """SELECT oc.*, COUNT(DISTINCT ocp.student_id) as participants
               FROM online_classes oc
               LEFT JOIN online_class_participants ocp ON oc.id = ocp.class_id
               WHERE oc.id = %s
               GROUP BY oc.id""",
            (class_id,)
        )
        session = cursor.fetchone()
        
        if session['scheduled_time']:
            session['scheduled_time'] = session['scheduled_time'].isoformat()
        if session['started_at']:
            session['started_at'] = session['started_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Class started successfully',
            'session': session
        })
    
    except Exception as e:
        print(f"Error starting class: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@online_classes_bp.route('/api/online-classes/<int:class_id>/join', methods=['POST'])
@token_required
def join_class(class_id):
    """Join an online class session"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify student is enrolled in this class
        cursor.execute(
            """SELECT oc.* FROM online_classes oc
               INNER JOIN online_class_participants ocp ON oc.id = ocp.class_id
               WHERE oc.id = %s AND ocp.student_id = %s AND oc.status = 'live'""",
            (class_id, request.user_id)
        )
        online_class = cursor.fetchone()
        
        if not online_class:
            return jsonify({
                'success': False,
                'message': 'Class not found, not live, or you are not enrolled'
            }), 404
        
        # Update participant join time
        cursor.execute(
            """UPDATE online_class_participants 
               SET joined_at = %s 
               WHERE class_id = %s AND student_id = %s""",
            (datetime.now(), class_id, request.user_id)
        )
        
        conn.commit()
        
        # Get session info
        cursor.execute(
            """SELECT oc.*, COUNT(DISTINCT ocp.student_id) as participants
               FROM online_classes oc
               LEFT JOIN online_class_participants ocp ON oc.id = ocp.class_id
               WHERE oc.id = %s
               GROUP BY oc.id""",
            (class_id,)
        )
        session = cursor.fetchone()
        
        if session['scheduled_time']:
            session['scheduled_time'] = session['scheduled_time'].isoformat()
        if session['started_at']:
            session['started_at'] = session['started_at'].isoformat()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Joined class successfully',
            'session': session
        })
    
    except Exception as e:
        print(f"Error joining class: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@online_classes_bp.route('/api/online-classes/<int:class_id>/end', methods=['POST'])
@token_required
def end_class(class_id):
    """End an online class session"""
    try:
        if request.user_role != 'teacher':
            return jsonify({
                'success': False,
                'message': 'Only teachers can end classes'
            }), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify teacher owns this class
        cursor.execute(
            "SELECT * FROM online_classes WHERE id = %s AND teacher_id = %s",
            (class_id, request.user_id)
        )
        online_class = cursor.fetchone()
        
        if not online_class:
            return jsonify({
                'success': False,
                'message': 'Class not found or unauthorized'
            }), 404
        
        # Update class status to completed
        cursor.execute(
            """UPDATE online_classes 
               SET status = 'completed', ended_at = %s 
               WHERE id = %s""",
            (datetime.now(), class_id)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Class ended successfully'
        })
    
    except Exception as e:
        print(f"Error ending class: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# Database schema for online classes
"""
CREATE TABLE IF NOT EXISTS online_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    class_level VARCHAR(10),
    scheduled_time DATETIME NOT NULL,
    duration INT DEFAULT 60,
    description TEXT,
    meeting_link VARCHAR(500),
    status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS online_class_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at DATETIME,
    left_at DATETIME,
    FOREIGN KEY (class_id) REFERENCES online_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (class_id, student_id),
    INDEX idx_class (class_id),
    INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""
