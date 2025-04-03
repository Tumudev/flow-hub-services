
import { Tables } from '@/integrations/supabase/types';

// Define interfaces based on the actual database tables
export interface DiscoveryTemplate {
  id: string;
  name: string;
  sections: string[];
  created_at: string;
  updated_at: string;
}

export interface DiscoverySession extends Tables<'discovery_sessions'> {
  // Add optional property for template relationship
  template?: DiscoveryTemplate | null;
}
