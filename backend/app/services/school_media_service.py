"""
School Media Service
Handles school media content, slideshows, and event management
"""
import os
import uuid
import logging
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from app import db
from app.models.school_media import SchoolMedia, MediaSlideshow, SchoolEvent
from app.models.user import User

logger = logging.getLogger(__name__)

class SchoolMediaService:
    def __init__(self):
        self.media_folder = 'uploads/school_media'
        self.allowed_image_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        self.allowed_video_extensions = {'mp4', 'avi', 'mov', 'wmv', 'webm'}
        self.max_file_size = 100 * 1024 * 1024  # 100MB for videos
        
        # Ensure upload directory exists
        os.makedirs(self.media_folder, exist_ok=True)
    
    def upload_media(self, file, media_data, uploaded_by_id):
        """Upload school media (photos/videos)"""
        try:
            if not file or file.filename == '':
                return {'success': False, 'message': 'No file selected'}
            
            # Determine media type
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            if file_extension in self.allowed_image_extensions:
                media_type = 'image'
            elif file_extension in self.allowed_video_extensions:
                media_type = 'video'
            else:
                return {'success': False, 'message': 'Invalid file type'}
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > self.max_file_size:
                return {'success': False, 'message': 'File too large. Maximum size is 100MB'}
            
            # Generate unique filename
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            file_path = os.path.join(self.media_folder, unique_filename)
            
            # Save file
            file.save(file_path)
            
            # Create media record
            media = SchoolMedia(
                title=media_data['title'],
                description=media_data.get('description'),
                media_type=media_type,
                file_path=file_path,
                file_name=secure_filename(file.filename),
                file_size=file_size,
                category=media_data.get('category'),
                activity_type=media_data.get('activity_type'),
                semester=media_data.get('semester'),
                academic_year=media_data.get('academic_year', str(datetime.now().year)),
                is_featured=media_data.get('is_featured', False),
                display_order=media_data.get('display_order', 0),
                visible_to_students=media_data.get('visible_to_students', True),
                visible_to_teachers=media_data.get('visible_to_teachers', True),
                visible_to_public=media_data.get('visible_to_public', False),
                event_date=datetime.fromisoformat(media_data['event_date']) if media_data.get('event_date') else None,
                location=media_data.get('location'),
                participants=media_data.get('participants'),
                tags=media_data.get('tags'),
                photographer=media_data.get('photographer'),
                uploaded_by=uploaded_by_id
            )
            
            db.session.add(media)
            db.session.commit()
            
            logger.info(f"Media uploaded: {media.title} by user {uploaded_by_id}")
            
            return {
                'success': True,
                'message': 'Media uploaded successfully',
                'media': media.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Media upload error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error uploading media',
                'error': str(e)
            }
    
    def get_slideshow_media(self, user_role, current_semester=None):
        """Get media for slideshow based on user role"""
        try:
            query = SchoolMedia.query.filter_by(is_active=True)
            
            # Filter by visibility
            if user_role == 'student':
                query = query.filter_by(visible_to_students=True)
            elif user_role == 'teacher':
                query = query.filter_by(visible_to_teachers=True)
            elif user_role == 'admin':
                pass  # Admin can see all
            else:
                query = query.filter_by(visible_to_public=True)
            
            # Filter by current semester if specified
            if current_semester:
                query = query.filter_by(semester=current_semester)
            
            # Order by featured first, then by display order, then by date
            media_items = query.order_by(
                SchoolMedia.is_featured.desc(),
                SchoolMedia.display_order.asc(),
                SchoolMedia.created_at.desc()
            ).limit(20).all()
            
            return {
                'success': True,
                'media_items': [media.to_dict() for media in media_items]
            }
            
        except Exception as e:
            logger.error(f"Error fetching slideshow media: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching media',
                'error': str(e)
            }
    
    def get_school_activities_preview(self, user_role='student'):
        """Get preview of school activities for students"""
        try:
            # Get recent media from various categories
            categories = ['Academic', 'Sports', 'Arts', 'Events', 'Facilities']
            preview_items = []
            
            for category in categories:
                media_items = SchoolMedia.query.filter_by(
                    category=category,
                    is_active=True,
                    visible_to_students=True
                ).order_by(SchoolMedia.created_at.desc()).limit(3).all()
                
                if media_items:
                    preview_items.extend([item.to_dict() for item in media_items])
            
            # Get upcoming events
            upcoming_events = SchoolEvent.query.filter(
                SchoolEvent.start_date > datetime.utcnow(),
                SchoolEvent.status == 'planned'
            ).order_by(SchoolEvent.start_date.asc()).limit(5).all()
            
            return {
                'success': True,
                'activity_preview': preview_items,
                'upcoming_events': [event.to_dict() for event in upcoming_events]
            }
            
        except Exception as e:
            logger.error(f"Error fetching activities preview: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching activities preview',
                'error': str(e)
            }
    
    def create_event(self, event_data, organizer_id):
        """Create a new school event"""
        try:
            event = SchoolEvent(
                title=event_data['title'],
                description=event_data.get('description'),
                event_type=event_data.get('event_type'),
                start_date=datetime.fromisoformat(event_data['start_date']),
                end_date=datetime.fromisoformat(event_data['end_date']) if event_data.get('end_date') else None,
                is_all_day=event_data.get('is_all_day', False),
                location=event_data.get('location'),
                venue_details=event_data.get('venue_details'),
                target_audience=event_data.get('target_audience', 'All'),
                expected_participants=event_data.get('expected_participants'),
                registration_required=event_data.get('registration_required', False),
                registration_deadline=datetime.fromisoformat(event_data['registration_deadline']) if event_data.get('registration_deadline') else None,
                featured_image=event_data.get('featured_image'),
                is_featured=event_data.get('is_featured', False),
                is_public=event_data.get('is_public', False),
                organizer_id=organizer_id,
                contact_person=event_data.get('contact_person'),
                contact_phone=event_data.get('contact_phone'),
                contact_email=event_data.get('contact_email')
            )
            
            db.session.add(event)
            db.session.commit()
            
            logger.info(f"Event created: {event.title} by user {organizer_id}")
            
            return {
                'success': True,
                'message': 'Event created successfully',
                'event': event.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Event creation error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error creating event',
                'error': str(e)
            }
    
    def get_media_by_category(self, category, user_role='public', page=1, per_page=20):
        """Get media filtered by category"""
        try:
            query = SchoolMedia.query.filter_by(
                category=category,
                is_active=True
            )
            
            # Apply visibility filters
            if user_role == 'student':
                query = query.filter_by(visible_to_students=True)
            elif user_role == 'teacher':
                query = query.filter_by(visible_to_teachers=True)
            elif user_role != 'admin':
                query = query.filter_by(visible_to_public=True)
            
            media_items = query.order_by(
                SchoolMedia.is_featured.desc(),
                SchoolMedia.created_at.desc()
            ).paginate(page=page, per_page=per_page, error_out=False)
            
            return {
                'success': True,
                'media_items': [item.to_dict() for item in media_items.items],
                'total': media_items.total,
                'pages': media_items.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching media by category: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching media',
                'error': str(e)
            }
    
    def get_semester_highlights(self, semester, academic_year=None):
        """Get highlights for a specific semester"""
        try:
            if not academic_year:
                academic_year = str(datetime.now().year)
            
            highlights = SchoolMedia.query.filter_by(
                semester=semester,
                academic_year=academic_year,
                is_active=True,
                is_featured=True
            ).order_by(SchoolMedia.display_order.asc()).all()
            
            # Group by category
            categorized_highlights = {}
            for highlight in highlights:
                category = highlight.category or 'General'
                if category not in categorized_highlights:
                    categorized_highlights[category] = []
                categorized_highlights[category].append(highlight.to_dict())
            
            return {
                'success': True,
                'semester': semester,
                'academic_year': academic_year,
                'highlights': categorized_highlights
            }
            
        except Exception as e:
            logger.error(f"Error fetching semester highlights: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching semester highlights',
                'error': str(e)
            }
    
    def create_slideshow_config(self, config_data):
        """Create slideshow configuration"""
        try:
            slideshow = MediaSlideshow(
                name=config_data['name'],
                description=config_data.get('description'),
                target_role=config_data['target_role'],
                auto_play=config_data.get('auto_play', True),
                slide_duration=config_data.get('slide_duration', 5000),
                show_captions=config_data.get('show_captions', True),
                show_navigation=config_data.get('show_navigation', True),
                categories=config_data.get('categories'),
                current_term_only=config_data.get('current_term_only', True),
                featured_only=config_data.get('featured_only', False),
                max_items=config_data.get('max_items', 20)
            )
            
            db.session.add(slideshow)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Slideshow configuration created',
                'slideshow': slideshow.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error creating slideshow config: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error creating slideshow configuration',
                'error': str(e)
            }
    
    
    def get_media_analytics(self):
        """Get media usage analytics"""
        try:
            total_media = SchoolMedia.query.filter_by(is_active=True).count()
            
            # Media by type
            images_count = SchoolMedia.query.filter_by(
                media_type='image',
                is_active=True
            ).count()
            
            videos_count = SchoolMedia.query.filter_by(
                media_type='video',
                is_active=True
            ).count()
            
            # Media by category
            category_stats = db.session.query(
                SchoolMedia.category,
                db.func.count(SchoolMedia.id).label('count')
            ).filter_by(is_active=True).group_by(SchoolMedia.category).all()
            
            # Recent uploads
            recent_media = SchoolMedia.query.filter_by(
                is_active=True
            ).order_by(SchoolMedia.created_at.desc()).limit(10).all()
            
            return {
                'success': True,
                'analytics': {
                    'total_media': total_media,
                    'images_count': images_count,
                    'videos_count': videos_count,
                    'category_distribution': {
                        stat.category or 'Uncategorized': stat.count 
                        for stat in category_stats
                    },
                    'recent_uploads': [media.to_dict() for media in recent_media]
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating media analytics: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating analytics',
                'error': str(e)
            }
