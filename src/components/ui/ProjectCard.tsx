'use client';

import { Project, PROJECT_CATEGORIES, COLLABORATION_TYPES, COLLABORATION_STATUS, CreateCollaborationRequestData } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Tag,
  Link2,
  Edit,
  Trash2,
  Calendar,
  RefreshCw,
  Github,
  Twitter,
  ExternalLink,
  Users,
  UserPlus
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onRequestCollaboration?: (data: CreateCollaborationRequestData) => Promise<void>;
  canEdit?: boolean;
  canRequestCollaboration?: boolean;
  currentUserId?: string;
}

import { VariantProps } from 'class-variance-authority';

//... (rest of the imports)

const statusVariantMap: Record<Project['status'], VariantProps<typeof badgeVariants>['variant']> = {
  showcase: 'default',
  'NS-Only': 'destructive',
  Archive: 'outline',
  Draft: 'secondary',
};

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onRequestCollaboration,
  canEdit = false,
  canRequestCollaboration = false,
  currentUserId
}: ProjectCardProps) {
  const getHost = (url: string | undefined | null) => {
    if (!url) return '';
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  };

  // Helper functions for collaboration system
  const getProjectCategory = () => {
    return PROJECT_CATEGORIES.find(cat => cat.id === project.category);
  };

  const getCollaborationStatus = () => {
    return COLLABORATION_STATUS.find(status => status.id === project.collaboration_status);
  };

  const getCollaborationTypes = () => {
    return project.looking_for_collaboration?.map(typeId => 
      COLLABORATION_TYPES.find(type => type.id === typeId)
    ).filter(Boolean) || [];
  };

  const isOwnProject = currentUserId === project.user_id;
  const spotsLeft = project.max_collaborators - project.current_collaborators;
  const isCollaborationOpen = project.collaboration_status === 'open' || project.collaboration_status === 'selective';
  const canShowCollaborationButton = !isOwnProject && canRequestCollaboration && isCollaborationOpen && spotsLeft > 0;

  const category = getProjectCategory();
  const collaborationStatus = getCollaborationStatus();
  const lookingForTypes = getCollaborationTypes();

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <CardHeader className="pb-4">
        {/* Project Image and Title */}
        <div className="flex items-start gap-4">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={`${project.title} logo`}
              className="w-16 h-16 object-cover rounded-xl border-2 border-border flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {project.title}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <Badge variant={statusVariantMap[project.status]} className="capitalize">
                {project.status}
              </Badge>
              
              {/* Category Badge */}
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category.emoji} {category.label}
                </Badge>
              )}
              
              {/* Collaboration Status Badge */}
              {collaborationStatus && collaborationStatus.id !== 'not-looking' && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    collaborationStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    collaborationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    collaborationStatus.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    ''
                  }`}
                >
                  {collaborationStatus.emoji} {collaborationStatus.label}
                </Badge>
              )}
              
              {/* Team Size Info */}
              {isCollaborationOpen && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {spotsLeft}/{project.max_collaborators} spots
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">

        {/* Project Description */}
        <div>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-1 text-muted-foreground" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 5).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm font-medium"
                >
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 5 && (
                  <Badge variant="secondary" className="text-muted-foreground">
                    +{project.tags.length - 5} more
                  </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        {(project.github_url || project.live_url || project.twitter_url) && (
           <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                <Link2 className="w-4 h-4 mr-1 text-blue-500" />
                Links
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Github className="w-3 h-3" /> GitHub
                    </a>
                )}
                {project.twitter_url && (
                    <a href={project.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <Twitter className="w-3 h-3" /> Twitter/X
                    </a>
                )}
                {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <ExternalLink className="w-3 h-3" /> {getHost(project.live_url)}
                    </a>
                )}
            </div>
           </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {canEdit && (
        <CardFooter className="flex gap-2 pt-4 mt-auto">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className="flex-1 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
