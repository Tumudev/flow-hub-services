
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DiscoveryTemplateForm from '@/components/discovery/DiscoveryTemplateForm';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { DiscoveryTemplate } from '@/types/discoveryTypes';

const DiscoveryTemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DiscoveryTemplate | null>(null);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['discoveryTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as unknown as DiscoveryTemplate[];
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      // First check if the template is in use
      const { data: sessionsUsingTemplate, error: checkError } = await supabase
        .from('discovery_sessions')
        .select('id')
        .eq('template_id', templateId)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (sessionsUsingTemplate && sessionsUsingTemplate.length > 0) {
        throw new Error('Cannot delete a template that is in use by discovery sessions');
      }
      
      const { error } = await supabase
        .from('discovery_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveryTemplates'] });
      toast.success('Template deleted successfully');
      setIsDeleteConfirmOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete template');
    }
  });

  const handleOpenForm = (template?: DiscoveryTemplate) => {
    setSelectedTemplate(template || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = (refreshList: boolean) => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
    if (refreshList) {
      queryClient.invalidateQueries({ queryKey: ['discoveryTemplates'] });
    }
  };

  const handleDeleteClick = (template: DiscoveryTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTemplate) {
      deleteTemplateMutation.mutate(selectedTemplate.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Discovery Templates</h1>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus size={16} className="mr-1" />
          Add New Template
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-md shadow">
        {isLoading ? (
          <div className="text-center py-4">Loading templates...</div>
        ) : !templates || templates.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No templates found. Create your first template to get started.
          </div>
        ) : (
          <div className="divide-y">
            {templates.map((template) => (
              <div key={template.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(template.sections) 
                      ? `${template.sections.length} sections` 
                      : '0 sections'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenForm(template)}
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Discovery Template Form Modal */}
      {isFormOpen && (
        <DiscoveryTemplateForm 
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          template={selectedTemplate}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        description={`Are you sure you want to delete the template "${selectedTemplate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default DiscoveryTemplateListPage;
