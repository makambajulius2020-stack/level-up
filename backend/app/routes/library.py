from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.models.user import User
from app.services.library_service import LibraryService
from app.utils.decorators import get_current_user_id

library_bp = Blueprint('library', __name__)

# Initialize library service
library_service = LibraryService()

@library_bp.route('/books', methods=['GET'])
@jwt_required()
def search_books():
    """Search books in the library"""
    try:
        query = request.args.get('query')
        category = request.args.get('category')
        subject = request.args.get('subject')
        class_level = request.args.get('class_level')
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result = library_service.search_books(
            query=query,
            category=category,
            subject=subject,
            class_level=class_level,
            available_only=available_only,
            page=page,
            per_page=per_page
        )
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error searching books',
            'error': str(e)
        }), 500

@library_bp.route('/books', methods=['POST'])
@jwt_required()
def add_book():
    """Add a new book to the library"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to add books'
            }), 403
        
        book_data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'author']
        for field in required_fields:
            if field not in book_data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = library_service.add_book(book_data, current_user_id)
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error adding book',
            'error': str(e)
        }), 500

@library_bp.route('/borrow', methods=['POST'])
@jwt_required()
def borrow_book():
    """Borrow a book"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        data = request.get_json()
        
        # Validate required fields
        if 'book_id' not in data:
            return jsonify({
                'success': False,
                'message': 'book_id is required'
            }), 400
        
        # For self-service, borrower is current user
        # For staff-assisted, borrower can be specified
        borrower_id = data.get('borrower_id', current_user_id)
        
        # Only admin/teacher can borrow for others
        if borrower_id != current_user_id and current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to borrow for other users'
            }), 403
        
        result = library_service.borrow_book(
            book_id=data['book_id'],
            borrower_id=borrower_id,
            issued_by_id=current_user_id,
            borrowing_period_days=data.get('borrowing_period_days')
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error borrowing book',
            'error': str(e)
        }), 500

@library_bp.route('/return', methods=['POST'])
@jwt_required()
def return_book():
    """Return a borrowed book"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        data = request.get_json()
        
        # Validate required fields
        if 'borrowing_id' not in data:
            return jsonify({
                'success': False,
                'message': 'borrowing_id is required'
            }), 400
        
        # Check authorization - only admin/teacher can process returns
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to process book returns'
            }), 403
        
        result = library_service.return_book(
            borrowing_id=data['borrowing_id'],
            returned_to_id=current_user_id,
            condition=data.get('condition', 'Good'),
            notes=data.get('notes')
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error returning book',
            'error': str(e)
        }), 500

@library_bp.route('/renew', methods=['POST'])
@jwt_required()
def renew_book():
    """Renew a borrowed book"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        data = request.get_json()
        
        # Validate required fields
        if 'borrowing_id' not in data:
            return jsonify({
                'success': False,
                'message': 'borrowing_id is required'
            }), 400
        
        result = library_service.renew_book(
            borrowing_id=data['borrowing_id'],
            renewed_by_id=current_user_id
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error renewing book',
            'error': str(e)
        }), 500

@library_bp.route('/my-books', methods=['GET'])
@jwt_required()
def get_my_borrowed_books():
    """Get current user's borrowed books"""
    try:
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        include_history = request.args.get('include_history', 'false').lower() == 'true'
        
        result = library_service.get_user_borrowed_books(user_id, include_history)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching borrowed books',
            'error': str(e)
        }), 500

@library_bp.route('/user/<int:user_id>/books', methods=['GET'])
@jwt_required()
def get_user_borrowed_books(user_id):
    """Get specific user's borrowed books"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user_id != user_id and current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        include_history = request.args.get('include_history', 'false').lower() == 'true'
        
        result = library_service.get_user_borrowed_books(user_id, include_history)
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching user borrowed books',
            'error': str(e)
        }), 500

@library_bp.route('/overdue', methods=['GET'])
@jwt_required()
def get_overdue_books():
    """Get all overdue books"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        result = library_service.get_overdue_books()
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching overdue books',
            'error': str(e)
        }), 500

@library_bp.route('/ban-user', methods=['POST'])
@jwt_required()
def ban_user():
    """Ban user from library services"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized to ban users'
            }), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        result = library_service.ban_user(
            user_id=data['user_id'],
            reason=data['reason'],
            ban_duration_days=data.get('ban_duration_days'),
            banned_by_id=current_user_id
        )
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error banning user',
            'error': str(e)
        }), 500

@library_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_library_analytics():
    """Get library usage analytics"""
    try:
        current_user_id = get_current_user_id()
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Invalid authentication'}), 401
        current_user = User.query.get(current_user_id)
        
        # Check authorization
        if current_user.role not in ['admin', 'teacher']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized access'
            }), 403
        
        result = library_service.get_library_analytics()
        
        status_code = 200 if result['success'] else 500
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating analytics',
            'error': str(e)
        }), 500

@library_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_book_categories():
    """Get available book categories"""
    try:
        categories = [
            'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History',
            'Geography', 'Literature', 'Reference', 'Textbook', 'Biography',
            'Technology', 'Arts', 'Sports', 'Health', 'Religion'
        ]
        
        subjects = [
            'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
            'History', 'Geography', 'Literature', 'Computer Science', 'Economics',
            'Business Studies', 'Agriculture', 'Art', 'Music', 'Physical Education'
        ]
        
        class_levels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'General', 'Reference']
        
        return jsonify({
            'success': True,
            'categories': categories,
            'subjects': subjects,
            'class_levels': class_levels
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching categories',
            'error': str(e)
        }), 500

@library_bp.route('/books/<int:book_id>', methods=['GET'])
@jwt_required()
def get_book_details(book_id):
    """Get detailed information about a specific book"""
    try:
        from app.models.library import Book, BookBorrowing
        
        book = Book.query.get(book_id)
        if not book:
            return jsonify({
                'success': False,
                'message': 'Book not found'
            }), 404
        
        # Get borrowing history
        borrowing_history = BookBorrowing.query.filter_by(
            book_id=book_id
        ).order_by(BookBorrowing.borrowed_date.desc()).limit(10).all()
        
        book_data = book.to_dict()
        book_data['borrowing_history'] = [
            borrowing.to_dict() for borrowing in borrowing_history
        ]
        
        return jsonify({
            'success': True,
            'book': book_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error fetching book details',
            'error': str(e)
        }), 500
