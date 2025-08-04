'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { ProfileFormData, EXPERTISE_OPTIONS, validateProfileForm, extractProfileFromDiscord } from '@/types/profile';

export default function OnboardingPage() {
  const { session, refreshProfile } = useAuth(); // Will be replaced by useSession from NextAuth
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    discordId: '',
    shillYourself: '',
    expertises: [],
    github: '',
    xHandle: ''
  });

  useEffect(() => {
    if (session?.user) {
      console.log('🔍 Loading Discord data for onboarding...');
      const discordProfile = extractProfileFromDiscord(session.user);
      
      setFormData(prev => ({
        ...prev,
        username: discordProfile.username || prev.username,
        discordId: discordProfile.discordId || prev.discordId,
        shillYourself: discordProfile.shillYourself || prev.shillYourself,
        github: discordProfile.github || prev.github,
        xHandle: discordProfile.xHandle || prev.xHandle,
        // expertises korunur çünkü Discord'dan gelmiyor
      }));
    }
  }, [session]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      console.error('No session found');
      alert('You must be logged in to create a profile.');
      return;
    }
    
    const validationError = validateProfileForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('user_profiles').upsert(
        {
          id: session.user.id,
          username: formData.username,
          discord_id: formData.discordId,
          shill_yourself: formData.shillYourself,
          expertises: formData.expertises,
          github: formData.github || null,
          x_handle: formData.xHandle || null,
          status: 'active', // Mark profile as completed
          updated_at: new Date().toISOString(),
          // wallet_address is removed
        },
        {
          onConflict: 'id',
        }
      );

      if (error) {
        console.error('Supabase upsert error:', error);
        alert(`Failed to save profile: ${error.message}`);
        return;
      }
      
      // Refresh the profile data in AuthContext
      await refreshProfile();
      
      alert('Profile created successfully!');
      router.push('/profile');

    } catch (error) {
      console.error('Unexpected error saving profile:', error);
      alert('An error occurred while saving your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasAuth = !!session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 space-y-8">
            <h1 className="text-4xl font-bold text-center text-white">Complete Your Profile</h1>
            <p className="text-gray-300 text-lg text-center">
                Help us connect you with the right people by completing your profile.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username (pre-filled) */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-200">Username *</label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="your_username"
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                        required
                    />
                </div>

                {/* Shill Yourself */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-200">Shill yourself *</label>
                    <textarea
                        value={formData.shillYourself}
                        onChange={(e) => handleInputChange('shillYourself', e.target.value)}
                        placeholder="Describe yourself..."
                        rows={4}
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                        required
                    />
                </div>

                {/* Expertises */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-purple-200">Your Expertises *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {EXPERTISE_OPTIONS.map((expertise) => (
                            <button
                                key={expertise}
                                type="button"
                                onClick={() => handleExpertiseToggle(expertise)}
                                className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                                    formData.expertises.includes(expertise)
                                    ? 'bg-purple-600/50 border-purple-400/50 text-white'
                                    : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                }`}
                            >
                                {expertise}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-200">GitHub Username</label>
                    <input
                        type="text"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="your-github"
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                    />
                </div>

                {/* X Handle */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-purple-200">X (Twitter) Handle</label>
                    <input
                        type="text"
                        value={formData.xHandle}
                        onChange={(e) => handleInputChange('xHandle', e.target.value)}
                        placeholder="your_x_handle"
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-2xl text-white"
                    />
                </div>

                <div className="pt-6">
                    <Button
                        type="submit"
                        disabled={isLoading || !hasAuth}
                        className="w-full h-14 bg-purple-600 text-white font-bold rounded-2xl"
                    >
                        {isLoading ? 'Saving...' : 'Complete Onboarding'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
}

