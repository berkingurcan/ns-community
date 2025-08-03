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
        toast.success('🎉 Profile updated successfully!');
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
        toast.success('🎉 Welcome to the community! Profile created successfully!');
      }
      
      // Force a profile check to update the enhanced auth context
      console.log('Onboarding: Calling checkUserProfile to refresh state...');
      await checkUserProfile();
      
      // Wait for the profile state to be confirmed as updated in the context
      console.log('Onboarding: Waiting for context to update hasProfile state...');
      let retries = 0;
      const maxRetries = 15; // More retries for context update
      let contextUpdated = false;
      
      while (retries < maxRetries && !contextUpdated) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Longer delays
        
        // Force another check to update context
        await checkUserProfile(); 
        
        // Check if the context has updated by checking the database again
        const { data: profileCheck } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();
        
        if (profileCheck) {
          // Give the context a moment to update after the database check
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`✅ Onboarding: Profile confirmed in database (attempt ${retries + 1})`);
          contextUpdated = true;
        }
        
        retries++;
      }
      
      if (!contextUpdated) {
        console.warn('⚠️ Onboarding: Context may not have updated, but profile exists. Proceeding with redirect.');
      }
      
      // Redirect to home page instead of protected route to avoid race condition
      console.log('Onboarding: Redirecting to homepage - let the home page handle the auth flow...');
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
    <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl overflow-hidden">
        <CardHeader className="text-center border-b pb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
                <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Complete Your Profile
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
                You're almost there! Fill out your profile to join the community
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!hasAuth && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                </div>
                <div className="text-destructive">
                    <h3 className="font-medium text-sm">
                      {isWalletTemporarilyDisconnected ? 'Wallet Temporarily Disconnected' : 'Wallet Not Connected'}
                    </h3>
                    <p className="text-xs text-destructive/80 mt-1">
                      {isWalletTemporarilyDisconnected 
                        ? 'Your wallet was disconnected during authentication. Please reconnect to continue.' 
                        : 'Please connect your wallet to create a profile.'}
                    </p>
                </div>
            </div>
          )}
          
          {isWalletTemporarilyDisconnected && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-50/50 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-amber-800">
                    <h3 className="font-medium text-sm">Session Active</h3>
                    <p className="text-xs text-amber-700 mt-1">You're authenticated but your wallet disconnected. You can still create your profile, but reconnecting your wallet is recommended.</p>
                </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="discordId" className="text-sm font-medium">Discord ID *</Label>
              <Input
                id="discordId"
                value={formData.discordId}
                onChange={(e) => handleInputChange('discordId', e.target.value)}
                placeholder="your_discord_username"
                required
                className="h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="shillYourself" className="text-sm font-medium">Tell Us About Yourself *</Label>
              <Textarea
                id="shillYourself"
                value={formData.shillYourself}
                onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                placeholder="Describe your background, experience, and what you bring to the community..."
                required
                rows={3}
                className="rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            
            <div className="space-y-3">
                <Label className="text-sm font-medium">Your Expertise Areas *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-gray-50/50">
                    {EXPERTISE_OPTIONS.map((expertise) => (
                        <Button
                            key={expertise}
                            type="button"
                            variant={formData.expertises.includes(expertise) ? 'default' : 'outline'}
                            onClick={() => handleExpertiseToggle(expertise)}
                            className="justify-start text-left h-8 text-xs px-3 rounded-md transition-all"
                        >
                            {expertise}
                        </Button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">Selected: {formData.expertises.length} expertise{formData.expertises.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Label htmlFor="github" className="text-sm font-medium">GitHub Username</Label>
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="github" 
                          value={formData.github} 
                          onChange={(e) => handleInputChange('github', e.target.value)} 
                          placeholder="your-github" 
                          className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="xHandle" className="text-sm font-medium">X (Twitter) Handle</Label>
                    <div className="relative">
                        <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="xHandle" 
                          value={formData.xHandle} 
                          onChange={(e) => handleInputChange('xHandle', e.target.value)} 
                          placeholder="your_x_handle" 
                          className="pl-10 h-11 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading || !session}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
