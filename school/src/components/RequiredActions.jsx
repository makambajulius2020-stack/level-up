import React from 'react';
import { CheckCircle2, AlertTriangle, User, FileText, CreditCard, Shield } from 'lucide-react';

const RequiredActions = ({ userRole, setActiveTab, darkMode = false }) => {
  const commonActions = [
    { id: 'profile', label: 'Complete your profile', icon: User, desc: 'Add photo, contact and emergency info', tab: 'profile' },
    { id: 'messaging', label: 'Check new messages', icon: FileText, desc: 'Review recent communications', tab: 'messaging' },
  ];

  const roleActionsMap = {
    admin: [
      { id: 'payments', label: 'Review pending payments', icon: CreditCard, desc: 'Approve or reconcile fees', tab: 'payments' },
      { id: 'users', label: 'Review system users', icon: Shield, desc: 'Verify user permissions', tab: 'users' },
    ],
    teacher: [
      { id: 'assignments', label: 'Grade recent assignments', icon: FileText, desc: 'Post grades and feedback', tab: 'assignments' },
      { id: 'attendance', label: 'Take attendance', icon: User, desc: 'Mark student attendance', tab: 'attendance' },
    ],
    student: [
      // Removed 'Submit due assignments' and 'Clear outstanding fees' as requested
    ],
  };

  const handleActionClick = (action) => {
    if (setActiveTab && action.tab) {
      setActiveTab(action.tab);
    }
  };

  const actions = [...commonActions, ...(roleActionsMap[userRole] || [])];

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold flex items-center ${textPrimary}`}>
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
          Required Actions
        </h3>
        <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
          {actions.length} items
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.id} className={`flex items-center justify-between p-3 border rounded-lg ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className="flex items-center">
              <action.icon className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className={`font-medium ${textPrimary}`}>{action.label}</p>
                <p className={`text-xs ${textSecondary}`}>{action.desc}</p>
              </div>
            </div>
            <button 
              onClick={() => handleActionClick(action)}
              className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Open
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-4 flex items-center text-xs ${textMuted}`}>
        <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
        Complete these to unlock all features
      </div>
    </div>
  );
};

export default RequiredActions;



