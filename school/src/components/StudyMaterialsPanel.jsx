import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Download, Eye, Search, Filter, Star, 
  FileText, Video, Headphones, Image, Link, 
  Clock, Users, Award, TrendingUp, Plus, Heart
} from 'lucide-react';
import apiService from '../services/api';

const StudyMaterialsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch materials from backend
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try library books endpoint as study materials
      const response = await apiService.get('/library/books');
      if (response.success && response.data) {
        // Transform library books to materials format
        const transformedMaterials = response.data.map(book => ({
          id: book.id,
          title: book.title,
          subject: book.subject || 'General',
          author: book.author,
          description: book.description || 'No description available',
          type: 'pdf',
          tags: book.category ? [book.category] : [],
          estimatedTime: '30 min',
          difficulty: 'Intermediate',
          rating: 4.5,
          downloads: 0,
          views: 0,
          uploadDate: new Date(book.created_at).toLocaleDateString(),
          isFavorite: false,
          isRecommended: false
        }));
        setMaterials(transformedMaterials);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Load materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const subjects = ['All Resources', 'Study Guides', 'Past Papers', 'Reference Materials'];
  const categories = [
    { id: 'all', label: 'All Materials', count: materials.length },
    { id: 'pdf', label: 'Documents', count: 0 },
    { id: 'video', label: 'Videos', count: 0 },
    { id: 'audio', label: 'Audio', count: 0 },
    { id: 'interactive', label: 'Interactive', count: 0 },
    { id: 'favorites', label: 'Favorites', count: 0 },
    { id: 'recommended', label: 'Recommended', count: 0 }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />;
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'audio': return <Headphones className="w-5 h-5 text-green-600" />;
      case 'interactive': return <Image className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = activeCategory === 'all' || 
                           material.type === activeCategory ||
                           (activeCategory === 'favorites' && material.isFavorite) ||
                           (activeCategory === 'recommended' && material.isRecommended);
    
    const matchesSubject = selectedSubject === 'all' || 
                          selectedSubject === 'All Subjects' || 
                          material.subject === selectedSubject;
    
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSubject && matchesSearch;
  });

  const renderMaterialCard = (material) => (
    <div key={material.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon(material.type)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
            <p className="text-sm text-gray-600">{material.subject} • {material.author}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {material.isRecommended && (
            <Award className="w-5 h-5 text-yellow-500" title="Recommended" />
          )}
          <button className={`p-1 rounded ${material.isFavorite ? 'text-red-500' : 'text-gray-400'}`}>
            <Heart className="w-5 h-5" fill={material.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4">{material.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {material.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">{material.estimatedTime}</span>
        </div>
        <div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(material.difficulty)}`}>
            {material.difficulty}
          </span>
        </div>
        {material.size && (
          <div className="text-gray-600">Size: {material.size}</div>
        )}
        {material.pages && (
          <div className="text-gray-600">{material.pages} pages</div>
        )}
        {material.duration && (
          <div className="text-gray-600">Duration: {material.duration}</div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{material.rating}</span>
          </div>
          {material.downloads && (
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>{material.downloads}</span>
            </div>
          )}
          {material.views && (
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{material.views}</span>
            </div>
          )}
          {material.plays && (
            <div className="flex items-center space-x-1">
              <Headphones className="w-4 h-4" />
              <span>{material.plays}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500">{material.uploadDate}</span>
      </div>

      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${darkMode ? 'text-white' : ''}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Study Materials</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Access comprehensive learning resources for all your subjects</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.slice(1).map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            {/* Only show upload button for teachers and admins */}
            {userRole !== 'student' && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{category.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeCategory === category.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(renderMaterialCard)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No materials match "${searchTerm}"` 
              : materials.length === 0 
                ? 'No materials have been uploaded yet. Click "Upload Material" to add your first resource!' 
                : 'No materials available in this category'}
          </p>
          <button 
            onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
              setSelectedSubject('all');
              fetchMaterials();
            }}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Browse All Materials'}
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{materials.length}</div>
          <div className="text-sm text-gray-600">Total Materials</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{materials.filter(m => m.isFavorite).length}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{materials.filter(m => m.isRecommended).length}</div>
          <div className="text-sm text-gray-600">Recommended</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Upload Material Modal - Only for teachers and admins */}
      {showUploadModal && userRole !== 'student' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Upload Study Material</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Title</label>
                  <input
                    type="text"
                    placeholder="Enter material title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a subject</option>
                    {subjects.slice(1).map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select type</option>
                    <option value="pdf">Document (PDF)</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="interactive">Interactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe the material"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., algebra, equations, practice"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input type="file" className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, MP4, MP3 up to 50MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialsPanel;
