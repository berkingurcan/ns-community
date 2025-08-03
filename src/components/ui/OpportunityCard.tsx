'use client';

import { Project } from '@/types/project';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface OpportunityCardProps {
  project: Project;
  currentUserId?: string;
  timeAgo: string;
  onApply?: (projectId: string) => void;
}

export function OpportunityCard({ project, timeAgo }: OpportunityCardProps) {
  return (
    <Card className="p-4 mb-4 border">
      <CardHeader>
        <h3 className="text-lg font-bold">{project.title}</h3>
        <p className="text-sm text-gray-500">{timeAgo}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{project.description}</p>
        {project.collaboration_status === 'open' && (
          <div className="mt-2 text-green-600 text-sm font-medium">
            ✨ Open for Collaboration
          </div>
        )}
      </CardContent>
    </Card>
  );
}