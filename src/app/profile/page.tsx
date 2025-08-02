'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

interface ProfileFormData {
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

export default function ProfilePage() {
  const { session, userProfile, hasProfile, checkUserProfile } = useAuth();
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
    // We shouldn't do anything until we know the auth and profile status.
    if (hasProfile === null) {
      return;
    }
    
    if (!session || !publicKey) {
      router.push('/');
      return;
    }

    // Redirect to onboarding if no profile exists
    if (hasProfile === false) {
      router.push('/onboarding');
      return;
    }

    // Load profile data if available
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

  const handleSave = async () => {
    if (!userProfile || !publicKey) {
      alert('No profile found to update');
      return;
    }

    if (!formData.discordId || !formData.shillYourself || formData.expertises.length === 0) {
      alert('Please fill in all required fields');
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
        console.error('Error updating profile:', error);
        alert(`Failed to update profile: ${error.message}`);
        return;
      }

      // Refresh the user profile
      await checkUserProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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

      <div className="relative w-full max-w-4xl">
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
                  Your Profile
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
                  {isEditing ? 'Update your profile information' : 'View and manage your profile information'}
                </p>
              </div>
            </div>

            {/* Edit/Save buttons */}
            <div className="flex justify-center space-x-4">
              {!isEditing ? (
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => router.push('/projects?tab=create')}
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative space-y-6">
            {/* Wallet Address (Read-only) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                Wallet Address
              </label>
              <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-gray-300 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-mono text-sm break-all">{userProfile.wallet_address}</span>
                </div>
              </div>
            </div>

            {/* Discord ID */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                Discord ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.discordId}
                    onChange={(e) => handleInputChange('discordId', e.target.value)}
                    placeholder="your_discord_username"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                ) : (
                  <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-white backdrop-blur-sm">
                    {userProfile.discord_id}
                  </div>
                )}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Shill Yourself */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                Shill yourself <span className="text-red-400">*</span>
              </label>
              {isEditing ? (
                <textarea
                  value={formData.shillYourself}
                  onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                  placeholder="Describe your background, experience, and what you bring to the community..."
                  rows={4}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm resize-none"
                  required
                />
              ) : (
                <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-white backdrop-blur-sm min-h-[120px] whitespace-pre-wrap">
                  {userProfile.shill_yourself}
                </div>
              )}
            </div>

            {/* Expertises */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-purple-200">
                Your Expertises <span className="text-red-400">*</span>
              </label>
              {isEditing ? (
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
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EXPERTISE_OPTIONS.map((expertise) => (
                    <div
                      key={expertise}
                      className={`p-3 rounded-xl text-sm font-medium border ${
                        userProfile.expertises.includes(expertise)
                          ? 'bg-gradient-to-r from-purple-600/50 to-blue-600/50 border-purple-400/50 text-white shadow-lg'
                          : 'bg-white/5 border-white/20 text-gray-400 opacity-50'
                      }`}
                    >
                      {expertise}
                    </div>
                  ))}
                </div>
              )}
              {(isEditing ? formData.expertises.length : userProfile.expertises.length) > 0 && (
                <p className="text-sm text-purple-300">
                  Selected {isEditing ? formData.expertises.length : userProfile.expertises.length} expertise{(isEditing ? formData.expertises.length : userProfile.expertises.length) !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                GitHub Username
              </label>
              <div className="relative">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="your-github-username"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                ) : (
                  <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-white backdrop-blur-sm">
                    {userProfile.github || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                )}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* X Handle */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-purple-200">
                X (Twitter) Handle
              </label>
              <div className="relative">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.xHandle}
                    onChange={(e) => handleInputChange('xHandle', e.target.value)}
                    placeholder="your_x_handle"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                  />
                ) : (
                  <div className="p-4 bg-white/5 border border-white/20 rounded-2xl text-white backdrop-blur-sm">
                    {userProfile.x_handle || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                )}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-purple-400">
                    {userProfile.expertises.length}
                  </div>
                  <div className="text-sm text-gray-300">Expertise Areas</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <div className="text-2xl font-bold text-cyan-400">
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-300">Member Since</div>
                </div>
              </div>
            </div>
          </div>

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