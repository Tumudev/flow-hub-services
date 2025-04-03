
import React from 'react';

const DiscoveryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discovery</h1>
        <p className="text-muted-foreground">
          Manage client discovery sessions and questionnaires.
        </p>
      </div>
      
      <div className="bg-white rounded-md shadow p-6">
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-serviceblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-serviceblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Discovery Module</h2>
          <p className="text-gray-500 mb-6">This is a placeholder for the Discovery module.</p>
          <p className="text-gray-500">Functionality coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPage;
