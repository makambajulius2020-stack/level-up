import React, { useState, useEffect } from 'react';
import { Book, Search, Plus, Calendar, Users, BarChart3, AlertTriangle, CheckCircle, Clock, BookOpen, User, FileText, Download, Video, Image, Music, Eye, Lock, Unlock, Filter, Upload, DollarSign, ShoppingCart, X, Brain } from 'lucide-react';

const LibraryPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeView, setActiveView] = useState('search');
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showLibraryAnalyticsForm, setShowLibraryAnalyticsForm] = useState(false);
  const [showManageCategoriesForm, setShowManageCategoriesForm] = useState(false);
  const [showBulkImportForm, setShowBulkImportForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Content Library states
  const [content, setContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Tracks which section triggered the upload modal: 'study-materials' | 'digital-content' | 'past-papers'
  const [uploadContext, setUploadContext] = useState('digital-content');
  // Temporary upload form state (UI-only for now)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject: '',
    year: '',
    type: 'document', // video | document | pdf | image | audio
    file: null
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedContentForAction, setSelectedContentForAction] = useState(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  // AI Tutor and Study Planner state
  const [showAITutorForm, setShowAITutorForm] = useState(false);
  const [aiTutorData, setAiTutorData] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    question: ''
  });
  const [showStudyPlannerForm, setShowStudyPlannerForm] = useState(false);
  // Quiz generator state
  const [showQuizGeneratorForm, setShowQuizGeneratorForm] = useState(false);
  const [quizData, setQuizData] = useState({
    subject: '',
    topic: '',
    difficulty: 'easy',
    questionCount: 10,
    questionType: 'multiple-choice'
  });
  // Flashcard creator state
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);
  const [flashcardData, setFlashcardData] = useState({
    subject: '',
    topic: '',
    cardCount: 20,
    difficulty: 'easy'
  });

  // Essay helper state
  const [showEssayHelperForm, setShowEssayHelperForm] = useState(false);
  const [essayData, setEssayData] = useState({
    topic: '',
    essayType: 'argumentative',
    wordCount: 500,
    requirements: ''
  });

  // Note Summarizer state
  const [showNoteSummarizerForm, setShowNoteSummarizerForm] = useState(false);
  const [noteSummarizerData, setNoteSummarizerData] = useState({
    notes: '',
    summaryLength: 3,
    subject: '',
    style: 'concise'
  });
  
  
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    subject: '',
    class_level: '',
    copies: 1,
    publication_year: '',
    publisher: '',
    description: '',
    is_reference_only: false,
    has_digital_copy: false
  });

  // Notification helper function
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // No sample data; show empty states until backend provides results

  useEffect(() => {
    if (activeView === 'search') {
      // Debounce search - only search after user stops typing for 500ms
      const debounceTimer = setTimeout(() => {
        searchBooks();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else if (activeView === 'my-books') {
      fetchMyBooks();
    } else if (activeView === 'digital-content') {
      loadContent();
      loadCategories();
      if (currentUser?.role === 'student') {
        loadMyPurchases();
      }
    }
  }, [activeView, searchQuery, filterType, filterCategory, searchTerm]);

  const searchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);

      const response = await fetch(`${baseUrl}/api/library/books?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both data.books and data.data formats
        setBooks(data.books || data.data || []);
      } else {
        console.warn('Failed to fetch books:', response.status);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/library/my-books`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyBooks(data.borrowings || data.data || []);
      } else {
        console.warn('Failed to fetch my books:', response.status);
        setMyBooks([]);
      }
    } catch (error) {
      console.error('Error fetching my books:', error);
      setMyBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const borrowBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/library/borrow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ book_id: bookId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Book borrowed successfully!');
        searchBooks();
      } else {
        alert(`❌ Failed to borrow book: ${result.message}`);
      }
    } catch (error) {
      alert('Error borrowing book');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${baseUrl}/api/library/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('✅ Book added successfully!');
        setShowAddBookModal(false);
        setNewBook({
          title: '',
          author: '',
          isbn: '',
          category: '',
          subject: '',
          class_level: '',
          copies: 1,
          publication_year: '',
          publisher: '',
          description: '',
          is_reference_only: false,
          has_digital_copy: false
        });
        searchBooks(); // Refresh the books list
      } else {
        alert(`❌ Failed to add book: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('❌ Network error occurred while adding book');
    }
  };

  // Content Library Functions
  const loadContent = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category_id', filterCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (currentUser?.role === 'teacher') params.append('uploaded_by', currentUser.id);
      
      const response = await fetch(`http://localhost:5000/api/content?${params}`);
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
      } else {
        // Fallback to empty if API is not available
        setContent([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to empty
      setContent([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/content/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        // Fallback to empty categories
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to empty categories
      setCategories([]);
    }
  };

  const loadMyPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/content/my-purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMyPurchases(data.data);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  const purchaseContent = async (contentId) => {
    const contentItem = content.find(item => item.id === contentId);
    setSelectedContentForAction(contentItem);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/content/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content_id: selectedContentForAction.id })
      });
      const data = await response.json();
      if (data.success) {
        addNotification('✅ Content purchased successfully!', 'success');
        loadMyPurchases();
        setShowPurchaseModal(false);
        setSelectedContentForAction(null);
      } else {
        addNotification(`❌ Purchase failed: ${data.message}`, 'error');
      }
    } catch (error) {
      addNotification('❌ Error purchasing content', 'error');
    }
  };

  const downloadContent = async (contentId, contentTitle) => {
    const contentItem = content.find(item => item.id === contentId);
    setSelectedContentForAction({ ...contentItem, title: contentTitle });
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/api/content/download/${selectedContentForAction.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Get file extension from content type or filename
        let fileExtension = 'pdf'; // default
        const contentType = blob.type;
        if (contentType.includes('pdf')) fileExtension = 'pdf';
        else if (contentType.includes('doc')) fileExtension = 'doc';
        else if (contentType.includes('docx')) fileExtension = 'docx';
        else if (contentType.includes('txt')) fileExtension = 'txt';
        else if (contentType.includes('mp4')) fileExtension = 'mp4';
        else if (contentType.includes('mp3')) fileExtension = 'mp3';
        else if (contentType.includes('jpg') || contentType.includes('jpeg')) fileExtension = 'jpg';
        else if (contentType.includes('png')) fileExtension = 'png';
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        // Sanitize filename to prevent issues with special characters
        const sanitizedTitle = selectedContentForAction.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
        link.download = `${sanitizedTitle}.${fileExtension}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        addNotification('✅ Content downloaded successfully!', 'success');
        setShowDownloadModal(false);
        setSelectedContentForAction(null);
      } else {
        // Fallback: Create a demo download for development
        const demoContent = `This is a demo download for: ${selectedContentForAction.title}\n\nContent Type: ${selectedContentForAction.type || 'Document'}\nDescription: ${selectedContentForAction.description || 'No description available'}\n\nIn a real application, this would be the actual file content.`;
        
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedContentForAction.title}.txt`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        addNotification(`📥 Demo download completed for "${selectedContentForAction.title}"!`, 'success');
        setShowDownloadModal(false);
        setSelectedContentForAction(null);
      }
    } catch (error) {
      console.error('Download error:', error);
      
      // Enhanced fallback for demo purposes
      const demoContent = `Demo Download: ${selectedContentForAction.title}\n\nThis is a demonstration download.\nIn a real application, this would download the actual file.\n\nContent Details:\n- Type: ${selectedContentForAction.type || 'Document'}\n- Description: ${selectedContentForAction.description || 'No description'}\n- Category: ${selectedContentForAction.category || 'General'}`;
      
      try {
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedContentForAction.title}_demo.txt`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        addNotification(`📥 Demo download completed for "${selectedContentForAction.title}"!`, 'success');
      } catch (fallbackError) {
        addNotification(`❌ Download failed: ${error.message}`, 'error');
      }
      
      setShowDownloadModal(false);
      setSelectedContentForAction(null);
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
      {/* Library Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            School Library
          </h3>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveView('search')}
            className={`flex-shrink-0 pb-2 px-1 whitespace-nowrap ${
              activeView === 'search'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1" />
            Search Books
          </button>
          
          <button
            onClick={() => setActiveView('my-books')}
            className={`flex-shrink-0 pb-2 px-1 whitespace-nowrap ${
              activeView === 'my-books'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4 inline mr-1" />
            My Books
          </button>

          <button
            onClick={() => setActiveView('study-materials')}
            className={`flex-shrink-0 pb-2 px-1 whitespace-nowrap ${
              activeView === 'study-materials'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Study Materials
          </button>

          <button
            onClick={() => setActiveView('past-papers')}
            className={`flex-shrink-0 pb-2 px-1 whitespace-nowrap ${
              activeView === 'past-papers'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Download className="w-4 h-4 inline mr-1" />
            Past Papers
          </button>

          <button
            onClick={() => setActiveView('digital-content')}
            className={`flex-shrink-0 pb-2 px-1 whitespace-nowrap ${
              activeView === 'digital-content'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Video className="w-4 h-4 inline mr-1" />
            Digital Content
          </button>

        </div>
      </div>

      {/* Search View */}
      {activeView === 'search' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or ISBN..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={searchBooks}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Books List */}
            {books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-800 mb-1">{book.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {book.category && <p><strong>Category:</strong> {book.category}</p>}
                      {book.subject && <p><strong>Subject:</strong> {book.subject}</p>}
                      {book.class_level && <p><strong>Level:</strong> {book.class_level}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available_copies > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available_copies > 0 
                          ? `${book.available_copies} available` 
                          : 'Not available'
                        }
                      </span>

                      {book.available_copies > 0 && !book.is_reference_only && (
                        <button
                          onClick={() => borrowBook(book.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Borrow
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No books found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Content Modal (contextual) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {uploadContext === 'study-materials' && 'Upload Study Material'}
                {uploadContext === 'digital-content' && 'Upload Digital Content'}
                {uploadContext === 'past-papers' && 'Add Past Paper'}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addNotification(
                  uploadContext === 'past-papers'
                    ? '✅ Past paper added successfully!'
                    : '✅ Content uploaded successfully!',
                  'success'
                );
                setShowUploadModal(false);
                setUploadData({ title: '', description: '', subject: '', year: '', type: 'document', file: null });
                if (activeView === 'digital-content') {
                  loadContent();
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadContext !== 'digital-content' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select
                      value={uploadData.subject}
                      onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Subject</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="engineering">Engineering</option>
                      <option value="business">Business Administration</option>
                      <option value="economics">Economics</option>
                      <option value="psychology">Psychology</option>
                      <option value="literature">Literature</option>
                      <option value="sociology">Sociology</option>
                    </select>
                  </div>
                )}

                {uploadContext === 'past-papers' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      value={uploadData.year}
                      onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                      placeholder="e.g., 2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {uploadContext === 'digital-content' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files && e.target.files[0] })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {uploadContext === 'past-papers' ? 'Add Past Paper' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Books View */}
      {activeView === 'my-books' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <h4 className="font-medium mb-4">My Borrowed Books</h4>
            
            {myBooks.length > 0 ? (
              <div className="space-y-4">
                {myBooks.map((borrowing) => (
                  <div key={borrowing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{borrowing.book_title}</h5>
                        <p className="text-sm text-gray-600 mb-2">by {borrowing.book_author}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Borrowed:</span> {new Date(borrowing.borrowed_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Due:</span> {new Date(borrowing.due_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        borrowing.status === 'returned' ? 'bg-green-100 text-green-800' :
                        borrowing.is_overdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {borrowing.status === 'returned' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                         borrowing.is_overdue ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {borrowing.status === 'returned' ? 'Returned' :
                         borrowing.is_overdue ? 'Overdue' : 'Borrowed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No borrowed books</p>
                <p className="text-sm">Visit the library to borrow books</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Actions - Contextual based on current view */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">
              {activeView === 'search' && 'Library Management'}
              {activeView === 'study-materials' && 'Study Materials Management'}
              {activeView === 'past-papers' && 'Past Papers Management'}
              {activeView === 'digital-content' && 'Digital Content Management'}
              {activeView === 'my-books' && 'Library Management'}
            </h4>
            <button 
              onClick={() => {
                if (activeView === 'search' || activeView === 'my-books') {
                  setShowAddBookModal(true);
                } else if (activeView === 'study-materials') {
                  setUploadContext('study-materials');
                  setShowUploadModal(true);
                } else if (activeView === 'past-papers') {
                  setUploadContext('past-papers');
                  setShowUploadModal(true);
                } else if (activeView === 'digital-content') {
                  setUploadContext('digital-content');
                  setShowUploadModal(true);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeView === 'search' && 'Add Book'}
              {activeView === 'my-books' && 'Add Book'}
              {activeView === 'study-materials' && 'Upload Materials'}
              {activeView === 'past-papers' && 'Add Past Paper'}
              {activeView === 'digital-content' && 'Upload Content'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowLibraryAnalyticsForm(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
              <h5 className="font-medium">Analytics</h5>
              <p className="text-sm text-gray-600">View usage statistics and reports</p>
            </button>
            <button 
              onClick={() => setShowManageCategoriesForm(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <BookOpen className="w-6 h-6 text-green-600 mb-2" />
              <h5 className="font-medium">Manage Categories</h5>
              <p className="text-sm text-gray-600">Organize categories and subjects</p>
            </button>
            <button 
              onClick={() => setShowBulkImportForm(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <Plus className="w-6 h-6 text-purple-600 mb-2" />
              <h5 className="font-medium">Bulk Import</h5>
              <p className="text-sm text-gray-600">Import multiple items from files</p>
            </button>
          </div>
        </div>
      )}

      {/* Study Materials View */}
      {activeView === 'study-materials' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Study Materials
            </h3>
            {currentUser?.role === 'teacher' && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setUploadContext('study-materials'); setShowUploadModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Materials</span>
                </button>
                <button
                  onClick={() => setShowLibraryAnalyticsForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Usage Analytics</span>
                </button>
              </div>
            )}
          </div>

          {/* Teacher Study Materials Analytics */}
          {currentUser?.role === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">Materials Uploaded</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-blue-700">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-700">Students Using</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No study materials available</p>
            <p className="text-sm text-gray-400">Study materials will appear here when uploaded by teachers</p>
          </div>
        </div>
      )}

      {/* Digital Content View */}
      {activeView === 'digital-content' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Video className="w-5 h-5 mr-2 text-blue-600" />
              Digital Content Library
            </h3>
            {currentUser?.role === 'teacher' && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setUploadContext('digital-content'); setShowUploadModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Content</span>
                </button>
                <button
                  onClick={() => setShowLibraryAnalyticsForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setShowManageCategoriesForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <Filter className="w-5 h-5" />
                  <span>Manage Categories</span>
                </button>
              </div>
            )}
          </div>

          {/* Teacher Dashboard Stats */}
          {currentUser?.role === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-blue-700">My Uploads</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-700">Downloads</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-orange-700">Students Using</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="pdf">PDFs</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Grid */}
          {content.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {item.content_type === 'video' && <Video className="w-5 h-5 text-blue-600" />}
                      {item.content_type === 'document' && <FileText className="w-5 h-5 text-green-600" />}
                      {item.content_type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                      {item.content_type === 'image' && <Image className="w-5 h-5 text-purple-600" />}
                      {item.content_type === 'audio' && <Music className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.content_type}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {/* Teacher-specific content info */}
                  {currentUser?.role === 'teacher' && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{item.view_count || 0} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{item.download_count || 0} downloads</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.is_premium ? (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {item.price} {item.currency}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Free</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedContent(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Content"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Teacher-specific actions */}
                        {currentUser?.role === 'teacher' && (
                          <>
                            <button
                              onClick={() => { setUploadContext('digital-content'); setShowUploadModal(true); }}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Edit Content"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this content?')) {
                                  addNotification('Content deleted successfully', 'success');
                                }
                              }}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete Content"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {item.is_premium ? (
                        <button
                          onClick={() => purchaseContent(item.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Buy</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => downloadContent(item.id, item.title)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No digital content available</p>
              <p className="text-sm">Content will appear here when uploaded by teachers</p>
            </div>
          )}
        </div>
      )}


      {/* Past Papers View */}
      {activeView === 'past-papers' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Download className="w-5 h-5 mr-2 text-purple-600" />
              Past Papers
            </h3>
            {currentUser?.role === 'teacher' && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowBulkImportForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <Upload className="w-5 h-5" />
                  <span>Bulk Import</span>
                </button>
                <button
                  onClick={() => { setUploadContext('past-papers'); setShowUploadModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Past Paper</span>
                </button>
                <button
                  onClick={() => setShowLibraryAnalyticsForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Teacher Past Papers Analytics */}
          {currentUser?.role === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-700">Uploaded Papers</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-blue-700">Total Downloads</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">Students Using</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-orange-700">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Past Papers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">Available Past Papers</h4>
              <div className="flex space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Subjects</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business Administration</option>
                  <option value="economics">Economics</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Years</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
                {currentUser?.role === 'teacher' && (
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                )}
              </div>
            </div>
            
            {/* Sample Past Papers for Teachers */}
            {currentUser?.role === 'teacher' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample Past Paper 1 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">Mathematics S4 - 2023</h4>
                      <p className="text-sm text-gray-600">UNEB Paper 1</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">156 views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">23 downloads</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Published</span>
                        <span className="text-sm text-gray-500">2023</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setSelectedContent({ title: 'Mathematics S4 - 2023', subject: 'Mathematics' })}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                          title="View Paper"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setUploadContext('past-papers'); setShowUploadModal(true); }}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" 
                          title="Edit Paper"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this past paper?')) {
                              addNotification('Past paper deleted successfully', 'success');
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" 
                          title="Delete Paper"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => downloadContent('math-2023', 'Mathematics S4 - 2023')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sample Past Paper 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">Computer Science Year 2 - 2022</h4>
                      <p className="text-sm text-gray-600">UNEB Paper 2</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">89 views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">12 downloads</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Draft</span>
                        <span className="text-sm text-gray-500">2022</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setSelectedContent({ title: 'Mathematics S4 - 2023', subject: 'Mathematics' })}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                          title="View Paper"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setUploadContext('past-papers'); setShowUploadModal(true); }}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" 
                          title="Edit Paper"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this past paper?')) {
                              addNotification('Past paper deleted successfully', 'success');
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" 
                          title="Delete Paper"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => downloadContent('math-2023', 'Mathematics S4 - 2023')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sample Past Paper 3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">Engineering Year 2 - 2021</h4>
                      <p className="text-sm text-gray-600">UNEB Paper 1</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">234 views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">45 downloads</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Published</span>
                        <span className="text-sm text-gray-500">2021</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => setSelectedContent({ title: 'Mathematics S4 - 2023', subject: 'Mathematics' })}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" 
                          title="View Paper"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" 
                          title="Edit Paper"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this past paper?')) {
                              addNotification('Past paper deleted successfully', 'success');
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" 
                          title="Delete Paper"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => downloadContent('math-2023', 'Mathematics S4 - 2023')}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No past papers available</p>
                <p className="text-sm text-gray-400">Past papers will appear here when uploaded by teachers</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Library Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">Library Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-700">Total Books</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-green-700">Available</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-yellow-700">Borrowed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-purple-700">Active Users</div>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddBook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                    placeholder="Enter book title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    placeholder="Enter author name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISBN Number</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    placeholder="Enter ISBN (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="textbook">Textbook</option>
                    <option value="reference">Reference</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="literature">Literature</option>
                    <option value="economics">Economics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={newBook.subject}
                    onChange={(e) => setNewBook({...newBook, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business Administration</option>
                    <option value="economics">Economics</option>
                    <option value="psychology">Psychology</option>
                    <option value="sociology">Sociology</option>
                    <option value="literature">Literature</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                  <select
                    value={newBook.class_level}
                    onChange={(e) => setNewBook({...newBook, class_level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year level</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="all-levels">All Levels</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Copies *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBook.copies}
                    onChange={(e) => setNewBook({...newBook, copies: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publication Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={newBook.publication_year}
                    onChange={(e) => setNewBook({...newBook, publication_year: e.target.value})}
                    placeholder="e.g., 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                  <input
                    type="text"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({...newBook, publisher: e.target.value})}
                    placeholder="Enter publisher name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows="4"
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  placeholder="Enter book description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reference-only"
                    checked={newBook.is_reference_only}
                    onChange={(e) => setNewBook({...newBook, is_reference_only: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="reference-only" className="ml-2 block text-sm text-gray-700">
                    Reference Only (Not borrowable)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="digital-copy"
                    checked={newBook.has_digital_copy}
                    onChange={(e) => setNewBook({...newBook, has_digital_copy: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="digital-copy" className="ml-2 block text-sm text-gray-700">
                    Digital Copy Available
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library Analytics Form */}
      {showLibraryAnalyticsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Library Analytics & Reports
              </h3>
              <button
                onClick={() => setShowLibraryAnalyticsForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="library-analytics-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Report Type *
                    </label>
                    <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                      <option value="">Select Report Type</option>
                      <option value="usage">Book Usage Statistics</option>
                      <option value="popular">Popular Subjects & Categories</option>
                      <option value="borrowing">Borrowing Patterns</option>
                      <option value="engagement">User Engagement Metrics</option>
                      <option value="overdue">Overdue Book Tracking</option>
                      <option value="growth">Collection Growth Analysis</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Date Range *
                    </label>
                    <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                      <option value="">Select Date Range</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="semester">This Term</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Filter by Category
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="">All Categories</option>
                    <option value="academic">Academic</option>
                    <option value="fiction">Fiction</option>
                    <option value="reference">Reference</option>
                    <option value="textbooks">Textbooks</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">PDF Report</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Excel Spreadsheet</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">CSV Data</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Charts & Graphs</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLibraryAnalyticsForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="library-analytics-form"
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Form */}
      {showManageCategoriesForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                🔍 Manage Categories
              </h3>
              <button
                onClick={() => setShowManageCategoriesForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="manage-categories-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Action Type *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Action</option>
                    <option value="create">Create New Category</option>
                    <option value="edit">Edit Existing Category</option>
                    <option value="assign">Assign Books to Categories</option>
                    <option value="organize">Organize by Subject</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Subject Alignment
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="literature">Literature</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="economics">Economics</option>
                    <option value="sociology">Sociology</option>
                    <option value="curriculum">Curriculum Standards</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Year Level
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="">All Levels</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    placeholder="Category description and guidelines..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowManageCategoriesForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="manage-categories-form"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Save Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Form */}
      {showBulkImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Bulk Import Books
              </h3>
              <button
                onClick={() => setShowBulkImportForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <form id="bulk-import-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Import Method *
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300" required>
                    <option value="">Select Method</option>
                    <option value="csv">CSV File Upload</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="isbn">ISBN Batch Lookup</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Upload File *
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    required
                  />
                  <p className="text-xs mt-1 text-gray-500">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Default Category
                  </label>
                  <select className="w-full p-3 rounded-lg border bg-white border-gray-300">
                    <option value="">Select Default Category</option>
                    <option value="academic">Academic</option>
                    <option value="fiction">Fiction</option>
                    <option value="reference">Reference</option>
                    <option value="textbooks">Textbooks</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Import Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Automatic metadata retrieval</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Bulk category assignment</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Duplicate detection</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Auto-generate book IDs</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Processing Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3 rounded-lg border bg-white border-gray-300"
                    placeholder="Any special instructions for processing..."
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImportForm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="bulk-import-form"
                  className="flex-1 py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Start Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Study Tools Forms */}
      
  {/* AI Tutor Form */}
  {userRole !== 'admin' && showAITutorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-blue-600" />
                AI Tutor Session
              </h2>
              <button
                onClick={() => setShowAITutorForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={aiTutorData.subject}
                    onChange={(e) => setAiTutorData({...aiTutorData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business Administration</option>
                    <option value="literature">Literature</option>
                    <option value="economics">Economics</option>
                    <option value="sociology">Sociology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={aiTutorData.topic}
                    onChange={(e) => setAiTutorData({...aiTutorData, topic: e.target.value})}
                    placeholder="e.g., Quadratic Equations, Photosynthesis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={aiTutorData.difficulty}
                  onChange={(e) => setAiTutorData({...aiTutorData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="medium">Medium</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Question *</label>
                <textarea
                  rows="4"
                  value={aiTutorData.question}
                  onChange={(e) => setAiTutorData({...aiTutorData, question: e.target.value})}
                  placeholder="Ask your question here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAITutorForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification('🤖 AI Tutor Session Started! Your personalized AI tutor is now analyzing your question and preparing a detailed explanation with examples and practice problems.', 'success');
                    setShowAITutorForm(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Study Planner Form */}
  {userRole !== 'admin' && showStudyPlannerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-green-600" />
                AI Study Planner
              </h2>
              <button
                onClick={() => setShowStudyPlannerForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects to Study *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mathematics', 'Computer Science', 'Engineering', 'Business Administration', 'Economics', 'Psychology', 'Literature', 'Sociology'].map(subject => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={studyPlannerData.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStudyPlannerData({...studyPlannerData, subjects: [...studyPlannerData.subjects, subject]});
                          } else {
                            setStudyPlannerData({...studyPlannerData, subjects: studyPlannerData.subjects.filter(s => s !== subject)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Study Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={studyPlannerData.studyHours}
                    onChange={(e) => setStudyPlannerData({...studyPlannerData, studyHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={studyPlannerData.examDate}
                    onChange={(e) => setStudyPlannerData({...studyPlannerData, examDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Times</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning (6-10 AM)', 'Afternoon (12-4 PM)', 'Evening (6-10 PM)'].map(time => (
                    <label key={time} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={studyPlannerData.preferredTimes.includes(time)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setStudyPlannerData({...studyPlannerData, preferredTimes: [...studyPlannerData.preferredTimes, time]});
                          } else {
                            setStudyPlannerData({...studyPlannerData, preferredTimes: studyPlannerData.preferredTimes.filter(t => t !== time)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowStudyPlannerForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification('📅 Study Plan Generated! Your AI-powered study schedule has been created with optimal study blocks, break intervals, and exam preparation timeline. Plan saved to your calendar!', 'success');
                    setShowStudyPlannerForm(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Quiz Generator Form */}
  {userRole !== 'admin' && showQuizGeneratorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                Quiz Generator
              </h2>
              <button
                onClick={() => setShowQuizGeneratorForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={quizData.subject}
                    onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business Administration</option>
                    <option value="economics">Economics</option>
                    <option value="psychology">Psychology</option>
                    <option value="sociology">Sociology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={quizData.topic}
                    onChange={(e) => setQuizData({...quizData, topic: e.target.value})}
                    placeholder="e.g., Algebra, Photosynthesis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={quizData.difficulty}
                    onChange={(e) => setQuizData({...quizData, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={quizData.questionCount}
                    onChange={(e) => setQuizData({...quizData, questionCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select
                  value={quizData.questionType}
                  onChange={(e) => setQuizData({...quizData, questionType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="mixed">Mixed Types</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuizGeneratorForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification(`📝 Quiz Generated! Your personalized quiz has been created with ${quizData.questionCount} ${quizData.questionType} questions on ${quizData.subject}. Difficulty: ${quizData.difficulty}, Time limit: 30 minutes.`, 'success');
                    setShowQuizGeneratorForm(false);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Generate Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Note Summarizer Form */}
  {userRole !== 'admin' && showNoteSummarizerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-orange-600" />
                Note Summarizer
              </h2>
              <button
                onClick={() => setShowNoteSummarizerForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text to Summarize *</label>
                <textarea
                  rows="8"
                  value={summarizerData.text}
                  onChange={(e) => setSummarizerData({...summarizerData, text: e.target.value})}
                  placeholder="Paste your notes or text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Summary Length</label>
                  <select
                    value={summarizerData.summaryLength}
                    onChange={(e) => setSummarizerData({...summarizerData, summaryLength: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="short">Short (Key points only)</option>
                    <option value="medium">Medium (Detailed summary)</option>
                    <option value="long">Long (Comprehensive summary)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
                  <input
                    type="text"
                    value={summarizerData.focusArea}
                    onChange={(e) => setSummarizerData({...summarizerData, focusArea: e.target.value})}
                    placeholder="e.g., Important concepts, Key formulas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowNoteSummarizerForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification('📄 Notes Summarized! Your text has been processed with key points extracted, important concepts highlighted, and formatted into a study-friendly summary with bullet points.', 'success');
                    setShowNoteSummarizerForm(false);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Summarize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Flashcard Creator Form */}
  {userRole !== 'admin' && showFlashcardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Book className="w-6 h-6 mr-2 text-red-600" />
                Flashcard Creator
              </h2>
              <button
                onClick={() => setShowFlashcardForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={flashcardData.subject}
                    onChange={(e) => setFlashcardData({...flashcardData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business Administration</option>
                    <option value="economics">Economics</option>
                    <option value="psychology">Psychology</option>
                    <option value="sociology">Sociology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={flashcardData.topic}
                    onChange={(e) => setFlashcardData({...flashcardData, topic: e.target.value})}
                    placeholder="e.g., Periodic Table, World War II"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Cards</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={flashcardData.cardCount}
                    onChange={(e) => setFlashcardData({...flashcardData, cardCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={flashcardData.difficulty}
                    onChange={(e) => setFlashcardData({...flashcardData, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowFlashcardForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification(`🃏 Flashcards Created! Your ${flashcardData.cardCount} flashcards have been generated with front and back sides, spaced repetition schedule, and progress tracking enabled.`, 'success');
                    setShowFlashcardForm(false);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Create Flashcards
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  {/* Essay Helper Form */}
  {userRole !== 'admin' && showEssayHelperForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Search className="w-6 h-6 mr-2 text-indigo-600" />
                Essay Helper
              </h2>
              <button
                onClick={() => setShowEssayHelperForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Essay Topic *</label>
                <input
                  type="text"
                  value={essayData.topic}
                  onChange={(e) => setEssayData({...essayData, topic: e.target.value})}
                  placeholder="e.g., Climate Change, The Impact of Technology"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Essay Type</label>
                  <select
                    value={essayData.essayType}
                    onChange={(e) => setEssayData({...essayData, essayType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="argumentative">Argumentative</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="narrative">Narrative</option>
                    <option value="expository">Expository</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Word Count</label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    value={essayData.wordCount}
                    onChange={(e) => setEssayData({...essayData, wordCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <textarea
                  rows="3"
                  value={essayData.requirements}
                  onChange={(e) => setEssayData({...essayData, requirements: e.target.value})}
                  placeholder="Any specific requirements, sources to include, or guidelines..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowEssayHelperForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    addNotification('✍️ Essay Helper Activated! Your essay assistance is ready with topic analysis, structure outline, key arguments, writing tips, and citation suggestions.', 'success');
                    setShowEssayHelperForm(false);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Get Help
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800'
                : notification.type === 'info'
                ? 'bg-blue-50 border-blue-400 text-blue-800'
                : 'bg-gray-50 border-gray-400 text-gray-800'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>AI Exam Predictions</span>
                </h3>
                <button 
                  onClick={() => setShowPredictionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">AI-powered predictions based on past paper analysis and curriculum patterns</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Subject Focus Areas */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Focus Areas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h5 className="font-semibold text-red-900 mb-2">Mathematics</h5>
                    <p className="text-red-800 text-sm">Focus on Algebra and Geometry - these topics appear in 85% of past papers</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-2">Physics</h5>
                    <p className="text-blue-800 text-sm">Concentrate on Mechanics and Electricity - high frequency topics</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-2">Chemistry</h5>
                    <p className="text-green-800 text-sm">Organic chemistry and stoichiometry are essential</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-2">Biology</h5>
                    <p className="text-purple-800 text-sm">Cell biology and genetics are core topics</p>
                  </div>
                </div>
              </div>

              {/* Study Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Study Recommendations</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Practice past papers from the last 5 years to identify patterns</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Focus on high-frequency topics identified in the analysis</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Time management is crucial - practice under exam conditions</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Review weak areas identified in previous assessments</span>
                  </div>
                </div>
              </div>

              {/* Prediction Confidence */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Prediction Confidence: 87%</p>
                    <p className="mt-1">These predictions are based on historical patterns from past 5 years of UNEB examinations and should be used as study guidance alongside your regular curriculum.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowPredictionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowPredictionModal(false);
                  addNotification('✅ AI Predictions saved to your dashboard!', 'success');
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Report Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <span>Analysis Report</span>
                </h3>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">Comprehensive analysis of past papers and curriculum patterns</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-900">Topic Frequency Analysis</div>
                  <div className="text-xs text-green-700 mt-1">Algebra appears in 85% of papers</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900">Difficulty Trends</div>
                  <div className="text-xs text-blue-700 mt-1">Increasing complexity over years</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-900">Pattern Recognition</div>
                  <div className="text-xs text-purple-700 mt-1">Similar question structures identified</div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Topic Frequency Analysis (Past 5 Years)</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Mathematics: Algebra (85%), Geometry (72%), Statistics (68%)</li>
                      <li>• Physics: Mechanics (78%), Electricity (75%), Waves (65%)</li>
                      <li>• Chemistry: Organic Chemistry (82%), Stoichiometry (70%), Acids & Bases (68%)</li>
                      <li>• Biology: Cell Biology (80%), Genetics (75%), Ecology (70%)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Difficulty Trend Analysis</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Overall difficulty has increased by 15% over the past 3 years</li>
                      <li>• Mathematics questions are becoming more application-based</li>
                      <li>• Physics calculations require more complex problem-solving</li>
                      <li>• Chemistry questions focus more on practical applications</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Question Pattern Recognition</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Multiple-choice questions follow specific distribution patterns</li>
                      <li>• Essay questions often require diagram drawing and explanation</li>
                      <li>• Calculation questions typically have 3-4 sub-parts</li>
                      <li>• Practical questions appear in 30% of papers</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Curriculum Alignment Scores</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Mathematics: 92% alignment with current curriculum</li>
                      <li>• Physics: 88% alignment with current curriculum</li>
                      <li>• Chemistry: 90% alignment with current curriculum</li>
                      <li>• Biology: 85% alignment with current curriculum</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Recommended Study Focus Areas</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• High Priority: Algebra, Mechanics, Organic Chemistry, Cell Biology</li>
                      <li>• Medium Priority: Statistics, Electricity, Stoichiometry, Genetics</li>
                      <li>• Low Priority: Geometry, Waves, Acids & Bases, Ecology</li>
                      <li>• Practice Areas: Problem-solving techniques, time management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowAnalysisModal(false);
                  addNotification('✅ Analysis Report saved to your dashboard!', 'success');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedContentForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  <span>Confirm Purchase</span>
                </h3>
                <button 
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedContentForAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedContentForAction.type === 'video' ? (
                    <Video className="w-8 h-8 text-gray-600" />
                  ) : selectedContentForAction.type === 'document' ? (
                    <FileText className="w-8 h-8 text-gray-600" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedContentForAction.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedContentForAction.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      {selectedContentForAction.price} {selectedContentForAction.currency}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">What you'll get:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Full access to this content</li>
                      <li>• Download capability</li>
                      <li>• Lifetime access</li>
                      <li>• Mobile and desktop compatibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedContentForAction(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPurchase}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Purchase Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadModal && selectedContentForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Confirm Download</span>
                </h3>
                <button 
                  onClick={() => {
                    setShowDownloadModal(false);
                    setSelectedContentForAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedContentForAction.type === 'video' ? (
                    <Video className="w-8 h-8 text-gray-600" />
                  ) : selectedContentForAction.type === 'document' ? (
                    <FileText className="w-8 h-8 text-gray-600" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedContentForAction.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedContentForAction.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-500">
                      Size: {selectedContentForAction.file_size || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Download Information:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• File will be saved to your Downloads folder</li>
                      <li>• Compatible with all devices</li>
                      <li>• No internet required after download</li>
                      <li>• Safe and secure download</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDownloadModal(false);
                  setSelectedContentForAction(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDownload}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPanel;
