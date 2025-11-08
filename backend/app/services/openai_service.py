"""
OpenAI Service Module for Smart School System
Handles all AI-powered features with secure API key management
"""

import openai
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    """Service class for OpenAI API interactions"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client with API key from config"""
        try:
            api_key = current_app.config.get('OPENAI_API_KEY')
            if not api_key:
                logger.warning("OpenAI API key not found in configuration")
                return
            
            openai.api_key = api_key
            self.client = openai
            logger.info("OpenAI client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    
    def is_available(self):
        """Check if OpenAI service is available"""
        return self.client is not None and current_app.config.get('OPENAI_API_KEY')
    
    def generate_lesson_plan(self, subject, topic, grade_level, duration=60):
        """Generate AI-powered lesson plan"""
        if not self.is_available():
            return {"error": "OpenAI service not available"}
        
        try:
            prompt = f"""
            Create a comprehensive lesson plan for:
            Subject: {subject}
            Topic: {topic}
            Grade Level: {grade_level}
            Duration: {duration} minutes
            
            Include:
            1. Learning objectives
            2. Materials needed
            3. Lesson structure with timing
            4. Activities and exercises
            5. Assessment methods
            6. Homework assignments
            
            Format as structured JSON.
            """
            
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.7
            )
            
            return {
                "success": True,
                "lesson_plan": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Error generating lesson plan: {str(e)}")
            return {"error": f"Failed to generate lesson plan: {str(e)}"}
    
    def check_plagiarism(self, text, reference_texts=None):
        """AI-powered plagiarism detection"""
        if not self.is_available():
            return {"error": "OpenAI service not available"}
        
        try:
            prompt = f"""
            Analyze the following text for potential plagiarism:
            
            Text to analyze: {text}
            
            Provide:
            1. Plagiarism probability (0-100%)
            2. Suspicious phrases or sentences
            3. Recommendations for improvement
            4. Overall assessment
            
            Format as JSON.
            """
            
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            return {
                "success": True,
                "analysis": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Error in plagiarism check: {str(e)}")
            return {"error": f"Plagiarism check failed: {str(e)}"}
    
    def generate_exam_questions(self, subject, topic, difficulty, num_questions=10):
        """Generate AI-powered exam questions"""
        if not self.is_available():
            return {"error": "OpenAI service not available"}
        
        try:
            prompt = f"""
            Generate {num_questions} exam questions for:
            Subject: {subject}
            Topic: {topic}
            Difficulty: {difficulty}
            
            Include:
            1. Multiple choice questions (4 options each)
            2. Short answer questions
            3. Essay questions
            4. Correct answers and explanations
            
            Format as structured JSON with question types.
            """
            
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.8
            )
            
            return {
                "success": True,
                "questions": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Error generating exam questions: {str(e)}")
            return {"error": f"Failed to generate questions: {str(e)}"}
    
    def analyze_student_performance(self, grades_data, attendance_data):
        """AI analysis of student performance patterns"""
        if not self.is_available():
            return {"error": "OpenAI service not available"}
        
        try:
            prompt = f"""
            Analyze student performance data:
            
            Grades: {grades_data}
            Attendance: {attendance_data}
            
            Provide:
            1. Performance trends
            2. Areas of concern
            3. Recommendations for improvement
            4. Predicted outcomes
            5. Intervention strategies
            
            Format as actionable JSON report.
            """
            
            response = self.client.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.5
            )
            
            return {
                "success": True,
                "analysis": response.choices[0].message.content
            }
            
        except Exception as e:
            logger.error(f"Error analyzing performance: {str(e)}")
            return {"error": f"Performance analysis failed: {str(e)}"}

# Global service instance
openai_service = OpenAIService()
