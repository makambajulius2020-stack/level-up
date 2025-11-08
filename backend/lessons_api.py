"""
Online Resource System API
Features: Lessons management, missed lesson tracking, review system
"""

from flask import Blueprint, jsonify, request
from database import db
from datetime import datetime

lessons_bp = Blueprint('lessons', __name__, url_prefix='/api/lessons')

# ============================================
# LESSONS MANAGEMENT
# ============================================

@lessons_bp.route('/', methods=['GET'])
def get_lessons():
    """Get lessons with filters"""
    subject_id = request.args.get('subject_id')
    class_level = request.args.get('class_level')
    teacher_id = request.args.get('teacher_id')
    status = request.args.get('status')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    query = """
    SELECT l.*, 
           u.first_name, u.last_name,
           s.name as subject_name, s.code as subject_code,
           cl.title as content_title,
           COUNT(DISTINCT la.id) as total_students,
           COUNT(DISTINCT CASE WHEN la.attended = TRUE THEN la.id END) as attended_count,
           COUNT(DISTINCT CASE WHEN la.reviewed = TRUE THEN la.id END) as reviewed_count
    FROM lessons l
    LEFT JOIN users u ON l.teacher_id = u.id
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN content_library cl ON l.content_id = cl.id
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id
    WHERE 1=1
    """
    params = []
    
    if subject_id:
        query += " AND l.subject_id = %s"
        params.append(subject_id)
    if class_level:
        query += " AND l.class_level = %s"
        params.append(class_level)
    if teacher_id:
        query += " AND l.teacher_id = %s"
        params.append(teacher_id)
    if status:
        query += " AND l.status = %s"
        params.append(status)
    if date_from:
        query += " AND l.lesson_date >= %s"
        params.append(date_from)
    if date_to:
        query += " AND l.lesson_date <= %s"
        params.append(date_to)
    
    query += " GROUP BY l.id ORDER BY l.lesson_date DESC, l.start_time DESC"
    
    lessons = db.execute_query(query, tuple(params) if params else None)
    return jsonify({'success': True, 'data': lessons or [], 'count': len(lessons) if lessons else 0})

@lessons_bp.route('/<int:lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    """Get detailed lesson information"""
    query = """
    SELECT l.*, 
           u.first_name, u.last_name, u.email,
           s.name as subject_name, s.code as subject_code,
           cl.title as content_title, cl.file_url as content_url,
           cl.content_type, cl.duration_seconds
    FROM lessons l
    LEFT JOIN users u ON l.teacher_id = u.id
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN content_library cl ON l.content_id = cl.id
    WHERE l.id = %s
    """
    lesson = db.execute_query(query, (lesson_id,))
    
    if not lesson:
        return jsonify({'success': False, 'message': 'Lesson not found'}), 404
    
    # Get attendance records
    attendance_query = """
    SELECT la.*, u.first_name, u.last_name, u.email,
           sp.admission_number
    FROM lesson_attendance la
    JOIN users u ON la.student_id = u.id
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    WHERE la.lesson_id = %s
    ORDER BY u.last_name, u.first_name
    """
    attendance = db.execute_query(attendance_query, (lesson_id,))
    
    return jsonify({
        'success': True,
        'lesson': lesson[0],
        'attendance': attendance or []
    })

@lessons_bp.route('/', methods=['POST'])
def create_lesson():
    """Create new lesson"""
    data = request.json
    
    query = """
    INSERT INTO lessons (
        title, description, subject_id, class_level, teacher_id,
        lesson_date, start_time, end_time, content_id, video_url,
        notes_url, objectives, homework, status
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    lesson_id = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('subject_id'),
        data.get('class_level'),
        data.get('teacher_id'),
        data.get('lesson_date'),
        data.get('start_time'),
        data.get('end_time'),
        data.get('content_id'),
        data.get('video_url'),
        data.get('notes_url'),
        data.get('objectives'),
        data.get('homework'),
        data.get('status', 'scheduled')
    ))
    
    if lesson_id:
        # Create attendance records for all students in class
        if data.get('class_level'):
            create_attendance_records(lesson_id, data.get('class_level'))
        
        return jsonify({'success': True, 'lesson_id': lesson_id}), 201
    return jsonify({'success': False, 'message': 'Failed to create lesson'}), 500

@lessons_bp.route('/<int:lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    """Update lesson"""
    data = request.json
    
    query = """
    UPDATE lessons SET
        title = %s, description = %s, lesson_date = %s,
        start_time = %s, end_time = %s, content_id = %s,
        video_url = %s, notes_url = %s, objectives = %s,
        homework = %s, status = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('lesson_date'),
        data.get('start_time'),
        data.get('end_time'),
        data.get('content_id'),
        data.get('video_url'),
        data.get('notes_url'),
        data.get('objectives'),
        data.get('homework'),
        data.get('status'),
        lesson_id
    ))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

