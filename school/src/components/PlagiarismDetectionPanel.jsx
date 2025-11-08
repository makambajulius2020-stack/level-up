import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Eye, Download, Upload, 
  Search, Filter, FileText, BarChart3, Clock, Users, Star,
  Brain, Zap, Target, Award, TrendingUp, RefreshCw
} from 'lucide-react';

const PlagiarismDetectionPanel = ({ userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const recentScans = [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-800';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score < 20) return 'text-green-600';
    if (score < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const simulateScan = () => {
    // Placeholder: no demo data. Hook this to backend later.
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResults(null);
    }, 1500);
  };

  const renderScanInterface = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Plagiarism Detection Scanner
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Document for Scanning</h4>
          <p className="text-gray-600 mb-4">Drag and drop files or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
          <button 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx,.txt';
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from(e.target.files);
                alert(`✅ ${files.length} file(s) selected for plagiarism check:\n\n${files.map(f => `• ${f.name} (${(f.size / 1024).toFixed(2)} KB)`).join('\n')}\n\nAnalyzing for plagiarism...`);
              };
              input.click();
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Choose Files
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Business Administration</option>
              <option>Accounting</option>
              <option>Computer Science</option>
              <option>Economics</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Human Resource Management</option>
              <option>Information Technology</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Check against internet sources</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="ml-2 text-sm text-gray-700">Check against student database</span>
            </label>
          </div>
          <button 
            onClick={simulateScan}
            disabled={isScanning}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
          </button>
        </div>
      </div>

      {/* Scan Results */}
      {scanResults && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Scan Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(scanResults.plagiarismScore)}`}>
                {scanResults.plagiarismScore}%
              </div>
              <div className="text-sm text-gray-600">Similarity Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900">{scanResults.wordCount}</div>
              <div className="text-sm text-green-700">Words Analyzed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-900">{scanResults.sources}</div>
              <div className="text-sm text-purple-700">Sources Found</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-900">{scanResults.scanTime}</div>
              <div className="text-sm text-orange-700">Scan Time</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Detected Matches</h4>
            {scanResults.matches.map((match, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{match.source}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getScoreColor(match.similarity)}`}>
                      {match.similarity}%
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      match.type === 'reference' ? 'bg-green-100 text-green-800' :
                      match.type === 'potential' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {match.type}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"{match.excerpt}"</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Report
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Mark as Reviewed
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Contact Student
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderScanHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Scans</h3>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Classes</option>
              <option>Year 1A</option>
              <option>Year 2B</option>
              <option>Year 3A</option>
              <option>Year 4A</option>
              <option>Graduate</option>
              <option>Postgraduate</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Statuses</option>
              <option>Clean</option>
              <option>Suspicious</option>
              <option>Flagged</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {recentScans.map((scan) => (
            <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{scan.title}</h4>
                  <p className="text-sm text-gray-600">
                    {scan.studentName} • {scan.class} • {scan.subject} • {scan.scanDate}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(scan.plagiarismScore)}`}>
                      {scan.plagiarismScore}%
                    </div>
                    <div className="text-xs text-gray-500">similarity</div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(scan.status)}`}>
                    {scan.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                <div>Words: {scan.wordCount}</div>
                <div>Sources: {scan.sources}</div>
                <div>Matches: {scan.matches.length}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {scan.matches.slice(0, 3).map((match, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {match.source}: {match.similarity}%
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Analytics</h3>
        <p className="text-sm text-gray-600">No analytics data available yet.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Plagiarism Detection</h1>
        <p className="text-gray-600">AI-powered plagiarism detection and academic integrity monitoring</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'scan', label: 'New Scan', icon: Search },
              { id: 'history', label: 'Scan History', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'scan' && renderScanInterface()}
      {activeTab === 'history' && renderScanHistory()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default PlagiarismDetectionPanel;
