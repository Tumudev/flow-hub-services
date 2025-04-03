
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  DollarSign, 
  Clock, 
  Tag, 
  Edit, 
  Trash2,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Opportunity, conceptStages, auditStages } from '@/components/opportunities/interfaces';
import LinkDiscoverySessionModal from '@/components/opportunities/LinkDiscoverySessionModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';

type OpportunityWithDiscoverySession = Opportunity & {
  discovery_session?: {
    id: string;
    client_name: string;
    session_date: string;
  } | null;
};

const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const [isLinkSessionModalOpen, setIsLinkSessionModalOpen] = useState(false);
  const [isUnlinkSessionConfirmOpen, setIsUnlinkSessionConfirmOpen] = useState(false);

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

  // Fetch opportunity data with linked discovery session
  const { data: opportunity, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      if (!id) throw new Error('Opportunity ID is required');
      
      // First get the opportunity data
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const opportunityData = data as Opportunity;
      
      // If the opportunity has a linked discovery session, fetch it
      let discoverySession = null;
      if (opportunityData.discovery_session_id) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('discovery_sessions')
          .select('id, client_name, session_date')
          .eq('id', opportunityData.discovery_session_id)
          .single();
        
        if (!sessionError && sessionData) {
          discoverySession = sessionData;
        }
      }
      
      // Return combined data
      return {
        ...opportunityData,
        discovery_session: discoverySession
      } as OpportunityWithDiscoverySession;
    }
  });

  // Set initial form values when opportunity data is loaded
  useEffect(() => {
    if (opportunity) {
      setDescription(opportunity.description || '');
      setStage(opportunity.stage);
    }
  }, [opportunity]);

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: any }) => {
      if (!id) throw new Error('Opportunity ID is required');
      
      const { data, error } = await supabase
        .from('opportunities')
        .update({ [field]: value })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      toast.success('Opportunity updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating opportunity:', error);
      toast.error('Failed to update opportunity');
    },
  });

  // Link discovery session mutation
  const linkSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!id) throw new Error('Opportunity ID is required');
      
      const { data, error } = await supabase
        .from('opportunities')
        .update({ discovery_session_id: sessionId })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      toast.success('Discovery session linked successfully');
      setIsLinkSessionModalOpen(false);
    },
    onError: (error) => {
      console.error('Error linking discovery session:', error);
      toast.error('Failed to link discovery session');
    },
  });

  // Unlink discovery session mutation
  const unlinkSessionMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Opportunity ID is required');
      
      const { data, error } = await supabase
        .from('opportunities')
        .update({ discovery_session_id: null })
        .eq('id', id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      toast.success('Discovery session unlinked successfully');
      setIsUnlinkSessionConfirmOpen(false);
    },
    onError: (error) => {
      console.error('Error unlinking discovery session:', error);
      toast.error('Failed to unlink discovery session');
    },
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Opportunity ID is required');
      
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Opportunity deleted successfully');
      navigate('/opportunities');
    },
    onError: (error) => {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    },
  });

  // Save description changes
  const saveDescription = () => {
    updateOpportunityMutation.mutate({ field: 'description', value: description });
  };

  // Handle stage change
  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    updateOpportunityMutation.mutate({ field: 'stage', value: newStage });
  };

  // Handle opportunity deletion with confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      deleteOpportunityMutation.mutate();
    }
  };

  // Handle linking a discovery session
  const handleLinkSession = (sessionId: string) => {
    linkSessionMutation.mutate(sessionId);
  };

  // Handle unlinking a discovery session
  const handleUnlinkSession = () => {
    unlinkSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="bg-white rounded-md shadow p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Opportunity Details</h1>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <p className="text-red-500">Failed to load opportunity details. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  // Get the list of available stages based on opportunity type
  const availableStages = opportunity ? (opportunity.opportunity_type === 'Concept' ? conceptStages : auditStages) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{opportunity?.name}</h1>
      </div>

      {opportunity && (
        <div className="bg-white rounded-md shadow p-6 space-y-6">
          <div className="flex justify-between">
            <div>
              <span className="px-2 py-1 text-xs rounded-md font-medium bg-gray-100 inline-flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {opportunity.opportunity_type}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                disabled={deleteOpportunityMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-lg">{opportunity.client_name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Stage</h3>
              {isEditing ? (
                <Select
                  value={stage}
                  onValueChange={handleStageChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStages.map((stageOption) => (
                      <SelectItem key={stageOption} value={stageOption}>
                        {stageOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-md text-sm font-medium ${getStageBadgeColor(opportunity.stage, opportunity.opportunity_type)}`}>
                    {opportunity.stage}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Value</h3>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-lg">{formatCurrency(opportunity.estimated_value)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-lg">{format(new Date(opportunity.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Linked Discovery Session Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Linked Discovery Session</h3>
            {opportunity.discovery_session ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{opportunity.discovery_session.client_name}</h4>
                    <p className="text-sm text-gray-600">{format(new Date(opportunity.discovery_session.session_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/discovery/${opportunity.discovery_session?.id}`)}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsUnlinkSessionConfirmOpen(true)}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 p-4 rounded-md text-center">
                <p className="text-gray-500 mb-3">No discovery session linked to this opportunity.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsLinkSessionModalOpen(true)}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link Discovery Session
                </Button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for this opportunity..."
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setDescription(opportunity.description || '');
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveDescription}
                    disabled={updateOpportunityMutation.isPending}
                  >
                    {updateOpportunityMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {opportunity.description || 'No description provided.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Link Discovery Session Modal */}
      <LinkDiscoverySessionModal
        isOpen={isLinkSessionModalOpen}
        onClose={() => setIsLinkSessionModalOpen(false)}
        onSelect={handleLinkSession}
      />

      {/* Confirmation Dialog for Unlinking Session */}
      <ConfirmationDialog
        isOpen={isUnlinkSessionConfirmOpen}
        onClose={() => setIsUnlinkSessionConfirmOpen(false)}
        onConfirm={handleUnlinkSession}
        title="Unlink Discovery Session"
        description="Are you sure you want to unlink this discovery session? This will remove the connection between this opportunity and the discovery session."
        confirmLabel="Unlink"
        variant="destructive"
      />
    </div>
  );
};

export default OpportunityDetailPage;
