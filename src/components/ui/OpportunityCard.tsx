'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  Github, 
  Twitter, 
  ExternalLink, 
  UserPlus, 
  Clock, 
  User,
  Zap,
  X,
  Bookmark,
  Share2,
  Globe, DollarSign, Image as ImageIcon, Gamepad2, Archive, Link, Hammer, Wallet, Split, Users, ShoppingCart, BarChart, GraduationCap, Bot, Cloud, Building, Smartphone, Sparkles, Laptop, Settings, Rocket, Palette, Paintbrush, Ruler, ClipboardList, Megaphone, Handshake, Gem, Lock, Feather
} from 'lucide-react';
import { PROJECT_CATEGORIES, COLLABORATION_TYPES } from '@/types/project';

interface OpportunityCardProps {
  project: Project;
  currentUserId?: string;
  timeAgo: string;
  onApply?: (projectId: string, message: string) => void;
  onCancel?: (projectId: string) => void;
  onSave?: (projectId: string) => void;
  onShare?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
  isSaved?: boolean;
  priority?: 'low' | 'medium' | 'high';
  className?: string;
}

const IconMap = {
  Github, Twitter, ExternalLink, UserPlus, Clock, User, Zap, X,
  Bookmark, Share2,
  Globe, DollarSign, Image: ImageIcon, Gamepad2, Archive, Link, Hammer, Wallet, Split, Users, ShoppingCart, BarChart, GraduationCap, Bot, Cloud, Building, Smartphone, Sparkles, Laptop, Settings, Rocket, Palette, Paintbrush, Ruler, ClipboardList, Megaphone, Handshake, Gem, Lock, Feather
};

type IconName = keyof typeof IconMap;

export function OpportunityCard({ 
  project, 
  currentUserId, 
  timeAgo, 
  onApply, 
  onCancel,
  onSave,
  onShare,
  onViewDetails,
  isSaved = false,
  priority = 'medium',
  className = ''
}: OpportunityCardProps) {

  // Get project category
  const category = PROJECT_CATEGORIES.find(cat => 
    project.categories?.includes(cat.id)
  );

  // Get collaboration types
  const lookingForTypes = COLLABORATION_TYPES.filter(type => 
    project.looking_for_collaboration?.includes(type.id)
  );

  const isOwner = currentUserId === project.user_id;

  const handleCancel = () => {
    if (onCancel) {
      onCancel(project.id);
    }
  };

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(project.id);
    }
  }, [onSave, project.id]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(project.id);
    }
  }, [onShare, project.id]);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(project.id);
    }
  }, [onViewDetails, project.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'in-development':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  // Removed priority styles to keep design clean and minimal

  const DynamicCategoryIcon = category && IconMap[category.icon as IconName];

    return (
    <Card 
      className={`
        group relative transition-smooth hover-lift border
        ${className}
      `}
      role="article"
      aria-labelledby={`opportunity-title-${project.id}`}
      aria-describedby={`opportunity-description-${project.id}`}
    >

        
      {/* Multi-Line Hierarchical Layout */}
      <div className="p-4">
        {/* Top Row: Logo + Title + Meta Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              {project.image_url ? (
                <Image
                  src={project.image_url}
                  alt={`${project.title} logo`}
                  width={44}
                  height={44}
                  className="w-11 h-11 object-cover rounded-lg"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}
              
              {/* Hot Badge for new opportunities */}
              {(() => {
                const daysDiff = (new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 1 ? (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                ) : null;
              })()}
            </div>

            {/* Project Title + Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  id={`opportunity-title-${project.id}`}
                  className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate"
                >
                  {project.title}
                </h3>
                
                {/* OPEN Badge */}
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 border-emerald-500 text-emerald-700 dark:text-emerald-400 flex-shrink-0"
                  aria-label="This opportunity is currently open for applications"
                >
                  OPEN
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Side Meta + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">{timeAgo}</span>
              <span className="sm:hidden">{timeAgo.split(' ')[0]}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Save/Bookmark Button - Hidden on mobile */}
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="hidden sm:flex p-1.5 hover:bg-muted"
                  aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
                </Button>
              )}
              
              {/* Share Button - Hidden on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="hidden sm:flex p-1.5 hover:bg-muted"
                aria-label="Share opportunity"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </Button>

              {/* Apply Button - Only for non-owners */}
              {!isOwner && onApply && (
                <Button
                  onClick={() => onApply(project.id, `I'm interested in collaborating on ${project.title}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 sm:px-4 py-2"
                  size="sm"
                  aria-label={`Apply to ${project.title}`}
                >
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Apply</span>
                </Button>
              )}
              
              {/* Cancel Button - Only for owners */}
              {isOwner && onCancel && (
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  size="sm"
                  className="text-sm px-3 sm:px-4 py-2"
                  aria-label={`Cancel ${project.title} opportunity`}
                >
                  <X className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Collaboration Note (Most Important) */}
        {project.collaboration_description && (
          <div className="mb-3 pl-14">
            <div className="text-sm font-medium text-foreground italic bg-muted/30 px-3 py-2 rounded-md">
              "{project.collaboration_description}"
            </div>
          </div>
        )}

        {/* Third Row: Skills + Social Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-14">
          {/* Skills Needed */}
          {lookingForTypes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-medium">Looking for:</span>
              <div className="flex gap-2 flex-wrap">
                {lookingForTypes.slice(0, 3).map((type) => {
                  const DynamicTypeIcon = IconMap[type.icon as IconName];
                  return DynamicTypeIcon ? (
                    <div key={type.id} className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md text-sm font-medium">
                      <DynamicTypeIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                    </div>
                  ) : null;
                })}
                {lookingForTypes.length > 3 && (
                  <div className="flex items-center px-2.5 py-1 bg-muted/30 rounded-md text-sm text-muted-foreground">
                    +{lookingForTypes.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links + Owner */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Owner Info */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{project.user_id === currentUserId ? 'You' : 'Owner'}</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-1">
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="View on GitHub"
                >
                  <Github className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {project.twitter_url && (
                <a 
                  href={project.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Follow on Twitter"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {project.website_url && (
                <a 
                  href={project.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

    </Card>
  );
}