'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectService } from '@/lib/projects';
import { Project, POPULAR_CATEGORIES, ProjectCategory } from '@/types/project';
import withAuth from '@/hoc/withAuth';
import { toast } from "sonner";

const ProjectsPage = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMyProjectsOnly, setShowMyProjectsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ProjectCategory[]>([]);
  const [openOnly, setOpenOnly] = useState<boolean>(false);

  const loadUserProjects = useCallback(async () => {
    if (!userProfile?.id) return;
    
    try {
      const userProjects = await ProjectService.getUserProjects(userProfile.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load your projects.');
    }
  }, [userProfile?.id]);

  const loadAllProjects = useCallback(async () => {
    try {
      const allProjectsData = await ProjectService.getAllProjects();
      setAllProjects(allProjectsData);
    } catch (error) {
      console.error('Error loading all projects:', error);
      toast.error('Failed to load ecosystem projects.');
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

  const handleDeleteProject = async (projectId: string) => {
    if (!userProfile?.id) return;

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await ProjectService.deleteProject(projectId, userProfile.id);
      toast.success('Project deleted successfully.');
      await loadUserProjects();
      await loadAllProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to delete project: ${errorMessage}`);
    }
  };
  
  const handleEditProject = (project: Project) => {
    // Navigate to a new edit page, which we will create later.
    // For now, this can be a placeholder.
    router.push(`/projects/edit/${project.id}`);
    toast.info("Navigating to edit page is not implemented yet.");
  };

  const handleCreateClick = () => {
    if (projects.length >= 3) {
      toast.error('You have reached the maximum project limit (3).');
    } else {
      router.push('/projects/new');
    }
  };

  const filteredProjects = allProjects.filter((project: Project) => {
    // My projects filter
    if (showMyProjectsOnly && project.user_id !== userProfile?.id) return false;

    // Open to collaboration filter
    if (openOnly && project.collaboration_status !== 'open') return false;

    // Category filter (intersection)
    if (selectedCategories.length > 0) {
      const categories: ProjectCategory[] = project.categories || [];
      const intersects = categories.some((c: ProjectCategory) => selectedCategories.includes(c));
      if (!intersects) return false;
    }

    // Search filter across title, description, tags, categories
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = project.title.toLowerCase().includes(q);
      const inDesc = project.description.toLowerCase().includes(q);
      const inTags = (project.tags || []).some((t) => t.toLowerCase().includes(q));
      const inCats = (project.categories || []).some((c: string) => c.toLowerCase().includes(q));
      if (!(inTitle || inDesc || inTags || inCats)) return false;
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Ecosystem Projects</h1>
            <p className="text-secondary-foreground">
              Create and discover innovative projects in the ecosystem
            </p>
          </div>
          <Button onClick={handleCreateClick}>
            Create New Project
          </Button>
        </div>



        {/* Modern Filter Section */}
        <div className="mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects by name, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* My Projects Filter */}
              <div className="lg:w-48">
                <Button
                  onClick={() => setShowMyProjectsOnly(!showMyProjectsOnly)}
                  variant={showMyProjectsOnly ? "default" : "outline"}
                  className="w-full py-3 h-auto"
                >
                  {showMyProjectsOnly ? "✓ My Projects" : "🔍 My Projects"}
                </Button>
              </div>

              {/* Open to collaboration */}
              <div className="lg:w-64">
                <Button
                  onClick={() => setOpenOnly((v) => !v)}
                  variant={openOnly ? 'default' : 'outline'}
                  className="w-full py-3 h-auto"
                >
                  {openOnly ? '✓ Open to Collaboration' : '🤝 Open to Collaboration'}
                </Button>
              </div>
              
              {/* Clear Filters Button */}
              {(searchQuery || selectedCategories.length > 0 || showMyProjectsOnly || openOnly) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setShowMyProjectsOnly(false);
                    setOpenOnly(false);
                  }}
                  variant="outline"
                  className="px-4 py-3 h-auto"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Active Filters Display */}
            {(searchQuery || selectedCategories.length > 0 || showMyProjectsOnly || openOnly) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    <span>Search: &quot;{searchQuery}&quot;</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {showMyProjectsOnly && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span>My Projects Only</span>
                    <button
                      onClick={() => setShowMyProjectsOnly(false)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {openOnly && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <span>Open to Collaboration</span>
                    <button onClick={() => setOpenOnly(false)} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
                {selectedCategories.map((cat) => (
                  <div key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/80 text-secondary-foreground rounded-full text-sm">
                    <span>{cat}</span>
                    <button
                      onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                      className="ml-1 hover:bg-secondary rounded-full p-0.5"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategories.includes(cat)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">
              {showMyProjectsOnly ? "No projects yet" : "No projects found"}
            </h3>
            <p className="text-secondary-foreground mb-4">
              {showMyProjectsOnly 
                ? "Create your first project to get started" 
                : "Try adjusting your search criteria"
              }
            </p>
            {showMyProjectsOnly && (
              <Button onClick={handleCreateClick}>
                Create New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                canEdit={project.user_id === userProfile?.id}
                onEdit={project.user_id === userProfile?.id ? () => handleEditProject(project) : undefined}
                onDelete={project.user_id === userProfile?.id ? () => handleDeleteProject(project.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(ProjectsPage);