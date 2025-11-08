import React, { useState } from 'react';
import { 
  FileText, BookOpen, Globe, Briefcase, Brain, Zap, 
  Download, Copy, Share2, RefreshCw, Target, Lightbulb,
  GraduationCap, Users, MessageSquare, TrendingUp, Star,
  Clock, CheckCircle, AlertCircle, Play, Pause, Volume2
} from 'lucide-react';

const StudentAIToolsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('text-summarizer');
  const [loading, setLoading] = useState(false);

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const tools = [
    { id: 'text-summarizer', label: 'Text Summarizer', icon: FileText, color: 'blue' },
    { id: 'research-helper', label: 'Research Helper', icon: BookOpen, color: 'green' },
    { id: 'language-tutor', label: 'Language Tutor', icon: Globe, color: 'purple' },
    { id: 'career-counselor', label: 'Career Counselor', icon: Briefcase, color: 'orange' }
  ];

  // Text Summarizer Component
  const TextSummarizer = () => {
    const [summarizerData, setSummarizerData] = useState({
      text: '',
      length: 'medium',
      subject: '',
      focusArea: 'general'
    });
    const [summary, setSummary] = useState(null);

    const generateSummary = async () => {
      if (!summarizerData.text.trim()) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        setTimeout(() => {
          const wordCount = summarizerData.text.split(' ').length;
          let targetLength;
          
          switch (summarizerData.length) {
            case 'short': targetLength = Math.max(50, Math.floor(wordCount * 0.1)); break;
            case 'long': targetLength = Math.max(200, Math.floor(wordCount * 0.4)); break;
            default: targetLength = Math.max(100, Math.floor(wordCount * 0.25));
          }

          setSummary({
            originalLength: wordCount,
            summaryLength: targetLength,
            compressionRatio: `${((targetLength/wordCount)*100).toFixed(1)}%`,
            summary: `This is a ${summarizerData.length} AI-generated summary of your text. The main concepts include key ideas, important details, and essential conclusions from the original content. The summary maintains the core message while reducing length for easier comprehension and study purposes.`,
            keyPoints: [
              'Primary concept identified in the original text',
              'Important supporting details and evidence',
              'Key conclusions and implications',
              'Relevant examples and applications'
            ],
            readingTime: `${Math.ceil(targetLength / 200)} minute${Math.ceil(targetLength / 200) > 1 ? 's' : ''}`,
            difficulty: 'Intermediate',
            subject: summarizerData.subject || 'General'
          });
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error generating summary:', error);
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className={`${cardBg} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center`}>
            <FileText className="w-6 h-6 mr-2 text-blue-500" />
            AI Text Summarizer
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Paste your text here *
              </label>
              <textarea
                rows={8}
                value={summarizerData.text}
                onChange={(e) => setSummarizerData({...summarizerData, text: e.target.value})}
                placeholder="Paste the text you want to summarize..."
                className={`w-full px-4 py-3 border rounded-lg resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <p className={`text-xs ${textMuted} mt-1`}>
                {summarizerData.text.split(' ').filter(word => word.length > 0).length} words
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Summary Length
                </label>
                <select
                  value={summarizerData.length}
                  onChange={(e) => setSummarizerData({...summarizerData, length: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="short">Short (10% of original)</option>
                  <option value="medium">Medium (25% of original)</option>
                  <option value="long">Long (40% of original)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={summarizerData.subject}
                  onChange={(e) => setSummarizerData({...summarizerData, subject: e.target.value})}
                  placeholder="e.g., Computer Science, Economics"
                  className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Focus Area
                </label>
                <select
                  value={summarizerData.focusArea}
                  onChange={(e) => setSummarizerData({...summarizerData, focusArea: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="general">General Summary</option>
                  <option value="key-concepts">Key Concepts</option>
                  <option value="study-notes">Study Notes</option>
                  <option value="exam-prep">Exam Preparation</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateSummary}
              disabled={loading || !summarizerData.text.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating Summary...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {summary && (
          <div className={`${cardBg} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>AI Generated Summary</h4>
              <div className="flex space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Copy Summary">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className={`text-2xl font-bold text-blue-600`}>{summary.originalLength}</p>
                <p className={`text-xs ${textMuted}`}>Original Words</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className={`text-2xl font-bold text-green-600`}>{summary.summaryLength}</p>
                <p className={`text-xs ${textMuted}`}>Summary Words</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className={`text-2xl font-bold text-purple-600`}>{summary.compressionRatio}</p>
                <p className={`text-xs ${textMuted}`}>Compression</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className={`text-2xl font-bold text-orange-600`}>{summary.readingTime}</p>
                <p className={`text-xs ${textMuted}`}>Reading Time</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className={`font-medium ${textPrimary} mb-2`}>Summary:</h5>
                <p className={`${textSecondary} leading-relaxed`}>{summary.summary}</p>
              </div>

              <div>
                <h5 className={`font-medium ${textPrimary} mb-2`}>Key Points:</h5>
                <ul className={`${textSecondary} space-y-1`}>
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Vocabulary Generator Component
  const VocabularyGenerator = () => {
    const [vocabData, setVocabData] = useState({
      source: 'topic',
      topic: '',
      text: '',
      subject: '',
      level: 'intermediate',
      count: 20
    });
    const [vocabulary, setVocabulary] = useState(null);

    const generateVocabulary = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          const sampleVocab = [
            { word: 'Photosynthesis', definition: 'The process by which plants make food using sunlight', difficulty: 'Advanced', usage: 'Plants use photosynthesis to convert sunlight into energy.' },
            { word: 'Chlorophyll', definition: 'The green pigment in plants that captures light energy', difficulty: 'Intermediate', usage: 'Chlorophyll gives leaves their green color.' },
            { word: 'Glucose', definition: 'A simple sugar produced during photosynthesis', difficulty: 'Intermediate', usage: 'Glucose is the main product of photosynthesis.' },
            { word: 'Stomata', definition: 'Small pores on leaves that allow gas exchange', difficulty: 'Advanced', usage: 'Carbon dioxide enters the plant through stomata.' },
            { word: 'Respiration', definition: 'The process of breaking down glucose to release energy', difficulty: 'Intermediate', usage: 'Cellular respiration occurs in all living organisms.' }
          ];

          setVocabulary({
            source: vocabData.source === 'topic' ? vocabData.topic : 'Custom Text',
            subject: vocabData.subject,
            level: vocabData.level,
            totalWords: sampleVocab.length,
            words: sampleVocab,
            categories: {
              'Beginner': sampleVocab.filter(w => w.difficulty === 'Beginner').length,
              'Intermediate': sampleVocab.filter(w => w.difficulty === 'Intermediate').length,
              'Advanced': sampleVocab.filter(w => w.difficulty === 'Advanced').length
            }
          });
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error generating vocabulary:', error);
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className={`${cardBg} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center`}>
            <BookOpen className="w-6 h-6 mr-2 text-green-500" />
            Research Helper
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Generate vocabulary from:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="topic"
                    checked={vocabData.source === 'topic'}
                    onChange={(e) => setVocabData({...vocabData, source: e.target.value})}
                    className="mr-2"
                  />
                  <span className={textSecondary}>Subject/Topic</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="text"
                    checked={vocabData.source === 'text'}
                    onChange={(e) => setVocabData({...vocabData, source: e.target.value})}
                    className="mr-2"
                  />
                  <span className={textSecondary}>Custom Text</span>
                </label>
              </div>
            </div>

            {vocabData.source === 'topic' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={vocabData.subject}
                    onChange={(e) => setVocabData({...vocabData, subject: e.target.value})}
                    placeholder="e.g., Computer Science, Engineering"
                    className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Topic
                  </label>
                  <input
                    type="text"
                    value={vocabData.topic}
                    onChange={(e) => setVocabData({...vocabData, topic: e.target.value})}
                    placeholder="e.g., Photosynthesis, Cell Division"
                    className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Text Content
                </label>
                <textarea
                  rows={6}
                  value={vocabData.text}
                  onChange={(e) => setVocabData({...vocabData, text: e.target.value})}
                  placeholder="Paste your text here to extract vocabulary..."
                  className={`w-full px-4 py-3 border rounded-lg resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Difficulty Level
                </label>
                <select
                  value={vocabData.level}
                  onChange={(e) => setVocabData({...vocabData, level: e.target.value})}
                  className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed Levels</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Number of Words
                </label>
                <select
                  value={vocabData.count}
                  onChange={(e) => setVocabData({...vocabData, count: parseInt(e.target.value)})}
                  className={`w-full px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value={10}>10 words</option>
                  <option value={20}>20 words</option>
                  <option value={30}>30 words</option>
                  <option value={50}>50 words</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateVocabulary}
              disabled={loading || (vocabData.source === 'topic' && !vocabData.topic) || (vocabData.source === 'text' && !vocabData.text)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating Vocabulary...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>Generate Vocabulary List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {vocabulary && (
          <div className={`${cardBg} rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${textPrimary}`}>Research Terms & Concepts</h4>
              <div className="flex space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Study Mode">
                  <Brain className="w-4 h-4" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className={`text-xl font-bold text-blue-600`}>{vocabulary.totalWords}</p>
                <p className={`text-xs ${textMuted}`}>Total Words</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className={`text-xl font-bold text-green-600`}>{vocabulary.categories.Intermediate}</p>
                <p className={`text-xs ${textMuted}`}>Intermediate</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className={`text-xl font-bold text-red-600`}>{vocabulary.categories.Advanced}</p>
                <p className={`text-xs ${textMuted}`}>Advanced</p>
              </div>
            </div>

            <div className="space-y-4">
              {vocabulary.words.map((word, index) => (
                <div key={index} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className={`text-lg font-semibold ${textPrimary}`}>{word.word}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      word.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                      word.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {word.difficulty}
                    </span>
                  </div>
                  <p className={`${textSecondary} mb-2`}>{word.definition}</p>
                  <p className={`${textMuted} text-sm italic`}>Example: {word.usage}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'text-summarizer':
        return <TextSummarizer />;
      case 'research-helper':
        return <VocabularyGenerator />;
      case 'language-tutor':
      case 'career-counselor':
        return (
          <div className={`${cardBg} rounded-xl p-8 text-center`}>
            <Lightbulb className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
              {tools.find(t => t.id === activeTab)?.label}
            </h3>
            <p className={`${textSecondary}`}>This AI learning tool is coming soon!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className={`text-3xl lg:text-4xl font-bold ${textPrimary} mb-2`}>
              AI Learning Tools
            </h1>
            <p className={`${textSecondary} text-lg`}>
              Enhance your learning with AI-powered study tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tool Navigation */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-xl p-4`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Learning Tools</h3>
              <div className="space-y-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        activeTab === tool.id
                          ? 'bg-blue-100 text-blue-700'
                          : `${textSecondary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tool Content */}
          <div className="lg:col-span-3">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAIToolsPanel;
