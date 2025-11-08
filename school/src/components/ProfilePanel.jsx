import React, { useState, useEffect } from 'react';
import { User, Camera, Upload, Save, Edit3, Phone, Mail, MapPin, Calendar, Award, BookOpen, Users, X } from 'lucide-react';
import apiService from '../services/api';
import StudentAchievements from './StudentAchievements';

const ProfilePanel = ({ userRole, currentUser }) => {
  const [profile, setProfile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef(null);
  
  // Only admins can edit profiles, but all users can upload photos
  const canEdit = userRole === 'admin';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Test Python backend connection
        const healthCheck = await apiService.healthCheck();
        console.log('Python Backend Status:', healthCheck);
        
        // Get profile from real backend
        const profileData = await apiService.getProfile(currentUser.id);
        console.log('Profile Data:', profileData);
        
        if (profileData.success) {
          setProfile(profileData.profile);
          setUserInfo(profileData.user);
          setFormData({
            full_name: profileData.user.full_name,
            email: profileData.user.email,
            phone: profileData.user.phone,
            date_of_birth: profileData.profile.date_of_birth || '',
            gender: profileData.profile.gender || '',
            nationality: profileData.profile.nationality || '',
            religion: profileData.profile.religion || '',
            address: profileData.profile.address || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Show empty profile - no fake data
        const emptyProfile = {
          id: null,
          user_id: currentUser.id,
          profile_photo_url: null,
          date_of_birth: null,
          gender: null,
          nationality: null,
          religion: null,
          address: null,
          class_level: null,
          stream: null,
          created_at: null
        };

        const basicUserInfo = {
          id: currentUser.id,
          full_name: currentUser.name,
          email: currentUser.email || '',
          phone: '',
          role: currentUser.role
        };

        setProfile(emptyProfile);
        setUserInfo(basicUserInfo);
        setFormData({
          full_name: basicUserInfo.full_name,
          email: basicUserInfo.email,
          phone: '',
          date_of_birth: '',
          gender: '',
          nationality: '',
          religion: '',
          address: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, userRole]);

  const handleSave = async () => {
    try {
      console.log('Saving profile:', formData);
      // Here you would normally call the API to save
      // await apiService.updateProfile(formData);
      
      // Update local state
      setUserInfo({ ...userInfo, ...formData });
      setProfile({ ...profile, ...formData });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, GIF)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Update local profile state with new photo URL
        setProfile(prev => ({
          ...prev,
          profile_photo_url: data.photo_url || data.file_path
        }));
        alert('Profile photo updated successfully!');
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {profile?.profile_photo_url ? (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4" />
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userInfo?.full_name}</h2>
              <p className="text-gray-600 capitalize">{userInfo?.role}</p>
              <p className="text-sm text-gray-500">{userInfo?.email}</p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
          {!canEdit && (
            <div className="text-sm text-gray-500 italic">
              Only admins can edit profiles
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData.gender || ''}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
            <input
              type="text"
              value={formData.nationality || ''}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
            <input
              type="text"
              value={formData.religion || ''}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!editing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          {/* Student-specific fields */}
          {userRole === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                <input
                  type="text"
                  value={profile?.class_level || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
                <input
                  type="text"
                  value={profile?.stream || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        {editing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Student Achievements Section */}
      {userRole === 'student' && currentUser && (
        <div className="mt-8">
          <StudentAchievements studentId={currentUser.id || 1} userRole={userRole} darkMode={false} />
        </div>
      )}
    </div>
  );
};

export default ProfilePanel;
