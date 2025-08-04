'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

import { Label } from '@/components/ui/label';
import { 
  Project, 
  COLLABORATION_TYPES, 
  CollaborationType,
  CreateCollaborationRequestData,
  IconMap,
  IconName
} from '@/types/project';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Users, Clock } from 'lucide-react';

interface CollaborationRequestModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollaborationRequestData) => Promise<void>;
}

export function CollaborationRequestModal({
  project,
  isOpen,
  onClose,
  onSubmit
}: CollaborationRequestModalProps) {
  const { userProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<CollaborationType | null>(null);
  const [introMessage, setIntroMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 140;
  const remainingChars = maxLength - introMessage.length;
  const isValid = selectedType && introMessage.trim().length >= 10 && introMessage.length <= maxLength;

  // Filter collaboration types to only show what the project is looking for
  const availableTypes = COLLABORATION_TYPES.filter(type => 
    project.looking_for_collaboration.includes(type.id)
  );

  const spotsLeft = project.max_collaborators - project.current_collaborators;

  const CollaborationIcon = ({ iconName }: { iconName: IconName }) => {
    const Icon = IconMap[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const handleSubmit = async () => {
    if (!selectedType || !isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        project_id: project.id,
        collaboration_type: selectedType,
        intro_message: introMessage.trim()
      });
      
      toast.success('Collaboration request sent! The founder will review it soon.');
      handleClose();
    } catch (error: unknown) {
      toast.error('Failed to send collaboration request. Please try again.');
      console.error('Collaboration request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setIntroMessage('');
    setIsSubmitting(false);
    onClose();
  };



  if (!userProfile?.discord_id) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discord Username Required</DialogTitle>
            <DialogDescription>
              To request collaboration, you need to add your Discord username to your profile for communication.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleClose();
              // TODO: Navigate to profile edit
              window.location.href = '/profile';
            }}>
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Request Collaboration
          </DialogTitle>
          <DialogDescription>
            Send a collaboration request to join <strong>{project.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{project.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {spotsLeft} spots left
              </div>
            </div>
            {project.collaboration_description && (
              <p className="text-sm text-muted-foreground mb-3">
                {project.collaboration_description}
              </p>
            )}
          </div>

          {/* Collaboration Type Selection */}
          <div className="space-y-3">
            <Label>What can you help with? *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CollaborationIcon iconName={type.icon as IconName} />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {type.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {type.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{type.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Intro Message */}
          <div className="space-y-3">
            <Label htmlFor="intro">
              Introduce yourself (10-140 characters) *
              <span className={`ml-2 text-sm ${
                remainingChars < 20 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {remainingChars} left
              </span>
            </Label>
            <div className="relative">
              <textarea
                id="intro"
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder="Hi! I&#39;m a Frontend Developer with 3+ years of React experience. I&#39;d love to help build your UI and contribute to the project&#39;s success. Available 10+ hours/week."
                className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                maxLength={maxLength}
              />
              <MessageSquare className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Mention your relevant experience, availability, and what excites you about this project!
            </p>
          </div>

          {/* Discord Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-600 dark:text-blue-400">💬</span>
              <span>Your Discord: <strong>{userProfile.discord_id}</strong></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The founder will contact you here if your request is accepted.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}