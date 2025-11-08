import React, { useState } from 'react';
import { 
  Brain, BookOpen, Microscope, Globe, Users, FileText, 
  MessageSquare, Trophy, HelpCircle, Lightbulb, Target,
  Play, Download, Share2, Settings, RefreshCw, Zap
} from 'lucide-react';

const AITeachingToolsPanel = ({ userRole, currentUser, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('assignment-scaffolder');
  const [loading, setLoading] = useState(false);

  const cardBg = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  const tools = [
    { id: 'assignment-scaffolder', label: 'Assignment Scaffolder', icon: Target, color: 'blue' },
    { id: 'science-labs', label: 'Science Labs', icon: Microscope, color: 'green' },
    { id: 'language-tutor', label: 'Language Tutor', icon: Globe, color: 'purple' },
    { id: 'research-assistant', label: 'Research Assistant', icon: FileText, color: 'orange' },
    { id: 'group-work', label: 'Group Work Generator', icon: Users, color: 'pink' },
    { id: 'text-summarizer', label: 'Text Summarizer', icon: FileText, color: 'indigo' },
    { id: 'case-studies', label: 'Case Studies Generator', icon: FileText, color: 'teal' },
    { id: 'discussion-prompts', label: 'Discussion Prompts', icon: MessageSquare, color: 'yellow' },
    { id: 'critical-thinking', label: 'Critical Thinking Questions', icon: HelpCircle, color: 'red' }
  ];

  const AssignmentScaffolder = () => {
    const [formData, setFormData] = useState({
      assignment: '',
      yearLevel: '',
      subject: '',
      difficulty: 'medium',
      steps: 5
    });
    const [scaffoldedSteps, setScaffoldedSteps] = useState([]);

    const generateScaffold = async () => {
      setLoading(true);
      // Simulate AI generation
      setTimeout(() => {
        const steps = [
          { step: 1, title: 'Research and Planning', description: 'Gather information and create an outline', timeEstimate: '30 minutes' },
          { step: 2, title: 'Introduction Draft', description: 'Write a compelling introduction paragraph', timeEstimate: '20 minutes' },
          { step: 3, title: 'Body Paragraphs', description: 'Develop main points with supporting evidence', timeEstimate: '45 minutes' },
          { step: 4, title: 'Conclusion', description: 'Summarize key points and provide closure', timeEstimate: '15 minutes' },
          { step: 5, title: 'Review and Edit', description: 'Proofread and refine your work', timeEstimate: '20 minutes' }
        ];
        setScaffoldedSteps(steps);
        setLoading(false);
      }, 2000);
    };

    return (
      <div className="space-y-6">
        <div className={`${cardBg} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Assignment Scaffolder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Assignment title or description"
              value={formData.assignment}
              onChange={(e) => setFormData({...formData, assignment: e.target.value})}
              className={`px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <select
              value={formData.yearLevel}
              onChange={(e) => setFormData({...formData, yearLevel: e.target.value})}
              className={`px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="">Select Year Level</option>
              <option value="S1">Senior 1</option>
              <option value="S2">Senior 2</option>
              <option value="S3">Senior 3</option>
              <option value="S4">Senior 4</option>
              <option value="S5">Senior 5</option>
              <option value="S6">Senior 6</option>
            </select>
          </div>
          <button
            onClick={generateScaffold}
            disabled={loading || !formData.assignment}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Scaffold'}
          </button>
        </div>

        {scaffoldedSteps.length > 0 && (
          <div className={`${cardBg} rounded-xl p-6`}>
            <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>Scaffolded Steps</h4>
            <div className="space-y-4">
              {scaffoldedSteps.map((step) => (
                <div key={step.step} className="border-l-4 border-blue-500 pl-4">
                  <h5 className={`font-medium ${textPrimary}`}>Step {step.step}: {step.title}</h5>
                  <p className={`${textSecondary} text-sm`}>{step.description}</p>
                  <span className={`${textMuted} text-xs`}>Estimated time: {step.timeEstimate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScienceLabs = () => {
    const [labData, setLabData] = useState({
      topic: '',
      standard: '',
      duration: '60',
      materials: [],
      safetyLevel: 'medium'
    });
    const [generatedLab, setGeneratedLab] = useState(null);

    const generateLab = async () => {
      setLoading(true);
      setTimeout(() => {
        setGeneratedLab({
          title: 'Chemical Reactions Lab',
          objective: 'Students will observe and analyze different types of chemical reactions',
          materials: ['Test tubes', 'Bunsen burner', 'Safety goggles', 'Various chemicals'],
          procedure: [
            'Set up safety equipment',
            'Prepare chemical solutions',
            'Conduct reaction experiments',
            'Record observations',
            'Analyze results'
          ],
          safety: ['Wear safety goggles at all times', 'Handle chemicals carefully', 'Report spills immediately']
        });
        setLoading(false);
      }, 2000);
    };

    return (
      <div className="space-y-6">
        <div className={`${cardBg} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Science Lab Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Lab topic (e.g., Chemical Reactions)"
              value={labData.topic}
              onChange={(e) => setLabData({...labData, topic: e.target.value})}
              className={`px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <input
              type="text"
              placeholder="Learning standard"
              value={labData.standard}
              onChange={(e) => setLabData({...labData, standard: e.target.value})}
              className={`px-4 py-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <button
            onClick={generateLab}
            disabled={loading || !labData.topic}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating Lab...' : 'Generate Science Lab'}
          </button>
        </div>

        {generatedLab && (
          <div className={`${cardBg} rounded-xl p-6`}>
            <h4 className={`text-lg font-semibold ${textPrimary} mb-4`}>{generatedLab.title}</h4>
            <div className="space-y-4">
              <div>
                <h5 className={`font-medium ${textPrimary}`}>Objective:</h5>
                <p className={`${textSecondary}`}>{generatedLab.objective}</p>
              </div>
              <div>
                <h5 className={`font-medium ${textPrimary}`}>Materials:</h5>
                <ul className={`${textSecondary} list-disc list-inside`}>
                  {generatedLab.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className={`font-medium ${textPrimary}`}>Procedure:</h5>
                <ol className={`${textSecondary} list-decimal list-inside`}>
                  {generatedLab.procedure.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'assignment-scaffolder':
        return <AssignmentScaffolder />;
      case 'science-labs':
        return <ScienceLabs />;
      default:
        return (
          <div className={`${cardBg} rounded-xl p-8 text-center`}>
            <Lightbulb className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>
              {tools.find(t => t.id === activeTab)?.label}
            </h3>
            <p className={`${textSecondary}`}>This AI tool is coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className={`text-3xl lg:text-4xl font-bold ${textPrimary} mb-2`}>
              AI Teaching Tools
            </h1>
            <p className={`${textSecondary} text-lg`}>
              Enhance your teaching with AI-powered tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tool Navigation */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-xl p-4`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>AI Tools</h3>
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
                          : `${textSecondary} hover:bg-gray-100`
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

export default AITeachingToolsPanel;
