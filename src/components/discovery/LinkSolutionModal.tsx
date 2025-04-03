
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Solution = Tables<'solutions'>;

interface LinkSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  discoverySessionId?: string;
  linkedSolutionIds?: string[];
}

const LinkSolutionModal: React.FC<LinkSolutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  discoverySessionId,
  linkedSolutionIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch active solutions
  const { data: solutions, isLoading } = useQuery({
    queryKey: ['activeSolutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Solution[];
    },
    enabled: isOpen,
  });

  // Mutation to link a solution to a discovery session
  const linkSolutionMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      if (!discoverySessionId) throw new Error('Discovery session ID is required');
      
      const { error } = await supabase
        .from('discovery_session_solutions')
        .insert({
          discovery_session_id: discoverySessionId,
          solution_id: solutionId
        });
      
      if (error) throw error;
      return solutionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', discoverySessionId] });
      toast.success('Solution linked successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error linking solution:', error);
      toast.error('Failed to link solution');
    }
  });

  // Handle selecting a solution
  const handleSelectSolution = (solutionId: string) => {
    linkSolutionMutation.mutate(solutionId);
  };

  // Filter solutions based on search term
  const filteredSolutions = solutions?.filter(solution => {
    const searchLower = searchTerm.toLowerCase();
    return solution.name.toLowerCase().includes(searchLower);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Solution</DialogTitle>
          <DialogDescription>
            Select a solution to link to this discovery session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search solutions"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : filteredSolutions && filteredSolutions.length > 0 ? (
            <ul className="divide-y">
              {filteredSolutions.map((solution) => {
                const isLinked = linkedSolutionIds.includes(solution.id);
                return (
                  <li key={solution.id} className="py-2">
                    <button
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center ${
                        isLinked ? 'bg-green-50' : ''
                      }`}
                      onClick={() => !isLinked && handleSelectSolution(solution.id)}
                      disabled={isLinked}
                    >
                      <div className="font-medium">{solution.name}</div>
                      {isLinked && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'No matching solutions found' : 'No active solutions found'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkSolutionModal;
