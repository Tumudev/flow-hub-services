
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tables } from '@/integrations/supabase/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Solution = Tables<'solutions'>;

const solutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  pain_points: z.string().optional(),
});

export type SolutionFormValues = z.infer<typeof solutionSchema>;

interface SolutionFormProps {
  defaultValues?: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const SolutionForm: React.FC<SolutionFormProps> = ({
  defaultValues = {
    name: '',
    description: '',
    pain_points: '',
  },
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues,
  });

  const handleSubmit = async (values: SolutionFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Solution name" {...field} />
              </FormControl>
              <FormDescription>
                Enter a unique name for this solution.
              </FormDescription>
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
                <Textarea 
                  placeholder="Description of the solution" 
                  {...field} 
                  value={field.value || ''}
                  rows={3}
                />
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
                <Textarea 
                  placeholder="Pain points addressed by this solution" 
                  {...field} 
                  value={field.value || ''}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="bg-serviceblue-600 hover:bg-serviceblue-700">
            {isSubmitting ? 'Saving...' : 'Save Solution'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SolutionForm;
