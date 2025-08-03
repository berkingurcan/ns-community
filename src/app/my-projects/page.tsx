'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProjectService } from '@/lib/projects';
import { CoinService } from '@/lib/coins';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { QuickEditModal } from '@/components/ui/QuickEditModal';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { Loader2, Plus } from 'lucide-react';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';

export default function MyProjectsPage() {
  const { session, userProfile, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [quickEditingProject, setQuickEditingProject] = useState<Project | null>(null);
  const [formIsLoading, setFormIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (userProfile?.id) {
      try {
        setLoading(true);
        const userProjects = await ProjectService.getUserProjects(userProfile.id);
        setProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (!authLoading && userProfile) {
      fetchProjects();
    }
  }, [authLoading, userProfile, fetchProjects]);

  const handleCreateProject = async (data: CreateProjectData) => {
    setFormIsLoading(true);
    try {
      await ProjectService.createProject(data);
      setShowCreateModal(false);
      await fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!editingProject) return;
    setFormIsLoading(true);
    try {
      await ProjectService.updateProject(data, editingProject.id);
      setEditingProject(null);
      await fetchProjects();
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!userProfile) return;
    setFormIsLoading(true);
    try {
      await ProjectService.deleteProject(projectId, userProfile.id);
      setEditingProject(null);
      await fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleQuickUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!userProfile) return;
    try {
      await ProjectService.quickUpdateProject(projectId, updates, userProfile.id);
      setQuickEditingProject(null);
      await fetchProjects();
    } catch (error) {
      console.error("Failed to quick update project:", error);
    }
  };


  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={userProfile?.id}
              canEdit={true}
              onEdit={() => setQuickEditingProject(project)}
              onEditMore={() => setEditingProject(project)}
              onQuickEdit={handleQuickUpdateProject}
              hasDiscordRole={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No projects yet.</h2>
          <p className="text-muted-foreground mt-2 mb-4">
            It&#39;s time to start building. Create your first project!
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      )}

      {showCreateModal && (
        <ProjectForm
          onCancel={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
          isLoading={formIsLoading}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onCancel={() => setEditingProject(null)}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          isLoading={formIsLoading}
        />
      )}

      {quickEditingProject && (
        <QuickEditModal
          isOpen={!!quickEditingProject}
          onClose={() => setQuickEditingProject(null)}
          project={quickEditingProject}
          onSave={handleQuickUpdateProject}
          onEditMore={() => {
            setEditingProject(quickEditingProject);
            setQuickEditingProject(null);
          }}
        />
      )}
    </div>
  );
}
