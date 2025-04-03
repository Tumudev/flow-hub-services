import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Building, DollarSign, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { Opportunity } from '@/components/opportunities/interfaces';

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch opportunities
  const { data: opportunities, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  const handleRowClick = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  const handleFormClose = (shouldRefetch: boolean) => {
    setIsFormOpen(false);
    if (shouldRefetch) {
      refetch();
    }
  };

  // Format currency value
  const formatCurrency = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Get stage badge color
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
      
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        {opportunities && opportunities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Est. Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow 
                  key={opportunity.id}
                  onClick={() => handleRowClick(opportunity.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">{opportunity.name}</TableCell>
                  <TableCell className="flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    {opportunity.client_name}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100">
                      {opportunity.opportunity_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageBadgeColor(opportunity.stage, opportunity.opportunity_type)}`}>
                      {opportunity.stage}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
                    {formatCurrency(opportunity.estimated_value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No opportunities yet</h3>
            <p className="text-gray-500 mb-4">Start creating opportunities to track your sales pipeline.</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Opportunity
            </Button>
          </div>
        )}
      </div>
      
      <OpportunityForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
};

export default OpportunitiesPage;
