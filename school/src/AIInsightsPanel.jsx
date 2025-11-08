import React from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';

const AIInsightsPanel = ({ aiInsights }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center mb-4">
      <div className="bg-purple-100 rounded-full p-2 mr-3">
        <BarChart3 className="w-5 h-5 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold">AI Insights</h3>
    </div>
    <div className="space-y-3">
      {aiInsights.map((insight, index) => {
        const message = typeof insight === 'string' ? insight : insight.message;
        const priority = typeof insight === 'object' ? insight.priority : undefined;
        const type = typeof insight === 'object' ? insight.type : undefined;
        const chipClass =
          priority === 'high' ? 'bg-red-100 text-red-800' :
          priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800';
        return (
          <div key={index} className="flex items-start">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p>{message}</p>
              {(priority || type) && (
                <div className="mt-1 flex items-center space-x-2">
                  {type && <span className="text-xs text-gray-500 capitalize">{type}</span>}
                  {priority && <span className={`text-xs px-2 py-0.5 rounded ${chipClass}`}>{priority}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default AIInsightsPanel;
