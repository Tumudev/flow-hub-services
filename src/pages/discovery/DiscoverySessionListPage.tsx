
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DiscoverySessionForm from '@/components/discovery/DiscoverySessionForm';
import { Tables } from '@/integrations/supabase/types';

type DiscoverySession = Tables<'discovery_sessions'>;

const DiscoverySessionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch discovery sessions
  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['discoverySessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_sessions')
        .select('*')
        .order('session_date', { ascending: false });
      
      if (error) throw error;
      return data as DiscoverySession[];
    },
  });

  const handleRowClick = (id: string) => {
    navigate(`/discovery/${id}`);
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
          <h1 className="text-2xl font-bold tracking-tight">Discovery Sessions</h1>
          <p className="text-muted-foreground">
            Manage client discovery sessions and questionnaires.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Discovery
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
          <h1 className="text-2xl font-bold tracking-tight">Discovery Sessions</h1>
          <p className="text-muted-foreground">
            Manage client discovery sessions and questionnaires.
          </p>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <p className="text-red-500">Failed to load discovery sessions. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discovery Sessions</h1>
        <p className="text-muted-foreground">
          Manage client discovery sessions and questionnaires.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Discovery
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        {sessions && sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Session Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow 
                  key={session.id}
                  onClick={() => handleRowClick(session.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    {session.client_name}
                  </TableCell>
                  <TableCell>{session.opportunity_name || '—'}</TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                    {format(new Date(session.session_date), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No discovery sessions yet</h3>
            <p className="text-gray-500 mb-4">Start your first discovery session to begin tracking client conversations.</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start New Discovery
            </Button>
          </div>
        )}
      </div>
      
      <DiscoverySessionForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
};

export default DiscoverySessionListPage;
