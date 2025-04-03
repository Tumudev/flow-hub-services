import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Building, Calendar, FileText, LinkIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import LinkSolutionModal from '@/components/discovery/LinkSolutionModal';
import TemplateSectionNotes from '@/components/discovery/TemplateSectionNotes';
import { DiscoverySession, DiscoveryTemplate } from '@/types/discoveryTypes';

const DiscoverySessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string>('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['discoverySession', id],
    queryFn: async () => {
      if (!id) throw new Error('Session ID is required');
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('discovery_sessions')
        .select(`
          *,
          template:template_id (
            id,
            name,
            sections
          )
        `)
        .eq('id', id)
        .single();
      
      if (sessionError) throw sessionError;
      
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('discovery_session_solutions')
        .select(`
          solution:solution_id (
            id,
            name
          )
        `)
        .eq('discovery_session_id', id);
      
      if (solutionsError) throw solutionsError;
      
      const linkedSolutions = solutionsData.map(item => ({
        id: item.solution.id,
        name: item.solution.name
      }));
      
      const result = {
        ...sessionData,
        template: sessionData.template as DiscoveryTemplate,
        linked_solutions: linkedSolutions
      } as DiscoverySession & { 
        linked_solutions: { id: string; name: string }[],
        template?: DiscoveryTemplate 
      };
      
      setNotes(result.notes || '');
      setIsEditingNotes(false);
      
      return result;
    },
    enabled: !!id,
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notesContent: string) => {
      if (!id) throw new Error('Session ID is required');
      
      const { error } = await supabase
        .from('discovery_sessions')
        .update({ notes: notesContent, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      return notesContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', id] });
      toast.success('Notes saved successfully');
      setIsEditingNotes(false);
    },
    onError: (error) => {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    },
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notes);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setIsEditingNotes(true);
  };

  const handleLinkSolutionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['discoverySession', id] });
    setIsLinkModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/discovery')} className="mr-2">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Separator />
          <div>
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/discovery')} className="mr-2">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">Failed to load discovery session. Please try again.</p>
          <Button onClick={() => navigate(0)} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  const hasTemplateSections = 
    session.template && 
    Array.isArray(session.template.sections) && 
    session.template.sections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/discovery')} className="mr-2">
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{session.client_name}</h1>
          {session.opportunity_name && (
            <Badge variant="outline" className="ml-3">
              {session.opportunity_name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditingNotes && (
            <Button 
              variant="default" 
              onClick={handleSaveNotes}
              disabled={updateNotesMutation.isPending}
            >
              <Save size={16} className="mr-1" />
              Save Notes
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setIsLinkModalOpen(true)}
          >
            <LinkIcon size={16} className="mr-1" />
            Link Solution
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center text-gray-500">
              <Building size={16} className="mr-2" />
              <span>Client: <span className="font-medium text-gray-700">{session.client_name}</span></span>
            </div>
            
            <div className="flex items-center text-gray-500">
              <Calendar size={16} className="mr-2" />
              <span>Date: <span className="font-medium text-gray-700">
                {format(new Date(session.session_date), 'MMM d, yyyy')}
              </span></span>
            </div>
            
            {session.template && (
              <div className="flex items-center text-gray-500">
                <FileText size={16} className="mr-2" />
                <span>Template: <span className="font-medium text-gray-700">{session.template.name}</span></span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-medium mb-3">Linked Solutions</h2>
            {session.linked_solutions && session.linked_solutions.length > 0 ? (
              <div className="space-y-2">
                {session.linked_solutions.map((solution) => (
                  <div key={solution.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <Link 
                      to={`/solutions/${solution.id}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {solution.name}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm p-3 border border-dashed rounded-md">
                No solutions linked to this discovery session yet. Click "Link Solution" to add one.
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-lg font-medium mb-4">Discovery Notes</h2>
            
            {hasTemplateSections ? (
              <TemplateSectionNotes
                sections={session.template.sections as string[]}
                initialNotes={session.notes || ''}
                onChange={handleNotesChange}
              />
            ) : (
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Enter discovery session notes here..."
                className="min-h-[300px] w-full"
              />
            )}
          </div>
        </div>
      </div>
      
      <LinkSolutionModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        discoverySessionId={id}
        onSuccess={handleLinkSolutionSuccess}
        linkedSolutionIds={session?.linked_solutions?.map(s => s.id) || []}
      />
    </div>
  );
};

export default DiscoverySessionDetailPage;
