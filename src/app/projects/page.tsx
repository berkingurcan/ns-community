'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnhancedAuth } from '@/context/EnhancedAuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
import withEnhancedAuth from '@/hoc/withEnhancedAuth';
import { ArrowLeft, Loader, Plus, AlertTriangle, PackageOpen, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ProjectsPage = () => {
  const router = useRouter();
  const { session } = useEnhancedAuth();
  const { publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'create'>('my-projects');

  const walletAddress = publicKey?.toBase58();

  const loadUserProjects = async () => {
    if (!walletAddress) return;
    try {
      const userProjects = await ProjectService.getUserProjects(walletAddress);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load your projects.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadUserProjects();
      setIsLoading(false);
    };
    if (walletAddress) {
      loadData();
    }
  }, [walletAddress]);

  const handleCreateProject = async (data: CreateProjectData) => {
    if (!walletAddress || !session) return;
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
    if (!walletAddress) return;
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
    if (!walletAddress) return;
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

  const handleBackToHome = () => {
    router.push('/');
  };

  const openCreateForm = () => {
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToHome} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">My Projects</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your projects and showcase your ideas to the community.
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 rounded-lg bg-muted p-1">
            <Button
              variant={activeTab === 'my-projects' ? 'default' : 'ghost'}
              onClick={() => {
                setActiveTab('my-projects');
                setShowForm(false);
              }}
              className="w-full"
            >
              My Projects ({projects.length}/3)
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={openCreateForm}
              disabled={projects.length >= 3 && !editingProject}
              className="w-full"
            >
              {editingProject ? 'Edit Project' : 'Create Project'}
            </Button>
          </div>
        </div>

        {activeTab === 'my-projects' && !showForm && (
          <div className="space-y-8">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <PackageOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">No projects yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Start your journey by creating your first project.
                </p>
                <Button onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <AlertDialog key={project.id}>
                    <ProjectCard
                      project={project}
                      canEdit={true}
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
      </div>
    </div>
  );
};

export default withEnhancedAuth(ProjectsPage);
