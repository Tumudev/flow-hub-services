
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  client_name: z.string().min(2, { message: 'Client name must be at least 2 characters' }),
  description: z.string().optional(),
  opportunity_type: z.enum(['Concept', 'Paid Audit']),
  stage: z.string(),
  estimated_value: z.string().optional().transform(val => val ? parseFloat(val) : null),
});

type FormValues = z.infer<typeof formSchema>;
type OpportunityInsert = TablesInsert<'opportunities'>;

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: (shouldRefetch: boolean) => void;
  initialData?: FormValues;
}

// Stage options based on opportunity type
const conceptStages = ['Discovery', 'Proposal', 'Agreement Sent', 'Closed Won', 'Closed Lost'];
const auditStages = ['Audit Proposed', 'Audit Signed', 'Audit Paid', 'Audit Delivered', 'Closed Won', 'Closed Lost'];

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const [opportunityType, setOpportunityType] = useState<'Concept' | 'Paid Audit'>(
    initialData?.opportunity_type || 'Concept'
  );

  // Get relevant stages based on opportunity type
  const relevantStages = opportunityType === 'Concept' ? conceptStages : auditStages;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      client_name: '',
      description: '',
      opportunity_type: 'Concept',
      stage: opportunityType === 'Concept' ? 'Discovery' : 'Audit Proposed',
      estimated_value: '',
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const opportunityData: OpportunityInsert = {
        name: values.name,
        client_name: values.client_name,
        description: values.description || null,
        opportunity_type: values.opportunity_type,
        stage: values.stage,
        estimated_value: values.estimated_value as number | null,
      };

      const { data, error } = await supabase
        .from('opportunities')
        .insert([opportunityData]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Opportunity created successfully');
      onClose(true);
    },
    onError: (error) => {
      console.error('Error creating opportunity:', error);
      toast.error('Failed to create opportunity');
    },
  });

  const onSubmit = (values: FormValues) => {
    createOpportunityMutation.mutate(values);
  };

  // Handle opportunity type change
  const handleOpportunityTypeChange = (type: 'Concept' | 'Paid Audit') => {
    setOpportunityType(type);
    // Set default stage based on new type
    const defaultStage = type === 'Concept' ? 'Discovery' : 'Audit Proposed';
    form.setValue('opportunity_type', type);
    form.setValue('stage', defaultStage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Opportunity</DialogTitle>
          <DialogDescription>
            Create a new business opportunity to track in your pipeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Website Redesign for ABC Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., ABC Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="opportunity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Type</FormLabel>
                  <Select
                    onValueChange={(value: 'Concept' | 'Paid Audit') => {
                      field.onChange(value);
                      handleOpportunityTypeChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Concept">Concept</SelectItem>
                      <SelectItem value="Paid Audit">Paid Audit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of opportunity you're creating.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relevantStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Value ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="E.g., 5000" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Estimated value in USD (optional).
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
                      placeholder="Brief description of the opportunity..." 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOpportunityMutation.isPending}>
                {createOpportunityMutation.isPending ? 'Creating...' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;
