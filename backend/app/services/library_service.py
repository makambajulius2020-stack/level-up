"""
Library Management Service
Handles book management, borrowing, returns, and library operations
"""
import logging
from datetime import datetime, timedelta
from app import db
from app.models.library import Book, BookBorrowing, LibrarySettings, LibraryBan
from app.models.user import User
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class LibraryService:
    def __init__(self):
        self.notification_service = NotificationService()
    
    def add_book(self, book_data, added_by_user_id):
        """Add a new book to the library"""
        try:
            book = Book(
                title=book_data['title'],
                author=book_data['author'],
                isbn=book_data.get('isbn'),
                publisher=book_data.get('publisher'),
                publication_year=book_data.get('publication_year'),
                edition=book_data.get('edition'),
                category=book_data.get('category'),
                subject=book_data.get('subject'),
                class_level=book_data.get('class_level'),
                language=book_data.get('language', 'English'),
                total_copies=book_data.get('total_copies', 1),
                available_copies=book_data.get('total_copies', 1),
                location=book_data.get('location'),
                has_digital_copy=book_data.get('has_digital_copy', False),
                digital_file_path=book_data.get('digital_file_path'),
                is_reference_only=book_data.get('is_reference_only', False)
            )
            
            db.session.add(book)
            db.session.commit()
            
            logger.info(f"Book added: {book.title} by user {added_by_user_id}")
            
            return {
                'success': True,
                'message': 'Book added successfully',
                'book': book.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error adding book: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error adding book',
                'error': str(e)
            }
    
    def search_books(self, query=None, category=None, subject=None, class_level=None, 
                    available_only=False, page=1, per_page=20):
        """Search books in the library"""
        try:
            books_query = Book.query.filter_by(is_active=True)
            
            if query:
                books_query = books_query.filter(
                    db.or_(
                        Book.title.ilike(f'%{query}%'),
                        Book.author.ilike(f'%{query}%'),
                        Book.isbn.ilike(f'%{query}%')
                    )
                )
            
            if category:
                books_query = books_query.filter_by(category=category)
            
            if subject:
                books_query = books_query.filter_by(subject=subject)
            
            if class_level:
                books_query = books_query.filter_by(class_level=class_level)
            
            if available_only:
                books_query = books_query.filter(Book.available_copies > 0)
            
            books = books_query.order_by(Book.title).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'books': [book.to_dict() for book in books.items],
                'total': books.total,
                'pages': books.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error searching books: {str(e)}")
            return {
                'success': False,
                'message': 'Error searching books',
                'error': str(e)
            }
    
    def borrow_book(self, book_id, borrower_id, issued_by_id, borrowing_period_days=None):
        """Process book borrowing"""
        try:
            # Get book and borrower
            book = Book.query.get(book_id)
            borrower = User.query.get(borrower_id)
            
            if not book or not borrower:
                return {'success': False, 'message': 'Book or borrower not found'}
            
            # Check if book is available
            if book.available_copies <= 0:
                return {'success': False, 'message': 'Book is not available'}
            
            if book.is_reference_only:
                return {'success': False, 'message': 'This is a reference book and cannot be borrowed'}
            
            # Check if user is banned
            if self._is_user_banned(borrower_id):
                return {'success': False, 'message': 'User is banned from library services'}
            
            # Check borrowing limits
            current_books = self._get_current_borrowed_books_count(borrower_id)
            max_books = self._get_max_books_for_user(borrower.role)
            
            if current_books >= max_books:
                return {'success': False, 'message': f'Maximum borrowing limit ({max_books}) reached'}
            
            # Get borrowing period
            if not borrowing_period_days:
                settings = self._get_library_settings()
                borrowing_period_days = settings.default_borrowing_period_days
            
            due_date = datetime.utcnow() + timedelta(days=borrowing_period_days)
            
            # Create borrowing record
            borrowing = BookBorrowing(
                book_id=book_id,
                borrower_id=borrower_id,
                due_date=due_date,
                issued_by=issued_by_id
            )
            
            # Update book availability
            book.available_copies -= 1
            
            db.session.add(borrowing)
            db.session.commit()
            
            # Send notification
            self._notify_book_borrowed(borrowing)
            
            logger.info(f"Book borrowed: {book.title} by user {borrower_id}")
            
            return {
                'success': True,
                'message': 'Book borrowed successfully',
                'borrowing': borrowing.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error borrowing book: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error processing book borrowing',
                'error': str(e)
            }
    
    def return_book(self, borrowing_id, returned_to_id, condition='Good', notes=None):
        """Process book return"""
        try:
            borrowing = BookBorrowing.query.get(borrowing_id)
            
            if not borrowing:
                return {'success': False, 'message': 'Borrowing record not found'}
            
            if borrowing.status == 'returned':
                return {'success': False, 'message': 'Book already returned'}
            
            # Calculate fine if overdue
            fine_amount = 0
            if borrowing.is_overdue:
                settings = self._get_library_settings()
                fine_amount = min(
                    borrowing.days_overdue * settings.fine_per_day,
                    settings.max_fine_amount
                )
            
            # Update borrowing record
            borrowing.returned_date = datetime.utcnow()
            borrowing.status = 'returned'
            borrowing.condition_on_return = condition
            borrowing.return_notes = notes
            borrowing.returned_to = returned_to_id
            borrowing.fine_amount = fine_amount
            
            # Update book availability
            book = borrowing.book
            book.available_copies += 1
            
            db.session.commit()
            
            # Send notification
            self._notify_book_returned(borrowing)
            
            logger.info(f"Book returned: {book.title} by user {borrowing.borrower_id}")
            
            return {
                'success': True,
                'message': 'Book returned successfully',
                'borrowing': borrowing.to_dict(),
                'fine_amount': fine_amount
            }
            
        except Exception as e:
            logger.error(f"Error returning book: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error processing book return',
                'error': str(e)
            }
    
    def renew_book(self, borrowing_id, renewed_by_id):
        """Renew book borrowing"""
        try:
            borrowing = BookBorrowing.query.get(borrowing_id)
            
            if not borrowing:
                return {'success': False, 'message': 'Borrowing record not found'}
            
            if borrowing.status != 'borrowed':
                return {'success': False, 'message': 'Book is not currently borrowed'}
            
            if borrowing.renewal_count >= borrowing.max_renewals:
                return {'success': False, 'message': 'Maximum renewals reached'}
            
            # Check if there are reservations for this book
            # (This would require a reservation system - simplified for now)
            
            # Extend due date
            settings = self._get_library_settings()
            borrowing.due_date += timedelta(days=settings.default_borrowing_period_days)
            borrowing.renewal_count += 1
            
            db.session.commit()
            
            # Send notification
            self._notify_book_renewed(borrowing)
            
            logger.info(f"Book renewed: {borrowing.book.title} by user {borrowing.borrower_id}")
            
            return {
                'success': True,
                'message': 'Book renewed successfully',
                'borrowing': borrowing.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error renewing book: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error renewing book',
                'error': str(e)
            }
    
    def get_user_borrowed_books(self, user_id, include_history=False):
        """Get books currently borrowed by user"""
        try:
            query = BookBorrowing.query.filter_by(borrower_id=user_id)
            
            if not include_history:
                query = query.filter_by(status='borrowed')
            
            borrowings = query.order_by(BookBorrowing.borrowed_date.desc()).all()
            
            return {
                'success': True,
                'borrowings': [borrowing.to_dict() for borrowing in borrowings]
            }
            
        except Exception as e:
            logger.error(f"Error fetching user borrowed books: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching borrowed books',
                'error': str(e)
            }
    
    def get_overdue_books(self):
        """Get all overdue books"""
        try:
            overdue_borrowings = BookBorrowing.query.filter(
                BookBorrowing.status == 'borrowed',
                BookBorrowing.due_date < datetime.utcnow()
            ).all()
            
            return {
                'success': True,
                'overdue_borrowings': [borrowing.to_dict() for borrowing in overdue_borrowings]
            }
            
        except Exception as e:
            logger.error(f"Error fetching overdue books: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching overdue books',
                'error': str(e)
            }
    
    def ban_user(self, user_id, reason, ban_duration_days=None, banned_by_id=None):
        """Ban user from library services"""
        try:
            # Check if user is already banned
            existing_ban = LibraryBan.query.filter_by(
                user_id=user_id,
                is_active=True
            ).first()
            
            if existing_ban and existing_ban.is_currently_banned:
                return {'success': False, 'message': 'User is already banned'}
            
            ban_end_date = None
            is_permanent = False
            
            if ban_duration_days:
                ban_end_date = datetime.utcnow() + timedelta(days=ban_duration_days)
            else:
                is_permanent = True
            
            ban = LibraryBan(
                user_id=user_id,
                reason=reason,
                ban_end_date=ban_end_date,
                is_permanent=is_permanent,
                banned_by=banned_by_id
            )
            
            db.session.add(ban)
            db.session.commit()
            
            # Send notification
            self._notify_user_banned(ban)
            
            logger.info(f"User banned from library: {user_id} for {reason}")
            
            return {
                'success': True,
                'message': 'User banned successfully',
                'ban': ban.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error banning user: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error banning user',
                'error': str(e)
            }
    
    def get_library_analytics(self):
        """Get library usage analytics"""
        try:
            # Total books
            total_books = Book.query.filter_by(is_active=True).count()
            available_books = db.session.query(db.func.sum(Book.available_copies)).scalar() or 0
            borrowed_books = db.session.query(db.func.sum(Book.total_copies - Book.available_copies)).scalar() or 0
            
            # Current borrowings
            current_borrowings = BookBorrowing.query.filter_by(status='borrowed').count()
            overdue_borrowings = BookBorrowing.query.filter(
                BookBorrowing.status == 'borrowed',
                BookBorrowing.due_date < datetime.utcnow()
            ).count()
            
            # Popular books (most borrowed)
            popular_books = db.session.query(
                Book.title,
                Book.author,
                db.func.count(BookBorrowing.id).label('borrow_count')
            ).join(BookBorrowing).group_by(Book.id).order_by(
                db.func.count(BookBorrowing.id).desc()
            ).limit(10).all()
            
            # Active borrowers
            active_borrowers = db.session.query(
                User.name,
                db.func.count(BookBorrowing.id).label('books_borrowed')
            ).join(BookBorrowing).filter(
                BookBorrowing.status == 'borrowed'
            ).group_by(User.id).order_by(
                db.func.count(BookBorrowing.id).desc()
            ).limit(10).all()
            
            return {
                'success': True,
                'analytics': {
                    'total_books': total_books,
                    'available_books': available_books,
                    'borrowed_books': borrowed_books,
                    'current_borrowings': current_borrowings,
                    'overdue_borrowings': overdue_borrowings,
                    'popular_books': [
                        {'title': book.title, 'author': book.author, 'borrow_count': book.borrow_count}
                        for book in popular_books
                    ],
                    'active_borrowers': [
                        {'name': borrower.name, 'books_borrowed': borrower.books_borrowed}
                        for borrower in active_borrowers
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating library analytics: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating analytics',
                'error': str(e)
            }
    
    def _is_user_banned(self, user_id):
        """Check if user is currently banned"""
        ban = LibraryBan.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        return ban and ban.is_currently_banned
    
    def _get_current_borrowed_books_count(self, user_id):
        """Get count of currently borrowed books by user"""
        return BookBorrowing.query.filter_by(
            borrower_id=user_id,
            status='borrowed'
        ).count()
    
    def _get_max_books_for_user(self, user_role):
        """Get maximum books allowed for user role"""
        settings = self._get_library_settings()
        
        if user_role == 'student':
            return settings.max_books_per_student
        elif user_role in ['teacher', 'admin']:
            return settings.max_books_per_teacher
        else:
            return settings.max_books_per_student
    
    def _get_library_settings(self):
        """Get library settings"""
        settings = LibrarySettings.query.first()
        if not settings:
            # Create default settings
            settings = LibrarySettings()
            db.session.add(settings)
            db.session.commit()
        return settings
    
    def _notify_book_borrowed(self, borrowing):
        """Send notification for book borrowing"""
        try:
            self.notification_service.send_system_notification(
                user_id=borrowing.borrower_id,
                title="Book Borrowed Successfully",
                message=f"You have borrowed '{borrowing.book.title}'. Due date: {borrowing.due_date.strftime('%Y-%m-%d')}",
                category='library',
                priority='medium'
            )
        except Exception as e:
            logger.error(f"Error sending borrowing notification: {str(e)}")
    
    def _notify_book_returned(self, borrowing):
        """Send notification for book return"""
        try:
            message = f"You have returned '{borrowing.book.title}' successfully."
            if borrowing.fine_amount > 0:
                message += f" Fine amount: UGX {borrowing.fine_amount:,.0f}"
            
            self.notification_service.send_system_notification(
                user_id=borrowing.borrower_id,
                title="Book Returned",
                message=message,
                category='library',
                priority='medium'
            )
        except Exception as e:
            logger.error(f"Error sending return notification: {str(e)}")
    
    def _notify_book_renewed(self, borrowing):
        """Send notification for book renewal"""
        try:
            self.notification_service.send_system_notification(
                user_id=borrowing.borrower_id,
                title="Book Renewed",
                message=f"'{borrowing.book.title}' has been renewed. New due date: {borrowing.due_date.strftime('%Y-%m-%d')}",
                category='library',
                priority='medium'
            )
        except Exception as e:
            logger.error(f"Error sending renewal notification: {str(e)}")
    
    def _notify_user_banned(self, ban):
        """Send notification for library ban"""
        try:
            ban_duration = "permanently" if ban.is_permanent else f"until {ban.ban_end_date.strftime('%Y-%m-%d')}"
            
            self.notification_service.send_system_notification(
                user_id=ban.user_id,
                title="Library Access Suspended",
                message=f"Your library access has been suspended {ban_duration}. Reason: {ban.reason}",
                category='library',
                priority='high'
            )
        except Exception as e:
            logger.error(f"Error sending ban notification: {str(e)}")
