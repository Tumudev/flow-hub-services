
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Building, Target, Save, PlusCircle, Link as LinkIcon, Unlink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import LinkSolutionModal from '@/components/discovery/LinkSolutionModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import TemplateSectionNotes from '@/components/discovery/TemplateSectionNotes';

type DiscoverySession = Tables<'discovery_sessions'> & {
  linked_solutions?: {
    id: string;
    name: string;
  }[];
  discovery_templates?: {
    id: string;
    name: string;
    sections: string[];
  } | null;
};

const DiscoverySessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string>('');
  const [isLinkSolutionModalOpen, setIsLinkSolutionModalOpen] = useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [solutionToUnlink, setSolutionToUnlink] = useState<string | null>(null);

  // Fetch discovery session details and linked solutions separately
  const { data: session, isLoading, error, refetch } = useQuery({
    queryKey: ['discoverySession', id],
    queryFn: async () => {
      if (!id) throw new Error('Session ID is required');
      
      // Get the discovery session with template
      const { data: sessionData, error: sessionError } = await supabase
        .from('discovery_sessions')
        .select(`
          *,
          discovery_templates (
            id,
            name,
            sections
          )
        `)
        .eq('id', id)
        .single();
      
      if (sessionError) throw sessionError;
      
      // Get the linked solutions through the junction table
      const { data: linkData, error: linkError } = await supabase
        .from('discovery_session_solutions')
        .select('solution_id')
        .eq('discovery_session_id', id);
      
      if (linkError) throw linkError;
      
      // If there are linked solutions, fetch their details
      let linkedSolutions: { id: string; name: string }[] = [];
      
      if (linkData && linkData.length > 0) {
        const solutionIds = linkData.map(item => item.solution_id);
        
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, name')
          .in('id', solutionIds);
        
        if (solutionsError) throw solutionsError;
        
        if (solutionsData) {
          linkedSolutions = solutionsData;
        }
      }
      
      // Combine the data
      return {
        ...sessionData,
        linked_solutions: linkedSolutions
      } as DiscoverySession;
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

  // Link solution mutation
  const linkSolutionMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!id) throw new Error('Session ID is required');
      
      const { data, error } = await supabase
        .from('discovery_session_solutions')
        .insert({
          discovery_session_id: id,
          solution_id: solutionId
        });
      
      if (error) {
        // Handle unique constraint violation (already linked)
        if (error.code === '23505') {
          toast.info('This solution is already linked to the session');
          return;
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', id] });
      toast.success('Solution linked successfully');
      setIsLinkSolutionModalOpen(false);
    },
    onError: (error) => {
      console.error('Error linking solution:', error);
      toast.error('Failed to link solution');
    },
  });

  // Unlink solution mutation
  const unlinkSolutionMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!id) throw new Error('Session ID is required');
      
      const { data, error } = await supabase
        .from('discovery_session_solutions')
        .delete()
        .eq('discovery_session_id', id)
        .eq('solution_id', solutionId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', id] });
      toast.success('Solution unlinked successfully');
      setIsUnlinkConfirmOpen(false);
      setSolutionToUnlink(null);
    },
    onError: (error) => {
      console.error('Error unlinking solution:', error);
      toast.error('Failed to unlink solution');
    },
  });

  const handleSaveNotes = () => {
    saveNotesMutation.mutate(notes);
  };

  const handleLinkSolution = (solutionId: string) => {
    linkSolutionMutation.mutate(solutionId);
  };

  const openUnlinkConfirmation = (solutionId: string) => {
    setSolutionToUnlink(solutionId);
    setIsUnlinkConfirmOpen(true);
  };

  const handleUnlinkSolution = () => {
    if (solutionToUnlink) {
      unlinkSolutionMutation.mutate(solutionToUnlink);
    }
  };

  const getLinkedSolutionIds = () => {
    return session?.linked_solutions?.map(solution => solution.id) || [];
  };

  // Function to check if we have a valid template with sections
  const hasTemplateSections = () => {
    return (
      session?.discovery_templates && 
      session.discovery_templates.sections && 
      Array.isArray(session.discovery_templates.sections) && 
      session.discovery_templates.sections.length > 0
    );
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

            {session.discovery_templates && (
              <div className="flex items-center">
                <div className="h-5 w-5 text-gray-500 mr-2">📋</div>
                <div>
                  <p className="text-sm text-gray-500">Template</p>
                  <p className="text-lg font-medium">{session.discovery_templates.name}</p>
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
        
        {/* Linked Solutions Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Linked Solutions</h2>
          
          {session.linked_solutions && session.linked_solutions.length > 0 ? (
            <div className="space-y-2">
              {session.linked_solutions.map((solution) => (
                <div key={solution.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>{solution.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/solutions/${solution.id}`)}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUnlinkConfirmation(solution.id)}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 p-4 rounded-md text-center">
              <p className="text-gray-500 mb-3">No solutions linked to this discovery session.</p>
            </div>
          )}
          
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={() => setIsLinkSolutionModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Link Solution
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Session Notes</h2>
          
          {hasTemplateSections() ? (
            <TemplateSectionNotes 
              sections={session.discovery_templates.sections}
              initialNotes={session.notes || ''}
              onChange={setNotes}
            />
          ) : (
            <Textarea 
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter session notes here..."
              className="min-h-[200px] w-full"
            />
          )}
          
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

      {/* Link Solution Modal */}
      <LinkSolutionModal
        isOpen={isLinkSolutionModalOpen}
        onClose={() => setIsLinkSolutionModalOpen(false)}
        onSelect={handleLinkSolution}
        linkedSolutionIds={getLinkedSolutionIds()}
      />

      {/* Confirmation Dialog for Unlinking Solution */}
      <ConfirmationDialog
        isOpen={isUnlinkConfirmOpen}
        onClose={() => setIsUnlinkConfirmOpen(false)}
        onConfirm={handleUnlinkSolution}
        title="Unlink Solution"
        description="Are you sure you want to unlink this solution from the discovery session?"
        confirmLabel="Unlink"
        variant="destructive"
      />
    </div>
  );
};

export default DiscoverySessionDetailPage;
