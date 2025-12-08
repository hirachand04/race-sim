/**
 * Loading Component
 * Displays a loading spinner with optional message
 */

import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* F1 Themed Spinner */}
      <div className="relative w-20 h-20 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-gray-700 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-t-f1-red border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        {/* Inner glow */}
        <div className="absolute inset-2 border-2 border-gray-600 rounded-full" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Message */}
      <p className="text-gray-300 text-lg font-medium">{message}</p>
      
      {/* Subtle dots animation */}
      <div className="flex gap-1 mt-3">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default Loading;
