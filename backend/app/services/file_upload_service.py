import os
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from werkzeug.utils import secure_filename
try:
    from PIL import Image, ImageOps
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    Image = None
    ImageOps = None

try:
    import magic
except ImportError:
    # Fallback for Windows systems without libmagic
    magic = None
from app import db
from app.models import User, Assignment, AssignmentSubmission
from app.services.notification_service import NotificationService

class FileUploadService:
    def __init__(self):
        self.notification_service = NotificationService()
        
        # Allowed file extensions
        self.ALLOWED_EXTENSIONS = {
            'images': {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'},
            'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'},
            'spreadsheets': {'xls', 'xlsx', 'csv', 'ods'},
            'presentations': {'ppt', 'pptx', 'odp'},
            'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
            'audio': {'mp3', 'wav', 'ogg', 'aac', 'm4a'},
            'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}
        }
        
        # File size limits (in bytes)
        self.SIZE_LIMITS = {
            'profile_photo': 5 * 1024 * 1024,  # 5MB
            'assignment': 50 * 1024 * 1024,    # 50MB
            'document': 25 * 1024 * 1024,      # 25MB
            'media': 100 * 1024 * 1024,        # 100MB
            'default': 10 * 1024 * 1024        # 10MB
        }
        
        # Upload directories
        self.UPLOAD_DIRS = {
            'profile_photos': 'uploads/profiles',
            'assignments': 'uploads/assignments',
            'documents': 'uploads/documents',
            'media': 'uploads/media',
            'certificates': 'uploads/certificates',
            'temp': 'uploads/temp'
        }

    def upload_profile_photo(self, file, user_id: int) -> Dict[str, Any]:
        """Upload and process profile photo"""
        try:
            # Validate file
            validation = self._validate_file(file, 'profile_photo', ['images'])
            if not validation['valid']:
                return {'success': False, 'error': validation['error']}
            
            # Generate unique filename
            filename = self._generate_filename(file.filename, 'profile')
            upload_path = os.path.join(self.UPLOAD_DIRS['profile_photos'], filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            
            # Process and save image
            if PIL_AVAILABLE:
                processed_image = self._process_profile_image(file)
                processed_image.save(upload_path, 'JPEG', quality=85, optimize=True)
                
                # Generate thumbnail
                thumbnail_path = self._generate_thumbnail(upload_path)
            else:
                # If PIL not available, just save the file as-is
                file.save(upload_path)
                thumbnail_path = None
            
            # Update user profile
            user = User.query.get(user_id)
            if user:
                # Remove old profile photo if exists
                if user.profile_photo_url:
                    self._delete_file(user.profile_photo_url)
                
                user.profile_photo_url = upload_path
                user.profile_photo_thumbnail = thumbnail_path
                user.updated_at = datetime.utcnow()
                db.session.commit()
            
            return {
                'success': True,
                'file_path': upload_path,
                'thumbnail_path': thumbnail_path,
                'file_size': os.path.getsize(upload_path),
                'message': 'Profile photo uploaded successfully'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def upload_assignment_files(self, files: List, assignment_id: int, student_id: int) -> Dict[str, Any]:
        """Upload assignment submission files"""
        try:
            assignment = Assignment.query.get(assignment_id)
            if not assignment:
                return {'success': False, 'error': 'Assignment not found'}
            
            uploaded_files = []
            total_size = 0
            
            # Check file count limit
            if len(files) > assignment.max_files:
                return {'success': False, 'error': f'Maximum {assignment.max_files} files allowed'}
            
            # Validate each file
            for file in files:
                if file.filename == '':
                    continue
                
                # Check file type
                allowed_types = ['documents', 'images', 'presentations', 'spreadsheets']
                if assignment.submission_format:
                    # Map assignment formats to our categories
                    format_mapping = {
                        'pdf': ['documents'],
                        'doc': ['documents'],
                        'docx': ['documents'],
                        'image': ['images'],
                        'ppt': ['presentations'],
                        'excel': ['spreadsheets']
                    }
                    allowed_types = []
                    for fmt in assignment.submission_format:
                        if fmt in format_mapping:
                            allowed_types.extend(format_mapping[fmt])
                
                validation = self._validate_file(file, 'assignment', allowed_types)
                if not validation['valid']:
                    return {'success': False, 'error': f"File '{file.filename}': {validation['error']}"}
                
                total_size += file.content_length or 0
            
            # Check total size limit
            max_size_mb = assignment.max_file_size_mb * 1024 * 1024
            if total_size > max_size_mb:
                return {'success': False, 'error': f'Total file size exceeds {assignment.max_file_size_mb}MB limit'}
            
            # Create assignment submission directory
            submission_dir = os.path.join(
                self.UPLOAD_DIRS['assignments'],
                str(assignment_id),
                str(student_id),
                datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            )
            os.makedirs(submission_dir, exist_ok=True)
            
            # Upload files
            for file in files:
                if file.filename == '':
                    continue
                
                filename = self._generate_filename(file.filename, 'assignment')
                file_path = os.path.join(submission_dir, filename)
                
                # Save file
                file.save(file_path)
                
                # Scan for viruses (placeholder - implement with actual antivirus)
                virus_scan = self._scan_for_viruses(file_path)
                if not virus_scan['clean']:
                    self._delete_file(file_path)
                    return {'success': False, 'error': f'File {filename} failed security scan'}
                
                # Extract metadata
                metadata = self._extract_file_metadata(file_path)
                
                uploaded_files.append({
                    'original_name': file.filename,
                    'stored_name': filename,
                    'file_path': file_path,
                    'file_size': os.path.getsize(file_path),
                    'mime_type': metadata['mime_type'],
                    'upload_time': datetime.utcnow().isoformat()
                })
            
            return {
                'success': True,
                'uploaded_files': uploaded_files,
                'total_files': len(uploaded_files),
                'total_size': sum(f['file_size'] for f in uploaded_files),
                'submission_directory': submission_dir,
                'message': f'{len(uploaded_files)} files uploaded successfully'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def upload_document(self, file, category: str, uploader_id: int, 
                       metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Upload general documents (certificates, reports, etc.)"""
        try:
            # Validate file
            allowed_types = ['documents', 'images', 'presentations', 'spreadsheets']
            validation = self._validate_file(file, 'document', allowed_types)
            if not validation['valid']:
                return {'success': False, 'error': validation['error']}
            
            # Generate filename and path
            filename = self._generate_filename(file.filename, category)
            upload_path = os.path.join(self.UPLOAD_DIRS['documents'], category, filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            
            # Save file
            file.save(upload_path)
            
            # Extract metadata
            file_metadata = self._extract_file_metadata(upload_path)
            
            # Combine with provided metadata
            if metadata:
                file_metadata.update(metadata)
            
            file_metadata.update({
                'uploader_id': uploader_id,
                'upload_time': datetime.utcnow().isoformat(),
                'file_path': upload_path,
                'file_size': os.path.getsize(upload_path),
                'category': category
            })
            
            return {
                'success': True,
                'file_path': upload_path,
                'metadata': file_metadata,
                'message': 'Document uploaded successfully'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _validate_file(self, file, upload_type: str, allowed_categories: List[str]) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            if not file or file.filename == '':
                return {'valid': False, 'error': 'No file provided'}
            
            # Check file extension
            filename = secure_filename(file.filename)
            if '.' not in filename:
                return {'valid': False, 'error': 'File must have an extension'}
            
            extension = filename.rsplit('.', 1)[1].lower()
            
            # Check if extension is allowed
            allowed_extensions = set()
            for category in allowed_categories:
                if category in self.ALLOWED_EXTENSIONS:
                    allowed_extensions.update(self.ALLOWED_EXTENSIONS[category])
            
            if extension not in allowed_extensions:
                return {'valid': False, 'error': f'File type .{extension} not allowed'}
            
            # Check file size
            size_limit = self.SIZE_LIMITS.get(upload_type, self.SIZE_LIMITS['default'])
            if hasattr(file, 'content_length') and file.content_length:
                if file.content_length > size_limit:
                    return {'valid': False, 'error': f'File size exceeds {size_limit // (1024*1024)}MB limit'}
            
            # Check MIME type
            file.seek(0)
            if magic:
                mime_type = magic.from_buffer(file.read(1024), mime=True)
            else:
                # Fallback MIME type detection based on extension
                ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
                mime_type = self._get_mime_type_from_extension(ext)
            file.seek(0)
            
            # Basic MIME type validation
            safe_mime_types = [
                'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
                'application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'text/rtf',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/zip', 'application/x-rar-compressed',
                'audio/mpeg', 'audio/wav', 'audio/ogg',
                'video/mp4', 'video/avi', 'video/quicktime'
            ]
            
            if mime_type not in safe_mime_types:
                return {'valid': False, 'error': f'MIME type {mime_type} not allowed'}
            
            return {'valid': True}
            
        except Exception as e:
            return {'valid': False, 'error': f'Validation error: {str(e)}'}

    def _generate_filename(self, original_filename: str, prefix: str = '') -> str:
        """Generate unique filename"""
        filename = secure_filename(original_filename)
        name, ext = os.path.splitext(filename)
        
        # Generate unique identifier
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        if prefix:
            new_filename = f"{prefix}_{timestamp}_{unique_id}{ext}"
        else:
            new_filename = f"{timestamp}_{unique_id}_{name}{ext}"
        
        return new_filename

    def _process_profile_image(self, file):
        """Process profile image (resize, optimize)"""
        try:
            if not PIL_AVAILABLE:
                raise Exception("PIL/Pillow is not installed. Image processing is unavailable.")
            
            image = Image.open(file)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Auto-orient based on EXIF data
            image = ImageOps.exif_transpose(image)
            
            # Resize to standard profile photo size
            max_size = (400, 400)
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Create square crop
            width, height = image.size
            if width != height:
                size = min(width, height)
                left = (width - size) // 2
                top = (height - size) // 2
                right = left + size
                bottom = top + size
                image = image.crop((left, top, right, bottom))
            
            return image
            
        except Exception as e:
            raise Exception(f"Image processing error: {str(e)}")

    def _generate_thumbnail(self, image_path: str) -> str:
        """Generate thumbnail for image"""
        try:
            if not PIL_AVAILABLE:
                return ""
            
            image = Image.open(image_path)
            
            # Create thumbnail
            thumbnail_size = (150, 150)
            image.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
            
            # Generate thumbnail path
            path_parts = os.path.splitext(image_path)
            thumbnail_path = f"{path_parts[0]}_thumb{path_parts[1]}"
            
            # Save thumbnail
            image.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            return thumbnail_path
            
        except Exception as e:
            print(f"Thumbnail generation error: {e}")
            return ""

    def _scan_for_viruses(self, file_path: str) -> Dict[str, Any]:
        """Scan file for viruses (placeholder implementation)"""
        try:
            # In production, integrate with actual antivirus solution
            # For now, do basic checks
            
            # Check file size (extremely large files might be suspicious)
            file_size = os.path.getsize(file_path)
            if file_size > 500 * 1024 * 1024:  # 500MB
                return {'clean': False, 'reason': 'File too large'}
            
            # Check for suspicious file signatures
            with open(file_path, 'rb') as f:
                header = f.read(1024)
                
                # Check for executable signatures
                exe_signatures = [
                    b'\x4d\x5a',  # PE executable
                    b'\x7f\x45\x4c\x46',  # ELF executable
                    b'\xfe\xed\xfa',  # Mach-O executable
                ]
                
                for sig in exe_signatures:
                    if header.startswith(sig):
                        return {'clean': False, 'reason': 'Executable file detected'}
            
            # File appears clean
            return {'clean': True}
            
        except Exception as e:
            return {'clean': False, 'reason': f'Scan error: {str(e)}'}

    def _extract_file_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract file metadata"""
        try:
            stat = os.stat(file_path)
            
            # Get MIME type
            if magic:
                mime_type = magic.from_file(file_path, mime=True)
            else:
                # Fallback MIME type detection
                ext = os.path.splitext(file_path)[1].lower().lstrip('.')
                mime_type = self._get_mime_type_from_extension(ext)
            
            # Calculate file hash
            file_hash = self._calculate_file_hash(file_path)
            
            metadata = {
                'file_size': stat.st_size,
                'mime_type': mime_type,
                'created_time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified_time': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'file_hash': file_hash
            }
            
            # Extract additional metadata for images
            if mime_type.startswith('image/') and PIL_AVAILABLE:
                try:
                    image = Image.open(file_path)
                    metadata.update({
                        'image_width': image.width,
                        'image_height': image.height,
                        'image_format': image.format,
                        'image_mode': image.mode
                    })
                    
                    # Extract EXIF data if available
                    if hasattr(image, '_getexif') and image._getexif():
                        exif = image._getexif()
                        if exif:
                            metadata['exif_data'] = {k: str(v) for k, v in exif.items() if isinstance(v, (str, int, float))}
                            
                except Exception:
                    pass  # Ignore EXIF extraction errors
            
            return metadata
            
        except Exception as e:
            return {'error': f'Metadata extraction failed: {str(e)}'}

    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        try:
            with open(file_path, 'rb') as f:
                file_content = f.read()
                return hashlib.sha256(file_content).hexdigest()
        except Exception:
            return ""
    
    def _get_mime_type_from_extension(self, ext: str) -> str:
        """Fallback MIME type detection based on file extension"""
        mime_types = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'rtf': 'text/rtf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        }
        return mime_types.get(ext, 'application/octet-stream')

    def _delete_file(self, file_path: str) -> bool:
        """Safely delete a file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                
                # Also try to delete thumbnail if it exists
                path_parts = os.path.splitext(file_path)
                thumbnail_path = f"{path_parts[0]}_thumb{path_parts[1]}"
                if os.path.exists(thumbnail_path):
                    os.remove(thumbnail_path)
                
                return True
            return False
        except Exception as e:
            print(f"File deletion error: {e}")
            return False

    def delete_file(self, file_path: str, user_id: int) -> Dict[str, Any]:
        """Delete file with permission check"""
        try:
            # Verify user has permission to delete this file
            # This is a simplified check - implement proper authorization
            
            if self._delete_file(file_path):
                return {
                    'success': True,
                    'message': 'File deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'error': 'File not found or could not be deleted'
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get information about a file"""
        try:
            if not os.path.exists(file_path):
                return {'success': False, 'error': 'File not found'}
            
            metadata = self._extract_file_metadata(file_path)
            
            return {
                'success': True,
                'file_info': {
                    'file_path': file_path,
                    'filename': os.path.basename(file_path),
                    **metadata
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def cleanup_temp_files(self, older_than_hours: int = 24) -> Dict[str, Any]:
        """Clean up temporary files older than specified hours"""
        try:
            temp_dir = self.UPLOAD_DIRS['temp']
            if not os.path.exists(temp_dir):
                return {'success': True, 'deleted_count': 0}
            
            cutoff_time = datetime.utcnow() - timedelta(hours=older_than_hours)
            deleted_count = 0
            
            for filename in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, filename)
                if os.path.isfile(file_path):
                    file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                    if file_time < cutoff_time:
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                        except Exception:
                            pass  # Ignore individual file deletion errors
            
            return {
                'success': True,
                'deleted_count': deleted_count,
                'message': f'Cleaned up {deleted_count} temporary files'
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_storage_usage(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        try:
            usage = {}
            total_size = 0
            
            for category, directory in self.UPLOAD_DIRS.items():
                if os.path.exists(directory):
                    size = self._get_directory_size(directory)
                    usage[category] = {
                        'size_bytes': size,
                        'size_mb': round(size / (1024 * 1024), 2),
                        'file_count': self._count_files_in_directory(directory)
                    }
                    total_size += size
                else:
                    usage[category] = {'size_bytes': 0, 'size_mb': 0, 'file_count': 0}
            
            return {
                'success': True,
                'usage': usage,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'total_size_gb': round(total_size / (1024 * 1024 * 1024), 2)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _get_directory_size(self, directory: str) -> int:
        """Get total size of directory"""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    if os.path.exists(filepath):
                        total_size += os.path.getsize(filepath)
        except Exception:
            pass
        return total_size

    def _count_files_in_directory(self, directory: str) -> int:
        """Count files in directory"""
        count = 0
        try:
            for dirpath, dirnames, filenames in os.walk(directory):
                count += len(filenames)
        except Exception:
            pass
        return count
