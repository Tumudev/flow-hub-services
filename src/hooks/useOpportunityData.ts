
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/components/opportunities/interfaces';

// Type for the stage summary
export type StageSummary = {
  stage: string;
  count: number;
};

// Type for the type summary
export type TypeSummary = {
  opportunity_type: string;
  count: number;
};

export const useOpportunityData = (
  stageFilter: string,
  typeFilter: string,
  sortBy: string,
  sortOrder: string
) => {
  const [stageSummary, setStageSummary] = useState<StageSummary[]>([]);
  const [typeSummary, setTypeSummary] = useState<TypeSummary[]>([]);

  // Fetch summary counts
  useEffect(() => {
    const fetchSummaries = async () => {
      // Fetch stage summary using raw SQL syntax in select
      const { data: stageData, error: stageError } = await supabase
        .from('opportunities')
        .select('stage, count(*)')
        .order('stage')
        .then(result => {
          // Convert the raw results to our expected format
          if (result.data) {
            return {
              ...result,
              data: result.data.map(item => ({
                stage: item.stage,
                count: parseInt(item.count, 10)
              }))
            };
          }
          return result;
        });
      
      if (!stageError && stageData) {
        setStageSummary(stageData as StageSummary[]);
      }
      
      // Fetch type summary using raw SQL syntax in select
      const { data: typeData, error: typeError } = await supabase
        .from('opportunities')
        .select('opportunity_type, count(*)')
        .order('opportunity_type')
        .then(result => {
          // Convert the raw results to our expected format
          if (result.data) {
            return {
              ...result,
              data: result.data.map(item => ({
                opportunity_type: item.opportunity_type,
                count: parseInt(item.count, 10)
              }))
            };
          }
          return result;
        });
      
      if (!typeError && typeData) {
        setTypeSummary(typeData as TypeSummary[]);
      }
    };
    
    fetchSummaries();
  }, []);

  // Fetch opportunities with filters and sorting
  const { data: opportunities, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities', stageFilter, typeFilter, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select('*');
      
      // Apply filters
      if (stageFilter !== "All Stages") {
        query = query.eq('stage', stageFilter);
      }
      
      if (typeFilter !== "All Types") {
        query = query.eq('opportunity_type', typeFilter);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  // Utility functions
  const formatCurrency = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStageBadgeColor = (stage: string, type: string) => {
    if (stage === 'Closed Won') return 'bg-green-100 text-green-800';
    if (stage === 'Closed Lost') return 'bg-red-100 text-red-800';
    
    if (type === 'Concept') {
      if (stage === 'Discovery') return 'bg-blue-100 text-blue-800';
      if (stage === 'Proposal') return 'bg-purple-100 text-purple-800';
      if (stage === 'Agreement Sent') return 'bg-yellow-100 text-yellow-800';
    } else { // Paid Audit
      if (stage === 'Audit Proposed') return 'bg-blue-100 text-blue-800';
      if (stage === 'Audit Signed') return 'bg-purple-100 text-purple-800';
      if (stage === 'Audit Paid') return 'bg-teal-100 text-teal-800';
      if (stage === 'Audit Delivered') return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  const getStageSummaryCount = (stage: string) => {
    const found = stageSummary.find(item => item.stage === stage);
    return found ? found.count : 0;
  };

  const getTypeSummaryCount = (type: string) => {
    const found = typeSummary.find(item => item.opportunity_type === type);
    return found ? found.count : 0;
  };

  return {
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
  };
};
