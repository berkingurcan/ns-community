'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { Project, CreateProjectData, UpdateProjectData, EXPERTISE_OPTIONS } from '@/types/project';
import withAuth from '@/hoc/withAuth';

const ProjectsPage = () => {
  const { session, userProfile } = useAuth();
  const { publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'browse' | 'create'>('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');

  const walletAddress = publicKey?.toBase58();

  // Load user's projects
  const loadUserProjects = async () => {
    if (!walletAddress) return;
    
    try {
      const userProjects = await ProjectService.getUserProjects(walletAddress);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Load all projects for browsing
  const loadAllProjects = async () => {
    try {
      const allProjectsData = await ProjectService.getAllProjects();
      setAllProjects(allProjectsData);
    } catch (error) {
      console.error('Error loading all projects:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadUserProjects(), loadAllProjects()]);
      setIsLoading(false);
    };

    if (walletAddress) {
      loadData();
    }
  }, [walletAddress]);

  // Handle project creation
  const handleCreateProject = async (data: CreateProjectData) => {
    if (!walletAddress || !session) return;

    setIsSubmitting(true);
    try {
      await ProjectService.createProject(data, walletAddress, session.user.id);
      await loadUserProjects();
      setShowForm(false);
      setActiveTab('my-projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project update
  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!walletAddress) return;

    setIsSubmitting(true);
    try {
      await ProjectService.updateProject(data, walletAddress);
      await loadUserProjects();
      await loadAllProjects(); // Refresh browse list too
      setEditingProject(undefined);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(error.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    if (!walletAddress) return;

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await ProjectService.deleteProject(projectId, walletAddress);
      await loadUserProjects();
      await loadAllProjects(); // Refresh browse list too
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project');
    }
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    setActiveTab('create');
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  // Filter projects for browsing
  const filteredProjects = allProjects.filter(project => {
    // Don't show user's own projects in browse
    if (project.wallet_address === walletAddress) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!project.project_name.toLowerCase().includes(query) &&
          !project.elevator_pitch.toLowerCase().includes(query) &&
          !project.founders.some(f => f.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Expertise filter
    if (selectedExpertise && !project.looking_for.includes(selectedExpertise)) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
          <p className="text-secondary-foreground">
            Create and discover innovative projects in the ecosystem
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-background rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-projects'
                ? 'bg-primary text-primary-foreground'
                : 'text-secondary-foreground hover:text-foreground'
            }`}
          >
            My Projects ({projects.length}/3)
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-primary text-primary-foreground'
                : 'text-secondary-foreground hover:text-foreground'
            }`}
          >
            Browse Projects
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setShowForm(true);
              setEditingProject(undefined);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-primary text-primary-foreground'
                : 'text-secondary-foreground hover:text-foreground'
            }`}
            disabled={projects.length >= 3}
          >
            Create Project
          </button>
        </div>

        {/* Content */}
        {activeTab === 'my-projects' && (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                <p className="text-secondary-foreground mb-4">
                  Create your first project to get started
                </p>
                <Button
                  onClick={() => {
                    setActiveTab('create');
                    setShowForm(true);
                  }}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    canEdit={true}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Expertise</option>
                  {EXPERTISE_OPTIONS.map((expertise) => (
                    <option key={expertise} value={expertise}>
                      {expertise}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                <p className="text-secondary-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && showForm && (
          <div>
            {projects.length >= 3 && !editingProject ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">Project limit reached</h3>
                <p className="text-secondary-foreground">
                  You can only create up to 3 projects. Delete an existing project to create a new one.
                </p>
                <Button
                  onClick={() => setActiveTab('my-projects')}
                  className="mt-4"
                >
                  View My Projects
                </Button>
              </div>
            ) : (
              <ProjectForm
                project={editingProject}
                onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
                walletAddress={walletAddress!}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProjectsPage);