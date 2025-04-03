
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Search } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

type DiscoverySession = Tables<'discovery_sessions'>;

interface LinkDiscoverySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sessionId: string) => void;
}

const LinkDiscoverySessionModal: React.FC<LinkDiscoverySessionModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch discovery sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['discoverySessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_sessions')
        .select('*')
        .order('session_date', { ascending: false });
      
      if (error) throw error;
      return data as DiscoverySession[];
    },
    enabled: isOpen,
  });

  // Filter sessions based on search term
  const filteredSessions = sessions?.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.client_name.toLowerCase().includes(searchLower) ||
      (session.opportunity_name && session.opportunity_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link Discovery Session</DialogTitle>
          <DialogDescription>
            Select a discovery session to link to this opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by client or opportunity name"
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
          ) : filteredSessions && filteredSessions.length > 0 ? (
            <ul className="divide-y">
              {filteredSessions.map((session) => (
                <li key={session.id} className="py-2">
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => onSelect(session.id)}
                  >
                    <div className="font-medium">{session.client_name}</div>
                    {session.opportunity_name && (
                      <div className="text-sm text-gray-500">
                        {session.opportunity_name}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(session.session_date), 'MMM d, yyyy')}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'No matching sessions found' : 'No discovery sessions found'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDiscoverySessionModal;
