'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/context/EnhancedAuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project, EXPERTISE_OPTIONS } from '@/types/project';
import { supabase } from '@/lib/supabaseClient';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { WalletSelection } from '@/components/ui/WalletSelection';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Loader, LogOut, Plus, Search, ShieldCheck, User, XCircle, UserPlus, Sparkles, Loader2, Bot, Github } from 'lucide-react';

export default function HomePage() {
  const { session, hasProfile, userProfile, login, logout, networkValidation, sessionWalletMismatch, checkUserProfile } = useEnhancedAuth();
  const { publicKey, connected, wallet } = useWallet();
  const router = useRouter();

  // Enhanced wallet state tracking
  useEffect(() => {
    console.log('🏠 HomePage: Wallet state changed', {
      connected,
      hasPublicKey: !!publicKey,
      walletName: wallet?.adapter?.name,
      autoConnected: wallet?.adapter?.connected,
      readyForAuth: !!(connected && publicKey)
    });
  }, [connected, publicKey, wallet?.adapter?.name, wallet?.adapter?.connected]);
  
  // States for projects and pagination
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');
  
  // Auth states
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // NFT popup states
  const [showNFTPopup, setShowNFTPopup] = useState(false);
  const [nftError, setNftError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Onboarding form state
  const [onboardingData, setOnboardingData] = useState({
    discordId: '',
    shillYourself: '',
    expertises: [] as string[],
    github: '',
    xHandle: ''
  });
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  const projectsPerPage = 9;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set authentication status
  useEffect(() => {
    console.log('🏠 HomePage: Auth state changed', { 
      hasSession: !!session, 
      sessionId: session?.user?.id,
      hasProfile,
      timestamp: new Date().toISOString()
    });
    
    // Only set authenticated if we have session AND profile is confirmed true
    if (session && hasProfile === true) {
      console.log('🏠 HomePage: ✅ Full auth confirmed - showing authenticated homepage');
      setIsAuthenticated(true);
      setShowLoginModal(false); // Close modal when fully authenticated
    } else if (session && hasProfile === false) {
      // We have session but no profile - ensure modal is open for onboarding
      console.log('🏠 HomePage: 🔄 Session exists but no profile - showing onboarding in modal');
      setIsAuthenticated(false);
      setShowLoginModal(true); // Ensure modal is open to show onboarding form
    } else {
      // No session or hasProfile is still null (loading)
      console.log('🏠 HomePage: ⏳ No session or hasProfile is null - showing login form');
      setIsAuthenticated(false);
    }
  }, [session, hasProfile, router]);

  const loadProjects = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const result = await ProjectService.getPaginatedProjects(page, projectsPerPage);
      let filteredProjects = result.projects;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProjects = filteredProjects.filter(project =>
          project.project_name.toLowerCase().includes(query) ||
          project.elevator_pitch.toLowerCase().includes(query) ||
          project.founders.some(f => f.toLowerCase().includes(query))
        );
      }

      // Apply expertise filter
      if (selectedExpertise && selectedExpertise !== 'all') {
        filteredProjects = filteredProjects.filter(project =>
          project.looking_for.includes(selectedExpertise)
        );
      }

      setProjects(filteredProjects);
      setCurrentPage(page);
      setTotalProjects(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedExpertise]);

  // Load projects always (not conditional on authentication)
  useEffect(() => {
    loadProjects(1);
  }, [loadProjects]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      console.log('HomePage: Starting login process...');
      const result = await login();
      
      if (result.success) {
        console.log('HomePage: Login successful! Keeping modal open for auth state transition...');
        // DON'T close modal immediately - let the auth state useEffect handle the flow
        // The modal will either show onboarding form (if no profile) or close (if profile exists)
        // Give some time for the context to update
        setTimeout(() => {
          console.log('HomePage: Login completed, context should be updated');
        }, 1000);
      } else {
        console.log('HomePage: Login failed:', result);
        if (result.type === 'nft_required') {
          setNftError(result.error || 'User does not own required NFT from collection');
          setShowNFTPopup(true);
        } else {
          // Handle other types of errors (config, wallet, auth, etc.)
          console.error('Login failed:', result.error);
          // You could add other error handling here if needed
        }
      }
    } catch (error) {
      console.error('HomePage: Login error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateProject = () => {
    if (!isAuthenticated) {
      // Show simple NS TOKEN required message instead of full modal
      alert('🚫 NS TOKEN Required\n\nYou need to own an NS TOKEN to create projects.\n\nConnect your wallet and verify NFT ownership to access full features.');
      return;
    }
    router.push('/projects?tab=create');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const handleOnboardingInputChange = (field: keyof typeof onboardingData, value: string) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setOnboardingData(prev => ({
      ...prev,
      expertises: prev.expertises.includes(expertise)
        ? prev.expertises.filter(e => e !== expertise)
        : [...prev.expertises, expertise]
    }));
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('You must be authenticated to create a profile.');
      return;
    }
    
    const walletAddress = publicKey?.toBase58() || 
                         session.user?.user_metadata?.wallet_address ||
                         session.user?.app_metadata?.wallet_address;
    
    if (!walletAddress) {
      toast.error('Cannot determine wallet address. Please reconnect your wallet and try again.');
      return;
    }
    
    if (!onboardingData.discordId || !onboardingData.shillYourself || onboardingData.expertises.length === 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsOnboardingLoading(true);
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            discord_id: onboardingData.discordId,
            shill_yourself: onboardingData.shillYourself,
            expertises: onboardingData.expertises,
            github: onboardingData.github || null,
            x_handle: onboardingData.xHandle || null,
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
            discord_id: onboardingData.discordId,
            shill_yourself: onboardingData.shillYourself,
            expertises: onboardingData.expertises,
            github: onboardingData.github || null,
            x_handle: onboardingData.xHandle || null
          });
        if (insertError) throw insertError;
        toast.success('🎉 Welcome to the community! Profile created successfully!');
      }
      
      // Trigger profile recheck - let the auth state useEffect handle modal closure
      await checkUserProfile();
      
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message}`);
    } finally {
      setIsOnboardingLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // Always show the main interface (projects visible to everyone)
  return (
    <div className="min-h-screen bg-background">
      {/* Auth Required Banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-primary text-primary-foreground border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5" />
                <div>
                  <p className="font-medium">You need NS TOKEN to access full features</p>
                  <p className="text-sm text-primary-foreground/80">Connect your wallet and verify NFT ownership to create projects and join the community</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowLoginModal(true)}
                variant="secondary" 
                size="sm"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className={`${!isAuthenticated ? 'bg-secondary' : 'bg-primary'} ${!isAuthenticated ? 'text-secondary-foreground' : 'text-primary-foreground'}`}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Project Hub
              </h1>
              <p className={`text-xl ${!isAuthenticated ? 'text-secondary-foreground/80' : 'text-primary-foreground/80'} max-w-3xl mx-auto leading-relaxed`}>
                Discover innovative projects, connect with builders, and showcase your ideas in our exclusive NFT-gated community
              </p>
            </div>
            
            {/* Action Buttons */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button onClick={handleCreateProject} size="lg" variant="secondary">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
                <Button onClick={handleViewProfile} size="lg" variant="outline">
                  <User className="mr-2 h-5 w-5" />
                  View Profile
                </Button>
                <Button onClick={logout} size="lg" variant="destructive">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button onClick={() => setShowLoginModal(true)} size="lg" variant="default">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
                <Button onClick={handleCreateProject} size="lg" variant="outline">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
              </div>
            )}

            {/* User Welcome - only for authenticated users */}
            {isAuthenticated && userProfile && (
              <div className="mt-8 p-4 bg-primary-foreground/10 rounded-lg max-w-md mx-auto">
                <p className="text-sm">
                  Welcome back, <span className="font-semibold">{userProfile.discord_id}</span>
                </p>
                <p className="text-xs text-primary-foreground/70 mt-1">
                  {userProfile.expertises?.length || 0} expertise areas • Member since {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects by name, description, or founder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Filter by expertise..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Expertise Areas</SelectItem>
                    {EXPERTISE_OPTIONS.map((expertise) => (
                        <SelectItem key={expertise} value={expertise}>
                            {expertise}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Latest Projects
              </h2>
              <p className="text-muted-foreground mt-1">
                {totalProjects} project{totalProjects !== 1 ? 's' : ''} in the community
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-muted rounded-lg w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Search className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || (selectedExpertise && selectedExpertise !== 'all') ? 'Try adjusting your search filters' : 'Be the first to create a project!'}
                  </p>
                  <Button onClick={handleCreateProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="transform hover:scale-105 transition-all duration-300">
                        <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {projects.length > 0 && (
                <div className="flex items-center justify-center space-x-4 mt-12">
                  <Button
                    onClick={() => loadProjects(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                      Page {currentPage}
                    </span>
                  </div>

                  <Button
                    onClick={() => loadProjects(currentPage + 1)}
                    disabled={!hasMore}
                    variant="outline"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">
              Project Hub
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Building the future together through NFT-gated collaboration and innovation
            </p>
            <div className="flex items-center justify-center space-x-6 pt-4">
              <Button
                onClick={handleCreateProject}
                variant="outline"
              >
                Create Project
              </Button>
              {isAuthenticated && (
                <Button
                  onClick={logout}
                  variant="ghost"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {session && hasProfile === false ? 'Complete Profile' : 'Connect Wallet'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative text-center space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <Globe className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                  Connect your wallet and verify NFT ownership to access full features
                </p>
              </div>
            </div>

            <div className="relative space-y-8">
              {!session ? (
                <div className="space-y-6">
                  {/* Show session mismatch warning */}
                  {sessionWalletMismatch && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <p className="text-sm text-yellow-800 font-medium">
                          Wallet değişikliği tespit edildi
                        </p>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Önceki oturumunuz farklı bir wallet ile. Yeni wallet ile giriş yapılıyor...
                      </p>
                    </div>
                  )}
                  
                  {/* Show network validation warning */}
                  {networkValidation && !networkValidation.isValid && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <p className="text-sm text-red-800 font-medium">
                          Network Uyumsuzluğu
                        </p>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        {networkValidation.message}
                      </p>
                    </div>
                  )}
                  
                  <WalletSelection 
                    connected={connected}
                    onWalletSelect={(walletName) => {
                      console.log(`🏠 HomePage: Wallet selected/connected: ${walletName}`);
                      // Wallet is connected, user can now authenticate
                      if (publicKey) {
                        console.log(`🏠 HomePage: PublicKey available, ready for authentication`);
                      }
                    }}
                  />

                  {publicKey && (
                    <div className="space-y-4">
                      <div className="relative p-4 rounded-lg bg-secondary">
                        <div className="flex items-center space-x-4">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-primary-foreground">
                              Wallet Connected Successfully
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                            </p>
                            <p className="text-xs text-primary/70 mt-1">
                              ✅ Ready for NFT verification & authentication
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleLogin}
                        disabled={isAuthLoading}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                      >
                        {isAuthLoading ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Verifying NFT & Authenticating...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Enter Project Hub
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : hasProfile === false ? (
                // Show onboarding form when authenticated but no profile
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                      <p className="text-sm text-gray-600">You're almost there! Fill out your profile to join the community</p>
                    </div>
                  </div>

                  <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="discordId" className="text-sm font-medium">Discord ID *</Label>
                      <Input
                        id="discordId"
                        value={onboardingData.discordId}
                        onChange={(e) => handleOnboardingInputChange('discordId', e.target.value)}
                        placeholder="your_discord_username"
                        required
                        className="h-10 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shillYourself" className="text-sm font-medium">Tell Us About Yourself *</Label>
                      <Textarea
                        id="shillYourself"
                        value={onboardingData.shillYourself}
                        onChange={(e) => handleOnboardingInputChange('shillYourself', e.target.value)}
                        placeholder="Describe your background, experience, and what you bring to the community..."
                        required
                        rows={3}
                        className="rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Your Expertise Areas *</Label>
                      <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto p-2 border rounded-lg bg-gray-50/50">
                        {EXPERTISE_OPTIONS.map((expertise) => (
                          <Button
                            key={expertise}
                            type="button"
                            variant={onboardingData.expertises.includes(expertise) ? 'default' : 'outline'}
                            onClick={() => handleExpertiseToggle(expertise)}
                            className="justify-start text-left h-7 text-xs px-2 rounded-md transition-all"
                          >
                            {expertise}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Selected: {onboardingData.expertises.length} expertise{onboardingData.expertises.length !== 1 ? 's' : ''}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm font-medium">GitHub</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="github" 
                            value={onboardingData.github} 
                            onChange={(e) => handleOnboardingInputChange('github', e.target.value)} 
                            placeholder="your-github" 
                            className="pl-10 h-10 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="xHandle" className="text-sm font-medium">X Handle</Label>
                        <div className="relative">
                          <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="xHandle" 
                            value={onboardingData.xHandle} 
                            onChange={(e) => handleOnboardingInputChange('xHandle', e.target.value)} 
                            placeholder="your_x_handle" 
                            className="pl-10 h-10 rounded-lg border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={isOnboardingLoading || !session}
                        className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isOnboardingLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing Setup...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Complete Onboarding
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-8">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">Welcome! 🎉</h2>
                    <p className="text-muted-foreground text-lg">
                      Loading your project hub...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* NFT Required Popup Modal */}
      {showNFTPopup && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl p-6 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
               <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  NFT Required
                </h3>
                <p className="text-muted-foreground">
                  {nftError}
                </p>
                <p className="text-sm text-muted-foreground">
                  You need to own an NFT from the required collection to access this application.
                </p>
              </div>
              
              <Button
                onClick={() => setShowNFTPopup(false)}
                variant="destructive"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}