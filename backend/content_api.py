"""
Content Management & Monetization System API
Features: Upload videos/notes, content library, search/filter, premium content, revenue tracking
"""

from flask import Blueprint, jsonify, request
from database import db
from datetime import datetime, date
import json

content_bp = Blueprint('content', __name__, url_prefix='/api/content')

# ============================================
# CONTENT LIBRARY MANAGEMENT
# ============================================

@content_bp.route('/', methods=['GET'])
def get_content():
    """Get content with filters and search"""
    content_type = request.args.get('type')
    category_id = request.args.get('category_id')
    subject_id = request.args.get('subject_id')
    class_level = request.args.get('class_level')
    is_premium = request.args.get('is_premium')
    search = request.args.get('search')
    uploaded_by = request.args.get('uploaded_by')
    
    query = """
    SELECT cl.*, 
           u.first_name, u.last_name,
           cc.name as category_name,
           s.name as subject_name,
           COUNT(DISTINCT cv.id) as total_views,
           COUNT(DISTINCT cp.id) as total_purchases
    FROM content_library cl
    LEFT JOIN users u ON cl.uploaded_by = u.id
    LEFT JOIN content_categories cc ON cl.category_id = cc.id
    LEFT JOIN subjects s ON cl.subject_id = s.id
    LEFT JOIN content_views cv ON cl.id = cv.content_id
    LEFT JOIN content_purchases cp ON cl.id = cp.content_id AND cp.status = 'completed'
    WHERE cl.is_published = TRUE
    """
    params = []
    
    if content_type:
        query += " AND cl.content_type = %s"
        params.append(content_type)
    if category_id:
        query += " AND cl.category_id = %s"
        params.append(category_id)
    if subject_id:
        query += " AND cl.subject_id = %s"
        params.append(subject_id)
    if class_level:
        query += " AND cl.class_level = %s"
        params.append(class_level)
    if is_premium is not None:
        query += " AND cl.is_premium = %s"
        params.append(1 if is_premium == 'true' else 0)
    if uploaded_by:
        query += " AND cl.uploaded_by = %s"
        params.append(uploaded_by)
    if search:
        query += " AND (cl.title LIKE %s OR cl.description LIKE %s OR cl.tags LIKE %s)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])
    
    query += " GROUP BY cl.id ORDER BY cl.created_at DESC"
    
    content = db.execute_query(query, tuple(params) if params else None)
    return jsonify({'success': True, 'data': content or [], 'count': len(content) if content else 0})

@content_bp.route('/<int:content_id>', methods=['GET'])
def get_content_detail(content_id):
    """Get detailed content information"""
    user_id = request.args.get('user_id')
    
    query = """
    SELECT cl.*, 
           u.first_name, u.last_name, u.email,
           cc.name as category_name,
           s.name as subject_name, s.code as subject_code
    FROM content_library cl
    LEFT JOIN users u ON cl.uploaded_by = u.id
    LEFT JOIN content_categories cc ON cl.category_id = cc.id
    LEFT JOIN subjects s ON cl.subject_id = s.id
    WHERE cl.id = %s
    """
    content = db.execute_query(query, (content_id,))
    
    if not content:
        return jsonify({'success': False, 'message': 'Content not found'}), 404
    
    content = content[0]
    
    # Check if user has access (purchased or free)
    has_access = not content['is_premium']
    if user_id and content['is_premium']:
        purchase_query = """
        SELECT id FROM content_purchases 
        WHERE content_id = %s AND student_id = %s AND status = 'completed'
        """
        purchase = db.execute_query(purchase_query, (content_id, user_id))
        has_access = bool(purchase)
    
    # Get user's progress if available
    progress = None
    if user_id:
        progress_query = """
        SELECT * FROM content_views 
        WHERE content_id = %s AND user_id = %s 
        ORDER BY viewed_at DESC LIMIT 1
        """
        progress_result = db.execute_query(progress_query, (content_id, user_id))
        progress = progress_result[0] if progress_result else None
    
    return jsonify({
        'success': True,
        'content': content,
        'has_access': has_access,
        'progress': progress
    })

