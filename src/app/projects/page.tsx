'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/context/EnhancedAuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletSelection } from '@/components/ui/WalletSelection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
// Removed withEnhancedAuth import - projects page now accessible to all
import { ArrowLeft, Loader, Plus, AlertTriangle, PackageOpen, LayoutGrid, XCircle, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ProjectsPage = () => {
  const router = useRouter();
  const { session, hasProfile, login, networkValidation, sessionWalletMismatch } = useEnhancedAuth();
  const { publicKey, connected } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'create' | 'browse'>('browse');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Check if user is fully authenticated
  const isAuthenticated = !!(session && hasProfile === true);

  const walletAddress = publicKey?.toBase58();

  const loadUserProjects = async () => {
    if (!isAuthenticated || !walletAddress) return;
    try {
      const userProjects = await ProjectService.getUserProjects(walletAddress);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load your projects.');
    }
  };

  // Load all projects for browsing
  const loadAllProjects = async () => {
    try {
      const result = await ProjectService.getPaginatedProjects(1, 50); // Load first 50 projects
      setProjects(result.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (isAuthenticated && walletAddress && activeTab === 'my-projects') {
        await loadUserProjects();
      } else {
        await loadAllProjects();
      }
      setIsLoading(false);
    };
    loadData();
  }, [isAuthenticated, walletAddress, activeTab]);

  const handleCreateProject = async (data: CreateProjectData) => {
    if (!isAuthenticated || !walletAddress || !session) {
      setShowLoginModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await ProjectService.createProject(data, walletAddress, session.user.id);
      await loadUserProjects();
      setShowForm(false);
      setEditingProject(undefined);
      setActiveTab('my-projects');
      toast.success('Project created successfully!');
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!isAuthenticated || !walletAddress) {
      setShowLoginModal(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await ProjectService.updateProject(data, walletAddress);
      await loadUserProjects();
      setEditingProject(undefined);
      setShowForm(false);
      toast.success('Project updated successfully!');
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error(error.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!isAuthenticated || !walletAddress) {
      setShowLoginModal(true);
      return;
    }
    setIsDeleting(projectId);
    try {
      await ProjectService.deleteProject(projectId, walletAddress);
      await loadUserProjects();
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    setActiveTab('create');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
    setActiveTab('my-projects');
  };

  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const result = await login();
      if (result.success) {
        setShowLoginModal(false);
        toast.success('Successfully authenticated!');
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Authentication failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const openCreateForm = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setEditingProject(undefined);
    setShowForm(true);
    setActiveTab('create');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 animate-spin" />
          <h2 className="mt-4 text-xl font-semibold">Loading Projects</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: CreateProjectData | UpdateProjectData) => {
    if ('id' in data) {
      handleUpdateProject(data);
    } else {
      handleCreateProject(data);
    }
  };

  return (
    <div className="min-h-screen">
              <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Auth Required Banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-primary text-primary-foreground border rounded-lg mb-8">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">You need NS TOKEN to create and manage projects</p>
                    <p className="text-sm text-primary-foreground/80">Connect your wallet and verify NFT ownership to start building</p>
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

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              {isAuthenticated && activeTab === 'my-projects' ? 'My Projects' : 'Community Projects'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isAuthenticated && activeTab === 'my-projects' 
                ? 'Manage your projects and showcase your ideas to the community.'
                : 'Discover innovative projects from the community. Connect your wallet to create your own.'}
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 rounded-lg bg-muted p-1">
            {isAuthenticated && (
              <Button
                variant={activeTab === 'my-projects' ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveTab('my-projects');
                  setShowForm(false);
                }}
                className="w-full"
              >
                My Projects ({projects.length || 0}/3)
              </Button>
            )}
            <Button
              variant={!isAuthenticated || activeTab === 'browse' ? 'default' : 'ghost'}
              onClick={() => {
                setActiveTab('browse' as any);
                setShowForm(false);
              }}
              className="w-full"
            >
              Browse All Projects
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={openCreateForm}
              disabled={isAuthenticated && (projects?.length || 0) >= 3 && !editingProject}
              className="w-full"
            >
              {editingProject ? 'Edit Project' : 'Create Project'}
            </Button>
          </div>
        </div>

        {(activeTab === 'my-projects' || activeTab === 'browse') && !showForm && (
          <div className="space-y-8">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <PackageOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {activeTab === 'my-projects' ? 'No projects yet' : 'No projects found'}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {activeTab === 'my-projects' 
                    ? 'Start your journey by creating your first project.'
                    : 'Be the first to create a project in the community!'}
                </p>
                <Button onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  {activeTab === 'my-projects' ? 'Create Your First Project' : 'Create Project'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <AlertDialog key={project.id}>
                    <ProjectCard
                      project={project}
                      canEdit={isAuthenticated && activeTab === 'my-projects'}
                      onEdit={handleEditProject}
                      onDeleteTrigger={() => {}}
                      isDeleting={isDeleting === project.id}
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your project
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ))}
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div className="max-w-4xl mx-auto">
            {projects.length >= 3 && !editingProject ? (
              <div className="text-center py-16">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Project limit reached</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You can only create up to 3 projects. Delete an existing project to create a new one.
                </p>
                <Button onClick={() => setActiveTab('my-projects')}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  View My Projects
                </Button>
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-8">
                <ProjectForm
                  project={editingProject}
                  onSubmit={onSubmit}
                  onCancel={handleCancelForm}
                  isLoading={isSubmitting}
                  walletAddress={walletAddress!}
                />
              </div>
            )}
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Connect Wallet</h2>
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
                    Connect your wallet and verify NFT ownership to create and manage projects
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
                            Wallet changed detected
                          </p>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Your previous session was with a different wallet. Logging in with new wallet...
                        </p>
                      </div>
                    )}
                    
                    {/* Show network validation warning */}
                    {networkValidation && !networkValidation.isValid && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <p className="text-sm text-red-800 font-medium">
                            Network Mismatch
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
                        console.log(`ProjectsPage: Wallet selected/connected: ${walletName}`);
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
      </div>
    </div>
  );
};

export default ProjectsPage;
