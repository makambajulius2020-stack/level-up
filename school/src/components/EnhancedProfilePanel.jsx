import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Camera, Upload, Save, Edit3, Mail, Phone, MapPin, Calendar, 
  School, BookOpen, Users, Settings, Shield, Eye, EyeOff, Trash2,
  Check, X, AlertCircle, Star, Award, Clock, Globe
} from 'lucide-react';

const EnhancedProfilePanel = ({ userRole, currentUser, darkMode = false }) => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);

  // Dark mode utility classes
  const containerBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/enhanced-profiles/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setUser(data.user);
        setFormData({
          ...data.profile,
          full_name: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/enhanced-profiles/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        await fetchProfile();
        alert('Profile photo updated successfully!');
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/enhanced-profiles/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${containerBg} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className={`h-8 ${cardBg} rounded mb-6`}></div>
            <div className={`h-64 ${cardBg} rounded-xl mb-6`}></div>
            <div className={`h-96 ${cardBg} rounded-xl`}></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className={`min-h-screen ${containerBg} p-6`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>My Profile</h1>
            <p className={`${textSecondary} mt-1`}>Manage your personal information and preferences</p>
          </div>
          
          <div className="flex gap-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className={`flex items-center gap-2 px-4 py-2 border ${borderColor} rounded-lg ${hoverBg} transition-colors`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <div className={`${cardBg} rounded-2xl shadow-xl border p-8`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Photo Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                {user?.full_name || 'User Name'}
              </h2>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className={`text-sm ${textSecondary} capitalize`}>{user?.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className={`text-sm ${textSecondary}`}>{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span className={`text-sm ${textSecondary}`}>{user.phone}</span>
                  </div>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-6 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className={`text-lg font-bold ${textPrimary}`}>
                    {profile?.class_level || profile?.department || 'N/A'}
                  </div>
                  <div className={`text-xs ${textMuted}`}>
                    {userRole === 'student' ? 'Class' : 'Department'}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${textPrimary}`}>
                    {new Date(profile?.created_at || Date.now()).getFullYear()}
                  </div>
                  <div className={`text-xs ${textMuted}`}>Member Since</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold text-green-600`}>Active</div>
                  <div className={`text-xs ${textMuted}`}>Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Info */}
        <div className={`${cardBg} border rounded-xl p-4`}>
          <h4 className={`font-medium ${textPrimary} mb-2`}>🚀 Enhanced Profile Features</h4>
          <div className={`text-sm ${textSecondary} grid grid-cols-1 md:grid-cols-2 gap-2`}>
            <p>• ✅ Profile photo upload with automatic resizing</p>
            <p>• 📱 Mobile-optimized interface</p>
            <p>• 🔒 Secure data management</p>
            <p>• 🌙 Dark mode support</p>
            <p>• 📊 Role-based profile fields</p>
            <p>• 🔄 Real-time updates</p>
            <p>• 📞 Emergency contact management</p>
            <p>• 🎓 Academic information tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfilePanel;
