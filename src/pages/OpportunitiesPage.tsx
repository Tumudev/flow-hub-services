
import React from 'react';

const OpportunitiesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground">
          Track and manage business opportunities.
        </p>
      </div>
      
      <div className="bg-white rounded-md shadow p-6">
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-serviceblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-serviceblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Opportunities Module</h2>
          <p className="text-gray-500 mb-6">This is a placeholder for the Opportunities module.</p>
          <p className="text-gray-500">Functionality coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
