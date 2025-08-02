'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project, EXPERTISE_OPTIONS } from '@/types/project';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { WalletSelection } from '@/components/ui/WalletSelection';

export default function HomePage() {
  const { session, hasProfile, userProfile, login, logout } = useAuth();
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  
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
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');
  
  // Auth states
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // NFT popup states
  const [showNFTPopup, setShowNFTPopup] = useState(false);
  const [nftError, setNftError] = useState('');

  const projectsPerPage = 9;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Set authentication status
  useEffect(() => {
    if (session && hasProfile !== null) {
      setIsAuthenticated(true);
      // Redirect to onboarding if no profile exists
      if (hasProfile === false) {
        router.push('/onboarding');
      }
    } else {
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
      if (selectedExpertise) {
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

  // Load projects when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects(1);
    }
  }, [isAuthenticated, loadProjects]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const result = await login();
      
      if (!result.success) {
        if (result.type === 'nft_required') {
          setNftError(result.error || 'User does not own required NFT from collection');
          setShowNFTPopup(true);
        } else {
          // Handle other types of errors (config, wallet, auth, etc.)
          console.error('Login failed:', result.error);
          // You could add other error handling here if needed
        }
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleCreateProject = () => {
    router.push('/projects?tab=create');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  if (!mounted) {
    return null;
  }

  // Show authentication flow if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-float-delay"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>

        <div className="relative w-full max-w-lg">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 p-8 space-y-8 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
            <div className="absolute inset-px bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
            
            <div className="relative text-center space-y-6">
              <div className="relative mx-auto w-24 h-24 group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl animate-spin-slow opacity-75"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                  <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                    Project Hub
                  </h1>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                    <span className="text-purple-300 font-mono text-sm tracking-wider">WEB3</span>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                  </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto">
                  Discover innovative projects and connect with builders in the ecosystem
                </p>
              </div>
            </div>

            <div className="relative space-y-8">
              {!session ? (
                <div className="space-y-6">
                  <div className="relative">
                    <StepIndicator 
                      steps={[
                        {
                          label: "Connect Wallet",
                          completed: connected,
                          active: !connected
                        },
                        {
                          label: "Authenticate", 
                          completed: !!session,
                          active: connected && !session
                        },
                        {
                          label: "Access Granted",
                          completed: !!session,
                          active: false
                        }
                      ]}
                    />
                  </div>

                  <div className="relative">
                    <WalletSelection 
                      connected={connected}
                      onWalletSelect={() => {}}
                      className="animate-slideUp"
                    />
                  </div>

                  {publicKey && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-100">Wallet Connected</p>
                            <p className="text-xs text-green-300 font-mono tracking-wider">
                              {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleLogin}
                        disabled={isAuthLoading}
                        className="relative w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative z-10">
                          {isAuthLoading ? (
                            <div className="flex items-center justify-center space-x-3">
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Authenticating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>Enter Project Hub</span>
                            </div>
                          )}
                        </div>
                      </Button>
                    </div>
                  )}

                  <div className="text-center space-y-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                      <p className="text-sm text-purple-200 leading-relaxed">
                        🔐 NFT-gated access to exclusive project community
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-8 animate-fadeIn">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Welcome! 🎉
                    </h2>
                    <p className="text-gray-300 text-lg">
                      Loading your project hub...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative text-center pt-6 border-t border-white/10">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-400 font-medium">
                  Powered by <span className="text-purple-400 font-semibold">Solana</span>
                </p>
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Required Popup Modal */}
        {showNFTPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    NFT Required
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {nftError}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    You need to own an NFT from the required collection to access this application.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowNFTPopup(false)}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main authenticated homepage with project listings
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Project Hub
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
                Discover innovative projects, connect with builders, and showcase your ideas in our exclusive NFT-gated community
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button
                onClick={handleCreateProject}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Project
              </Button>
              <Button
                onClick={handleViewProfile}
                variant="default"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </Button>
              <Button
                onClick={logout}
                variant="destructive"
                size="lg"
                className="border-white/30 text-white hover:bg-red-500/20 hover:border-red-400/50 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>

            {/* User Welcome */}
            {userProfile && (
              <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm max-w-md mx-auto">
                <p className="text-sm text-purple-100">
                  Welcome back, <span className="font-semibold">{userProfile.discord_id}</span>
                </p>
                <p className="text-xs text-purple-200 mt-1">
                  {userProfile.expertises?.length || 0} expertise areas • Member since {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects by name, description, or founder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Expertise Areas</option>
              {EXPERTISE_OPTIONS.map((expertise) => (
                <option key={expertise} value={expertise}>
                  {expertise}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Latest Projects
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalProjects} project{totalProjects !== 1 ? 's' : ''} in the community
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery || selectedExpertise ? 'Try adjusting your search filters' : 'Be the first to create a project!'}
                  </p>
                  <Button
                    onClick={handleCreateProject}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="transform hover:scale-105 transition-all duration-300">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <ProjectCard project={project} />
                      </div>
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
                    className="px-6 py-3 rounded-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {currentPage}
                    </span>
                  </div>

                  <Button
                    onClick={() => loadProjects(currentPage + 1)}
                    disabled={!hasMore}
                    variant="outline"
                    className="px-6 py-3 rounded-xl"
                  >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Project Hub
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Building the future together through NFT-gated collaboration and innovation
            </p>
            <div className="flex items-center justify-center space-x-6 pt-4">
              <Button
                onClick={handleCreateProject}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Create Project
              </Button>
              <Button
                onClick={logout}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}