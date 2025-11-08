import React, { useState, useEffect } from 'react';
import { Fingerprint, UserCheck, Clock, Shield, Settings } from 'lucide-react';

const StudentBiometricPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('biometric');
  const [biometricData, setBiometricData] = useState([]);
  const [enrollingBiometric, setEnrollingBiometric] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'biometric') {
      fetchBiometricData();
    } else if (activeTab === 'attendance') {
      fetchAttendanceLogs();
    }
  }, [activeTab]);

  const fetchBiometricData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/biometric/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBiometricData(data.biometrics || []);
      }
    } catch (error) {
      console.error('Error fetching biometric data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/biometric/logs/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollFingerprint = async (studentId, fingerprintData) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/biometric/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: studentId,
          biometric_hash: fingerprintData.hash,
          template_data: fingerprintData.template,
          finger_position: fingerprintData.finger_position,
          quality_score: fingerprintData.quality_score,
          device_id: 'web-enrollment'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Fingerprint enrolled successfully!');
        fetchBiometricData();
        setEnrollingBiometric(false);
        setSelectedStudent(null);
      } else {
        alert(`❌ Enrollment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll fingerprint');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Biometric Management</h1>
        <p className="text-gray-600 mt-2">Manage student fingerprint enrollment and biometric attendance tracking</p>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Enrolled Students</p>
              <p className="text-2xl font-bold text-green-800">{biometricData.length}</p>
            </div>
            <Fingerprint className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Fingerprints</p>
              <p className="text-2xl font-bold text-blue-800">{biometricData.filter(b => b.is_active).length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Scans Today</p>
              <p className="text-2xl font-bold text-yellow-800">{attendanceLogs.filter(log => new Date(log.scan_timestamp).toDateString() === new Date().toDateString()).length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-purple-800">
                {attendanceLogs.length > 0 ? Math.round((attendanceLogs.filter(l => l.verification_status === 'success').length / attendanceLogs.length) * 100) : 0}%
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'biometric', label: 'Fingerprint Enrollment', icon: Fingerprint },
              { id: 'attendance', label: 'Attendance Logs', icon: Clock },
              { id: 'setup', label: 'Device Setup', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'biometric' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Fingerprint Enrollment</h3>
                <button 
                  onClick={() => setEnrollingBiometric(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Enroll New Fingerprint
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biometricData.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                    No fingerprints enrolled yet
                  </div>
                ) : biometricData.map((bio) => (
                  <div key={bio.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Fingerprint className="w-8 h-8 text-blue-600" />
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bio.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bio.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Student ID: {bio.user_id}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Finger: {bio.finger_position || 'N/A'}</p>
                      <p>Quality: {bio.quality_score}%</p>
                      <p>Verifications: {bio.verification_count}</p>
                      <p>Enrolled: {new Date(bio.enrollment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Biometric Attendance Logs</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceLogs.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No attendance logs</td></tr>
                    ) : attendanceLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.scan_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.location || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.verification_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.verification_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.match_score}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(log.scan_timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Biometric Device Setup & Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Fingerprint Scanner Configuration</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter device name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="FP-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="usb">USB</option>
                        <option value="network">Network</option>
                        <option value="bluetooth">Bluetooth</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select Location</option>
                        <option value="main-gate">Main Gate</option>
                        <option value="library">Library</option>
                        <option value="lab-block">Lab Block</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Device Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Device Connection</span>
                        <span className="text-sm text-green-600">✓ Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fingerprint Sensor</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Database Connection</span>
                        <span className="text-sm text-green-600">✓ Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Scan</span>
                        <span className="text-sm text-gray-600">2 minutes ago</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Test Device
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Enrollment Settings</h4>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Minimum Quality Score</span>
                    <input type="number" defaultValue="70" className="w-20 px-2 py-1 border rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Required Finger Scans</span>
                    <input type="number" defaultValue="3" className="w-20 px-2 py-1 border rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Auto-verify on Scan</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fingerprint Enrollment Modal */}
      {enrollingBiometric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enroll Fingerprint</h2>
              <button
                onClick={() => {
                  setEnrollingBiometric(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const fingerprintData = {
                hash: `FP-${Date.now()}`,
                template: `TEMPLATE-${Math.random().toString(36).substr(2, 9)}`,
                finger_position: formData.get('finger'),
                quality_score: parseInt(formData.get('quality'))
              };
              enrollFingerprint(formData.get('studentId'), fingerprintData);
            }} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Student ID *</label>
                <input
                  name="studentId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Finger Position *</label>
                <select
                  name="finger"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select finger</option>
                  <option value="right_thumb">Right Thumb</option>
                  <option value="right_index">Right Index</option>
                  <option value="right_middle">Right Middle</option>
                  <option value="left_thumb">Left Thumb</option>
                  <option value="left_index">Left Index</option>
                  <option value="left_middle">Left Middle</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Quality Score (%) *</label>
                <input
                  name="quality"
                  type="number"
                  required
                  min="60"
                  max="100"
                  defaultValue="85"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Place finger on the scanner and hold steady until the scan completes.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEnrollingBiometric(false);
                    setSelectedStudent(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Enroll Fingerprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBiometricPanel;
