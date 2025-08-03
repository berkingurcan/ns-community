'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';

import { Label } from '@/components/ui/label';
import { 
  Project, 
  PROJECT_CATEGORIES, 
  COLLABORATION_TYPES, 
  COLLABORATION_STATUS,
  POPULAR_CATEGORIES,
  QuickEditData,
  CollaborationType,
  CollaborationStatus,
  ProjectCategory
} from '@/types/project';
import { toast } from 'sonner';
import { 
  Settings, 
  Users, 
  Eye, 
  UserPlus,

  Zap,
  Rocket,
  Lock,
  FileText,
  Archive,
  Globe,
  DollarSign,
  Image,
  Gamepad2,
  Building,
  Link,
  Wrench,
  Wallet,
  ArrowLeftRight,
  MessageCircle,
  ShoppingCart,
  BarChart3,
  GraduationCap,
  Bot,
  Cloud,
  Briefcase,
  Smartphone,
  Sparkles,
  Monitor,
  Server,
  Blocks,
  Palette,
  Paintbrush,
  Ruler,
  ClipboardList,
  Megaphone,
  Handshake,
  Shield,
  Brain,
  UserX,

  Plus,
  X,
  Edit3
} from 'lucide-react';

interface QuickEditModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, updates: Partial<Project>) => Promise<void>;
  onEditMore?: () => void;
}