@lessons_bp.route('/<int:lesson_id>', methods=['DELETE'])
def delete_lesson(lesson_id):
    """Delete lesson"""
    query = "DELETE FROM lessons WHERE id = %s"
    result = db.execute_insert(query, (lesson_id,))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Delete failed'}), 500

# ============================================
# LESSON ATTENDANCE & REVIEW
# ============================================

@lessons_bp.route('/<int:lesson_id>/attendance', methods=['POST'])
def mark_attendance(lesson_id):
    """Mark student attendance for lesson"""
    data = request.json
    student_id = data.get('student_id')
    attended = data.get('attended', False)
    
    # Check if record exists
    check_query = """
    SELECT id FROM lesson_attendance 
    WHERE lesson_id = %s AND student_id = %s
    """
    existing = db.execute_query(check_query, (lesson_id, student_id))
    
    if existing:
        # Update existing record
        update_query = """
        UPDATE lesson_attendance 
        SET attended = %s, notes = %s
        WHERE id = %s
        """
        result = db.execute_insert(update_query, (
            attended,
            data.get('notes'),
            existing[0]['id']
        ))
        return jsonify({'success': True, 'attendance_id': existing[0]['id']})
    
    # Create new record
    insert_query = """
    INSERT INTO lesson_attendance (lesson_id, student_id, attended, notes)
    VALUES (%s, %s, %s, %s)
    """
    
    attendance_id = db.execute_insert(insert_query, (
        lesson_id,
        student_id,
        attended,
        data.get('notes')
    ))
    
    if attendance_id:
        return jsonify({'success': True, 'attendance_id': attendance_id}), 201
    return jsonify({'success': False, 'message': 'Failed to mark attendance'}), 500

@lessons_bp.route('/<int:lesson_id>/review', methods=['POST'])
def mark_lesson_reviewed(lesson_id):
    """Mark lesson as reviewed by student"""
    data = request.json
    student_id = data.get('student_id')
    
    query = """
    UPDATE lesson_attendance 
    SET reviewed = TRUE, review_date = %s, completion_percentage = %s, notes = %s
    WHERE lesson_id = %s AND student_id = %s
    """
    
    result = db.execute_insert(query, (
        datetime.now(),
        data.get('completion_percentage', 100),
        data.get('notes'),
        lesson_id,
        student_id
    ))
    
    if result is not None:
        # Notify teacher
        notify_teacher_review(lesson_id, student_id)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

@lessons_bp.route('/student/<int:student_id>/missed', methods=['GET'])
def get_missed_lessons(student_id):
    """Get lessons missed by student"""
    
    # Get student's class level
    class_query = "SELECT class_level FROM student_profiles WHERE user_id = %s"
    class_result = db.execute_query(class_query, (student_id,))
    
    if not class_result:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404
    
    class_level = class_result[0]['class_level']
    
    query = """
    SELECT l.*, 
           s.name as subject_name,
           u.first_name as teacher_first_name, u.last_name as teacher_last_name,
           la.attended, la.reviewed, la.review_date, la.completion_percentage,
           cl.title as content_title, cl.file_url as content_url
    FROM lessons l
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN users u ON l.teacher_id = u.id
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id AND la.student_id = %s
    LEFT JOIN content_library cl ON l.content_id = cl.id
    WHERE l.class_level = %s 
    AND l.status = 'completed'
    AND (la.attended = FALSE OR la.attended IS NULL)
    ORDER BY l.lesson_date DESC, l.start_time DESC
    """
    
    missed_lessons = db.execute_query(query, (student_id, class_level))
    return jsonify({'success': True, 'data': missed_lessons or [], 'count': len(missed_lessons) if missed_lessons else 0})

