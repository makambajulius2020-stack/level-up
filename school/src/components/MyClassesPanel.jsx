import React, { useState } from 'react';
import { 
  Users, BookOpen, Clock, Calendar, MessageSquare, FileText, 
  TrendingUp, Award, AlertTriangle, CheckCircle, Eye, Plus,
  Search, Filter, Download, Upload, BarChart3, Target
} from 'lucide-react';

const MyClassesPanel = ({ userRole, currentUser, activeTab }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeView, setActiveView] = useState(activeTab === 'class-schedules' ? 'schedules' : 'overview');

  // Local classes state so we can add new classes from this panel
  const [classes, setClasses] = useState([]);

  // Create Class modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    meetingLink: '',
    schedule: '',
    students: 0
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    const now = new Date();
    const classItem = {
      id: Date.now(),
      name: newClass.name || 'Untitled Class',
      subject: newClass.subject || 'Subject',
      meetingLink: newClass.meetingLink || 'https://meet.example.com/class',
      schedule: newClass.schedule || 'Mon 10:00-11:00',
      students: Number(newClass.students) || 0,
      trend: 'flat',
      nextClass: now.toLocaleDateString(),
      performance: { average: 0, attendance: 0, lastTest: 0 },
      recentActivity: [],
      upcomingEvents: []
    };
    setClasses(prev => [classItem, ...prev]);
    setShowCreateModal(false);
    setNewClass({ name: '', subject: '', meetingLink: '', schedule: '', students: 0 });
  };

  const getPerformanceColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'test': return Award;
      case 'lab': return BookOpen;
      case 'attendance': return Users;
      default: return FileText;
    }
  };

  const renderClassSchedules = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        Online Class Schedules
      </h3>
      
      {/* Schedule Navigation */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'overview' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Online Classes Overview
        </button>
        <button 
          onClick={() => setActiveView('schedules')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeView === 'schedules' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Schedules
        </button>
      </div>

      {/* Schedule Content */}
      <div className="space-y-4">
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium mb-2">No Online Schedule Data Available</h4>
          <p className="text-sm">Online class schedules will be displayed here once they are configured.</p>
        </div>
      </div>
    </div>
  );


  const renderClassOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Online Classes</h2>
            <p className="text-gray-600">Access your virtual classes, recordings, and learning resources</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Join Online Class
          </button>
        </div>
      </div>

      {/* Empty State - Card grid removed */}
      {classes.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Online Classes Found</h3>
            <p className="text-gray-600 mb-4">You don't have any online classes enrolled yet. Join a class to get started with e-learning.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderClassDetails = () => {
    if (!selectedClass) return null;

    return (
      <div className="space-y-6">
        {/* Class Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
              <p className="text-gray-600">{selectedClass.subject} • {selectedClass.level} • Online</p>
            </div>
            <button 
              onClick={() => setSelectedClass(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{selectedClass.students}</div>
              <div className="text-sm text-blue-700">Students</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{selectedClass.performance.average}%</div>
              <div className="text-sm text-green-700">Class Average</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{selectedClass.performance.attendance}%</div>
              <div className="text-sm text-purple-700">Attendance</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{selectedClass.performance.lastTest}%</div>
              <div className="text-sm text-orange-700">Last Test</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Online Class Schedule
            </h3>
            <div className="space-y-3">
              {selectedClass.schedule.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{session.day}</span>
                  <span className="text-gray-600">{session.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {selectedClass.upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-600">{event.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{event.date}</div>
                    <div className="text-xs text-gray-600">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {selectedClass.recentActivity.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 rounded-full p-2">
                      <ActivityIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.submitted && (
                      <div className="text-sm font-medium text-gray-900">
                        {activity.submitted}/{activity.total} submitted
                      </div>
                    )}
                    {activity.average && (
                      <div className="text-sm text-gray-600">Average: {activity.average}%</div>
                    )}
                    {activity.present && (
                      <div className="text-sm font-medium text-gray-900">
                        {activity.present}/{activity.total} present
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-800">Mark Attendance</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
              <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-800">Create Assignment</span>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-800">Grade Work</span>
            </button>
            <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <MessageSquare className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-800">Message Class</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeView === 'schedules' ? renderClassSchedules() : (selectedClass ? renderClassDetails() : renderClassOverview())}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Join Online Class</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Online Class Name</label>
                <input value={newClass.name} onChange={e => setNewClass(c => ({...c, name: e.target.value}))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Computer Science 101" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Subject</label>
                  <input value={newClass.subject} onChange={e => setNewClass(c => ({...c, subject: e.target.value}))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Meeting Link</label>
                  <input value={newClass.meetingLink} onChange={e => setNewClass(c => ({...c, meetingLink: e.target.value}))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., https://meet.example.com/class" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Schedule</label>
                  <input value={newClass.schedule} onChange={e => setNewClass(c => ({...c, schedule: e.target.value}))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Mon 10:00-11:00" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Students</label>
                  <input type="number" value={newClass.students} onChange={e => setNewClass(c => ({...c, students: e.target.value}))} className="w-full border rounded-lg px-3 py-2" placeholder="0" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClassesPanel;
