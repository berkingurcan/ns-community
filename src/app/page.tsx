'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project } from '@/types/project';
import { Briefcase, User, Mail, LogOut, Coins } from 'lucide-react'; // Added Mail and LogOut for the overlay

export default function HomePage() {
  const { session, userProfile, coinBalance, isAuthorized, loading: authLoading, login, logout } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedExpertise, setSelectedExpertise] = useState<string>(''); // Removed as per commit analysis and user preference

  const projectsPerPage = 9;
  
  useEffect(() => {
    // No explicit mounted state for this version, rely on authLoading
  }, []);

  useEffect(() => {
    // This redirect logic is not present in the target commit for homepage
    // The target commit uses renderAuthOverlay for access control
  }, [ ]); 

  const loadProjects = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      // Reverting to getPaginatedProjects as per the commit's logic
      const result = await ProjectService.getPaginatedProjects(page, projectsPerPage); 
      let filteredProjects = result.projects;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProjects = filteredProjects.filter(project =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        );
      }
      
      setProjects(filteredProjects);
      setTotalProjects(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, projectsPerPage]); // Added projectsPerPage to dependencies

  useEffect(() => {
      loadProjects(1);
  }, [loadProjects]);
  
  const handleCreateProject = () => router.push('/projects/new');
  const handleViewProfile = () => router.push('/profile');

  // New renderAuthOverlay function from the target commit
  const renderAuthOverlay = () => {
    if (isAuthorized) return null;

    let title = "Join the Community";
    let description = "Login with your Discord account to view projects, create your profile, and connect with other builders.";
    let button = <Button onClick={() => login()}>Login with Discord</Button>;

    if (session && isAuthorized === false) {
      title = "Access Restricted";
      description = "Your account is not on the approved list. Please contact us to request access or try logging in with a different account.";
      button = (
          <div className="flex flex-col gap-3">
            <Button onClick={() => logout()} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
            <Button asChild>
              <a href="mailto:contact@example.com"><Mail className="w-4 h-4 mr-2" />Contact Us</a>
            </Button>
          </div>
      );
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card rounded-3xl border border-border p-8 max-w-md mx-4 text-center space-y-6 pointer-events-auto shadow-2xl">
              <h3 className="text-2xl font-bold text-foreground">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
              {button}
            </div>
          </div>
        </div>
    );
  };

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card text-card-foreground border-b border-border text-center py-16">
        <h1 className="text-5xl md:text-6xl font-bold">NSphere</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
          For Network State builders. Find collaborators, share projects, and build the future.
        </p>
        {isAuthorized && (
          <div className="flex flex-col items-center gap-4 mt-8">
            {/* Coin Balance */}
            {coinBalance !== null && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-4 py-2 text-amber-700">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">{coinBalance.balance} Continental Coins</span>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={handleCreateProject}><Briefcase className="mr-2" />Create Project</Button>
              <Button onClick={handleViewProfile} variant="secondary"><User className="mr-2"/>View Profile</Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 py-8 ${!isAuthorized ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        {/* Search and Filter, adjusted to remove selectedExpertise and use current search state */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects by name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ecosystem
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalProjects} project{totalProjects !== 1 ? 's' : ''} in the community
              </p>
            </div>
          </div>

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
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery ? 'Try adjusting your search filters' : 'Be the first to create a project!'}
                  </p>
                  {isAuthorized && (
                  <Button
                    onClick={handleCreateProject}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Create First Project
                  </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="transform hover:scale-105 transition-all duration-300">
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                        <ProjectCard project={project} hasDiscordRole={isAuthorized} currentUserId={userProfile?.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {projects.length > 0 && (
                <div className="flex items-center justify-center space-x-4 mt-12">
                  <Button
                    onClick={() => loadProjects(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="px-6 py-3 rounded-xl"
                  >
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
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {renderAuthOverlay()}
    </div>
  );
}