'use client';

import { useState } from 'react';
import { Project, PROJECT_CATEGORIES, COLLABORATION_TYPES, COLLABORATION_STATUS, CreateCollaborationRequestData } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { QuickEditModal } from '@/components/ui/QuickEditModal';
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
  UserPlus,
  Settings,
  Zap,
  StickyNote
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onRequestCollaboration?: (data: CreateCollaborationRequestData) => Promise<void>;
  onQuickEdit?: (projectId: string, updates: Partial<Project>) => Promise<void>;
  onEditMore?: () => void;
  canEdit?: boolean;
  canRequestCollaboration?: boolean;
  currentUserId?: string;
  hasDiscordRole?: boolean; // For showing collaboration badges
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
  onQuickEdit,
  onEditMore,
  canEdit = false,
  canRequestCollaboration = false,
  currentUserId,
  hasDiscordRole = false
}: ProjectCardProps) {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
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
  const isCollaborationOpen = project.collaboration_status === 'open';
  const canShowCollaborationButton = !isOwnProject && canRequestCollaboration && isCollaborationOpen;

  const category = getProjectCategory();
  const collaborationStatus = getCollaborationStatus();
  const lookingForTypes = getCollaborationTypes();

  return (
    <Card className="hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
      {/* Collaboration Badge - Only visible for Discord role holders */}
      {hasDiscordRole && project.collaboration_status === 'open' && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full text-xs">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 dark:text-green-400 font-medium">Open</span>
            {project.notes_for_requests && (
              <div className="relative group">
                <StickyNote className="w-3 h-3 text-green-600 cursor-help" />
                <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {project.notes_for_requests}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
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
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
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

            </div>
          </div>
        </div>
      </CardHeader>

      {/* Quick Edit Button - Floating on Hover */}
      {canEdit && onQuickEdit && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickEdit(true);
            }}
            className="shadow-lg backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            Quick Edit
          </Button>
        </div>
      )}

      <CardContent className="space-y-4 flex-grow">

        {/* Project Description */}
        <div>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Collaboration Info */}
        {lookingForTypes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <UserPlus className="w-4 h-4 mr-1 text-green-500" />
              Looking for Help
            </h4>
            <div className="flex flex-wrap gap-2">
              {lookingForTypes.slice(0, 3).map((type) => (
                <Badge
                  key={type.id}
                  variant="outline"
                  className="text-sm font-medium border-green-200 text-green-800 dark:border-green-700 dark:text-green-400"
                >
                  {type.emoji} {type.label}
                </Badge>
              ))}
              {lookingForTypes.length > 3 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{lookingForTypes.length - 3} more
                </Badge>
              )}
            </div>
            {project.collaboration_description && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                "{project.collaboration_description}"
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div>
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

        {/* Project Links */}
        {(project.github_url || project.live_url || project.twitter_url || project.website_url) && (
           <div>
            <div className="flex gap-2">
                {project.github_url && (
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={project.github_url}
                    >
                        <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                    </a>
                )}
                {project.twitter_url && (
                    <a 
                      href={project.twitter_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-lg transition-colors"
                      title={project.twitter_url}
                    >
                        <Twitter className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                    </a>
                )}
                {project.website_url && (
                    <a 
                      href={project.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 rounded-lg transition-colors"
                      title={project.website_url}
                    >
                        <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300" />
                    </a>
                )}
                {project.live_url && (
                    <a 
                      href={project.live_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-lg transition-colors"
                      title={project.live_url}
                    >
                        <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                    </a>
                )}
            </div>
           </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {(canEdit || canShowCollaborationButton) && (
        <CardFooter className="flex gap-2 pt-4 mt-auto">
          {/* Owner Actions */}
          {canEdit && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(project)}
                  className="flex-1"
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
            </>
          )}
          
          {/* Collaboration Request Button */}
          {canShowCollaborationButton && onRequestCollaboration && (
            <Button
              size="sm"
              onClick={() => {
                // Open collaboration modal
                // This will be handled by parent component
                // For now, we'll use a simple approach
                console.log('Request collaboration for project:', project.id);
              }}
              className="flex-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
              variant="outline"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Request to Join
            </Button>
          )}
        </CardFooter>
      )}

      {/* Quick Edit Modal */}
      {showQuickEdit && onQuickEdit && (
        <QuickEditModal
          project={project}
          isOpen={showQuickEdit}
          onClose={() => setShowQuickEdit(false)}
          onSave={onQuickEdit}
          onEditMore={onEditMore}
        />
      )}
    </Card>
  );
}