@content_bp.route('/', methods=['POST'])
def upload_content():
    """Upload new content"""
    data = request.json
    
    query = """
    INSERT INTO content_library (
        title, description, content_type, file_url, file_size,
        duration_seconds, thumbnail_url, category_id, subject_id,
        class_level, uploaded_by, is_premium, price, currency,
        tags, is_published
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    content_id = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('content_type'),
        data.get('file_url'),
        data.get('file_size'),
        data.get('duration_seconds'),
        data.get('thumbnail_url'),
        data.get('category_id'),
        data.get('subject_id'),
        data.get('class_level'),
        data.get('uploaded_by'),
        data.get('is_premium', False),
        data.get('price', 0.00),
        data.get('currency', 'UGX'),
        data.get('tags'),
        data.get('is_published', True)
    ))
    
    if content_id:
        # Create notification for students in that class
        if data.get('class_level'):
            notify_students_new_content(content_id, data.get('class_level'), data.get('title'))
        
        return jsonify({'success': True, 'content_id': content_id}), 201
    return jsonify({'success': False, 'message': 'Failed to upload content'}), 500

@content_bp.route('/<int:content_id>', methods=['PUT'])
def update_content(content_id):
    """Update content"""
    data = request.json
    
    query = """
    UPDATE content_library SET
        title = %s, description = %s, category_id = %s, subject_id = %s,
        class_level = %s, is_premium = %s, price = %s, tags = %s,
        is_published = %s, thumbnail_url = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('title'),
        data.get('description'),
        data.get('category_id'),
        data.get('subject_id'),
        data.get('class_level'),
        data.get('is_premium'),
        data.get('price'),
        data.get('tags'),
        data.get('is_published'),
        data.get('thumbnail_url'),
        content_id
    ))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

@content_bp.route('/<int:content_id>', methods=['DELETE'])
def delete_content(content_id):
    """Delete content"""
    query = "DELETE FROM content_library WHERE id = %s"
    result = db.execute_insert(query, (content_id,))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Delete failed'}), 500

# ============================================
# CONTENT VIEWS & PROGRESS TRACKING
# ============================================

@content_bp.route('/<int:content_id>/view', methods=['POST'])
def record_view(content_id):
    """Record content view and update progress"""
    data = request.json
    user_id = data.get('user_id')
    
    # Update view count
    update_query = "UPDATE content_library SET view_count = view_count + 1 WHERE id = %s"
    db.execute_insert(update_query, (content_id,))
    
    # Record view
    insert_query = """
    INSERT INTO content_views (
        content_id, user_id, view_duration_seconds, completed, last_position_seconds
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    view_id = db.execute_insert(insert_query, (
        content_id,
        user_id,
        data.get('view_duration_seconds', 0),
        data.get('completed', False),
        data.get('last_position_seconds', 0)
    ))
    
    if view_id:
        return jsonify({'success': True, 'view_id': view_id}), 201
    return jsonify({'success': False, 'message': 'Failed to record view'}), 500

@content_bp.route('/views/<int:view_id>/progress', methods=['PUT'])
def update_view_progress(view_id):
    """Update viewing progress"""
    data = request.json
    
    query = """
    UPDATE content_views 
    SET view_duration_seconds = %s, completed = %s, last_position_seconds = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(query, (
        data.get('view_duration_seconds'),
        data.get('completed'),
        data.get('last_position_seconds'),
        view_id
    ))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Update failed'}), 500

@content_bp.route('/student/<int:student_id>/history', methods=['GET'])
def get_student_history(student_id):
    """Get student's viewing history"""
    query = """
    SELECT cv.*, cl.title, cl.content_type, cl.thumbnail_url,
           cl.duration_seconds
    FROM content_views cv
    JOIN content_library cl ON cv.content_id = cl.id
    WHERE cv.user_id = %s
    ORDER BY cv.viewed_at DESC
    LIMIT 50
    """
    
    history = db.execute_query(query, (student_id,))
    return jsonify({'success': True, 'data': history or []})

# ============================================
# CONTENT CATEGORIES
# ============================================

