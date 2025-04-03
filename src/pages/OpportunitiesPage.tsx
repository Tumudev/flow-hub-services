
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Building, DollarSign, Tag, ArrowUpDown, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import OpportunityForm from '@/components/opportunities/OpportunityForm';
import { Opportunity, conceptStages, auditStages } from '@/components/opportunities/interfaces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

// Type for the stage summary
type StageSummary = {
  stage: string;
  count: number;
};

// Type for the type summary
type TypeSummary = {
  opportunity_type: string;
  count: number;
};

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter and sort states
  const [stageFilter, setStageFilter] = useState<string>("All Stages");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  
  // Summary data states
  const [stageSummary, setStageSummary] = useState<StageSummary[]>([]);
  const [typeSummary, setTypeSummary] = useState<TypeSummary[]>([]);
  
  // All possible stages from both opportunity types
  const allStages = [...new Set([...conceptStages, ...auditStages])];

  // Fetch summary counts
  useEffect(() => {
    const fetchSummaries = async () => {
      // Fetch stage summary
      const { data: stageData, error: stageError } = await supabase
        .from('opportunities')
        .select('stage, count(*)', { count: 'exact' })
        .groupby('stage');
      
      if (!stageError && stageData) {
        setStageSummary(stageData as StageSummary[]);
      }
      
      // Fetch type summary
      const { data: typeData, error: typeError } = await supabase
        .from('opportunities')
        .select('opportunity_type, count(*)', { count: 'exact' })
        .groupby('opportunity_type');
      
      if (!typeError && typeData) {
        setTypeSummary(typeData as TypeSummary[]);
      }
    };
    
    fetchSummaries();
  }, []);
  
  // Fetch opportunities with filters and sorting
  const { data: opportunities, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities', stageFilter, typeFilter, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select('*');
      
      // Apply filters
      if (stageFilter !== "All Stages") {
        query = query.eq('stage', stageFilter);
      }
      
      if (typeFilter !== "All Types") {
        query = query.eq('opportunity_type', typeFilter);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  const handleRowClick = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  const handleFormClose = (shouldRefetch: boolean) => {
    setIsFormOpen(false);
    if (shouldRefetch) {
      refetch();
    }
  };

  // Format currency value
  const formatCurrency = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Get stage badge color
  const getStageBadgeColor = (stage: string, type: string) => {
    if (stage === 'Closed Won') return 'bg-green-100 text-green-800';
    if (stage === 'Closed Lost') return 'bg-red-100 text-red-800';
    
    if (type === 'Concept') {
      if (stage === 'Discovery') return 'bg-blue-100 text-blue-800';
      if (stage === 'Proposal') return 'bg-purple-100 text-purple-800';
      if (stage === 'Agreement Sent') return 'bg-yellow-100 text-yellow-800';
    } else { // Paid Audit
      if (stage === 'Audit Proposed') return 'bg-blue-100 text-blue-800';
      if (stage === 'Audit Signed') return 'bg-purple-100 text-purple-800';
      if (stage === 'Audit Paid') return 'bg-teal-100 text-teal-800';
      if (stage === 'Audit Delivered') return 'bg-yellow-100 text-yellow-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  // Count total opportunities for a specific stage
  const getStageSummaryCount = (stage: string) => {
    const found = stageSummary.find(item => item.stage === stage);
    return found ? found.count : 0;
  };

  // Count total opportunities for a specific type
  const getTypeSummaryCount = (type: string) => {
    const found = typeSummary.find(item => item.opportunity_type === type);
    return found ? found.count : 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage business opportunities.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage business opportunities.
          </p>
        </div>
        <div className="bg-white rounded-md shadow p-6">
          <p className="text-red-500">Failed to load opportunities. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground">
          Track and manage business opportunities.
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">By Stage</h3>
            <div className="flex flex-wrap gap-2">
              {allStages.map((stage) => (
                <Badge 
                  key={stage}
                  variant="outline" 
                  className={`${getStageBadgeColor(stage, "")}`}
                >
                  {stage}: {getStageSummaryCount(stage)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">By Type</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                Concept: {getTypeSummaryCount("Concept")}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-800">
                Paid Audit: {getTypeSummaryCount("Paid Audit")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter and Sort Controls */}
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
            <Button variant="outline" onClick={() => {
              setStageFilter("All Stages");
              setTypeFilter("All Types");
              setSortBy("created_at");
              setSortOrder("desc");
            }}>
              Reset Filters
            </Button>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        {opportunities && opportunities.length > 0 ? (
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
        ) : (
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
        )}
      </div>
      
      <OpportunityForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
};

export default OpportunitiesPage;
