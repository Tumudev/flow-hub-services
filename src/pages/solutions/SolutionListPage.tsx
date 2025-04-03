
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import SolutionForm, { SolutionFormValues } from '@/components/solutions/SolutionForm';

type Solution = Tables<'solutions'>;

const SolutionListPage: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setSolutions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching solutions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSolution = async (values: SolutionFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('solutions')
        .insert({
          name: values.name,
          description: values.description || null,
          pain_points: values.pain_points || null,
          is_active: true,
        });

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
        description: "Solution created successfully.",
      });
      
      setModalOpen(false);
      fetchSolutions();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solutions</h1>
          <p className="text-muted-foreground">
            Manage your business solutions
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)} 
          className="bg-serviceblue-600 hover:bg-serviceblue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Solution
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-serviceblue-600"></div>
        </div>
      ) : solutions.length === 0 ? (
        <div className="bg-white rounded-md shadow p-6">
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-serviceblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-serviceblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No Active Solutions</h2>
            <p className="text-gray-500 mb-6">Create your first solution to get started.</p>
            <Button 
              onClick={() => setModalOpen(true)} 
              className="bg-serviceblue-600 hover:bg-serviceblue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Solution
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map((solution) => (
            <Card key={solution.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{solution.name}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Created: {new Date(solution.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="grow">
                {solution.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{solution.description}</p>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link 
                  to={`/solutions/${solution.id}`}
                  className="flex items-center text-serviceblue-600 hover:text-serviceblue-700 ml-auto"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Solution</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new solution.
            </DialogDescription>
          </DialogHeader>
          <SolutionForm 
            onSubmit={handleCreateSolution}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolutionListPage;