@content_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all content categories"""
    query = """
    SELECT cc.*, 
           COUNT(cl.id) as content_count
    FROM content_categories cc
    LEFT JOIN content_library cl ON cc.id = cl.category_id
    GROUP BY cc.id
    ORDER BY cc.order_number, cc.name
    """
    
    categories = db.execute_query(query)
    return jsonify({'success': True, 'data': categories or []})

@content_bp.route('/categories', methods=['POST'])
def create_category():
    """Create content category"""
    data = request.json
    
    query = """
    INSERT INTO content_categories (name, description, parent_id, icon, order_number)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    category_id = db.execute_insert(query, (
        data.get('name'),
        data.get('description'),
        data.get('parent_id'),
        data.get('icon'),
        data.get('order_number')
    ))
    
    if category_id:
        return jsonify({'success': True, 'category_id': category_id}), 201
    return jsonify({'success': False, 'message': 'Failed to create category'}), 500

# ============================================
# MONETIZATION - PURCHASES
# ============================================

@content_bp.route('/<int:content_id>/purchase', methods=['POST'])
def purchase_content(content_id):
    """Purchase premium content"""
    data = request.json
    student_id = data.get('student_id')
    
    # Get content info
    content_query = "SELECT * FROM content_library WHERE id = %s AND is_premium = TRUE"
    content = db.execute_query(content_query, (content_id,))
    
    if not content:
        return jsonify({'success': False, 'message': 'Content not found or not premium'}), 404
    
    content = content[0]
    
    # Check if already purchased
    check_query = """
    SELECT id FROM content_purchases 
    WHERE content_id = %s AND student_id = %s AND status = 'completed'
    """
    existing = db.execute_query(check_query, (content_id, student_id))
    
    if existing:
        return jsonify({'success': False, 'message': 'Already purchased'}), 400
    
    # Create purchase record
    purchase_query = """
    INSERT INTO content_purchases (
        content_id, student_id, amount, currency, payment_method,
        transaction_id, status
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    purchase_id = db.execute_insert(purchase_query, (
        content_id,
        student_id,
        content['price'],
        content['currency'],
        data.get('payment_method'),
        data.get('transaction_id'),
        'pending'
    ))
    
    if purchase_id:
        return jsonify({
            'success': True,
            'purchase_id': purchase_id,
            'amount': float(content['price']),
            'currency': content['currency']
        }), 201
    
    return jsonify({'success': False, 'message': 'Failed to create purchase'}), 500

@content_bp.route('/purchases/<int:purchase_id>/confirm', methods=['PUT'])
def confirm_purchase(purchase_id):
    """Confirm purchase payment"""
    data = request.json
    
    # Update purchase status
    update_query = """
    UPDATE content_purchases 
    SET status = 'completed', transaction_id = %s
    WHERE id = %s
    """
    
    result = db.execute_insert(update_query, (
        data.get('transaction_id'),
        purchase_id
    ))
    
    if result is not None:
        # Get purchase details
        purchase_query = """
        SELECT cp.*, cl.uploaded_by, cl.title
        FROM content_purchases cp
        JOIN content_library cl ON cp.content_id = cl.id
        WHERE cp.id = %s
        """
        purchase = db.execute_query(purchase_query, (purchase_id,))
        
        if purchase:
            purchase = purchase[0]
            
            # Record revenue
            record_revenue(purchase_id, purchase['amount'], purchase['uploaded_by'])
            
            # Notify student
            notify_purchase_success(purchase['student_id'], purchase['title'])
        
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Confirmation failed'}), 500

@content_bp.route('/student/<int:student_id>/purchases', methods=['GET'])
def get_student_purchases(student_id):
    """Get student's purchase history"""
    query = """
    SELECT cp.*, cl.title, cl.content_type, cl.thumbnail_url,
           u.first_name as teacher_first_name, u.last_name as teacher_last_name
    FROM content_purchases cp
    JOIN content_library cl ON cp.content_id = cl.id
    LEFT JOIN users u ON cl.uploaded_by = u.id
    WHERE cp.student_id = %s
    ORDER BY cp.purchased_at DESC
    """
    
    purchases = db.execute_query(query, (student_id,))
    return jsonify({'success': True, 'data': purchases or []})

# ============================================
# MONETIZATION - REVENUE TRACKING
# ============================================

