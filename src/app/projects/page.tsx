'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
import withAuth from '@/hoc/withAuth';

const ProjectsPage = () => {
  const router = useRouter();
  const { session, userProfile } = useAuth();
  const { publicKey } = useWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'create'>('my-projects');

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

  // Initial load
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

    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setIsDeleting(projectId);
    try {
      await ProjectService.deleteProject(projectId, walletAddress);
      await loadUserProjects();
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.textContent = 'Project deleted successfully!';
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
      
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(null);
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

  // Navigate back to homepage
  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loading Projects</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Button>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your innovative projects and showcase your ideas to the community
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'my-projects'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                My Projects ({projects.length}/3)
              </button>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setShowForm(true);
                  setEditingProject(undefined);
                }}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700'
                } ${projects.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={projects.length >= 3}
              >
                {projects.length >= 3 ? 'Limit Reached' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'my-projects' && (
          <div className="space-y-8">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No projects yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start your journey by creating your first project and sharing your innovative ideas with the community
                </p>
                <Button
                  onClick={() => {
                    setActiveTab('create');
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div key={project.id} className="group">
                    <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <ProjectCard
                        project={project}
                        canEdit={true}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                      />
                      {isDeleting === project.id && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-red-600 dark:text-red-400 font-medium">Deleting...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {activeTab === 'create' && showForm && (
          <div className="max-w-4xl mx-auto">
            {projects.length >= 3 && !editingProject ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project limit reached</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  You can only create up to 3 projects. Delete an existing project to create a new one.
                </p>
                <Button
                  onClick={() => setActiveTab('my-projects')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  View My Projects
                </Button>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8">
                <ProjectForm
                  project={editingProject}
                  onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
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

export default withAuth(ProjectsPage);