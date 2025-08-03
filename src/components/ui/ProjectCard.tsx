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
  StickyNote,
  Eye
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
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] bg-background rounded-[inherit]" />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="relative p-6 pb-4">


          {/* Project Header */}
          <div className="flex items-start gap-4">
            {/* Project Avatar */}
            <div className="relative">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={`${project.title} logo`}
                  className="w-16 h-16 object-cover rounded-2xl shadow-lg ring-2 ring-background group-hover:ring-primary/20 transition-all duration-300"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-background group-hover:ring-primary/20 transition-all duration-300">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              )}
              
              {/* Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
                project.status === 'active' ? 'bg-emerald-500' :
                project.status === 'in-development' ? 'bg-blue-500' :
                project.status === 'completed' ? 'bg-gray-500' : 'bg-orange-500'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              {/* Title with OPEN Badge */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 truncate">
                  {project.title}
                </h3>
                {hasDiscordRole && project.collaboration_status === 'open' && (
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm opacity-30 animate-pulse" />
                      <div className="relative bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                        OPEN
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Category & Status Pills */}
              <div className="flex items-center flex-wrap gap-2">
                {category && (
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs font-medium">
                    <span className="text-base">{category.emoji}</span>
                    <span className="text-muted-foreground">{category.label}</span>
                  </div>
                )}
                
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                  project.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  project.status === 'in-development' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  project.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {project.status}
                </div>
              </div>
            </div>

            {/* Quick Edit - Floating Action */}
            {canEdit && onQuickEdit && (
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 self-end">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickEdit(true);
                  }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg hover:shadow-xl text-xs font-medium px-2.5 py-1.5 h-auto"
                  variant="ghost"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 space-y-5 flex-grow">
          {/* Project Description */}
          <div className="space-y-3">
            <p className="text-muted-foreground leading-relaxed text-sm line-clamp-2 group-hover:text-foreground/80 transition-colors">
              {project.description}
            </p>
          </div>

          {/* Collaboration Section - Premium Design */}
          {lookingForTypes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <UserPlus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Seeking Collaborators</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {lookingForTypes.slice(0, 3).map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                  </div>
                ))}
                {lookingForTypes.length > 3 && (
                  <div className="flex items-center px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                    +{lookingForTypes.length - 3} more
                  </div>
                )}
              </div>
              
              {/* Collaboration Note - Always show if collaboration is open */}
              {hasDiscordRole && project.collaboration_status === 'open' && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <StickyNote className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Note for Collaborators</div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        {project.notes_for_requests || "No specific requirements. Feel free to reach out!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack / Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tech Stack</h4>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted/60 hover:bg-muted text-xs font-medium rounded-md transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 4 && (
                  <span className="px-2 py-1 bg-muted/40 text-xs font-medium text-muted-foreground rounded-md">
                    +{project.tags.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-muted/30 bg-muted/10">
          <div className="flex items-center justify-between">
            {/* Social Links */}
            <div className="flex items-center gap-1">
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                  title="View on GitHub"
                >
                  <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                </a>
              )}
              {project.twitter_url && (
                <a 
                  href={project.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative p-2.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                  title="Follow on Twitter"
                >
                  <Twitter className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                </a>
              )}
              {project.website_url && (
                <a 
                  href={project.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative p-2.5 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300" />
                </a>
              )}
              {project.live_url && (
                <a 
                  href={project.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative p-2.5 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
                  title="View Live Demo"
                >
                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Owner Actions */}
              {canEdit && (
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(project)}
                      className="h-8 px-3 text-xs font-medium bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(project.id)}
                      className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
              
              {/* Collaboration Request Button */}
              {canShowCollaborationButton && onRequestCollaboration && (
                <Button
                  size="sm"
                  onClick={() => {
                    console.log('Request collaboration for project:', project.id);
                  }}
                  className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium shadow-sm"
                >
                  <UserPlus className="w-3 h-3 mr-1.5" />
                  Join Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Quick Edit Modal */}
      {showQuickEdit && onQuickEdit && (
        <QuickEditModal
          project={project}
          isOpen={showQuickEdit}
          onClose={() => setShowQuickEdit(false)}
          onSave={onQuickEdit}
          onEditMore={() => {
            setShowQuickEdit(false);
            if (onEditMore) onEditMore();
          }}
        />
      )}
    </Card>
  );
}
