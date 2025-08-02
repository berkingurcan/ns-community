'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

interface OnboardingFormData {
  discordId: string;
  shillYourself: string;
  expertises: string[];
  github: string;
  xHandle: string;
}

const EXPERTISE_OPTIONS = [
  'Software Architecture',
  'Blockchain Development',
  'UI/UX Design',
  'Product Management',
  'Marketing',
  'Community Management',
  'Business Development',
  'AI/ML',
  'Cybersecurity',
  'Legal/Compliance',
  'Finance/Tokenomics',
  'Content Creation',
];

export default function OnboardingPage() {
  const { session, checkUserProfile } = useAuth();
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

  // Development: Allow access to onboarding even without auth

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    
    if (!publicKey || !session) {
      console.error('No wallet or session found');
      return;
    }

    if (!formData.discordId || !formData.shillYourself || formData.expertises.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const walletAddress = publicKey.toBase58();
      
      // First check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        alert('Failed to check existing profile. Please try again.');
        return;
      }

      if (existingProfile) {
        console.log('Profile already exists, updating instead...');
        // Update existing profile
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

        if (updateError) {
          console.error('Error updating profile:', updateError);
          alert(`Failed to update profile: ${updateError.message || 'Unknown error'}`);
          return;
        }
      } else {
        // Create new profile
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

        if (insertError) {
          console.error('Error creating profile:', insertError);
          console.error('Full error details:', JSON.stringify(insertError, null, 2));
          alert(`Failed to create profile: ${insertError.message || 'Unknown error'}`);
          return;
        }
      }

      console.log('Profile saved successfully');
      // Refresh the user profile status in AuthContext
      await checkUserProfile();
      router.push('/dashboard');
    } catch (error) {
      console.error('Unexpected error:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Development: Show warning when no auth but still allow access
  const hasAuth = session && publicKey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse-slow"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Main card with enhanced glass morphism */}
        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 p-8 space-y-8 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
          <div className="absolute inset-px bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
          
          {/* Header */}
          <div className="relative text-center space-y-6">
            <div className="relative mx-auto w-24 h-24 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl animate-spin-slow opacity-75"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                  Welcome to the Community
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
                  Help us connect you with the right founders and experts by completing your profile
                </p>
              </div>
            </div>
          </div>

          {/* Development Notice */}
          {!hasAuth && (
            <div className="relative p-4 bg-orange-500/10 border border-orange-400/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-orange-300 text-sm font-medium">
                    Development Mode: No wallet connected or session found. Form submission will be disabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Form */}
          <form onSubmit={handleSubmit} className="relative space-y-6">
            {/* Discord ID (Required) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                Discord ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.discordId}
                  onChange={(e) => handleInputChange('discordId', e.target.value)}
                  placeholder="your_discord_username"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Shill Yourself (Required) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                Shill yourself <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.shillYourself}
                onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                placeholder="Describe your background, experience, and what you bring to the community..."
                rows={4}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm resize-none"
                required
              />
            </div>

            {/* Expertises (Required) */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-purple-200">
                Your Expertises <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EXPERTISE_OPTIONS.map((expertise) => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleExpertiseToggle(expertise)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      formData.expertises.includes(expertise)
                        ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-purple-400/50 text-white shadow-lg'
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
              {formData.expertises.length > 0 && (
                <p className="text-sm text-purple-300">
                  Selected {formData.expertises.length} expertise{formData.expertises.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* GitHub (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                GitHub Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="your-github-username"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* X Handle (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                X (Twitter) Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.xHandle}
                  onChange={(e) => handleInputChange('xHandle', e.target.value)}
                  placeholder="your_x_handle"
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading || !hasAuth || !formData.discordId || !formData.shillYourself || formData.expertises.length === 0}
                className="relative w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving Profile...</span>
                    </div>
                  ) : !hasAuth ? (
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Connect Wallet to Submit</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Complete Onboarding</span>
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="relative text-center pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-400 font-medium">
                Building the future together
              </p>
              <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}