@content_bp.route('/revenue/summary', methods=['GET'])
def get_revenue_summary():
    """Get revenue summary (admin dashboard)"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    teacher_id = request.args.get('teacher_id')
    
    query = """
    SELECT 
        DATE(recorded_at) as date,
        SUM(amount) as total_revenue,
        SUM(net_amount) as net_revenue,
        SUM(commission_amount) as total_commission,
        COUNT(*) as transaction_count
    FROM revenue_records
    WHERE 1=1
    """
    params = []
    
    if start_date:
        query += " AND DATE(recorded_at) >= %s"
        params.append(start_date)
    if end_date:
        query += " AND DATE(recorded_at) <= %s"
        params.append(end_date)
    if teacher_id:
        query += " AND teacher_id = %s"
        params.append(teacher_id)
    
    query += " GROUP BY DATE(recorded_at) ORDER BY date DESC"
    
    revenue = db.execute_query(query, tuple(params) if params else None)
    
    # Get totals
    totals_query = """
    SELECT 
        SUM(amount) as total_revenue,
        SUM(net_amount) as net_revenue,
        COUNT(DISTINCT purchase_id) as total_purchases,
        COUNT(DISTINCT teacher_id) as active_teachers
    FROM revenue_records
    WHERE 1=1
    """
    
    if start_date:
        totals_query += " AND DATE(recorded_at) >= %s"
    if end_date:
        totals_query += " AND DATE(recorded_at) <= %s"
    if teacher_id:
        totals_query += " AND teacher_id = %s"
    
    totals = db.execute_query(totals_query, tuple(params) if params else None)
    
    return jsonify({
        'success': True,
        'daily_revenue': revenue or [],
        'totals': totals[0] if totals else {}
    })

@content_bp.route('/revenue/teacher/<int:teacher_id>', methods=['GET'])
def get_teacher_revenue(teacher_id):
    """Get revenue for specific teacher"""
    query = """
    SELECT 
        DATE(rr.recorded_at) as date,
        SUM(rr.amount) as gross_revenue,
        SUM(rr.net_amount) as net_revenue,
        COUNT(*) as sales_count,
        cl.title as content_title
    FROM revenue_records rr
    LEFT JOIN content_purchases cp ON rr.purchase_id = cp.id
    LEFT JOIN content_library cl ON cp.content_id = cl.id
    WHERE rr.teacher_id = %s
    GROUP BY DATE(rr.recorded_at), cl.id
    ORDER BY date DESC
    """
    
    revenue = db.execute_query(query, (teacher_id,))
    
    # Get teacher totals
    totals_query = """
    SELECT 
        SUM(amount) as total_gross,
        SUM(net_amount) as total_net,
        COUNT(*) as total_sales
    FROM revenue_records
    WHERE teacher_id = %s
    """
    totals = db.execute_query(totals_query, (teacher_id,))
    
    return jsonify({
        'success': True,
        'revenue': revenue or [],
        'totals': totals[0] if totals else {}
    })

@content_bp.route('/revenue/analytics', methods=['GET'])
def get_revenue_analytics():
    """Get revenue analytics for admin dashboard"""
    
    # Today's revenue
    today_query = """
    SELECT SUM(amount) as today_revenue, COUNT(*) as today_purchases
    FROM revenue_records
    WHERE DATE(recorded_at) = CURDATE()
    """
    today = db.execute_query(today_query)
    
    # This month's revenue
    month_query = """
    SELECT SUM(amount) as month_revenue, COUNT(*) as month_purchases
    FROM revenue_records
    WHERE YEAR(recorded_at) = YEAR(CURDATE()) 
    AND MONTH(recorded_at) = MONTH(CURDATE())
    """
    month = db.execute_query(month_query)
    
    # Top selling content
    top_content_query = """
    SELECT cl.id, cl.title, cl.price, cl.thumbnail_url,
           COUNT(cp.id) as purchase_count,
           SUM(cp.amount) as total_revenue
    FROM content_library cl
    JOIN content_purchases cp ON cl.id = cp.content_id
    WHERE cp.status = 'completed'
    GROUP BY cl.id
    ORDER BY purchase_count DESC
    LIMIT 10
    """
    top_content = db.execute_query(top_content_query)
    
    # Top earning teachers
    top_teachers_query = """
    SELECT u.id, u.first_name, u.last_name,
           SUM(rr.net_amount) as total_earnings,
           COUNT(DISTINCT rr.purchase_id) as sales_count
    FROM users u
    JOIN revenue_records rr ON u.id = rr.teacher_id
    GROUP BY u.id
    ORDER BY total_earnings DESC
    LIMIT 10
    """
    top_teachers = db.execute_query(top_teachers_query)
    
    return jsonify({
        'success': True,
        'today': today[0] if today else {},
        'month': month[0] if month else {},
        'top_content': top_content or [],
        'top_teachers': top_teachers or []
    })

# ============================================
# BOOKMARKS/FAVORITES
# ============================================

@content_bp.route('/bookmarks', methods=['POST'])
def add_bookmark():
    """Add content to bookmarks"""
    data = request.json
    
    query = """
    INSERT INTO content_bookmarks (user_id, content_id, lesson_id, notes)
    VALUES (%s, %s, %s, %s)
    """
    
    bookmark_id = db.execute_insert(query, (
        data.get('user_id'),
        data.get('content_id'),
        data.get('lesson_id'),
        data.get('notes')
    ))
    
    if bookmark_id:
        return jsonify({'success': True, 'bookmark_id': bookmark_id}), 201
    return jsonify({'success': False, 'message': 'Failed to add bookmark'}), 500

@content_bp.route('/bookmarks/<int:bookmark_id>', methods=['DELETE'])
def remove_bookmark(bookmark_id):
    """Remove bookmark"""
    query = "DELETE FROM content_bookmarks WHERE id = %s"
    result = db.execute_insert(query, (bookmark_id,))
    
    if result is not None:
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Delete failed'}), 500

@content_bp.route('/student/<int:student_id>/bookmarks', methods=['GET'])
def get_student_bookmarks(student_id):
    """Get student's bookmarks"""
    query = """
    SELECT cb.*, cl.title, cl.content_type, cl.thumbnail_url,
           l.title as lesson_title
    FROM content_bookmarks cb
    LEFT JOIN content_library cl ON cb.content_id = cl.id
    LEFT JOIN lessons l ON cb.lesson_id = l.id
    WHERE cb.user_id = %s
    ORDER BY cb.created_at DESC
    """
    
    bookmarks = db.execute_query(query, (student_id,))
    return jsonify({'success': True, 'data': bookmarks or []})

