
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface OpportunityFilterControlsProps {
  stageFilter: string;
  setStageFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  allStages: string[];
  setIsFormOpen: (isOpen: boolean) => void;
}

const OpportunityFilterControls: React.FC<OpportunityFilterControlsProps> = ({
  stageFilter,
  setStageFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  allStages,
  setIsFormOpen
}) => {
  const resetFilters = () => {
    setStageFilter("All Stages");
    setTypeFilter("All Types");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  return (
    <div className="bg-white p-4 rounded-md shadow space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2 md:w-1/4">
          <label className="text-sm font-medium">Filter by Stage</label>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Stages">All Stages</SelectItem>
              {allStages.map((stage) => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:w-1/4">
          <label className="text-sm font-medium">Filter by Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Types">All Types</SelectItem>
              <SelectItem value="Concept">Concept</SelectItem>
              <SelectItem value="Paid Audit">Paid Audit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:w-1/4">
          <label className="text-sm font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Created Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created Date</SelectItem>
              <SelectItem value="client_name">Client Name</SelectItem>
              <SelectItem value="name">Opportunity Name</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
              <SelectItem value="estimated_value">Estimated Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:w-1/4">
          <label className="text-sm font-medium">Order</label>
          <ToggleGroup type="single" value={sortOrder} onValueChange={(value) => value && setSortOrder(value)}>
            <ToggleGroupItem value="asc" aria-label="Sort Ascending">
              Ascending
            </ToggleGroupItem>
            <ToggleGroupItem value="desc" aria-label="Sort Descending">
              Descending
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>
    </div>
  );
};

export default OpportunityFilterControls;
