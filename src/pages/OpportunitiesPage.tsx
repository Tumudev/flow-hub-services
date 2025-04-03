
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { conceptStages, auditStages } from '@/components/opportunities/interfaces';
import OpportunitySummaryCards from '@/components/opportunities/OpportunitySummaryCards';
import OpportunityFilterControls from '@/components/opportunities/OpportunityFilterControls';
import OpportunityTable from '@/components/opportunities/OpportunityTable';
import { useOpportunityData } from '@/hooks/useOpportunityData';

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter and sort states
  const [stageFilter, setStageFilter] = useState<string>("All Stages");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  
  // All possible stages from both opportunity types
  const allStages = [...new Set([...conceptStages, ...auditStages])];

  // Use the custom hook to get opportunity data
  const {
    opportunities,
    stageSummary,
    typeSummary,
    isLoading,
    error,
    refetch,
    formatCurrency,
    getStageBadgeColor,
    getStageSummaryCount,
    getTypeSummaryCount
  } = useOpportunityData(stageFilter, typeFilter, sortBy, sortOrder);

  const handleRowClick = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  const handleFormClose = (shouldRefetch: boolean) => {
    setIsFormOpen(false);
    if (shouldRefetch) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage business opportunities.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage business opportunities.
          </p>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <p className="text-red-500">Failed to load opportunities. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground">
          Track and manage business opportunities.
        </p>
      </div>
      
      {/* Summary Cards */}
      <OpportunitySummaryCards 
        stageSummary={stageSummary}
        typeSummary={typeSummary}
        allStages={allStages}
        getStageBadgeColor={getStageBadgeColor}
        getStageSummaryCount={getStageSummaryCount}
        getTypeSummaryCount={getTypeSummaryCount}
      />
      
      {/* Filter Controls */}
      <OpportunityFilterControls 
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        allStages={allStages}
        setIsFormOpen={setIsFormOpen}
      />
      
      {/* Opportunity Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <OpportunityTable 
          opportunities={opportunities}
          stageFilter={stageFilter}
          typeFilter={typeFilter}
          setStageFilter={setStageFilter}
          setTypeFilter={setTypeFilter}
          setIsFormOpen={setIsFormOpen}
          handleRowClick={handleRowClick}
          formatCurrency={formatCurrency}
          getStageBadgeColor={getStageBadgeColor}
        />
      </div>
      
      <OpportunityForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
};

export default OpportunitiesPage;
