'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProjectService } from '@/lib/projects';
import { Project } from '@/types/project';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function MyProjectsPage() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (userProfile) {
      const fetchProjects = async () => {
        setIsLoading(true);
        try {
          const userProjects = await ProjectService.getProjectsByFounder(userProfile.id);
          setProjects(userProjects);
        } catch (error) {
          console.error('Error fetching user projects:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjects();
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Projects</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-lg animate-pulse border border-border">
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded-lg w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={() => router.push('/projects?tab=create')}>
          Create New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-4">You haven't created any projects. Start building something new!</p>
          <Button onClick={() => router.push('/projects?tab=create')}>
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
