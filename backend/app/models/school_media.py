from app import db
from datetime import datetime
import json

class SchoolMedia(db.Model):
    """School media for showcasing activities and events"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Media details
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    media_type = db.Column(db.String(20), nullable=False)  # image, video
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer)
    
    # Categorization
    category = db.Column(db.String(100))  # Academic, Sports, Arts, Events, Facilities
    activity_type = db.Column(db.String(100))  # Science Fair, Football Match, Drama Club, etc.
    semester = db.Column(db.String(10))  # Semester 1, Semester 2, Semester 3
    academic_year = db.Column(db.String(10))  # 2024, 2025
    
    # Display settings
    is_featured = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Visibility settings
    visible_to_students = db.Column(db.Boolean, default=True)
    visible_to_students = db.Column(db.Boolean, default=True)
    visible_to_teachers = db.Column(db.Boolean, default=True)
    visible_to_public = db.Column(db.Boolean, default=False)
    
    # Event details
    event_date = db.Column(db.Date)
    location = db.Column(db.String(255))
    participants = db.Column(db.Text)  # JSON array of participant names/classes
    
    # Metadata
    tags = db.Column(db.Text)  # JSON array of tags
    photographer = db.Column(db.String(255))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploader = db.relationship('User', backref='uploaded_media')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'media_type': self.media_type,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'category': self.category,
            'activity_type': self.activity_type,
            'semester': self.semester,
            'academic_year': self.academic_year,
            'is_featured': self.is_featured,
            'display_order': self.display_order,
            'is_active': self.is_active,
            'visible_to_students': self.visible_to_students,
            'visible_to_teachers': self.visible_to_teachers,
            'visible_to_public': self.visible_to_public,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'location': self.location,
            'participants': self.participants,
            'tags': self.tags,
            'photographer': self.photographer,
            'uploaded_by': self.uploaded_by,
            'uploader_name': self.uploader.name if self.uploader else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class MediaSlideshow(db.Model):
    """Slideshow configurations for different user roles"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Slideshow details
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    # Target audience
    target_role = db.Column(db.String(20), nullable=False)  # student, teacher, admin, public
    
    # Display settings
    auto_play = db.Column(db.Boolean, default=True)
    slide_duration = db.Column(db.Integer, default=5000)  # milliseconds
    show_captions = db.Column(db.Boolean, default=True)
    show_navigation = db.Column(db.Boolean, default=True)
    
    # Filtering criteria
    categories = db.Column(db.Text)  # JSON array of categories to include
    current_term_only = db.Column(db.Boolean, default=True)
    featured_only = db.Column(db.Boolean, default=False)
    max_items = db.Column(db.Integer, default=20)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'target_role': self.target_role,
            'auto_play': self.auto_play,
            'slide_duration': self.slide_duration,
            'show_captions': self.show_captions,
            'show_navigation': self.show_navigation,
            'categories': self.categories,
            'current_term_only': self.current_term_only,
            'featured_only': self.featured_only,
            'max_items': self.max_items,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SchoolEvent(db.Model):
    """Upcoming school events and activities"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Event details
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    event_type = db.Column(db.String(100))  # Academic, Sports, Cultural, Administrative
    
    # Timing
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    is_all_day = db.Column(db.Boolean, default=False)
    
    # Location
    location = db.Column(db.String(255))
    venue_details = db.Column(db.Text)
    
    # Participants
    target_audience = db.Column(db.String(100))  # All, S1-S3, S4-S6, Teachers, Parents
    expected_participants = db.Column(db.Integer)
    registration_required = db.Column(db.Boolean, default=False)
    registration_deadline = db.Column(db.DateTime)
    
    # Media
    featured_image = db.Column(db.String(500))
    gallery_images = db.Column(db.Text)  # JSON array of image paths
    
    # Status
    status = db.Column(db.String(20), default='planned')  # planned, ongoing, completed, cancelled
    is_featured = db.Column(db.Boolean, default=False)
    is_public = db.Column(db.Boolean, default=False)
    
    # Organizer
    organizer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    contact_person = db.Column(db.String(255))
    contact_phone = db.Column(db.String(20))
    contact_email = db.Column(db.String(255))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organizer = db.relationship('User', backref='organized_events')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'event_type': self.event_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_all_day': self.is_all_day,
            'location': self.location,
            'venue_details': self.venue_details,
            'target_audience': self.target_audience,
            'expected_participants': self.expected_participants,
            'registration_required': self.registration_required,
            'registration_deadline': self.registration_deadline.isoformat() if self.registration_deadline else None,
            'featured_image': self.featured_image,
            'gallery_images': self.gallery_images,
            'status': self.status,
            'is_featured': self.is_featured,
            'is_public': self.is_public,
            'organizer_id': self.organizer_id,
            'organizer_name': self.organizer.name if self.organizer else None,
            'contact_person': self.contact_person,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
