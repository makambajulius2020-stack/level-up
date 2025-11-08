import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ onClick, className = '', label = 'Back' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;

