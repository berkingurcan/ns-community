'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProjectService } from '@/lib/projects';
import { CreateProjectData } from '@/types/project';
import withAuth from '@/hoc/withAuth';
import { toast } from "sonner"

const CreateProjectPage = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProject = async (data: CreateProjectData) => {
    if (!userProfile?.id) {
        toast.error('You must be logged in to create a project.');
        return;
    };

    setIsSubmitting(true);
    try {
      await ProjectService.createProject(data, userProfile.id);
      toast.success('Project created successfully!');
      router.push('/my-projects'); 
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to create project: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Project</h1>
        <p className="text-muted-foreground">
          Fill out the details below to get your project listed in the ecosystem.
        </p>
      </div>
      <div className="mt-8">
        <ProjectForm
          onCreate={handleCreateProject}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default withAuth(CreateProjectPage);

