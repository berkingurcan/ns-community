'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Github, 
  Twitter, 
  ExternalLink, 
  UserPlus, 
  Clock, 
  StickyNote,
  Eye,
  User,
  Zap,
  X,
  Send
} from 'lucide-react';
import { PROJECT_CATEGORIES, COLLABORATION_TYPES } from '@/types/project';

interface OpportunityCardProps {
  project: Project;
  currentUserId?: string;
  timeAgo: string;
  onApply?: (projectId: string, message: string) => void;
  onCancel?: (projectId: string) => void;
}

export function OpportunityCard({ project, currentUserId, timeAgo, onApply, onCancel }: OpportunityCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  // Get project category
  const category = PROJECT_CATEGORIES.find(cat => 
    project.categories?.includes(cat.id) || 
    project.category === cat.id
  );

  // Get collaboration types
  const lookingForTypes = COLLABORATION_TYPES.filter(type => 
    project.looking_for_help?.includes(type.id)
  );

  const isOwner = currentUserId === project.user_id;

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    if (onApply && applyMessage.trim()) {
      onApply(project.id, applyMessage.trim());
      setShowApplyModal(false);
      setApplyMessage('');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(project.id);
    }
  };

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

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-[1px] bg-background rounded-[inherit]" />
      
      {/* Content Container */}
      <div className="relative z-10">
        
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              
              {/* Project Avatar */}
              <div className="relative flex-shrink-0">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={`${project.title} logo`}
                    className="w-12 h-12 object-cover rounded-xl shadow-md ring-2 ring-background group-hover:ring-primary/20 transition-all duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md ring-2 ring-background group-hover:ring-primary/20 transition-all duration-300">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                )}
                
                {/* Hot Badge for new opportunities */}
                {(() => {
                  const daysDiff = (new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24);
                  return daysDiff <= 1 ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      🔥
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                    {project.title}
                  </h3>
                  
                  {/* OPEN Badge */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm opacity-30 animate-pulse" />
                      <div className="relative bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                        OPEN
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Category & Status */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  {category && (
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full text-xs font-medium">
                      <span className="text-sm">{category.emoji}</span>
                      <span className="text-muted-foreground">{category.label}</span>
                    </div>
                  )}
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 ml-4 flex gap-2">
              {/* Apply Button - Only for non-owners */}
              {!isOwner && (
                <Button
                  onClick={handleApply}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              )}
              
              {/* Cancel Button - Only for owners */}
              {isOwner && onCancel && (
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  size="sm"
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {/* Description */}
          <div>
            <p className={`text-muted-foreground leading-relaxed ${
              showFullDescription ? '' : 'line-clamp-2'
            }`}>
              {project.description}
            </p>
            {project.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary hover:text-primary/80 text-sm font-medium mt-1 transition-colors"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Collaboration Section */}
          {lookingForTypes.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <UserPlus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Seeking Collaborators</h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {lookingForTypes.slice(0, 4).map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                  </div>
                ))}
                {lookingForTypes.length > 4 && (
                  <div className="flex items-center px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground">
                    +{lookingForTypes.length - 4} more
                  </div>
                )}
              </div>
              
              {/* Collaboration Note */}
              {project.notes_for_requests && (
                <div className="bg-white dark:bg-gray-900/50 border border-emerald-200 dark:border-emerald-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <StickyNote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                        Note for Collaborators
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        {project.notes_for_requests}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tech Stack</h4>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {project.tags.slice(0, 6).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted/60 hover:bg-muted text-xs font-medium rounded-md transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 6 && (
                  <span className="px-2 py-1 bg-muted/40 text-xs font-medium text-muted-foreground rounded-md">
                    +{project.tags.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-muted/30">
            
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                  title="View on GitHub"
                >
                  <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {project.twitter_url && (
                <a 
                  href={project.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                  title="Follow on Twitter"
                >
                  <Twitter className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </a>
              )}
              {project.website_url && (
                <a 
                  href={project.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />
                </a>
              )}
              {project.live_url && (
                <a 
                  href={project.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                  title="View Live Demo"
                >
                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </a>
              )}
            </div>

            {/* Project Owner Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>by {project.user_id === currentUserId ? 'You' : 'Project Owner'}</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Apply for Collaboration
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Send a message to <span className="font-medium">{project.title}</span> project owner
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your message (140 characters max)
              </label>
              <div className="relative">
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value.slice(0, 140))}
                  placeholder="Hi! I'm interested in collaborating on your project. I have experience in..."
                  className="w-full h-24 px-3 py-2 text-sm border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  maxLength={140}
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
                  {140 - applyMessage.length}
                </div>
              </div>
            </div>
            
            {/* Project Details Preview */}
            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-6 h-6 object-cover rounded"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium">{project.title}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApplyModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!applyMessage.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
              size="sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}