
import React from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { DiscoveryTemplate } from '@/types/discoveryTypes';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  opportunity_name: z.string().optional(),
  session_date: z.date(),
  template_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DiscoverySessionFormProps {
  isOpen: boolean;
  onClose: (refreshList: boolean) => void;
}

const DiscoverySessionForm: React.FC<DiscoverySessionFormProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: '',
      opportunity_name: '',
      session_date: new Date(),
      template_id: undefined,
    },
  });

  // Fetch available templates
  const { data: templates } = useQuery({
    queryKey: ['discoveryTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_templates')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as unknown as Pick<DiscoveryTemplate, 'id' | 'name'>[];
    },
    enabled: isOpen, // Only fetch when the modal is open
  });

  const createSessionMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const sessionData = {
        client_name: values.client_name,
        opportunity_name: values.opportunity_name || null,
        session_date: values.session_date.toISOString(),
        template_id: values.template_id || null,
      };

      const { data, error } = await supabase
        .from('discovery_sessions')
        .insert([sessionData]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySessions'] });
      toast.success('Discovery session created successfully');
      form.reset();
      onClose(true);
    },
    onError: (error) => {
      console.error('Error creating discovery session:', error);
      toast.error('Failed to create discovery session');
    },
  });

  const onSubmit = (values: FormValues) => {
    createSessionMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Discovery Session</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="opportunity_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter opportunity name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="session_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Session Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverySessionForm;
