"""
UNEB-Aligned Lesson Planning Service
AI-assisted lesson planning for Uganda National Examinations Board curriculum
"""
import json
import logging
from datetime import datetime, timedelta
from app import db
from app.models.profile import LessonPlan
from app.models.user import User

logger = logging.getLogger(__name__)

class LessonPlanningService:
    def __init__(self):
        # UNEB curriculum structure
        self.uneb_subjects = {
            'Mathematics': {
                'S1': ['Numbers', 'Algebra', 'Geometry', 'Measurement'],
                'S2': ['Algebra', 'Geometry', 'Statistics', 'Trigonometry'],
                'S3': ['Functions', 'Coordinate Geometry', 'Probability', 'Calculus Basics'],
                'S4': ['Advanced Algebra', 'Trigonometry', 'Statistics', 'Calculus'],
                'S5': ['Pure Mathematics', 'Applied Mathematics', 'Statistics'],
                'S6': ['Advanced Pure Math', 'Mechanics', 'Statistics', 'Decision Math']
            },
            'English Language': {
                'S1': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing Skills'],
                'S2': ['Advanced Grammar', 'Literature Introduction', 'Essay Writing', 'Oral Skills'],
                'S3': ['Literary Analysis', 'Creative Writing', 'Research Skills', 'Public Speaking'],
                'S4': ['Advanced Literature', 'Critical Writing', 'Language Structure', 'Communication'],
                'S5': ['Literature in English', 'Language and Communication', 'Writing Skills'],
                'S6': ['Advanced Literature', 'Linguistics', 'Critical Analysis', 'Research Methods']
            },
            'Physics': {
                'S1': ['Matter', 'Forces', 'Energy', 'Waves'],
                'S2': ['Motion', 'Heat', 'Light', 'Sound'],
                'S3': ['Electricity', 'Magnetism', 'Modern Physics', 'Mechanics'],
                'S4': ['Advanced Mechanics', 'Thermodynamics', 'Electromagnetism', 'Atomic Physics'],
                'S5': ['Classical Mechanics', 'Thermal Physics', 'Waves and Oscillations'],
                'S6': ['Quantum Physics', 'Nuclear Physics', 'Astrophysics', 'Electronics']
            },
            'Chemistry': {
                'S1': ['Matter and States', 'Elements and Compounds', 'Chemical Reactions', 'Acids and Bases'],
                'S2': ['Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Solutions'],
                'S3': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Environmental Chemistry'],
                'S4': ['Advanced Organic', 'Analytical Chemistry', 'Industrial Chemistry', 'Biochemistry'],
                'S5': ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
                'S6': ['Advanced Physical Chemistry', 'Polymer Chemistry', 'Analytical Methods', 'Green Chemistry']
            },
            'Biology': {
                'S1': ['Cell Biology', 'Classification', 'Human Biology', 'Ecology'],
                'S2': ['Plant Biology', 'Animal Biology', 'Genetics', 'Evolution'],
                'S3': ['Physiology', 'Reproduction', 'Biotechnology', 'Environmental Biology'],
                'S4': ['Advanced Physiology', 'Molecular Biology', 'Ecology and Conservation', 'Applied Biology'],
                'S5': ['Cell Biology and Genetics', 'Physiology', 'Ecology and Evolution'],
                'S6': ['Molecular Biology', 'Biotechnology', 'Bioinformatics', 'Research Methods']
            }
        }
        
        # UNEB competencies framework
        self.uneb_competencies = [
            'Critical thinking and problem solving',
            'Communication and collaboration',
            'Creativity and innovation',
            'Digital literacy',
            'Learning to learn',
            'Personal life skills',
            'Citizenship and national identity'
        ]
    
    def create_lesson_plan(self, teacher_id, title, subject, class_level, topic, lesson_date, 
                          duration_minutes=40, period_number=1):
        """
        Create a new lesson plan with AI assistance
        
        Args:
            teacher_id (int): Teacher creating the lesson
            title (str): Lesson title
            subject (str): Subject name
            class_level (str): Class level (S1-S6)
            topic (str): Lesson topic
            lesson_date (date): Date of the lesson
            duration_minutes (int): Lesson duration
            period_number (int): Period number in the day
            
        Returns:
            dict: Creation result with AI suggestions
        """
        try:
            teacher = User.query.get(teacher_id)
            if not teacher or teacher.role != 'teacher':
                return {'success': False, 'message': 'Invalid teacher'}
            
            # Generate AI suggestions for the lesson
            ai_suggestions = self._generate_ai_suggestions(subject, class_level, topic)
            uneb_alignment = self._get_uneb_alignment(subject, class_level, topic)
            
            lesson_plan = LessonPlan(
                teacher_id=teacher_id,
                title=title,
                subject=subject,
                class_level=class_level,
                topic=topic,
                lesson_date=lesson_date,
                duration_minutes=duration_minutes,
                period_number=period_number,
                uneb_objective=uneb_alignment['objective'],
                learning_outcomes=json.dumps(uneb_alignment['outcomes']),
                uneb_competencies=json.dumps(uneb_alignment['competencies']),
                ai_suggestions=json.dumps(ai_suggestions)
            )
            
            db.session.add(lesson_plan)
            db.session.commit()
            
            logger.info(f"Lesson plan created: {title} by teacher {teacher_id}")
            
            return {
                'success': True,
                'message': 'Lesson plan created successfully',
                'lesson_plan': lesson_plan.to_dict(),
                'ai_suggestions': ai_suggestions
            }
            
        except Exception as e:
            logger.error(f"Lesson plan creation error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error creating lesson plan',
                'error': str(e)
            }
    
    def update_lesson_plan(self, lesson_id, teacher_id, updates):
        """Update lesson plan content"""
        try:
            lesson_plan = LessonPlan.query.filter_by(
                id=lesson_id,
                teacher_id=teacher_id
            ).first()
            
            if not lesson_plan:
                return {'success': False, 'message': 'Lesson plan not found'}
            
            # Update allowed fields
            updatable_fields = [
                'title', 'introduction', 'main_content', 'activities', 
                'assessment_methods', 'resources_needed', 'homework'
            ]
            
            for field in updatable_fields:
                if field in updates:
                    if field in ['activities', 'assessment_methods', 'resources_needed']:
                        # These fields are JSON arrays
                        setattr(lesson_plan, field, json.dumps(updates[field]))
                    else:
                        setattr(lesson_plan, field, updates[field])
            
            lesson_plan.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Lesson plan updated successfully',
                'lesson_plan': lesson_plan.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Lesson plan update error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error updating lesson plan',
                'error': str(e)
            }
    
    def complete_lesson(self, lesson_id, teacher_id, effectiveness_rating, reflection):
        """Mark lesson as completed with reflection"""
        try:
            lesson_plan = LessonPlan.query.filter_by(
                id=lesson_id,
                teacher_id=teacher_id
            ).first()
            
            if not lesson_plan:
                return {'success': False, 'message': 'Lesson plan not found'}
            
            lesson_plan.is_completed = True
            lesson_plan.effectiveness_rating = effectiveness_rating
            lesson_plan.teacher_reflection = reflection
            lesson_plan.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Lesson marked as completed',
                'lesson_plan': lesson_plan.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Lesson completion error: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Error completing lesson',
                'error': str(e)
            }
    
    def get_teacher_lesson_plans(self, teacher_id, page=1, per_page=20, subject=None, class_level=None):
        """Get lesson plans for a teacher"""
        try:
            query = LessonPlan.query.filter_by(teacher_id=teacher_id)
            
            if subject:
                query = query.filter_by(subject=subject)
            
            if class_level:
                query = query.filter_by(class_level=class_level)
            
            lesson_plans = query.order_by(LessonPlan.lesson_date.desc()).paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'lesson_plans': [lp.to_dict() for lp in lesson_plans.items],
                'total': lesson_plans.total,
                'pages': lesson_plans.pages,
                'current_page': page
            }
            
        except Exception as e:
            logger.error(f"Error fetching lesson plans: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching lesson plans',
                'error': str(e)
            }
    
    def get_weekly_schedule(self, teacher_id, start_date):
        """Get weekly lesson schedule for teacher"""
        try:
            end_date = start_date + timedelta(days=6)
            
            lesson_plans = LessonPlan.query.filter_by(
                teacher_id=teacher_id
            ).filter(
                LessonPlan.lesson_date >= start_date,
                LessonPlan.lesson_date <= end_date
            ).order_by(LessonPlan.lesson_date.asc(), LessonPlan.period_number.asc()).all()
            
            # Organize by day
            weekly_schedule = {}
            for lesson in lesson_plans:
                day = lesson.lesson_date.strftime('%A')
                if day not in weekly_schedule:
                    weekly_schedule[day] = []
                weekly_schedule[day].append(lesson.to_dict())
            
            return {
                'success': True,
                'weekly_schedule': weekly_schedule,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching weekly schedule: {str(e)}")
            return {
                'success': False,
                'message': 'Error fetching weekly schedule',
                'error': str(e)
            }
    
    def generate_scheme_of_work(self, teacher_id, subject, class_level, term):
        """Generate AI-assisted scheme of work"""
        try:
            if subject not in self.uneb_subjects or class_level not in self.uneb_subjects[subject]:
                return {'success': False, 'message': 'Invalid subject or class level'}
            
            topics = self.uneb_subjects[subject][class_level]
            weeks_in_term = 12  # Typical term length
            
            scheme = []
            for week, topic in enumerate(topics[:weeks_in_term], 1):
                week_plan = {
                    'week': week,
                    'topic': topic,
                    'objectives': self._generate_topic_objectives(subject, class_level, topic),
                    'activities': self._generate_topic_activities(subject, topic),
                    'assessment': self._generate_assessment_methods(subject, topic),
                    'resources': self._generate_required_resources(subject, topic)
                }
                scheme.append(week_plan)
            
            return {
                'success': True,
                'scheme_of_work': {
                    'subject': subject,
                    'class_level': class_level,
                    'term': term,
                    'weeks': scheme,
                    'total_weeks': len(scheme)
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating scheme of work: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating scheme of work',
                'error': str(e)
            }
    
    def _generate_ai_suggestions(self, subject, class_level, topic):
        """Generate AI suggestions for lesson planning"""
        suggestions = []
        
        # Teaching methods suggestions
        if subject in ['Mathematics', 'Physics', 'Chemistry']:
            suggestions.extend([
                'Use practical demonstrations and experiments',
                'Incorporate problem-solving activities',
                'Use visual aids and diagrams',
                'Apply real-world examples'
            ])
        elif subject in ['English Language', 'Literature']:
            suggestions.extend([
                'Use interactive reading activities',
                'Incorporate group discussions',
                'Use multimedia resources',
                'Practice writing exercises'
            ])
        elif subject == 'Biology':
            suggestions.extend([
                'Use specimens and models',
                'Incorporate field work if possible',
                'Use microscopy activities',
                'Connect to environmental issues'
            ])
        
        # Class level specific suggestions
        if class_level in ['S1', 'S2']:
            suggestions.append('Use more visual and hands-on activities')
            suggestions.append('Break down complex concepts into simpler parts')
        elif class_level in ['S3', 'S4']:
            suggestions.append('Encourage critical thinking and analysis')
            suggestions.append('Prepare students for O-level examinations')
        elif class_level in ['S5', 'S6']:
            suggestions.append('Focus on advanced concepts and applications')
            suggestions.append('Prepare for A-level examinations')
            suggestions.append('Encourage independent research')
        
        # Topic-specific suggestions
        suggestions.append(f'Relate {topic} to UNEB examination requirements')
        suggestions.append(f'Use past UNEB questions related to {topic}')
        
        return suggestions
    
    def _get_uneb_alignment(self, subject, class_level, topic):
        """Get UNEB curriculum alignment for the lesson"""
        objective = f"By the end of this lesson, students should be able to understand and apply concepts related to {topic} as per UNEB {class_level} {subject} curriculum."
        
        outcomes = [
            f"Demonstrate understanding of {topic} concepts",
            f"Apply {topic} knowledge to solve problems",
            f"Relate {topic} to real-world situations",
            "Prepare for UNEB examination requirements"
        ]
        
        # Select relevant competencies
        competencies = self.uneb_competencies[:4]  # Use first 4 competencies
        
        return {
            'objective': objective,
            'outcomes': outcomes,
            'competencies': competencies
        }
    
    def _generate_topic_objectives(self, subject, class_level, topic):
        """Generate learning objectives for a topic"""
        return [
            f"Understand the fundamental concepts of {topic}",
            f"Apply {topic} knowledge to solve problems",
            f"Analyze and evaluate {topic} in different contexts",
            f"Demonstrate mastery of {topic} for UNEB assessment"
        ]
    
    def _generate_topic_activities(self, subject, topic):
        """Generate suggested activities for a topic"""
        activities = [
            "Teacher explanation and demonstration",
            "Student practice exercises",
            "Group work and discussions",
            "Individual assignments"
        ]
        
        if subject in ['Mathematics', 'Physics', 'Chemistry']:
            activities.extend([
                "Problem-solving sessions",
                "Practical experiments",
                "Calculator/computer activities"
            ])
        elif subject in ['English Language', 'Literature']:
            activities.extend([
                "Reading and comprehension",
                "Writing exercises",
                "Oral presentations"
            ])
        
        return activities
    
    def _generate_assessment_methods(self, subject, topic):
        """Generate assessment methods for a topic"""
        return [
            "Oral questions and answers",
            "Written exercises",
            "Class tests",
            "Homework assignments",
            "Peer assessment",
            "Self-assessment"
        ]
    
    def _generate_required_resources(self, subject, topic):
        """Generate required resources for a topic"""
        resources = [
            "Textbooks",
            "Whiteboard/Blackboard",
            "Chalk/Markers",
            "Exercise books"
        ]
        
        if subject in ['Mathematics', 'Physics', 'Chemistry']:
            resources.extend([
                "Calculators",
                "Mathematical instruments",
                "Laboratory equipment",
                "Charts and diagrams"
            ])
        elif subject in ['English Language', 'Literature']:
            resources.extend([
                "Dictionaries",
                "Reading materials",
                "Audio/Video equipment",
                "Reference books"
            ])
        elif subject == 'Biology':
            resources.extend([
                "Specimens",
                "Microscopes",
                "Charts and models",
                "Field guides"
            ])
        
        return resources
    
    def get_lesson_analytics(self, teacher_id, subject=None, class_level=None, start_date=None, end_date=None):
        """Get analytics for lesson plans"""
        try:
            query = LessonPlan.query.filter_by(teacher_id=teacher_id)
            
            if subject:
                query = query.filter_by(subject=subject)
            
            if class_level:
                query = query.filter_by(class_level=class_level)
            
            if start_date:
                query = query.filter(LessonPlan.lesson_date >= start_date)
            
            if end_date:
                query = query.filter(LessonPlan.lesson_date <= end_date)
            
            lesson_plans = query.all()
            
            total_lessons = len(lesson_plans)
            completed_lessons = len([lp for lp in lesson_plans if lp.is_completed])
            
            # Calculate average effectiveness rating
            ratings = [lp.effectiveness_rating for lp in lesson_plans if lp.effectiveness_rating]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            # Subject distribution
            subject_distribution = {}
            for lp in lesson_plans:
                if lp.subject not in subject_distribution:
                    subject_distribution[lp.subject] = 0
                subject_distribution[lp.subject] += 1
            
            # Class level distribution
            class_distribution = {}
            for lp in lesson_plans:
                if lp.class_level not in class_distribution:
                    class_distribution[lp.class_level] = 0
                class_distribution[lp.class_level] += 1
            
            return {
                'success': True,
                'analytics': {
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_lessons,
                    'pending_lessons': total_lessons - completed_lessons,
                    'completion_rate': (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
                    'average_effectiveness_rating': round(avg_rating, 2),
                    'subject_distribution': subject_distribution,
                    'class_distribution': class_distribution
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating lesson analytics: {str(e)}")
            return {
                'success': False,
                'message': 'Error generating analytics',
                'error': str(e)
            }
