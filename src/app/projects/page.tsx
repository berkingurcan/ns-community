'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import withAuth from '@/hoc/withAuth';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { CreateProjectData } from '@/types/project';
import { ProjectService } from '@/lib/projects';
import { toast } from 'sonner';

const CreateProjectPage = () => {
    const { userProfile } = useAuth();
  const router = useRouter();

  if (!userProfile) {
    // Or a loading spinner
    return <div>Loading user profile...</div>;
  }
  
  const handleCreateProject = async (data: CreateProjectData) => {
    const newProject = await ProjectService.createProject(data, userProfile.id);
    if (newProject) {
      toast.success('Project created successfully!');
      router.push('/my-projects');
    }
  };

  const handleCancelForm = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
                <ProjectForm
          onCreate={handleCreateProject}
          onCancel={handleCancelForm}
        />
      </div>
    </div>
  );
};

export default withAuth(CreateProjectPage);
