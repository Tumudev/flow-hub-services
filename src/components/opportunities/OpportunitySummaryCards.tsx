
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

interface OpportunitySummaryCardsProps {
  stageSummary: StageSummary[];
  typeSummary: TypeSummary[];
  allStages: string[];
  getStageBadgeColor: (stage: string, type: string) => string;
  getStageSummaryCount: (stage: string) => number;
  getTypeSummaryCount: (type: string) => number;
}

const OpportunitySummaryCards: React.FC<OpportunitySummaryCardsProps> = ({
  stageSummary,
  typeSummary,
  allStages,
  getStageBadgeColor,
  getStageSummaryCount,
  getTypeSummaryCount
}) => {
  return (
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
  );
};

export default OpportunitySummaryCards;