export function QuickEditModal({
  project,
  isOpen,
  onClose,
  onSave,
  onEditMore
}: QuickEditModalProps) {
  const [formData, setFormData] = useState<QuickEditData>({
    status: project.status,
    collaboration_status: project.collaboration_status,
    looking_for_collaboration: project.looking_for_collaboration || [],
    categories: project.categories || []
  });
  const [notesForRequests, setNotesForRequests] = useState(
    project.notes_for_requests || ''
  );
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleCollaborationTypeToggle = (typeId: CollaborationType) => {
    setFormData(prev => ({
      ...prev,
      looking_for_collaboration: prev.looking_for_collaboration.includes(typeId)
        ? prev.looking_for_collaboration.filter(id => id !== typeId)
        : [...prev.looking_for_collaboration, typeId]
    }));
  };

  const handleCategoryToggle = (categoryId: ProjectCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates: Partial<Project> = {
        status: formData.status,
        collaboration_status: formData.collaboration_status,
        looking_for_collaboration: formData.looking_for_collaboration,
        notes_for_requests: notesForRequests.trim() || undefined,
        categories: formData.categories,
        updated_at: new Date().toISOString()
      };

      await onSave(project.id, updates);
      toast.success('Project updated successfully! ✨');
      onClose();
    } catch (error) {
      toast.error('Failed to update project');
      console.error('Quick edit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      status: project.status,
      collaboration_status: project.collaboration_status,
      looking_for_collaboration: project.looking_for_collaboration || [],
      categories: project.categories || []
    });
    setNotesForRequests(project.notes_for_requests || '');
    setShowAllCategories(false);
    onClose();
  };



  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'showcase': return Rocket;
      case 'NS-Only': return Lock;
      case 'Draft': return FileText;
      case 'Archive': return Archive;
      default: return FileText;
    }
  };

  const getCategoryIcon = (categoryId: ProjectCategory) => {
    const iconMap: Record<ProjectCategory, React.ComponentType> = {
      'web3-dapp': Globe,
      'defi': DollarSign,
      'nft': Image,
      'gaming': Gamepad2,
      'dao': Building,
      'blockchain': Link,
      'developer-tools': Wrench,
      'wallet': Wallet,
      'bridge': ArrowLeftRight,
      'social': MessageCircle,
      'marketplace': ShoppingCart,
      'analytics': BarChart3,
      'education': GraduationCap,
      'ai': Bot,
      'saas': Cloud,
      'enterprise': Briefcase,
      'mobile': Smartphone,
      'other': Sparkles
    };
    return iconMap[categoryId] || Sparkles;
  };

  const getCollaborationIcon = (typeId: CollaborationType) => {
    const iconMap: Record<CollaborationType, React.ComponentType> = {
      'frontend-dev': Monitor,
      'backend-dev': Server,
      'blockchain-dev': Blocks,
      'mobile-dev': Smartphone,
      'devops': Settings,
      'ui-design': Palette,
      'graphic-design': Paintbrush,
      'product-design': Ruler,
      'product-mgmt': ClipboardList,
      'marketing': Megaphone,
      'business-dev': Handshake,
      'community': Users,
      'tokenomics': DollarSign,
      'security': Shield,
      'ai-ml': Brain,
      'content': FileText,
      'power-user': Zap
    };
    return iconMap[typeId] || Users;
  };

  const getCollaborationStatusIcon = (statusId: CollaborationStatus) => {
    switch (statusId) {
      case 'not-open': return UserX;
      case 'open': return UserPlus;
      default: return Users;
    }
  };

  const getDisplayCategories = () => {
    return showAllCategories ? PROJECT_CATEGORIES : PROJECT_CATEGORIES.filter(cat => 
      POPULAR_CATEGORIES.includes(cat.id)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col" showCloseButton={false}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-lg">{project.title}</div>
                <DialogDescription className="text-sm text-muted-foreground">
                  Quick project settings
                </DialogDescription>
              </div>
            </DialogTitle>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          <div className="p-6 space-y-4 pb-2">
            

            
            {/* Single Line Visibility */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Eye className="w-4 h-4 text-slate-500" />
                Project Visibility
              </Label>
              <div className="flex gap-2">
                {(['showcase', 'NS-Only', 'Draft', 'Archive'] as const).map((status) => {
                  const StatusIcon = getStatusIcon(status);
                  return (
                    <Button
                      key={status}
                      variant={formData.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className="h-8"
                    >
                      <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                      {status}
                    </Button>
                  );
                })}
              </div>
            </div>



            {/* Categories */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-slate-500" />
                Categories ({formData.categories.length} selected)
              </Label>
              
              <div className="grid grid-cols-3 gap-2">
                {getDisplayCategories().map((category) => {
                  const CategoryIcon = getCategoryIcon(category.id);
                  const isSelected = formData.categories.includes(category.id);
                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category.id)}
                      className="h-9 justify-start"
                    >
                      <CategoryIcon className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs">{category.label}</span>
                    </Button>
                  );
                })}
                
                {!showAllCategories && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllCategories(true)}
                    className="h-9 justify-start border border-dashed border-gray-300"
                  >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    <span className="text-xs">More</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Collaboration */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-slate-500" />
                Collaboration Status
              </Label>
              
              <div className="flex gap-2">
                {COLLABORATION_STATUS.map((status) => {
                  const StatusIcon = getCollaborationStatusIcon(status.id);
                  return (
                    <Button
                      key={status.id}
                      variant={formData.collaboration_status === status.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, collaboration_status: status.id }))}
                      className="h-8"
                    >
                      <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                      {status.label}
                    </Button>
                  );
                })}
              </div>

              {/* Expanded Collaboration Options */}
              {formData.collaboration_status === 'open' && (
                <div className="bg-green-50/60 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/40 dark:border-green-800/30 space-y-3">
                  {/* Looking For Help */}
                  <div>
                    <Label className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 block">
                      Looking for help with:
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLLABORATION_TYPES.slice(0, 6).map((type) => {
                        const isSelected = formData.looking_for_collaboration.includes(type.id);
                        const CollabIcon = getCollaborationIcon(type.id);
                        return (
                          <Button
                            key={type.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCollaborationTypeToggle(type.id)}
                            className="h-8 justify-start"
                          >
                            <CollabIcon className="w-3.5 h-3.5 mr-2" />
                            <span className="text-xs">{type.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes for Requests */}
                  <div>
                    <Label className="text-sm font-medium text-green-700 dark:text-green-400 mb-2 block">
                      Note for collaboration requests:
                    </Label>
                    <div className="relative">
                      <textarea
                        value={notesForRequests}
                        onChange={(e) => setNotesForRequests(e.target.value)}
                        placeholder="Brief note for potential collaborators (visible to NS members only)..."
                        className="w-full h-16 px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-gray-900"
                        maxLength={140}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white dark:bg-gray-900 px-1 rounded">
                        {140 - notesForRequests.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Always visible */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-gray-50/80 dark:bg-gray-900/80">
          <div className="flex gap-3 justify-between">
            <Button 
              variant="outline" 
              onClick={onEditMore || (() => {})}
              className="flex items-center gap-2"
              disabled={isLoading || !onEditMore}
            >
              <Edit3 className="w-4 h-4" />
              Edit More
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || formData.categories.length === 0}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}