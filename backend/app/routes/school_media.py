from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.services.school_media_service import SchoolMediaService

school_media_bp = Blueprint('school_media', __name__)

# Initialize school media service
media_service = SchoolMediaService()

@school_media_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_media():
    """Upload school media (photos/videos)"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to upload media'
            }), 403
        
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Get media data from form
        media_data = {
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'category': request.form.get('category'),
            'activity_type': request.form.get('activity_type'),
            'semester': request.form.get('semester'),
            'academic_year': request.form.get('academic_year'),
            'is_featured': request.form.get('is_featured', 'false').lower() == 'true',
            'display_order': int(request.form.get('display_order', 0)),
            'visible_to_students': request.form.get('visible_to_students', 'true').lower() == 'true',
            'visible_to_students': request.form.get('visible_to_students', 'true').lower() == 'true',
            'visible_to_teachers': request.form.get('visible_to_teachers', 'true').lower() == 'true',
            'visible_to_public': request.form.get('visible_to_public', 'false').lower() == 'true',
            'event_date': request.form.get('event_date'),
            'location': request.form.get('location'),
            'participants': request.form.get('participants'),
            'tags': request.form.get('tags'),
            'photographer': request.form.get('photographer')
        }
        
        # Validate required fields
        if not media_data['title']:
            return jsonify({
                'success': False,
                'message': 'Title is required'
            }), 400
        
        result = media_service.upload_media(file, media_data, current_user_id)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error uploading media',
            'error': str(e)
        }), 500

@school_media_bp.route('/slideshow', methods=['GET'])
@jwt_required()
def get_slideshow_media():
    """Get media for slideshow"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        current_semester = request.args.get('semester')
        
        result = media_service.get_slideshow_media(current_user.role, current_semester)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching slideshow media',
            'error': str(e)
        }), 500

@school_media_bp.route('/activities-preview', methods=['GET'])
def get_activities_preview():
    """Get preview of school activities (public endpoint)"""
    try:
        user_role = 'student'  # Default for this endpoint
        
        # If user is authenticated, use their role
        try:
            current_user_id = get_jwt_identity()['id']
            current_user = User.query.get(current_user_id)
            if current_user:
                user_role = current_user.role
        except:
            pass  # Not authenticated, use default
        
        result = media_service.get_school_activities_preview(user_role)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching activities preview',
            'error': str(e)
        }), 500

@school_media_bp.route('/events', methods=['POST'])
@jwt_required()
def create_event():
    """Create a new school event"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to create events'
            }), 403
        
        event_data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'start_date']
        for field in required_fields:
            if field not in event_data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = media_service.create_event(event_data, current_user_id)
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error creating event',
            'error': str(e)
        }), 500

@school_media_bp.route('/category/<category>', methods=['GET'])
def get_media_by_category(category):
    """Get media filtered by category"""
    try:
        user_role = 'public'  # Default
        
        # If user is authenticated, use their role
        try:
            current_user_id = get_jwt_identity()['id']
            current_user = User.query.get(current_user_id)
            if current_user:
                user_role = current_user.role
        except:
            pass  # Not authenticated, use default
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = media_service.get_media_by_category(category, user_role, page, per_page)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching media by category',
            'error': str(e)
        }), 500

@school_media_bp.route('/semester-highlights/<semester>', methods=['GET'])
def get_semester_highlights(semester):
    """Get highlights for a specific semester"""
    try:
        academic_year = request.args.get('academic_year')
        
        result = media_service.get_semester_highlights(semester, academic_year)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching semester highlights',
            'error': str(e)
        }), 500

@school_media_bp.route('/slideshow-config', methods=['POST'])
@jwt_required()
def create_slideshow_config():
    """Create slideshow configuration"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to create slideshow configurations'
            }), 403
        
        config_data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'target_role']
        for field in required_fields:
            if field not in config_data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = media_service.create_slideshow_config(config_data)
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error creating slideshow configuration',
            'error': str(e)
        }), 500


@school_media_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_media_analytics():
    """Get media usage analytics"""
    try:
        current_user_id = get_jwt_identity()['id']
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        result = media_service.get_media_analytics()
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating analytics',
            'error': str(e)
        }), 500

@school_media_bp.route('/categories', methods=['GET'])
def get_media_categories():
    """Get available media categories"""
    try:
        categories = [
            'Academic', 'Sports', 'Arts', 'Cultural', 'Events', 
            'Facilities', 'Graduation', 'Awards', 'Community', 'General'
        ]
        
        activity_types = [
            'Science Fair', 'Football Match', 'Drama Performance', 'Cultural Festival',
            'Graduation Ceremony', 'Awards Night', 'Open Day', 'Sports Day',
            'Music Concert', 'Art Exhibition', 'Debate Competition', 'Quiz Competition'
        ]
        
        semesters = ['Semester 1', 'Semester 2', 'Semester 3']
        
        return jsonify({
            'success': True,
            'categories': categories,
            'activity_types': activity_types,
            'semesters': semesters
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching categories',
            'error': str(e)
        }), 500
