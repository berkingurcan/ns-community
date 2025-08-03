'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/context/EnhancedAuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EXPERTISE_OPTIONS } from '@/types/project';
import { toast } from 'sonner';
import { User, Pencil, Save, X, Plus, Loader2, Wallet as WalletIcon, Github, Bot } from 'lucide-react';

interface ProfileFormData {
  discordId: string;
  shillYourself: string;
  expertises: string[];
  github: string;
  xHandle: string;
}

export default function ProfilePage() {
  const { session, userProfile, hasProfile, checkUserProfile } = useEnhancedAuth();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    discordId: '',
    shillYourself: '',
    expertises: [],
    github: '',
    xHandle: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (hasProfile === null) return;
    if (!session || !publicKey) {
      router.push('/');
      return;
    }
    if (hasProfile === false) {
      router.push('/onboarding');
      return;
    }
    if (userProfile) {
      setFormData({
        discordId: userProfile.discord_id || '',
        shillYourself: userProfile.shill_yourself || '',
        expertises: userProfile.expertises || [],
        github: userProfile.github || '',
        xHandle: userProfile.x_handle || ''
      });
    }
  }, [session, publicKey, userProfile, hasProfile, router]);

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

  const handleSave = async () => {
    if (!userProfile || !publicKey) {
      toast.error('No profile found to update');
      return;
    }
    if (!formData.discordId || !formData.shillYourself || formData.expertises.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          discord_id: formData.discordId,
          shill_yourself: formData.shillYourself,
          expertises: formData.expertises,
          github: formData.github || null,
          x_handle: formData.xHandle || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) {
        throw error;
      }
      await checkUserProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        discordId: userProfile.discord_id || '',
        shillYourself: userProfile.shill_yourself || '',
        expertises: userProfile.expertises || [],
        github: userProfile.github || '',
        xHandle: userProfile.x_handle || ''
      });
    }
    setIsEditing(false);
  };

  if (!session || !publicKey || hasProfile === null || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <User className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl">{userProfile.discord_id}'s Profile</CardTitle>
                <CardDescription>
                    {isEditing ? 'Update your profile information below.' : 'View and manage your profile information.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <div className="flex items-center gap-2 rounded-md border p-3">
                        <WalletIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-mono text-sm break-all">{userProfile.wallet_address}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="discordId">Discord ID *</Label>
                    {isEditing ? (
                        <Input id="discordId" value={formData.discordId} onChange={(e) => handleInputChange('discordId', e.target.value)} required />
                    ) : (
                        <p className="rounded-md border p-3">{formData.discordId}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="shillYourself">Shill Yourself *</Label>
                    {isEditing ? (
                        <Textarea id="shillYourself" value={formData.shillYourself} onChange={(e) => handleInputChange('shillYourself', e.target.value)} required rows={4} />
                    ) : (
                        <p className="rounded-md border p-3 min-h-[100px] whitespace-pre-wrap">{formData.shillYourself}</p>
                    )}
                </div>

                <div className="space-y-4">
                    <Label>Your Expertises *</Label>
                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${!isEditing ? 'pointer-events-none' : ''}`}>
                        {EXPERTISE_OPTIONS.map((expertise) => (
                            <Button
                                key={expertise}
                                type="button"
                                variant={formData.expertises.includes(expertise) ? 'default' : 'outline'}
                                onClick={() => isEditing && handleExpertiseToggle(expertise)}
                                className={`justify-start text-left h-auto ${!isEditing && !formData.expertises.includes(expertise) ? 'opacity-50' : ''}`}
                            >
                                {expertise}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username</Label>
                        {isEditing ? (
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="github" value={formData.github} onChange={(e) => handleInputChange('github', e.target.value)} className="pl-10" />
                            </div>
                        ) : (
                            <p className="rounded-md border p-3">{formData.github || <span className="text-muted-foreground">Not provided</span>}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="xHandle">X (Twitter) Handle</Label>
                        {isEditing ? (
                             <div className="relative">
                                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="xHandle" value={formData.xHandle} onChange={(e) => handleInputChange('xHandle', e.target.value)} className="pl-10" />
                            </div>
                        ) : (
                            <p className="rounded-md border p-3">{formData.xHandle || <span className="text-muted-foreground">Not provided</span>}</p>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                {isEditing ? (
                    <>
                        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                        <Button onClick={() => router.push('/projects')} variant="secondary" className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            My Projects
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}
