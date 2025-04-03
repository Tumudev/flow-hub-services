
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ArrowLeft, Edit, Archive, CheckCircle, XCircle } from 'lucide-react';
import SolutionForm, { SolutionFormValues } from '@/components/solutions/SolutionForm';
import ConfirmationDialog from '@/components/ConfirmationDialog';

type Solution = Tables<'solutions'>;

const SolutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'archive' | null>(null);

  useEffect(() => {
    if (id) {
      fetchSolution(id);
    }
  }, [id]);

  const fetchSolution = async (solutionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', solutionId)
        .single();

      if (error) {
        throw error;
      }

      setSolution(data);
    } catch (error: any) {
      toast({
        title: "Error fetching solution",
        description: error.message,
        variant: "destructive",
      });
      navigate('/solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSolution = async (values: SolutionFormValues) => {
    if (!id || !solution) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('solutions')
        .update({
          name: values.name,
          description: values.description || null,
          pain_points: values.pain_points || null,
        })
        .eq('id', id);

      if (error) {
        if (error.code === '23505') { // Unique constraint error
          toast({
            title: "Error",
            description: "A solution with this name already exists.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Solution updated successfully.",
      });
      
      setEditModalOpen(false);
      fetchSolution(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!id || !solution || !statusAction) return;
    
    try {
      const newStatus = statusAction === 'activate';
      
      const { error } = await supabase
        .from('solutions')
        .update({
          is_active: newStatus,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Solution ${newStatus ? 'activated' : 'archived'} successfully.`,
      });
      
      fetchSolution(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openStatusConfirmation = (action: 'activate' | 'archive') => {
    setStatusAction(action);
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-serviceblue-600"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Solution not found</h2>
        <Button 
          onClick={() => navigate('/solutions')} 
          variant="outline" 
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Solutions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate('/solutions')} 
            variant="outline" 
            size="sm"
            className="h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{solution.name}</h1>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button 
            onClick={() => setEditModalOpen(true)} 
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          {solution.is_active ? (
            <Button 
              onClick={() => openStatusConfirmation('archive')} 
              variant="outline"
              className="text-gray-600 hover:text-gray-700"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          ) : (
            <Button 
              onClick={() => openStatusConfirmation('activate')} 
              variant="outline"
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">Status:</span>
          {solution.is_active ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <XCircle className="w-3 h-3 mr-1" />
              Archived
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          Last updated: {new Date(solution.updated_at).toLocaleDateString()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          {solution.description ? (
            <p className="text-gray-700 whitespace-pre-line">{solution.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided</p>
          )}
        </div>
        
        <div className="bg-white rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pain Points</h2>
          {solution.pain_points ? (
            <p className="text-gray-700 whitespace-pre-line">{solution.pain_points}</p>
          ) : (
            <p className="text-gray-400 italic">No pain points provided</p>
          )}
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Solution</DialogTitle>
            <DialogDescription>
              Make changes to the existing solution.
            </DialogDescription>
          </DialogHeader>
          <SolutionForm 
            defaultValues={{
              name: solution.name,
              description: solution.description || '',
              pain_points: solution.pain_points || '',
            }}
            onSubmit={handleEditSolution}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleStatusChange}
        title={statusAction === 'archive' ? 'Archive Solution' : 'Activate Solution'}
        description={
          statusAction === 'archive' 
            ? 'Are you sure you want to archive this solution? It will no longer appear in the active solutions list.'
            : 'Are you sure you want to activate this solution? It will appear in the active solutions list.'
        }
        confirmLabel={statusAction === 'archive' ? 'Archive' : 'Activate'}
        variant={statusAction === 'archive' ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default SolutionDetailPage;