@lessons_bp.route('/student/<int:student_id>/to-review', methods=['GET'])
def get_lessons_to_review(student_id):
    """Get lessons that student needs to review"""
    
    # Get student's class level
    class_query = "SELECT class_level FROM student_profiles WHERE user_id = %s"
    class_result = db.execute_query(class_query, (student_id,))
    
    if not class_result:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404
    
    class_level = class_result[0]['class_level']
    
    query = """
    SELECT l.*, 
           s.name as subject_name,
           u.first_name as teacher_first_name, u.last_name as teacher_last_name,
           la.attended, la.reviewed, la.completion_percentage,
           cl.title as content_title, cl.file_url as content_url,
           cl.content_type, cl.duration_seconds
    FROM lessons l
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN users u ON l.teacher_id = u.id
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id AND la.student_id = %s
    LEFT JOIN content_library cl ON l.content_id = cl.id
    WHERE l.class_level = %s 
    AND l.status = 'completed'
    AND (la.attended = FALSE OR la.reviewed = FALSE OR la.reviewed IS NULL)
    AND (l.video_url IS NOT NULL OR l.content_id IS NOT NULL)
    ORDER BY l.lesson_date DESC, l.start_time DESC
    """
    
    to_review = db.execute_query(query, (student_id, class_level))
    return jsonify({'success': True, 'data': to_review or [], 'count': len(to_review) if to_review else 0})

@lessons_bp.route('/student/<int:student_id>/progress', methods=['GET'])
def get_student_lesson_progress(student_id):
    """Get student's overall lesson progress"""
    
    # Get student's class level
    class_query = "SELECT class_level FROM student_profiles WHERE user_id = %s"
    class_result = db.execute_query(class_query, (student_id,))
    
    if not class_result:
        return jsonify({'success': False, 'message': 'Student profile not found'}), 404
    
    class_level = class_result[0]['class_level']
    
    # Overall stats
    stats_query = """
    SELECT 
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN la.attended = TRUE THEN l.id END) as attended_lessons,
        COUNT(DISTINCT CASE WHEN la.reviewed = TRUE THEN l.id END) as reviewed_lessons,
        COUNT(DISTINCT CASE WHEN la.attended = FALSE OR la.attended IS NULL THEN l.id END) as missed_lessons
    FROM lessons l
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id AND la.student_id = %s
    WHERE l.class_level = %s AND l.status = 'completed'
    """
    stats = db.execute_query(stats_query, (student_id, class_level))
    
    # Progress by subject
    subject_query = """
    SELECT 
        s.id, s.name as subject_name,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN la.attended = TRUE THEN l.id END) as attended,
        COUNT(DISTINCT CASE WHEN la.reviewed = TRUE THEN l.id END) as reviewed
    FROM lessons l
    JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id AND la.student_id = %s
    WHERE l.class_level = %s AND l.status = 'completed'
    GROUP BY s.id
    """
    by_subject = db.execute_query(subject_query, (student_id, class_level))
    
    return jsonify({
        'success': True,
        'overall': stats[0] if stats else {},
        'by_subject': by_subject or []
    })

# ============================================
# TEACHER VIEWS
# ============================================

@lessons_bp.route('/teacher/<int:teacher_id>/lessons', methods=['GET'])
def get_teacher_lessons(teacher_id):
    """Get all lessons by teacher"""
    status = request.args.get('status')
    
    query = """
    SELECT l.*, 
           s.name as subject_name,
           COUNT(DISTINCT la.id) as total_students,
           COUNT(DISTINCT CASE WHEN la.attended = TRUE THEN la.id END) as attended_count
    FROM lessons l
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN lesson_attendance la ON l.id = la.lesson_id
    WHERE l.teacher_id = %s
    """
    params = [teacher_id]
    
    if status:
        query += " AND l.status = %s"
        params.append(status)
    
    query += " GROUP BY l.id ORDER BY l.lesson_date DESC, l.start_time DESC"
    
    lessons = db.execute_query(query, tuple(params))
    return jsonify({'success': True, 'data': lessons or []})

