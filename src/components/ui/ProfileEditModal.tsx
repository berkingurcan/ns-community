'use client';

import Image from 'next/image';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProfileFormData, EXPERTISE_OPTIONS, UserProfile, extractProfileFromDiscord } from '@/types/profile';
import { Save, X, User, Github, Twitter, Zap, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<void>;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  userProfile,
  isLoading
}: ProfileEditModalProps) {
  const { session } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    discordId: '',
    shillYourself: '',
    expertises: [],
    github: '',
    xHandle: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        discordId: userProfile.discord_id || '',
        shillYourself: userProfile.shill_yourself || '',
        expertises: Array.isArray(userProfile.expertises) ? userProfile.expertises : [],
        github: userProfile.github || '',
        xHandle: userProfile.x_handle || ''
      });
    }
  }, [userProfile]);

  const handleAutoFillFromDiscord = () => {
    if (!session?.user) {
      toast.error('No Discord session found');
      return;
    }

    setIsSyncing(true);
    try {
      const discordProfile = extractProfileFromDiscord(session.user);
      
      setFormData(prev => ({
        ...prev,
        // Only fill empty fields
        username: prev.username || discordProfile.username || prev.username,
        discordId: prev.discordId || discordProfile.discordId || prev.discordId,
        shillYourself: prev.shillYourself || discordProfile.shillYourself || prev.shillYourself,
        github: prev.github || discordProfile.github || prev.github,
        xHandle: prev.xHandle || discordProfile.xHandle || prev.xHandle,
        // Keep existing expertises
      }));

      toast.success('Discord data synced! Empty fields were filled.');
    } catch (error) {
      console.error('Discord sync error:', error);
      toast.error('Failed to sync Discord data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertises: prev.expertises.includes(expertise)
        ? prev.expertises.filter(e => e !== expertise)
        : [...prev.expertises, expertise]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const handleClose = () => {
    // Reset form data
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        discordId: userProfile.discord_id || '',
        shillYourself: userProfile.shill_yourself || '',
        expertises: Array.isArray(userProfile.expertises) ? userProfile.expertises : [],
        github: userProfile.github || '',
        xHandle: userProfile.x_handle || ''
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          {/* Discord Sync Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFillFromDiscord}
            disabled={isSyncing || isLoading}
            className="shrink-0"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Sync Discord
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture & Basic Info */}
          <div className="flex gap-4">
            {/* Discord Avatar */}
            <div className="flex-shrink-0">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Discord Avatar"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            {/* Basic Fields */}
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="username" className="text-sm">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="github" className="text-sm">GitHub</Label>
                  <Input
                    id="github"
                    type="text"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="text-sm">X (Twitter)</Label>
                  <Input
                    id="twitter"
                    type="text"
                    value={formData.xHandle}
                    onChange={(e) => handleInputChange('xHandle', e.target.value)}
                    placeholder="handle"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-sm">Bio *</Label>
            <Textarea
              id="bio"
              value={formData.shillYourself}
              onChange={(e) => handleInputChange('shillYourself', e.target.value)}
              placeholder="Tell us about yourself..."
              className="mt-1 min-h-[80px] resize-none"
              required
            />
          </div>

          {/* Expertises */}
          <div>
            <Label className="text-sm flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" />
              Expertises
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERTISE_OPTIONS.map((expertise) => {
                const isSelected = formData.expertises.includes(expertise);
                return (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleExpertiseToggle(expertise)}
                    className={`p-2 rounded-md border text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    {expertise}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading || isSyncing} className="flex-1">
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading || isSyncing}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}