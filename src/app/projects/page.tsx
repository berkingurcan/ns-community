'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { Project, CreateProjectData, UpdateProjectData, EXPERTISE_OPTIONS } from '@/types/project';
import withAuth from '@/hoc/withAuth';

const ProjectsPage = () => {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'browse' | 'create'>('my-projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('');

  const loadUserProjects = useCallback(async () => {
    if (!userProfile?.id) return;
    
    try {
      const userProjects = await ProjectService.getUserProjects(userProfile.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, [userProfile?.id]);

  const loadAllProjects = useCallback(async () => {
    try {
      const allProjectsData = await ProjectService.getAllProjects();
      setAllProjects(allProjectsData);
    } catch (error) {
      console.error('Error loading all projects:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadUserProjects(), loadAllProjects()]);
      setIsLoading(false);
    };

    if (userProfile?.id) {
      loadData();
    }
  }, [userProfile?.id, loadUserProjects, loadAllProjects]);

  const handleCreateProject = async (data: CreateProjectData) => {
    if (!userProfile?.id) return;

    setIsSubmitting(true);
    try {
      await ProjectService.createProject(data, userProfile.id);
      await loadUserProjects();
      setShowForm(false);
      setActiveTab('my-projects');
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!userProfile?.id) return;

    setIsSubmitting(true);
    try {
      await ProjectService.updateProject(data, userProfile.id);
      await loadUserProjects();
      await loadAllProjects();
      setEditingProject(undefined);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating project:', error);
      alert(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!userProfile?.id) return;

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await ProjectService.deleteProject(projectId, userProfile.id);
      await loadUserProjects();
      await loadAllProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete project');
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
  };

  const filteredProjects = allProjects.filter(project => {
    if (project.user_id === userProfile?.id) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!project.title.toLowerCase().includes(query) &&
          !project.description.toLowerCase().includes(query)) {
        return false;
      }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ecosystem Projects</h1>
          <p className="text-secondary-foreground">
            Create and discover innovative projects in the ecosystem
          </p>
        </div>

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
            Browse Ecosystem
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
                onCreate={handleCreateProject}
                onUpdate={handleUpdateProject}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProjectsPage);