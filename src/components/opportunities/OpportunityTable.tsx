
import React from 'react';
import { Building, DollarSign, Tag, Filter, Plus } from 'lucide-react';
import { Opportunity } from '@/components/opportunities/interfaces';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface OpportunityTableProps {
  opportunities: Opportunity[] | null;
  stageFilter: string;
  typeFilter: string;
  setStageFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setIsFormOpen: (isOpen: boolean) => void;
  handleRowClick: (id: string) => void;
  formatCurrency: (value: number | null) => string;
  getStageBadgeColor: (stage: string, type: string) => string;
}

const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  stageFilter,
  typeFilter,
  setStageFilter,
  setTypeFilter,
  setIsFormOpen,
  handleRowClick,
  formatCurrency,
  getStageBadgeColor
}) => {
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-1">No opportunities {stageFilter !== "All Stages" || typeFilter !== "All Types" ? "matching filters" : "yet"}</h3>
        <p className="text-gray-500 mb-4">
          {stageFilter !== "All Stages" || typeFilter !== "All Types" 
            ? "Try adjusting your filters to see more results." 
            : "Start creating opportunities to track your sales pipeline."}
        </p>
        {stageFilter !== "All Stages" || typeFilter !== "All Types" ? (
          <Button variant="outline" onClick={() => {
            setStageFilter("All Stages");
            setTypeFilter("All Types");
          }}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        ) : (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Est. Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {opportunities.map((opportunity) => (
          <TableRow 
            key={opportunity.id}
            onClick={() => handleRowClick(opportunity.id)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <TableCell className="font-medium">{opportunity.name}</TableCell>
            <TableCell className="flex items-center">
              <Building className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              {opportunity.client_name}
            </TableCell>
            <TableCell>
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100">
                {opportunity.opportunity_type}
              </span>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageBadgeColor(opportunity.stage, opportunity.opportunity_type)}`}>
                {opportunity.stage}
              </span>
            </TableCell>
            <TableCell className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
              {formatCurrency(opportunity.estimated_value)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OpportunityTable;
