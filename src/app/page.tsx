'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWalletErrorSuppression } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project, EXPERTISE_OPTIONS } from '@/types/project';
import { Mail, Briefcase, User, LogOut } from 'lucide-react';

export default function HomePage() {
  const { session, userProfile, isAuthorized, loading: authLoading, login, logout } = useAuth();
  const router = useRouter();
  
  // Suppress wallet extension errors
  useWalletErrorSuppression();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');

  const projectsPerPage = 9;
  
  // User is fully authenticated and authorized to see content

  const loadProjects = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      // For simplicity, we fetch projects regardless of auth state,
      // the UI will handle blurring/hiding content.
      const result = await ProjectService.getPaginatedProjects(page, projectsPerPage);
      // Filtering logic can be added here if needed based on search/tags
      setProjects(result.projects);
      setTotalProjects(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(1);
  }, [loadProjects]);
  
  const handleCreateProject = () => router.push('/projects');
  const handleViewProfile = () => router.push('/profile');

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
          <div className="flex gap-4 justify-center mt-8">
            <Button onClick={handleCreateProject}><Briefcase className="mr-2" />Create Project</Button>
            <Button onClick={handleViewProfile} variant="secondary"><User className="mr-2"/>View Profile</Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 py-8 ${!isAuthorized ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {/* Pagination etc. */}
      </div>
      
      {renderAuthOverlay()}
    </div>
  );
}