# ============================================
# HELPER FUNCTIONS
# ============================================

def record_revenue(purchase_id, amount, teacher_id):
    """Record revenue from purchase"""
    commission_rate = 0.20  # 20% commission for school
    commission = float(amount) * commission_rate
    net_amount = float(amount) - commission
    
    query = """
    INSERT INTO revenue_records (
        purchase_id, revenue_type, amount, teacher_id,
        commission_amount, net_amount
    ) VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    db.execute_insert(query, (
        purchase_id,
        'content_purchase',
        amount,
        teacher_id,
        commission,
        net_amount
    ))
    
    # Update daily analytics
    update_analytics(date.today(), amount)

def update_analytics(date_val, amount):
    """Update daily revenue analytics"""
    check_query = "SELECT id FROM revenue_analytics WHERE date = %s"
    existing = db.execute_query(check_query, (date_val,))
    
    if existing:
        update_query = """
        UPDATE revenue_analytics 
        SET total_revenue = total_revenue + %s,
            total_purchases = total_purchases + 1
        WHERE date = %s
        """
        db.execute_insert(update_query, (amount, date_val))
    else:
        insert_query = """
        INSERT INTO revenue_analytics (date, total_revenue, total_purchases)
        VALUES (%s, %s, 1)
        """
        db.execute_insert(insert_query, (date_val, amount))

def notify_students_new_content(content_id, class_level, title):
    """Notify students about new content"""
    # Get students in class
    students_query = """
    SELECT user_id FROM student_profiles WHERE class_level = %s
    """
    students = db.execute_query(students_query, (class_level,))
    
    if students:
        for student in students:
            notif_query = """
            INSERT INTO notifications (user_id, title, message, notification_type, related_id)
            VALUES (%s, %s, %s, %s, %s)
            """
            db.execute_insert(notif_query, (
                student['user_id'],
                'New Content Available',
                f'New content uploaded: {title}',
                'content',
                content_id
            ))

def notify_purchase_success(student_id, content_title):
    """Notify student of successful purchase"""
    query = """
    INSERT INTO notifications (user_id, title, message, notification_type)
    VALUES (%s, %s, %s, %s)
    """
    db.execute_insert(query, (
        student_id,
        'Purchase Successful',
        f'You now have access to: {content_title}',
        'payment'
    ))
