'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProfileFormData, EXPERTISE_OPTIONS, UserProfile } from '@/types/profile';
import { Save, X, User, Github, Twitter, Zap } from 'lucide-react';

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
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    discordId: '',
    shillYourself: '',
    expertises: [],
    github: '',
    xHandle: ''
  });

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Basic Information</h3>
              
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.shillYourself}
                  onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Github className="w-4 h-4" />
                Social Links
              </h3>
              
              <div>
                <Label htmlFor="github">GitHub Username</Label>
                <Input
                  id="github"
                  type="text"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="your-github-username"
                />
              </div>

              <div>
                <Label htmlFor="twitter">X (Twitter) Handle</Label>
                <Input
                  id="twitter"
                  type="text"
                  value={formData.xHandle}
                  onChange={(e) => handleInputChange('xHandle', e.target.value)}
                  placeholder="your-twitter-handle"
                />
              </div>
            </div>
          </div>

          {/* Expertises */}
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" />
              Expertises
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERTISE_OPTIONS.map((expertise) => {
                const isSelected = formData.expertises.includes(expertise);
                return (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleExpertiseToggle(expertise)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
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
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}