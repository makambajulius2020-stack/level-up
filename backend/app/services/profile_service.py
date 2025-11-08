"""
Profile Management Service
Handles user profiles, photo uploads, and personal information
"""
import os
import uuid
import logging
from datetime import datetime
from werkzeug.utils import secure_filename

# Optional PIL import for image processing
try:
    from PIL import Image
except ImportError:
    Image = None
from app import db
from app.models.profile import UserProfile
from app.models.user import User

logger = logging.getLogger(__name__)

class ProfileService:
    def __init__(self):
        self.upload_folder = 'uploads/profiles'
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        self.max_file_size = 5 * 1024 * 1024  # 5MB
        self.image_sizes = {
            'thumbnail': (150, 150),
            'medium': (300, 300),
            'large': (600, 600)
        }
        
        # Ensure upload directory exists
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def upload_profile_photo(self, user_id, file):
        """
        Upload and process profile photo
        
        Args:
            user_id (int): User ID
            file: Uploaded file object
            
        Returns:
            dict: Upload result with photo URLs
        """
        try:
            if not file or file.filename == '':
                return {'success': False, 'message': 'No file selected'}
            
            if not self.allowed_file(file.filename):
                return {'success': False, 'message': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'}
            
            # Check file size
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > self.max_file_size:
                return {'success': False, 'message': 'File too large. Maximum size is 5MB'}
            
            # Generate unique filename
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"
            
            # Save original file
            original_path = os.path.join(self.upload_folder, unique_filename)
            file.save(original_path)
            
            # Process and create different sizes
            photo_urls = self._process_image(original_path, user_id, unique_filename)
            
            # Update user profile
            profile = UserProfile.query.filter_by(user_id=user_id).first()
            if not profile:
                profile = UserProfile(user_id=user_id)
                db.session.add(profile)
            
            profile.profile_photo_url = photo_urls['large']
            profile.profile_photo_filename = unique_filename
            profile.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Profile photo uploaded for user {user_id}")
            
            return {
                'success': True,
                'message': 'Profile photo uploaded successfully',
                'photo_urls': photo_urls
            }
            
        except Exception as e:
            logger.error(f"Profile photo upload error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error uploading profile photo',
                'error': str(e)
            }
    
    def _process_image(self, original_path, user_id, filename):
        """Process image into different sizes"""
        photo_urls = {}
        
        try:
            with Image.open(original_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Create different sizes
                for size_name, dimensions in self.image_sizes.items():
                    # Create thumbnail maintaining aspect ratio
                    img_copy = img.copy()
                    img_copy.thumbnail(dimensions, Image.Resampling.LANCZOS)
                    
                    # Create new image with exact dimensions and center the thumbnail
                    new_img = Image.new('RGB', dimensions, (255, 255, 255))
                    
                    # Calculate position to center the image
                    x = (dimensions[0] - img_copy.width) // 2
                    y = (dimensions[1] - img_copy.height) // 2
                    
                    new_img.paste(img_copy, (x, y))
                    
                    # Save processed image
                    size_filename = f"{user_id}_{size_name}_{filename}"
                    size_path = os.path.join(self.upload_folder, size_filename)
                    new_img.save(size_path, 'JPEG', quality=85)
                    
                    photo_urls[size_name] = f"/uploads/profiles/{size_filename}"
                
                # Also save original as large if not processed
                if 'large' not in photo_urls:
                    photo_urls['large'] = f"/uploads/profiles/{filename}"
                
        except Exception as e:
            logger.error(f"Image processing error: {str(e)}")
            # Fallback to original image
            photo_urls['large'] = f"/uploads/profiles/{filename}"
            photo_urls['medium'] = f"/uploads/profiles/{filename}"
            photo_urls['thumbnail'] = f"/uploads/profiles/{filename}"
        
        return photo_urls
    
    def get_user_profile(self, user_id):
        """Get complete user profile"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            profile = UserProfile.query.filter_by(user_id=user_id).first()
            
            # Create profile if it doesn't exist
            if not profile:
                profile = UserProfile(user_id=user_id)
                db.session.add(profile)
                db.session.commit()
            
            user_data = user.to_dict()
            profile_data = profile.to_dict()
            
            return {
                'success': True,
                'user': user_data,
                'profile': profile_data
            }
            
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching profile',
                'error': str(e)
            }
    
    def update_profile(self, user_id, profile_data):
        """Update user profile information"""
        try:
            profile = UserProfile.query.filter_by(user_id=user_id).first()
            if not profile:
                profile = UserProfile(user_id=user_id)
                db.session.add(profile)
            
            # Update profile fields
            updatable_fields = [
                'date_of_birth', 'gender', 'nationality', 'religion', 'address',
                'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
                'class_level', 'stream', 'department', 'position', 'subjects_taught',
                'notification_preferences', 'language_preference', 'theme_preference'
            ]
            
            for field in updatable_fields:
                if field in profile_data:
                    setattr(profile, field, profile_data[field])
            
            profile.updated_at = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Profile updated for user {user_id}")
            
            return {
                'success': True,
                'message': 'Profile updated successfully',
                'profile': profile.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error updating profile',
                'error': str(e)
            }
    
    def delete_profile_photo(self, user_id):
        """Delete user's profile photo"""
        try:
            profile = UserProfile.query.filter_by(user_id=user_id).first()
            if not profile or not profile.profile_photo_filename:
                return {'success': False, 'message': 'No profile photo to delete'}
            
            # Delete physical files
            filename_base = profile.profile_photo_filename.rsplit('.', 1)[0]
            file_extension = profile.profile_photo_filename.rsplit('.', 1)[1]
            
            files_to_delete = [
                profile.profile_photo_filename,
                f"{user_id}_thumbnail_{profile.profile_photo_filename}",
                f"{user_id}_medium_{profile.profile_photo_filename}",
                f"{user_id}_large_{profile.profile_photo_filename}"
            ]
            
            for filename in files_to_delete:
                file_path = os.path.join(self.upload_folder, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Update database
            profile.profile_photo_url = None
            profile.profile_photo_filename = None
            profile.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Profile photo deleted for user {user_id}")
            
            return {
                'success': True,
                'message': 'Profile photo deleted successfully'
            }
            
        except Exception as e:
            logger.error(f"Profile photo deletion error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error deleting profile photo',
                'error': str(e)
            }
    
    def get_class_profiles(self, class_level, stream=None):
        """Get profiles for a specific class"""
        try:
            query = UserProfile.query.join(User).filter(
                User.role == 'student',
                UserProfile.class_level == class_level
            )
            
            if stream:
                query = query.filter(UserProfile.stream == stream)
            
            profiles = query.all()
            
            result = []
            for profile in profiles:
                user_data = profile.user.to_dict()
                profile_data = profile.to_dict()
                result.append({
                    'user': user_data,
                    'profile': profile_data
                })
            
            return {
                'success': True,
                'profiles': result,
                'total_count': len(result)
            }
            
        except Exception as e:
            logger.error(f"Error fetching class profiles: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching class profiles',
                'error': str(e)
            }
    
    def get_staff_profiles(self, department=None):
        """Get profiles for staff members"""
        try:
            query = UserProfile.query.join(User).filter(
                User.role.in_(['teacher', 'admin'])
            )
            
            if department:
                query = query.filter(UserProfile.department == department)
            
            profiles = query.all()
            
            result = []
            for profile in profiles:
                user_data = profile.user.to_dict()
                profile_data = profile.to_dict()
                result.append({
                    'user': user_data,
                    'profile': profile_data
                })
            
            return {
                'success': True,
                'profiles': result,
                'total_count': len(result)
            }
            
        except Exception as e:
            logger.error(f"Error fetching staff profiles: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching staff profiles',
                'error': str(e)
            }
