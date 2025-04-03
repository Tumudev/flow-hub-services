
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Building, Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

type DiscoverySession = {
  id: string;
  client_name: string;
  opportunity_name: string | null;
  session_date: string;
  notes: string | null;
};

const DiscoverySessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string>('');

  // Fetch discovery session details
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['discoverySession', id],
    queryFn: async () => {
      if (!id) throw new Error('Session ID is required');
      const { data, error } = await supabase
        .from('discovery_sessions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as DiscoverySession;
    },
  });

  // Update notes when session data is loaded
  useEffect(() => {
    if (session && session.notes !== null) {
      setNotes(session.notes);
    }
  }, [session]);

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!id) throw new Error('Session ID is required');
      const { data, error } = await supabase
        .from('discovery_sessions')
        .update({ notes })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', id] });
      toast.success('Notes saved successfully');
    },
    onError: (error) => {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    },
  });

  const handleSaveNotes = () => {
    saveNotesMutation.mutate(notes);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/discovery')}
            className="mr-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading session...</h1>
        </div>
        <div className="bg-white p-6 rounded-md shadow animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/discovery')}
            className="mr-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="bg-white p-6 rounded-md shadow">
          <p className="text-red-500">Failed to load discovery session. Please try again.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/discovery')}
          >
            Return to Discovery Sessions
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(session.session_date), 'MMMM d, yyyy');

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/discovery')}
          className="mr-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Discovery Session Details</h1>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="text-lg font-medium">{session.client_name}</p>
              </div>
            </div>
            
            {session.opportunity_name && (
              <div className="flex items-center">
                <Target className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Opportunity</p>
                  <p className="text-lg font-medium">{session.opportunity_name}</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Session Date</p>
                <p className="text-lg font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Session Notes</h2>
          <Textarea 
            value={notes || ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter session notes here..."
            className="min-h-[200px] w-full"
          />
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSaveNotes}
              disabled={saveNotesMutation.isPending}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverySessionDetailPage;