@lessons_bp.route('/<int:lesson_id>/analytics', methods=['GET'])
def get_lesson_analytics(lesson_id):
    """Get analytics for a specific lesson"""
    
    # Attendance stats
    stats_query = """
    SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN attended = TRUE THEN 1 END) as attended,
        COUNT(CASE WHEN attended = FALSE THEN 1 END) as absent,
        COUNT(CASE WHEN reviewed = TRUE THEN 1 END) as reviewed,
        AVG(completion_percentage) as avg_completion
    FROM lesson_attendance
    WHERE lesson_id = %s
    """
    stats = db.execute_query(stats_query, (lesson_id,))
    
    # Students who reviewed
    reviewed_query = """
    SELECT la.*, u.first_name, u.last_name, u.email
    FROM lesson_attendance la
    JOIN users u ON la.student_id = u.id
    WHERE la.lesson_id = %s AND la.reviewed = TRUE
    ORDER BY la.review_date DESC
    """
    reviewed = db.execute_query(reviewed_query, (lesson_id,))
    
    # Students who need to review
    need_review_query = """
    SELECT la.*, u.first_name, u.last_name, u.email
    FROM lesson_attendance la
    JOIN users u ON la.student_id = u.id
    WHERE la.lesson_id = %s AND (la.attended = FALSE OR la.reviewed = FALSE)
    ORDER BY u.last_name, u.first_name
    """
    need_review = db.execute_query(need_review_query, (lesson_id,))
    
    return jsonify({
        'success': True,
        'stats': stats[0] if stats else {},
        'reviewed_students': reviewed or [],
        'need_review': need_review or []
    })

# ============================================
# SUBJECTS MANAGEMENT
# ============================================

@lessons_bp.route('/subjects', methods=['GET'])
def get_subjects():
    """Get all subjects"""
    class_level = request.args.get('class_level')
    
    query = """
    SELECT s.*, 
           u.first_name as teacher_first_name, u.last_name as teacher_last_name,
           COUNT(DISTINCT l.id) as lesson_count
    FROM subjects s
    LEFT JOIN users u ON s.teacher_id = u.id
    LEFT JOIN lessons l ON s.id = l.subject_id
    WHERE s.is_active = TRUE
    """
    params = []
    
    if class_level:
        query += " AND s.class_level = %s"
        params.append(class_level)
    
    query += " GROUP BY s.id ORDER BY s.name"
    
    subjects = db.execute_query(query, tuple(params) if params else None)
    return jsonify({'success': True, 'data': subjects or []})

@lessons_bp.route('/subjects', methods=['POST'])
def create_subject():
    """Create new subject"""
    data = request.json
    
    query = """
    INSERT INTO subjects (name, code, description, class_level, teacher_id, color, icon)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    subject_id = db.execute_insert(query, (
        data.get('name'),
        data.get('code'),
        data.get('description'),
        data.get('class_level'),
        data.get('teacher_id'),
        data.get('color'),
        data.get('icon')
    ))
    
    if subject_id:
        return jsonify({'success': True, 'subject_id': subject_id}), 201
    return jsonify({'success': False, 'message': 'Failed to create subject'}), 500

# ============================================
# HELPER FUNCTIONS
# ============================================

def create_attendance_records(lesson_id, class_level):
    """Create attendance records for all students in class"""
    # Get all students in class
    students_query = """
    SELECT user_id FROM student_profiles WHERE class_level = %s
    """
    students = db.execute_query(students_query, (class_level,))
    
    if students:
        for student in students:
            insert_query = """
            INSERT INTO lesson_attendance (lesson_id, student_id, attended)
            VALUES (%s, %s, FALSE)
            """
            db.execute_insert(insert_query, (lesson_id, student['user_id']))

def notify_teacher_review(lesson_id, student_id):
    """Notify teacher when student reviews lesson"""
    # Get lesson and teacher info
    query = """
    SELECT l.teacher_id, l.title, u.first_name, u.last_name
    FROM lessons l
    JOIN users u ON l.teacher_id = u.id
    WHERE l.id = %s
    """
    info = db.execute_query(query, (lesson_id,))
    
    if info:
        info = info[0]
        
        # Get student name
        student_query = "SELECT first_name, last_name FROM users WHERE id = %s"
        student = db.execute_query(student_query, (student_id,))
        
        if student:
            student = student[0]
            notif_query = """
            INSERT INTO notifications (user_id, title, message, notification_type, related_id)
            VALUES (%s, %s, %s, %s, %s)
            """
            db.execute_insert(notif_query, (
                info['teacher_id'],
                'Lesson Reviewed',
                f"{student['first_name']} {student['last_name']} reviewed: {info['title']}",
                'system',
                lesson_id
            ))
