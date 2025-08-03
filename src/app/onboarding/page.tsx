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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPERTISE_OPTIONS } from '@/types/project';
import { toast } from 'sonner';
import { UserPlus, Sparkles, Loader2, Bot, Github, ShieldAlert } from 'lucide-react';

interface OnboardingFormData {
  discordId: string;
  shillYourself: string;
  expertises: string[];
  github: string;
  xHandle: string;
}

export default function OnboardingPage() {
  const { session, checkUserProfile } = useEnhancedAuth();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    discordId: '',
    shillYourself: '',
    expertises: [],
    github: '',
    xHandle: ''
  });

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
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
    
    if (!session) {
      toast.error('You must be authenticated to create a profile.');
      return;
    }
    
    // Get wallet address from current connection or session metadata
    const walletAddress = publicKey?.toBase58() || 
                         session.user?.user_metadata?.wallet_address ||
                         session.user?.app_metadata?.wallet_address;
    
    if (!walletAddress) {
      toast.error('Cannot determine wallet address. Please reconnect your wallet and try again.');
      return;
    }
    
    if (!formData.discordId || !formData.shillYourself || formData.expertises.length === 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating profile with wallet address:', walletAddress);
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            discord_id: formData.discordId,
            shill_yourself: formData.shillYourself,
            expertises: formData.expertises,
            github: formData.github || null,
            x_handle: formData.xHandle || null,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress);
        if (updateError) throw updateError;
        toast.success('Profile updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            wallet_address: walletAddress,
            discord_id: formData.discordId,
            shill_yourself: formData.shillYourself,
            expertises: formData.expertises,
            github: formData.github || null,
            x_handle: formData.xHandle || null
          });
        if (insertError) throw insertError;
        toast.success('Profile created successfully!');
      }
      
      // Force a profile check to update the enhanced auth context
      console.log('Onboarding: Calling checkUserProfile to refresh state...');
      await checkUserProfile();
      
      // Give the context time to update hasProfile state
      console.log('Onboarding: Waiting for context to update...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to home - enhanced auth will handle the proper routing
      console.log('Onboarding: Redirecting to homepage...');
      router.push('/');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // More forgiving auth check - session is primary indicator of authentication
  const hasAuth = session && (publicKey || session.user);
  const isWalletTemporarilyDisconnected = session && !publicKey;
  
  // Debug authentication state
  useEffect(() => {
    console.log('Onboarding: Auth state check', { 
      hasSession: !!session, 
      hasPublicKey: !!publicKey,
      sessionUserId: session?.user?.id,
      publicKeyString: publicKey?.toBase58(),
      hasAuth,
      isWalletTemporarilyDisconnected
    });
  }, [session, publicKey, hasAuth, isWalletTemporarilyDisconnected]);

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                <UserPlus className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Welcome to the Community</CardTitle>
            <CardDescription>
                Complete your profile to connect with founders and experts.
            </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAuth && (
            <div className="mb-4 flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <div className="text-destructive">
                    <h3 className="font-semibold">
                      {isWalletTemporarilyDisconnected ? 'Wallet Temporarily Disconnected' : 'Wallet Not Connected'}
                    </h3>
                    <p className="text-sm">
                      {isWalletTemporarilyDisconnected 
                        ? 'Your wallet was disconnected during authentication. Please reconnect to continue.' 
                        : 'Please connect your wallet to create a profile.'}
                    </p>
                </div>
            </div>
          )}
          
          {isWalletTemporarilyDisconnected && (
            <div className="mb-4 flex items-center gap-4 rounded-lg border border-amber-500/50 bg-amber-50 p-4">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
                <div className="text-amber-800">
                    <h3 className="font-semibold">Session Active</h3>
                    <p className="text-sm">You're authenticated but your wallet disconnected. You can still create your profile, but reconnecting your wallet is recommended.</p>
                </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="discordId">Discord ID *</Label>
              <Input
                id="discordId"
                value={formData.discordId}
                onChange={(e) => handleInputChange('discordId', e.target.value)}
                placeholder="your_discord_username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shillYourself">Shill Yourself *</Label>
              <Textarea
                id="shillYourself"
                value={formData.shillYourself}
                onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                placeholder="Describe your background, experience, and what you bring to the community..."
                required
                rows={4}
              />
            </div>
            <div className="space-y-4">
                <Label>Your Expertises *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EXPERTISE_OPTIONS.map((expertise) => (
                        <Button
                            key={expertise}
                            type="button"
                            variant={formData.expertises.includes(expertise) ? 'default' : 'outline'}
                            onClick={() => handleExpertiseToggle(expertise)}
                             className="justify-start text-left h-auto"
                        >
                            {expertise}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="github">GitHub Username</Label>
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="github" value={formData.github} onChange={(e) => handleInputChange('github', e.target.value)} placeholder="your-github" className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="xHandle">X (Twitter) Handle</Label>
                    <div className="relative">
                        <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="xHandle" value={formData.xHandle} onChange={(e) => handleInputChange('xHandle', e.target.value)} placeholder="your_x_handle" className="pl-10" />
                    </div>
                </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !session}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Complete Onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
