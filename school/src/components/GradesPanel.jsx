import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, BarChart3, Calendar, FileText, Target, Star } from 'lucide-react';

const GradesPanel = ({ userRole, currentUser }) => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('current');
  const [loading, setLoading] = useState(true);

  // No sample data; display empty states until backend responds

  useEffect(() => {
    fetchGrades();
  }, [selectedTerm]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/grades/?semester=${selectedTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
        setSummary(data.summary || null);
      } else {
        setGrades([]);
        setSummary(null);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'A-': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'B-': return 'text-yellow-600 bg-yellow-100';
      case 'C+': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Term Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Academic Performance
          </h3>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Semester</option>
            <option value="term1">Semester 1, 2025</option>
            <option value="term2">Semester 2, 2025</option>
          </select>
        </div>

        {/* Overall Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.overall_average}%</div>
              <div className="text-sm text-blue-700">Overall Average</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold px-2 py-1 rounded ${getGradeColor(summary.overall_grade)}`}>
                {summary.overall_grade}
              </div>
              <div className="text-sm text-green-700">Overall Grade</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{summary.overall_position}</div>
              <div className="text-sm text-purple-700">Class Position</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.subjects_count}</div>
              <div className="text-sm text-yellow-700">Courses</div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {grades.map((subject) => (
          <div key={subject.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{subject.subject}</h4>
                <p className="text-sm text-gray-600">Lecturer: {subject.teacher}</p>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(cousre.grade)}`}>
                  {subject.grade}
                </div>
                <div className="flex items-center mt-1">
                  {getTrendIcon(subject.trend)}
                  <span className="text-sm text-gray-600 ml-1">{course.current_average}%</span>
                </div>
              </div>
            </div>

            {/* Position and Class Info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Position: </span>
                <span className="text-sm text-gray-600">{course.position}/{subject.total_students}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Average: </span>
                <span className="text-sm text-gray-600">{course.current_average}%</span>
              </div>
            </div>

            {/* Recent Assessments */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Assessments:</h5>
              <div className="space-y-2">
                {subject.assessments.slice(-3).map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{assessment.type}</span>
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium mr-2">
                        {assessment.score}/{assessment.max_score}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({((assessment.score / assessment.max_score) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Comments */}
            {subject.comments && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Lecturer's Comment:</p>
                <p className="text-sm text-blue-700">{course.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Analysis */}
      {summary && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Performance Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Strengths
              </h5>
              <div className="space-y-2">
                {summary.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                    <Award className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                Areas for Improvement
              </h5>
              <div className="space-y-2">
                {summary.areas_for_improvement.map((area, index) => (
                  <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                    <Target className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teacher Recommendations */}
          <div className="mt-6">
            <h5 className="font-medium text-gray-800 mb-3">lecturer Recommendations:</h5>
            <div className="space-y-2">
              {summary.teacher_recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(summary.instructor_meeting_scheduled || summary.parent_meeting_scheduled) && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Instructor Meeting</span>
              </div>
              <p className="text-sm text-purple-700">{new Date(summary.instructor_meeting_scheduled || summary.parent_meeting_scheduled).toLocaleDateString()}</p>
            </div>
            )}
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">Next Assessment</span>
              </div>
              <p className="text-sm text-orange-700">{new Date(summary.next_assessment_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPanel;
