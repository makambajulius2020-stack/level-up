from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy import and_, or_, func, desc
from app import db
from app.models import (
    CocurricularActivity, CocurricularParticipation, CocurricularEvent,
    CocurricularAttendance, CocurricularAchievement, User, Grade
)
from app.services.ai_analytics_service import AIAnalyticsService
from app.services.notification_service import NotificationService

class CocurricularService:
    def __init__(self):
        self.ai_service = AIAnalyticsService()
        self.notification_service = NotificationService()

    def create_activity(self, activity_data: Dict[str, Any], creator_id: int) -> Dict[str, Any]:
        """Create a new co-curricular activity"""
        try:
            activity = CocurricularActivity(
                name=activity_data['name'],
                description=activity_data.get('description', ''),
                category=activity_data['category'],
                subcategory=activity_data.get('subcategory', ''),
                activity_type=activity_data.get('activity_type', 'regular'),
                schedule_type=activity_data.get('schedule_type', 'weekly'),
                meeting_days=activity_data.get('meeting_days', []),
                start_time=activity_data.get('start_time', ''),
                end_time=activity_data.get('end_time', ''),
                venue=activity_data.get('venue', ''),
                academic_credit=activity_data.get('academic_credit', False),
                credit_hours=activity_data.get('credit_hours', 0.0),
                grade_level_requirement=activity_data.get('grade_level_requirement', []),
                max_participants=activity_data.get('max_participants', 50),
                min_participants=activity_data.get('min_participants', 5),
                skill_level_required=activity_data.get('skill_level_required', 'beginner'),
                prerequisites=activity_data.get('prerequisites', []),
                supervisor_id=activity_data['supervisor_id'],
                assistant_supervisors=activity_data.get('assistant_supervisors', []),
                equipment_needed=activity_data.get('equipment_needed', []),
                budget_allocated=activity_data.get('budget_allocated', 0.0),
                start_date=datetime.fromisoformat(activity_data['start_date']),
                end_date=datetime.fromisoformat(activity_data['end_date']) if activity_data.get('end_date') else None,
                registration_deadline=datetime.fromisoformat(activity_data['registration_deadline']) if activity_data.get('registration_deadline') else None,
                created_by=creator_id
            )
            
            db.session.add(activity)
            db.session.commit()
            
            # Send notification to potential participants
            self._notify_activity_created(activity)
            
            return {
                'success': True,
                'activity': activity.to_dict(),
                'message': 'Co-curricular activity created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def register_student(self, activity_id: int, student_id: int, registration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a student for a co-curricular activity"""
        try:
            activity = CocurricularActivity.query.get(activity_id)
            if not activity:
                return {'success': False, 'error': 'Activity not found'}
            
            # Check if already registered
            existing = CocurricularParticipation.query.filter_by(
                activity_id=activity_id,
                student_id=student_id,
                status='active'
            ).first()
            
            if existing:
                return {'success': False, 'error': 'Student already registered for this activity'}
            
            # Check capacity
            current_participants = CocurricularParticipation.query.filter_by(
                activity_id=activity_id,
                status='active'
            ).count()
            
            if current_participants >= activity.max_participants:
                return {'success': False, 'error': 'Activity is at maximum capacity'}
            
            # Check registration deadline
            if activity.registration_deadline and datetime.utcnow() > activity.registration_deadline:
                return {'success': False, 'error': 'Registration deadline has passed'}
            
            # Check prerequisites
            student = User.query.get(student_id)
            if not self._check_prerequisites(student, activity):
                return {'success': False, 'error': 'Student does not meet prerequisites'}
            
            participation = CocurricularParticipation(
                activity_id=activity_id,
                student_id=student_id,
                role=registration_data.get('role', 'member'),
                participation_level=registration_data.get('participation_level', 'regular'),
                expected_completion_date=activity.end_date
            )
            
            db.session.add(participation)
            
            # Update activity statistics
            activity.total_participants += 1
            activity.active_participants += 1
            
            db.session.commit()
            
            # Send confirmation notification
            self.notification_service.create_notification(
                user_id=student_id,
                title=f'Registered for {activity.name}',
                message=f'You have been successfully registered for {activity.name}. Next session: {activity.start_time}',
                notification_type='activity'
            )
            
            return {
                'success': True,
                'participation': participation.to_dict(),
                'message': 'Student registered successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def _check_prerequisites(self, student: User, activity: CocurricularActivity) -> bool:
        """Check if student meets activity prerequisites"""
        try:
            # Check grade level requirement
            if activity.grade_level_requirement:
                student_grade = getattr(student, 'grade_level', 'S6')
                if student_grade not in activity.grade_level_requirement:
                    return False
            
            # Check skill level (simplified check)
            if activity.skill_level_required == 'advanced':
                # Check if student has participated in similar activities
                similar_participations = CocurricularParticipation.query.join(CocurricularActivity).filter(
                    and_(
                        CocurricularParticipation.student_id == student.id,
                        CocurricularActivity.category == activity.category,
                        CocurricularParticipation.status == 'completed'
                    )
                ).count()
                
                if similar_participations < 1:
                    return False
            
            return True
            
        except Exception:
            return True  # Default to allowing registration

    def mark_attendance(self, participation_id: int, attendance_data: Dict[str, Any], recorder_id: int) -> Dict[str, Any]:
        """Mark attendance for a co-curricular session"""
        try:
            participation = CocurricularParticipation.query.get(participation_id)
            if not participation:
                return {'success': False, 'error': 'Participation record not found'}
            
            # Check if attendance already marked for today
            today = datetime.utcnow().date()
            existing_attendance = CocurricularAttendance.query.filter(
                and_(
                    CocurricularAttendance.participation_id == participation_id,
                    func.date(CocurricularAttendance.attendance_date) == today
                )
            ).first()
            
            if existing_attendance:
                # Update existing attendance
                attendance = existing_attendance
            else:
                attendance = CocurricularAttendance(
                    participation_id=participation_id,
                    attendance_date=datetime.utcnow()
                )
                db.session.add(attendance)
            
            attendance.status = attendance_data['status']
            attendance.arrival_time = datetime.fromisoformat(attendance_data['arrival_time']) if attendance_data.get('arrival_time') else None
            attendance.departure_time = datetime.fromisoformat(attendance_data['departure_time']) if attendance_data.get('departure_time') else None
            attendance.participation_quality = attendance_data.get('participation_quality', '')
            attendance.engagement_level = attendance_data.get('engagement_level', 0.0)
            attendance.behavior_rating = attendance_data.get('behavior_rating', 0.0)
            attendance.supervisor_notes = attendance_data.get('supervisor_notes', '')
            attendance.achievements_today = attendance_data.get('achievements_today', '')
            attendance.areas_for_improvement = attendance_data.get('areas_for_improvement', '')
            attendance.excuse_reason = attendance_data.get('excuse_reason', '')
            attendance.recorded_by = recorder_id
            
            # Update participation statistics
            if attendance.status == 'present':
                participation.attendance_count += 1
            participation.total_sessions += 1
            participation.attendance_percentage = (participation.attendance_count / participation.total_sessions) * 100
            
            db.session.commit()
            
            return {
                'success': True,
                'attendance': attendance.to_dict(),
                'message': 'Attendance marked successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def create_event(self, event_data: Dict[str, Any], creator_id: int) -> Dict[str, Any]:
        """Create a co-curricular event"""
        try:
            event = CocurricularEvent(
                activity_id=event_data['activity_id'],
                name=event_data['name'],
                description=event_data.get('description', ''),
                event_type=event_data['event_type'],
                event_date=datetime.fromisoformat(event_data['event_date']),
                start_time=event_data.get('start_time', ''),
                end_time=event_data.get('end_time', ''),
                venue=event_data.get('venue', ''),
                required_attendance=event_data.get('required_attendance', False),
                max_participants=event_data.get('max_participants'),
                equipment_needed=event_data.get('equipment_needed', []),
                budget_required=event_data.get('budget_required', 0.0),
                external_participants=event_data.get('external_participants', []),
                competition_level=event_data.get('competition_level', ''),
                created_by=creator_id
            )
            
            db.session.add(event)
            db.session.commit()
            
            # Notify activity participants
            self._notify_event_created(event)
            
            return {
                'success': True,
                'event': event.to_dict(),
                'message': 'Event created successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def record_achievement(self, achievement_data: Dict[str, Any], recorder_id: int) -> Dict[str, Any]:
        """Record a co-curricular achievement"""
        try:
            achievement = CocurricularAchievement(
                student_id=achievement_data['student_id'],
                activity_id=achievement_data['activity_id'],
                achievement_type=achievement_data['achievement_type'],
                title=achievement_data['title'],
                description=achievement_data.get('description', ''),
                level=achievement_data['level'],
                category=achievement_data.get('category', ''),
                achievement_date=datetime.fromisoformat(achievement_data['achievement_date']),
                event_context=achievement_data.get('event_context', ''),
                certificate_path=achievement_data.get('certificate_path', ''),
                skill_impact=achievement_data.get('skill_impact', []),
                academic_impact=achievement_data.get('academic_impact', 0.0),
                leadership_impact=achievement_data.get('leadership_impact', 0.0),
                public_recognition=achievement_data.get('public_recognition', False),
                media_coverage=achievement_data.get('media_coverage', []),
                school_announcement=achievement_data.get('school_announcement', False),
                created_by=recorder_id
            )
            
            db.session.add(achievement)
            db.session.commit()
            
            # Send congratulations notification
            self.notification_service.create_notification(
                user_id=achievement.student_id,
                title=f'Achievement Recorded: {achievement.title}',
                message=f'Congratulations! Your achievement in {achievement.activity.name if achievement.activity else "co-curricular activity"} has been recorded.',
                notification_type='achievement'
            )
            
            # Notify parents if applicable
            student = User.query.get(achievement.student_id)
            # Parent notifications removed - feature not available
            # if student and hasattr(student, 'parent_id') and student.parent_id:
            #     self.notification_service.create_notification(
            #         user_id=student.parent_id,
            #         title=f'Achievement: {student.full_name}',
            #         message=f'{student.full_name} achieved: {achievement.title}',
            #         notification_type='achievement'
            #     )
            
            return {
                'success': True,
                'achievement': achievement.to_dict(),
                'message': 'Achievement recorded successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def get_student_activities(self, student_id: int, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get co-curricular activities for a student"""
        try:
            query = CocurricularParticipation.query.filter_by(student_id=student_id)
            
            if status:
                query = query.filter_by(status=status)
            
            participations = query.all()
            
            activities_data = []
            for participation in participations:
                activity_dict = participation.to_dict()
                
                # Add recent attendance
                recent_attendance = CocurricularAttendance.query.filter_by(
                    participation_id=participation.id
                ).order_by(desc(CocurricularAttendance.attendance_date)).limit(5).all()
                
                activity_dict['recent_attendance'] = [att.to_dict() for att in recent_attendance]
                
                # Add upcoming events
                upcoming_events = CocurricularEvent.query.filter(
                    and_(
                        CocurricularEvent.activity_id == participation.activity_id,
                        CocurricularEvent.event_date > datetime.utcnow(),
                        CocurricularEvent.status != 'cancelled'
                    )
                ).order_by(CocurricularEvent.event_date).limit(3).all()
                
                activity_dict['upcoming_events'] = [event.to_dict() for event in upcoming_events]
                
                # Add achievements
                achievements = CocurricularAchievement.query.filter_by(
                    student_id=student_id,
                    activity_id=participation.activity_id
                ).order_by(desc(CocurricularAchievement.achievement_date)).all()
                
                activity_dict['achievements'] = [ach.to_dict() for ach in achievements]
                
                activities_data.append(activity_dict)
            
            return activities_data
            
        except Exception as e:
            return []

    def get_activity_analytics(self, activity_id: int) -> Dict[str, Any]:
        """Get comprehensive analytics for an activity"""
        try:
            activity = CocurricularActivity.query.get(activity_id)
            if not activity:
                return {'success': False, 'error': 'Activity not found'}
            
            # Get all participations
            participations = CocurricularParticipation.query.filter_by(activity_id=activity_id).all()
            
            # Calculate statistics
            total_participants = len(participations)
            active_participants = len([p for p in participations if p.status == 'active'])
            completed_participants = len([p for p in participations if p.status == 'completed'])
            
            # Attendance statistics
            all_attendance = []
            for participation in participations:
                attendance_records = CocurricularAttendance.query.filter_by(
                    participation_id=participation.id
                ).all()
                all_attendance.extend(attendance_records)
            
            total_sessions = len(set(att.attendance_date.date() for att in all_attendance))
            present_count = len([att for att in all_attendance if att.status == 'present'])
            attendance_rate = (present_count / len(all_attendance) * 100) if all_attendance else 0
            
            # Performance metrics
            avg_engagement = sum(att.engagement_level for att in all_attendance if att.engagement_level) / len(all_attendance) if all_attendance else 0
            avg_behavior = sum(att.behavior_rating for att in all_attendance if att.behavior_rating) / len(all_attendance) if all_attendance else 0
            
            # Achievements
            achievements = CocurricularAchievement.query.filter_by(activity_id=activity_id).all()
            achievement_levels = {}
            for achievement in achievements:
                level = achievement.level
                achievement_levels[level] = achievement_levels.get(level, 0) + 1
            
            # Academic impact analysis
            academic_impact = self._analyze_academic_impact(participations)
            
            analytics = {
                'activity': activity.to_dict(),
                'participation_stats': {
                    'total_participants': total_participants,
                    'active_participants': active_participants,
                    'completed_participants': completed_participants,
                    'completion_rate': (completed_participants / total_participants * 100) if total_participants else 0
                },
                'attendance_stats': {
                    'total_sessions': total_sessions,
                    'attendance_rate': attendance_rate,
                    'avg_engagement': avg_engagement,
                    'avg_behavior': avg_behavior
                },
                'achievements': {
                    'total_achievements': len(achievements),
                    'by_level': achievement_levels
                },
                'academic_impact': academic_impact,
                'top_performers': self._get_top_performers(participations),
                'improvement_areas': self._identify_improvement_areas(participations, all_attendance)
            }
            
            return {
                'success': True,
                'analytics': analytics
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _analyze_academic_impact(self, participations: List[CocurricularParticipation]) -> Dict[str, Any]:
        """Analyze the academic impact of co-curricular participation"""
        try:
            impact_data = {
                'participants_with_improvement': 0,
                'average_improvement': 0.0,
                'subjects_affected': {}
            }
            
            total_improvement = 0
            participants_analyzed = 0
            
            for participation in participations:
                if participation.academic_improvement is not None:
                    total_improvement += participation.academic_improvement
                    participants_analyzed += 1
                    
                    if participation.academic_improvement > 0:
                        impact_data['participants_with_improvement'] += 1
            
            if participants_analyzed > 0:
                impact_data['average_improvement'] = total_improvement / participants_analyzed
            
            return impact_data
            
        except Exception:
            return {'participants_with_improvement': 0, 'average_improvement': 0.0}

    def _get_top_performers(self, participations: List[CocurricularParticipation]) -> List[Dict[str, Any]]:
        """Get top performing participants"""
        try:
            performers = []
            
            for participation in participations:
                if participation.performance_rating > 0:
                    performers.append({
                        'student_id': participation.student_id,
                        'student_name': participation.student.full_name if participation.student else 'Unknown',
                        'performance_rating': participation.performance_rating,
                        'attendance_percentage': participation.attendance_percentage,
                        'leadership_score': participation.leadership_score,
                        'achievements_count': len(participation.student.cocurricular_achievements) if participation.student else 0
                    })
            
            # Sort by performance rating
            performers.sort(key=lambda x: x['performance_rating'], reverse=True)
            return performers[:10]  # Top 10
            
        except Exception:
            return []

    def _identify_improvement_areas(self, participations: List[CocurricularParticipation], 
                                  attendance_records: List[CocurricularAttendance]) -> List[str]:
        """Identify areas for improvement"""
        try:
            areas = []
            
            # Check attendance
            if attendance_records:
                present_rate = len([att for att in attendance_records if att.status == 'present']) / len(attendance_records)
                if present_rate < 0.8:
                    areas.append("Improve attendance rate")
            
            # Check engagement
            if attendance_records:
                avg_engagement = sum(att.engagement_level for att in attendance_records if att.engagement_level) / len(attendance_records)
                if avg_engagement < 3.0:
                    areas.append("Increase student engagement")
            
            # Check completion rate
            total_participants = len(participations)
            completed = len([p for p in participations if p.status == 'completed'])
            if total_participants > 0 and (completed / total_participants) < 0.7:
                areas.append("Improve completion rate")
            
            return areas
            
        except Exception:
            return []

    def _notify_activity_created(self, activity: CocurricularActivity):
        """Send notifications about new activity"""
        try:
            # Notify students who might be interested
            if activity.grade_level_requirement:
                students = User.query.filter(
                    and_(
                        User.role == 'student',
                        User.grade_level.in_(activity.grade_level_requirement)
                    )
                ).all()
                
                for student in students:
                    self.notification_service.create_notification(
                        user_id=student.id,
                        title=f'New Activity: {activity.name}',
                        message=f'A new {activity.category} activity is now available for registration. Registration deadline: {activity.registration_deadline.strftime("%Y-%m-%d") if activity.registration_deadline else "TBD"}',
                        notification_type='activity'
                    )
                    
        except Exception as e:
            print(f"Error notifying about new activity: {e}")

    def _notify_event_created(self, event: CocurricularEvent):
        """Send notifications about new event"""
        try:
            # Notify activity participants
            participations = CocurricularParticipation.query.filter_by(
                activity_id=event.activity_id,
                status='active'
            ).all()
            
            for participation in participations:
                self.notification_service.create_notification(
                    user_id=participation.student_id,
                    title=f'New Event: {event.name}',
                    message=f'A new {event.event_type} has been scheduled for {event.activity.name if event.activity else "your activity"}. Date: {event.event_date.strftime("%Y-%m-%d")}',
                    notification_type='event'
                )
                
        except Exception as e:
            print(f"Error notifying about new event: {e}")

    def get_available_activities(self, student_id: int) -> List[Dict[str, Any]]:
        """Get activities available for student registration"""
        try:
            student = User.query.get(student_id)
            if not student:
                return []
            
            # Get activities student is not already registered for
            registered_activity_ids = db.session.query(CocurricularParticipation.activity_id).filter_by(
                student_id=student_id,
                status='active'
            ).subquery()
            
            available_activities = CocurricularActivity.query.filter(
                and_(
                    CocurricularActivity.status == 'active',
                    ~CocurricularActivity.id.in_(registered_activity_ids),
                    or_(
                        CocurricularActivity.registration_deadline.is_(None),
                        CocurricularActivity.registration_deadline > datetime.utcnow()
                    )
                )
            ).all()
            
            # Filter by prerequisites and capacity
            suitable_activities = []
            for activity in available_activities:
                if self._check_prerequisites(student, activity):
                    current_participants = CocurricularParticipation.query.filter_by(
                        activity_id=activity.id,
                        status='active'
                    ).count()
                    
                    if current_participants < activity.max_participants:
                        activity_dict = activity.to_dict()
                        activity_dict['available_spots'] = activity.max_participants - current_participants
                        suitable_activities.append(activity_dict)
            
            return suitable_activities
            
        except Exception as e:
            return []

    def update_participation_assessment(self, participation_id: int, assessment_data: Dict[str, Any], 
                                      assessor_id: int) -> Dict[str, Any]:
        """Update participant assessment scores"""
        try:
            participation = CocurricularParticipation.query.get(participation_id)
            if not participation:
                return {'success': False, 'error': 'Participation record not found'}
            
            participation.performance_rating = assessment_data.get('performance_rating', participation.performance_rating)
            participation.leadership_score = assessment_data.get('leadership_score', participation.leadership_score)
            participation.teamwork_score = assessment_data.get('teamwork_score', participation.teamwork_score)
            participation.commitment_score = assessment_data.get('commitment_score', participation.commitment_score)
            participation.supervisor_feedback = assessment_data.get('supervisor_feedback', participation.supervisor_feedback)
            participation.skills_developed = assessment_data.get('skills_developed', participation.skills_developed)
            participation.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Send feedback notification to student
            self.notification_service.create_notification(
                user_id=participation.student_id,
                title=f'Assessment Update: {participation.activity.name}',
                message='Your co-curricular activity assessment has been updated. Check your progress!',
                notification_type='assessment'
            )
            
            return {
                'success': True,
                'participation': participation.to_dict(),
                'message': 'Assessment updated successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
