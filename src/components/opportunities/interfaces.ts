
import { Tables } from '@/integrations/supabase/types';

// Create a type for the Opportunity from our database
export type Opportunity = {
  id: string;
  name: string;
  client_name: string;
  description: string | null;
  opportunity_type: 'Concept' | 'Paid Audit';
  stage: string;
  estimated_value: number | null;
  created_at: string;
  updated_at: string;
  discovery_session_id: string | null;
};

// Create a type for the form values
export type OpportunityFormValues = {
  name: string;
  client_name: string;
  description?: string;
  opportunity_type: 'Concept' | 'Paid Audit';
  stage: string;
  estimated_value?: string; // String for form input
};

// Define the valid stage options
export const conceptStages = ['Discovery', 'Proposal', 'Agreement Sent', 'Closed Won', 'Closed Lost'];
export const auditStages = ['Audit Proposed', 'Audit Signed', 'Audit Paid', 'Audit Delivered', 'Closed Won', 'Closed Lost'];
