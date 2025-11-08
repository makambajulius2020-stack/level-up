import React, { useState } from 'react';
import { 
  BookOpen, Download, Upload, Search, Filter, Plus, Eye, Star, 
  FileText, Video, Image, Headphones, Link, Folder, Calendar,
  Users, Award, Clock, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';

const TeachingResourcesPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const resourceCategories = [
    { id: 'library', label: 'Resource Library', icon: BookOpen },
    { id: 'my-resources', label: 'My Resources', icon: Folder },
    { id: 'shared', label: 'Shared Resources', icon: Users },
    { id: 'create', label: 'Create Resource', icon: Plus }
  ];

  const resources = [];

  const myResources = [];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'image': return Image;
      case 'interactive': return Link;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'document': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-red-600 bg-red-100';
      case 'audio': return 'text-green-600 bg-green-100';
      case 'image': return 'text-purple-600 bg-purple-100';
      case 'interactive': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const renderResourceLibrary = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Accounting">Accounting</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Economics">Economics</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Human Resource Management">Human Resource Management</option>
            <option value="Information Technology">Information Technology</option>
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
            <option value="Graduate">Graduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          return (
            <div key={resource.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src={resource.thumbnail} 
                  alt={resource.title}
                  className="w-full h-32 object-cover"
                />
                <div className={`absolute top-2 right-2 p-2 rounded-full ${getTypeColor(resource.type)}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{resource.title}</h3>
                  <div className="flex items-center ml-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">{resource.rating}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{resource.subject} • {resource.level}</span>
                  <span>{resource.size}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Preview</span>
                    </button>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-800">
                      <Download className="w-4 h-4" />
                      <span className="text-xs">Download</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{resource.downloads} downloads</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMyResources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">My Teaching Resources</h3>
          <button 
            onClick={() => setActiveTab('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {myResources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{resource.title}</h4>
                  <p className="text-sm text-gray-600">{resource.subject} • {resource.level}</p>
                  <p className="text-xs text-gray-500">Created: {resource.created}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{resource.views} views</p>
                  <p className="text-xs text-gray-600">{resource.downloads} downloads</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  resource.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {resource.status}
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreateResource = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Create New Teaching Resource</h3>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        alert(`✅ Resource Created Successfully!\n\nTitle: ${formData.get('title') || 'New Resource'}\nCourse: ${formData.get('subject')}\nLevel: ${formData.get('level')}\nType: ${formData.get('type')}\n\nYour resource has been published!`);
      }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title</label>
            <input
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select name="subject" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select Course</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Accounting">Accounting</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Economics">Economics</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Human Resource Management">Human Resource Management</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Law">Law</option>
              <option value="Nursing">Nursing</option>
              <option value="Public Health">Public Health</option>
              <option value="Education">Education</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
            <select name="level" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select Level</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
              <option value="Graduate">Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
            <select name="type" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select Type</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your resource and how it can be used"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., calculus, integration, UNEB, practical"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, MP4, MP3, ZIP files up to 50MB</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="share" className="rounded" />
            <label htmlFor="share" className="text-sm text-gray-700">Share with other teachers</label>
          </div>
          
          <div className="flex space-x-3">
            <button 
              type="button" 
              onClick={() => {
                alert('💾 Resource saved as draft!\n\nYou can continue editing later from "My Resources".');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Publish Resource
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Teaching Resources</h1>
        <p className="text-gray-600">Access, create, and share educational resources with your colleagues</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {resourceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'library' && renderResourceLibrary()}
      {activeTab === 'my-resources' && renderMyResources()}
      {activeTab === 'shared' && renderResourceLibrary()}
      {activeTab === 'create' && renderCreateResource()}
    </div>
  );
};

export default TeachingResourcesPanel;
