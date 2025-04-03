
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
});

interface DiscoveryTemplateFormProps {
  isOpen: boolean;
  onClose: (refreshList: boolean) => void;
  template?: DiscoveryTemplate | null;
}

const DiscoveryTemplateForm: React.FC<DiscoveryTemplateFormProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [sections, setSections] = useState<string[]>([]);
  const isEditMode = !!template;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
    },
  });

  useEffect(() => {
    if (template && template.sections) {
      const parsedSections = Array.isArray(template.sections) 
        ? template.sections as string[]
        : [];
      setSections(parsedSections);
    }
  }, [template]);

  const saveTemplateMutation = useMutation({
    mutationFn: async (formData: { name: string, sections: string[] }) => {
      const { name, sections } = formData;
      
      if (isEditMode && template) {
        // Update existing template
        const { data, error } = await supabase
          .from('discovery_templates')
          .update({
            name,
            sections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id);
        
        if (error) {
          if (error.code === '23505') { // Unique violation
            throw new Error('A template with this name already exists');
          }
          throw error;
        }
        return data;
      } else {
        // Create new template
        const newTemplate = {
          name,
          sections,
        };
        
        const { data, error } = await supabase
          .from('discovery_templates')
          .insert([newTemplate]);
        
        if (error) {
          if (error.code === '23505') { // Unique violation
            throw new Error('A template with this name already exists');
          }
          throw error;
        }
        return data;
      }
    },
    onSuccess: () => {
      toast.success(`Template ${isEditMode ? 'updated' : 'created'} successfully`);
      form.reset();
      setSections([]);
      onClose(true);
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save template');
    },
  });

  const handleAddSection = () => {
    setSections([...sections, '']);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = value;
    setSections(updatedSections);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Filter out empty sections
    const filteredSections = sections.filter(section => section.trim().length > 0);
    saveTemplateMutation.mutate({
      name: values.name,
      sections: filteredSections,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <FormLabel>Template Sections</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddSection}
                >
                  <Plus size={14} className="mr-1" />
                  Add Section
                </Button>
              </div>
              
              {sections.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 border border-dashed rounded-md text-center">
                  No sections added. Click "Add Section" to create your first section.
                </div>
              ) : (
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={section}
                        onChange={(e) => handleUpdateSection(index, e.target.value)}
                        placeholder={`Section ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveSection(index)}
                        className="h-10 w-10"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
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
                disabled={saveTemplateMutation.isPending}
              >
                {saveTemplateMutation.isPending 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Template' : 'Create Template')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoveryTemplateForm;
