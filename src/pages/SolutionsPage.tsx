
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface Solution {
  id: string;
  name: string;
  description: string | null;
  pain_points: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const solutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  pain_points: z.string().optional(),
  is_active: z.boolean().default(true),
});

type SolutionFormValues = z.infer<typeof solutionSchema>;

const SolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const { toast } = useToast();

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues: {
      name: '',
      description: '',
      pain_points: '',
      is_active: true,
    },
  });

  useEffect(() => {
    fetchSolutions();
  }, []);

  useEffect(() => {
    if (editingSolution) {
      form.reset({
        name: editingSolution.name,
        description: editingSolution.description || '',
        pain_points: editingSolution.pain_points || '',
        is_active: editingSolution.is_active,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        pain_points: '',
        is_active: true,
      });
    }
  }, [editingSolution, form]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
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

  const handleOpenDialog = (solution: Solution | null = null) => {
    setEditingSolution(solution);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSolution(null);
    form.reset();
  };

  const onSubmit = async (values: SolutionFormValues) => {
    try {
      if (editingSolution) {
        // Update existing solution
        const { error } = await supabase
          .from('solutions')
          .update({
            name: values.name,
            description: values.description || null,
            pain_points: values.pain_points || null,
            is_active: values.is_active,
          })
          .eq('id', editingSolution.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Solution updated successfully.",
        });
      } else {
        // Create new solution
        const { error } = await supabase
          .from('solutions')
          .insert({
            name: values.name,
            description: values.description || null,
            pain_points: values.pain_points || null,
            is_active: values.is_active,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Solution created successfully.",
        });
      }

      handleCloseDialog();
      fetchSolutions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this solution?")) {
      try {
        const { error } = await supabase
          .from('solutions')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Solution deleted successfully.",
        });
        
        fetchSolutions();
      } catch (error: any) {
        toast({
          title: "Error deleting solution",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solutions</h1>
          <p className="text-muted-foreground">
            Manage and track your business solutions.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-serviceblue-600 hover:bg-serviceblue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Solution
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-serviceblue-600"></div>
          </div>
        ) : solutions.length === 0 ? (
          <div className="col-span-full bg-white rounded-md shadow p-6">
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-serviceblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-serviceblue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Solutions Yet</h2>
              <p className="text-gray-500 mb-6">Create your first solution to get started.</p>
              <Button onClick={() => handleOpenDialog()} className="bg-serviceblue-600 hover:bg-serviceblue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Solution
              </Button>
            </div>
          </div>
        ) : (
          solutions.map((solution) => (
            <Card key={solution.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{solution.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {solution.is_active ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-500">
                  Created: {new Date(solution.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="grow">
                {solution.description && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{solution.description}</p>
                  </div>
                )}
                {solution.pain_points && (
                  <div>
                    <h4 className="text-sm font-medium">Pain Points</h4>
                    <p className="text-sm text-gray-600">{solution.pain_points}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenDialog(solution)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(solution.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSolution ? 'Edit Solution' : 'Add New Solution'}</DialogTitle>
            <DialogDescription>
              {editingSolution 
                ? 'Make changes to the existing solution.'
                : 'Fill in the details to create a new solution.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Solution name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description of the solution" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pain_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Points</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Pain points addressed by this solution" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Mark this solution as active or inactive
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="sm:justify-start">
                <Button type="submit" className="bg-serviceblue-600 hover:bg-serviceblue-700">
                  {editingSolution ? 'Update Solution' : 'Create Solution'}
                </Button>
                <Button variant="outline" type="button" onClick={handleCloseDialog}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolutionsPage;
