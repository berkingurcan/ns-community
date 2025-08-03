'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project, EXPERTISE_OPTIONS } from '@/types/project';

export default function HomePage() {
  const { session, hasProfile, userProfile } = useAuth();
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  
  // States for projects and pagination
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');

  const projectsPerPage = 9;
  const isAuthenticated = session && hasProfile !== null;
  const isNewUser = connected && session && hasProfile === false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirection for new users
  useEffect(() => {
    if (isNewUser) {
        router.push('/onboarding');
    }
  }, [isNewUser, router]);

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

  // Load projects - always load them, blur if not authenticated
  useEffect(() => {
      loadProjects(1);
  }, [loadProjects]);

  const handleCreateProject = () => {
    router.push('/projects?tab=create');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  if (!mounted) {
    return null;
  }

  // Main homepage with project listings - always show but blur if not authenticated
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
            
            {/* Auth Status Indicator */}
            {!isAuthenticated && (
              <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm max-w-md mx-auto border border-white/20">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-purple-100 text-sm">
                    🔐 Connect your wallet to access full features
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons - Only show if authenticated */}
            {isAuthenticated && (
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
            </div>
            )}

            {/* User Welcome - Only show if authenticated */}
            {isAuthenticated && userProfile && (
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

      {/* Main Content - Apply blur effect if not authenticated */}
      <div className={`max-w-7xl mx-auto px-4 py-8 ${!isAuthenticated ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
      {/* Search and Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects by name, description, or founder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={!isAuthenticated}
              />
            </div>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!isAuthenticated}
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
                  {isAuthenticated && (
                  <Button
                    onClick={handleCreateProject}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Project
                  </Button>
                  )}
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

      {/* Authentication Overlay for non-authenticated users */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md mx-4 text-center space-y-6 pointer-events-auto">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Connect Your Wallet</h3>
                <p className="text-gray-300">
                  Connect your wallet and authenticate to access full project features, create projects, and interact with the community.
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-purple-200 bg-purple-500/20 rounded-xl p-3 border border-purple-400/30">
                  🔐 NFT-gated access to exclusive project community
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            {isAuthenticated && (
            <div className="flex items-center justify-center space-x-6 pt-4">
              <Button
                onClick={handleCreateProject}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Create Project
              </Button>
            </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}