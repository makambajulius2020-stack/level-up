"""
Plagiarism Detection Service
Detects plagiarism in student submissions using various techniques
"""
import logging
import hashlib
import re
import json
from datetime import datetime
from difflib import SequenceMatcher
from app import db
from app.models.ai_analytics import PlagiarismCheck
from app.models.user import User
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class PlagiarismService:
    def __init__(self):
        self.notification_service = NotificationService()
        self.similarity_threshold = 25.0  # 25% similarity threshold
        self.common_phrases = [
            'in conclusion', 'furthermore', 'however', 'therefore', 'moreover',
            'on the other hand', 'in addition', 'as a result', 'for example',
            'in summary', 'first of all', 'finally', 'meanwhile', 'nevertheless'
        ]
        
        # Common academic sources (would be expanded in real system)
        self.known_sources = [
            'wikipedia.org', 'britannica.com', 'scholar.google.com',
            'jstor.org', 'researchgate.net', 'academia.edu'
        ]
    
    def check_plagiarism(self, student_id, assignment_id, submission_title, submission_content, 
                        subject=None, academic_term='Term 1', academic_year='2024'):
        """
        Check submission for plagiarism
        
        Args:
            student_id (int): Student ID
            assignment_id (str): Assignment identifier
            submission_title (str): Title of submission
            submission_content (str): Content to check
            subject (str): Subject area
            academic_term (str): Academic term
            academic_year (str): Academic year
            
        Returns:
            dict: Plagiarism check results
        """
        try:
            # Get student
            student = User.query.get(student_id)
            if not student or student.role != 'student':
                return {'success': False, 'message': 'Student not found'}
            
            # Create file hash for duplicate detection
            content_hash = hashlib.sha256(submission_content.encode()).hexdigest()
            
            # Check for exact duplicates
            existing_submission = PlagiarismCheck.query.filter_by(
                file_hash=content_hash
            ).first()
            
            if existing_submission and existing_submission.student_id != student_id:
                return {
                    'success': True,
                    'plagiarism_detected': True,
                    'plagiarism_score': 100.0,
                    'message': 'Exact duplicate submission found',
                    'duplicate_submission': existing_submission.to_dict()
                }
            
            # Perform plagiarism analysis
            analysis_results = self._analyze_content(submission_content, student_id)
            
            # Create plagiarism check record
            plagiarism_check = PlagiarismCheck(
                student_id=student_id,
                assignment_id=assignment_id,
                submission_title=submission_title,
                submission_content=submission_content[:5000],  # Store first 5000 chars
                file_hash=content_hash,
                plagiarism_score=analysis_results['plagiarism_score'],
                similarity_threshold=self.similarity_threshold,
                is_flagged=analysis_results['plagiarism_score'] > self.similarity_threshold,
                sources_found=json.dumps(analysis_results['sources_found']),
                similar_submissions=json.dumps(analysis_results['similar_submissions']),
                detection_method='custom_algorithm',
                subject=subject,
                academic_term=academic_term,
                academic_year=academic_year
            )
            
            db.session.add(plagiarism_check)
            db.session.commit()
            
            # Send notification if plagiarism detected
            if plagiarism_check.is_flagged:
                self._notify_plagiarism_detection(student, plagiarism_check)
            
            logger.info(f"Plagiarism check completed for student {student_id}: {analysis_results['plagiarism_score']:.1f}%")
            
            return {
                'success': True,
                'check_id': plagiarism_check.id,
                'plagiarism_detected': plagiarism_check.is_flagged,
                'plagiarism_score': analysis_results['plagiarism_score'],
                'similarity_threshold': self.similarity_threshold,
                'sources_found': analysis_results['sources_found'],
                'similar_submissions': analysis_results['similar_submissions'],
                'recommendations': self._generate_recommendations(analysis_results),
                'detailed_analysis': analysis_results['detailed_analysis']
            }
            
        except Exception as e:
            logger.error(f"Plagiarism check error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Plagiarism check failed',
                'error': str(e)
            }
    
    def _analyze_content(self, content, student_id):
        """Analyze content for plagiarism indicators"""
        results = {
            'plagiarism_score': 0.0,
            'sources_found': [],
            'similar_submissions': [],
            'detailed_analysis': {
                'total_sentences': 0,
                'flagged_sentences': 0,
                'common_phrases_count': 0,
                'suspicious_patterns': [],
                'writing_style_analysis': {}
            }
        }
        
        # Clean and prepare content
        cleaned_content = self._clean_content(content)
        sentences = self._split_into_sentences(cleaned_content)
        results['detailed_analysis']['total_sentences'] = len(sentences)
        
        # Check against known sources (simulated)
        source_similarity = self._check_against_sources(cleaned_content)
        results['sources_found'] = source_similarity['sources']
        
        # Check against other student submissions
        submission_similarity = self._check_against_submissions(cleaned_content, student_id)
        results['similar_submissions'] = submission_similarity['submissions']
        
        # Analyze writing patterns
        pattern_analysis = self._analyze_writing_patterns(cleaned_content)
        results['detailed_analysis']['suspicious_patterns'] = pattern_analysis['suspicious_patterns']
        results['detailed_analysis']['writing_style_analysis'] = pattern_analysis['style_analysis']
        
        # Calculate overall plagiarism score
        score_components = [
            source_similarity['max_similarity'] * 0.4,  # 40% weight for source similarity
            submission_similarity['max_similarity'] * 0.3,  # 30% weight for submission similarity
            pattern_analysis['suspicion_score'] * 0.3  # 30% weight for pattern analysis
        ]
        
        results['plagiarism_score'] = sum(score_components)
        results['detailed_analysis']['flagged_sentences'] = int(
            results['plagiarism_score'] / 100 * len(sentences)
        )
        
        return results
    
    def _clean_content(self, content):
        """Clean content for analysis"""
        # Remove extra whitespace and normalize
        content = re.sub(r'\s+', ' ', content.strip())
        
        # Remove common formatting
        content = re.sub(r'[^\w\s.,!?;:]', '', content)
        
        return content.lower()
    
    def _split_into_sentences(self, content):
        """Split content into sentences"""
        sentences = re.split(r'[.!?]+', content)
        return [s.strip() for s in sentences if len(s.strip()) > 10]
    
    def _check_against_sources(self, content):
        """Check content against known sources (simulated)"""
        # In a real system, this would query external databases or APIs
        # For demo, we'll simulate some matches
        
        sources_found = []
        max_similarity = 0.0
        
        # Simulate checking against common academic sources
        for source in self.known_sources:
            # Simulate similarity score
            import random
            similarity = random.uniform(0, 45)  # Random similarity up to 45%
            
            if similarity > 15:  # Only report significant similarities
                sources_found.append({
                    'source': source,
                    'similarity_percentage': similarity,
                    'matched_text': content[:100] + '...',  # First 100 chars as sample
                    'confidence': min(similarity / 50, 1.0)
                })
                max_similarity = max(max_similarity, similarity)
        
        # Sort by similarity
        sources_found.sort(key=lambda x: x['similarity_percentage'], reverse=True)
        
        return {
            'sources': sources_found[:5],  # Top 5 matches
            'max_similarity': max_similarity
        }
    
    def _check_against_submissions(self, content, current_student_id):
        """Check against other student submissions"""
        similar_submissions = []
        max_similarity = 0.0
        
        try:
            # Get other submissions (excluding current student)
            other_submissions = PlagiarismCheck.query.filter(
                PlagiarismCheck.student_id != current_student_id
            ).limit(50).all()  # Check against last 50 submissions
            
            for submission in other_submissions:
                if submission.submission_content:
                    similarity = self._calculate_text_similarity(
                        content, 
                        submission.submission_content.lower()
                    )
                    
                    if similarity > 20:  # Only report significant similarities
                        # Get student info
                        student = User.query.get(submission.student_id)
                        similar_submissions.append({
                            'student_name': student.name if student else 'Unknown',
                            'assignment_id': submission.assignment_id,
                            'similarity_percentage': similarity,
                            'submission_date': submission.created_at.isoformat(),
                            'matched_segments': self._find_matching_segments(content, submission.submission_content.lower())
                        })
                        max_similarity = max(max_similarity, similarity)
            
            # Sort by similarity
            similar_submissions.sort(key=lambda x: x['similarity_percentage'], reverse=True)
            
        except Exception as e:
            logger.error(f"Error checking against submissions: {str(e)}")
        
        return {
            'submissions': similar_submissions[:3],  # Top 3 matches
            'max_similarity': max_similarity
        }
    
    def _calculate_text_similarity(self, text1, text2):
        """Calculate similarity between two texts"""
        # Use SequenceMatcher for basic similarity
        similarity = SequenceMatcher(None, text1, text2).ratio()
        return similarity * 100
    
    def _find_matching_segments(self, text1, text2):
        """Find matching text segments"""
        # Simple implementation - in production would use more sophisticated algorithms
        words1 = text1.split()
        words2 = text2.split()
        
        matching_segments = []
        
        # Find common sequences of 5+ words
        for i in range(len(words1) - 4):
            segment = ' '.join(words1[i:i+5])
            if segment in text2:
                matching_segments.append(segment)
        
        return matching_segments[:5]  # Return top 5 matches
    
    def _analyze_writing_patterns(self, content):
        """Analyze writing patterns for suspicious indicators"""
        analysis = {
            'suspicious_patterns': [],
            'style_analysis': {},
            'suspicion_score': 0.0
        }
        
        words = content.split()
        sentences = self._split_into_sentences(content)
        
        # Calculate basic metrics
        avg_sentence_length = len(words) / max(len(sentences), 1)
        analysis['style_analysis']['avg_sentence_length'] = avg_sentence_length
        
        # Check for suspicious patterns
        suspicion_indicators = []
        
        # Very long sentences (possible copy-paste)
        long_sentences = [s for s in sentences if len(s.split()) > 30]
        if len(long_sentences) > len(sentences) * 0.3:
            suspicion_indicators.append('High proportion of very long sentences')
        
        # Sudden style changes
        if len(sentences) > 5:
            first_half_avg = sum(len(s.split()) for s in sentences[:len(sentences)//2]) / (len(sentences)//2)
            second_half_avg = sum(len(s.split()) for s in sentences[len(sentences)//2:]) / (len(sentences) - len(sentences)//2)
            
            if abs(first_half_avg - second_half_avg) > 10:
                suspicion_indicators.append('Inconsistent sentence length patterns')
        
        # Excessive use of common phrases
        common_phrase_count = sum(1 for phrase in self.common_phrases if phrase in content)
        if common_phrase_count > len(sentences) * 0.5:
            suspicion_indicators.append('Overuse of common academic phrases')
        
        # Calculate suspicion score
        analysis['suspicious_patterns'] = suspicion_indicators
        analysis['suspicion_score'] = min(len(suspicion_indicators) * 15, 60)  # Max 60% from pattern analysis
        
        return analysis
    
    def _generate_recommendations(self, analysis_results):
        """Generate recommendations based on plagiarism analysis"""
        recommendations = []
        
        score = analysis_results['plagiarism_score']
        
        if score > 50:
            recommendations.extend([
                'Immediate review required - high plagiarism detected',
                'Student should be called for explanation',
                'Consider academic integrity violation procedures'
            ])
        elif score > 25:
            recommendations.extend([
                'Moderate plagiarism detected - requires investigation',
                'Review flagged sections with student',
                'Provide guidance on proper citation and referencing'
            ])
        else:
            recommendations.extend([
                'Low plagiarism risk detected',
                'Provide feedback on writing improvement',
                'Encourage original thinking and proper citations'
            ])
        
        # Source-specific recommendations
        if analysis_results['sources_found']:
            recommendations.append('Teach proper citation methods for online sources')
        
        # Submission similarity recommendations
        if analysis_results['similar_submissions']:
            recommendations.append('Investigate potential collaboration or copying between students')
        
        return recommendations
    
    def _notify_plagiarism_detection(self, student, plagiarism_check):
        """Send notifications when plagiarism is detected"""
        try:
            # Notify teacher/admin
            admin_message = f"""
            Plagiarism Alert: {plagiarism_check.plagiarism_score:.1f}% similarity detected
            
            Student: {student.name}
            Assignment: {plagiarism_check.assignment_id}
            Subject: {plagiarism_check.subject}
            
            Please review the submission for academic integrity.
            """
            
            # Find teachers (simplified - in real system would find specific subject teacher)
            teachers = User.query.filter_by(role='teacher').limit(3).all()
            
            for teacher in teachers:
                if teacher.email:
                    self.notification_service.send_email(
                        recipient=teacher.email,
                        subject=f'Plagiarism Alert - {student.name}',
                        message=admin_message,
                        user_id=teacher.id,
                        category='academic',
                        priority='high',
                        reference_id=str(plagiarism_check.id)
                    )
            
            # Notify student (educational message)
            student_message = f"""
            Dear {student.name},
            
            Your recent submission for {plagiarism_check.assignment_id} has been flagged for review 
            due to similarity with other sources.
            
            Please ensure all sources are properly cited and your work is original.
            Contact your teacher if you have questions about academic integrity.
            
            Smart School Academic Team
            """
            
            if student.email:
                self.notification_service.send_email(
                    recipient=student.email,
                    subject='Academic Integrity Notice',
                    message=student_message,
                    user_id=student.id,
                    category='academic',
                    priority='medium',
                    reference_id=str(plagiarism_check.id)
                )
            
        except Exception as e:
            logger.error(f"Error sending plagiarism notifications: {str(e)}")
    
    def review_plagiarism_case(self, check_id, reviewer_id, status, notes):
        """Review a plagiarism case"""
        try:
            plagiarism_check = PlagiarismCheck.query.get(check_id)
            if not plagiarism_check:
                return {'success': False, 'message': 'Plagiarism check not found'}
            
            reviewer = User.query.get(reviewer_id)
            if not reviewer or reviewer.role not in ['teacher', 'admin']:
                return {'success': False, 'message': 'Unauthorized reviewer'}
            
            # Update review status
            plagiarism_check.reviewed_by = reviewer_id
            plagiarism_check.review_status = status
            plagiarism_check.review_notes = notes
            plagiarism_check.reviewed_at = datetime.utcnow()
            
            db.session.commit()
            
            # Send notification to student about review outcome
            student = User.query.get(plagiarism_check.student_id)
            if student and student.email:
                outcome_message = f"""
                Dear {student.name},
                
                Your submission for {plagiarism_check.assignment_id} has been reviewed.
                
                Status: {status.title()}
                Reviewer Notes: {notes}
                
                Please contact your teacher if you have any questions.
                
                Smart School Academic Team
                """
                
                self.notification_service.send_email(
                    recipient=student.email,
                    subject='Plagiarism Review Complete',
                    message=outcome_message,
                    user_id=student.id,
                    category='academic',
                    priority='medium',
                    reference_id=str(plagiarism_check.id)
                )
            
            return {
                'success': True,
                'message': 'Plagiarism case reviewed successfully',
                'review_status': status
            }
            
        except Exception as e:
            logger.error(f"Error reviewing plagiarism case: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error reviewing plagiarism case',
                'error': str(e)
            }
    
    def get_plagiarism_statistics(self, academic_term='Term 1', academic_year='2024'):
        """Get plagiarism statistics for reporting"""
        try:
            # Get all checks for the period
            checks = PlagiarismCheck.query.filter_by(
                academic_term=academic_term,
                academic_year=academic_year
            ).all()
            
            if not checks:
                return {
                    'success': True,
                    'statistics': {
                        'total_submissions': 0,
                        'flagged_submissions': 0,
                        'plagiarism_rate': 0.0
                    }
                }
            
            total_submissions = len(checks)
            flagged_submissions = len([c for c in checks if c.is_flagged])
            
            # Calculate statistics
            statistics = {
                'total_submissions': total_submissions,
                'flagged_submissions': flagged_submissions,
                'plagiarism_rate': (flagged_submissions / total_submissions) * 100,
                'average_similarity_score': sum(c.plagiarism_score for c in checks) / total_submissions,
                'by_subject': {},
                'by_review_status': {},
                'trend_analysis': self._calculate_trend_analysis(checks)
            }
            
            # Group by subject
            for check in checks:
                subject = check.subject or 'Unknown'
                if subject not in statistics['by_subject']:
                    statistics['by_subject'][subject] = {'total': 0, 'flagged': 0}
                
                statistics['by_subject'][subject]['total'] += 1
                if check.is_flagged:
                    statistics['by_subject'][subject]['flagged'] += 1
            
            # Group by review status
            for check in checks:
                status = check.review_status
                if status not in statistics['by_review_status']:
                    statistics['by_review_status'][status] = 0
                statistics['by_review_status'][status] += 1
            
            return {
                'success': True,
                'statistics': statistics
            }
            
        except Exception as e:
            logger.error(f"Error generating plagiarism statistics: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating statistics',
                'error': str(e)
            }
    
    def _calculate_trend_analysis(self, checks):
        """Calculate plagiarism trends over time"""
        # Group checks by month
        monthly_data = {}
        
        for check in checks:
            month_key = check.created_at.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'total': 0, 'flagged': 0}
            
            monthly_data[month_key]['total'] += 1
            if check.is_flagged:
                monthly_data[month_key]['flagged'] += 1
        
        # Calculate trend
        trend_data = []
        for month, data in sorted(monthly_data.items()):
            rate = (data['flagged'] / data['total']) * 100 if data['total'] > 0 else 0
            trend_data.append({
                'month': month,
                'total_submissions': data['total'],
                'flagged_submissions': data['flagged'],
                'plagiarism_rate': rate
            })
        
        return trend_data
