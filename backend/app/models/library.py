from app import db
from datetime import datetime, timedelta
from sqlalchemy import func

class Book(db.Model):
    """Library book management"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Book details
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    isbn = db.Column(db.String(20), unique=True)
    publisher = db.Column(db.String(255))
    publication_year = db.Column(db.Integer)
    edition = db.Column(db.String(50))
    
    # Classification
    category = db.Column(db.String(100))  # Fiction, Science, Mathematics, etc.
    subject = db.Column(db.String(100))   # Subject area
    class_level = db.Column(db.String(20)) # S1-S6, General, Reference
    language = db.Column(db.String(50), default='English')
    
    # Physical details
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    location = db.Column(db.String(100))  # Shelf location
    
    # Digital details
    has_digital_copy = db.Column(db.Boolean, default=False)
    digital_file_path = db.Column(db.String(500))
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_reference_only = db.Column(db.Boolean, default=False)
    
    # Timestamps
    added_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    borrowing_records = db.relationship('BookBorrowing', backref='book', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'publisher': self.publisher,
            'publication_year': self.publication_year,
            'edition': self.edition,
            'category': self.category,
            'subject': self.subject,
            'class_level': self.class_level,
            'language': self.language,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'location': self.location,
            'has_digital_copy': self.has_digital_copy,
            'is_active': self.is_active,
            'is_reference_only': self.is_reference_only,
            'added_date': self.added_date.isoformat(),
            'last_updated': self.last_updated.isoformat()
        }

class BookBorrowing(db.Model):
    """Book borrowing records"""
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    borrower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Borrowing details
    borrowed_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    returned_date = db.Column(db.DateTime)
    
    # Status
    status = db.Column(db.String(20), default='borrowed')  # borrowed, returned, overdue, lost
    renewal_count = db.Column(db.Integer, default=0)
    max_renewals = db.Column(db.Integer, default=2)
    
    # Fines and penalties
    fine_amount = db.Column(db.Float, default=0.0)
    fine_paid = db.Column(db.Boolean, default=False)
    
    # Notes
    borrowing_notes = db.Column(db.Text)
    return_notes = db.Column(db.Text)
    condition_on_return = db.Column(db.String(50))  # Good, Fair, Poor, Damaged
    
    # Staff handling
    issued_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    returned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    borrower = db.relationship('User', foreign_keys=[borrower_id], backref='borrowed_books')
    issuer = db.relationship('User', foreign_keys=[issued_by])
    returner = db.relationship('User', foreign_keys=[returned_to])
    
    @property
    def is_overdue(self):
        """Check if book is overdue"""
        if self.status == 'returned':
            return False
        return datetime.utcnow() > self.due_date
    
    @property
    def days_overdue(self):
        """Calculate days overdue"""
        if not self.is_overdue:
            return 0
        return (datetime.utcnow() - self.due_date).days
    
    def to_dict(self):
        return {
            'id': self.id,
            'book_id': self.book_id,
            'book_title': self.book.title if self.book else None,
            'book_author': self.book.author if self.book else None,
            'borrower_id': self.borrower_id,
            'borrower_name': self.borrower.name if self.borrower else None,
            'borrowed_date': self.borrowed_date.isoformat(),
            'due_date': self.due_date.isoformat(),
            'returned_date': self.returned_date.isoformat() if self.returned_date else None,
            'status': self.status,
            'renewal_count': self.renewal_count,
            'max_renewals': self.max_renewals,
            'fine_amount': self.fine_amount,
            'fine_paid': self.fine_paid,
            'is_overdue': self.is_overdue,
            'days_overdue': self.days_overdue,
            'condition_on_return': self.condition_on_return,
            'created_at': self.created_at.isoformat()
        }

class LibrarySettings(db.Model):
    """Library configuration settings"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Borrowing rules
    default_borrowing_period_days = db.Column(db.Integer, default=14)
    max_books_per_student = db.Column(db.Integer, default=3)
    max_books_per_teacher = db.Column(db.Integer, default=5)
    max_renewals = db.Column(db.Integer, default=2)
    
    # Fine settings
    fine_per_day = db.Column(db.Float, default=500.0)  # UGX per day
    max_fine_amount = db.Column(db.Float, default=50000.0)  # UGX
    
    # Library hours
    opening_time = db.Column(db.String(10), default='08:00')
    closing_time = db.Column(db.String(10), default='17:00')
    
    # Digital library settings
    digital_downloads_enabled = db.Column(db.Boolean, default=True)
    max_digital_books_per_user = db.Column(db.Integer, default=5)
    
    # Notifications
    overdue_notification_days = db.Column(db.Integer, default=1)  # Days after due date
    reminder_notification_days = db.Column(db.Integer, default=2)  # Days before due date
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'default_borrowing_period_days': self.default_borrowing_period_days,
            'max_books_per_student': self.max_books_per_student,
            'max_books_per_teacher': self.max_books_per_teacher,
            'max_renewals': self.max_renewals,
            'fine_per_day': self.fine_per_day,
            'max_fine_amount': self.max_fine_amount,
            'opening_time': self.opening_time,
            'closing_time': self.closing_time,
            'digital_downloads_enabled': self.digital_downloads_enabled,
            'max_digital_books_per_user': self.max_digital_books_per_user,
            'overdue_notification_days': self.overdue_notification_days,
            'reminder_notification_days': self.reminder_notification_days
        }

class LibraryBan(db.Model):
    """Library ban records for users who violate rules"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Ban details
    reason = db.Column(db.String(255), nullable=False)
    ban_start_date = db.Column(db.DateTime, default=datetime.utcnow)
    ban_end_date = db.Column(db.DateTime)
    is_permanent = db.Column(db.Boolean, default=False)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Staff details
    banned_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    lifted_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Notes
    ban_notes = db.Column(db.Text)
    lift_notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    banned_user = db.relationship('User', foreign_keys=[user_id], backref='library_bans')
    banner = db.relationship('User', foreign_keys=[banned_by])
    lifter = db.relationship('User', foreign_keys=[lifted_by])
    
    @property
    def is_currently_banned(self):
        """Check if ban is currently active"""
        if not self.is_active:
            return False
        if self.is_permanent:
            return True
        if self.ban_end_date:
            return datetime.utcnow() < self.ban_end_date
        return True
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.banned_user.name if self.banned_user else None,
            'reason': self.reason,
            'ban_start_date': self.ban_start_date.isoformat(),
            'ban_end_date': self.ban_end_date.isoformat() if self.ban_end_date else None,
            'is_permanent': self.is_permanent,
            'is_active': self.is_active,
            'is_currently_banned': self.is_currently_banned,
            'banned_by': self.banner.name if self.banner else None,
            'ban_notes': self.ban_notes,
            'created_at': self.created_at.isoformat()
        }
