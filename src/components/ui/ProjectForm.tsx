'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from './ImageUpload';
import { CreateProjectData, UpdateProjectData, Project } from '@/types/project';
import { Plus, X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectFormProps {
  project?: Project;
  onCreate?: (data: CreateProjectData) => Promise<void>;
  onUpdate?: (data: UpdateProjectData) => Promise<void>;
  onDelete?: (projectId: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ project, onCreate, onUpdate, onDelete, onCancel, isLoading = false }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<CreateProjectData>>({
    title: '',
    description: '',
    tags: [],
    status: 'Draft',
    collaboration_status: 'open',
    looking_for_collaboration: [],
    categories: [],
    max_collaborators: 5,
    image_url: '',
    github_url: '',
    live_url: '',
    twitter_url: '',
  });

  const [currentTag, setCurrentTag] = useState('');

  // Populate form if editing existing project
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        tags: project.tags || [],
        status: project.status,
        image_url: project.image_url || '',
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        twitter_url: project.twitter_url || '',
      });
    }
  }, [project]);

  const handleInputChange = (field: keyof CreateProjectData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.description?.trim()) {
      alert('Please fill in the project title and description');
      return;
    }

    // Clean up the data
    const cleanData = {
      ...formData,
      image_url: formData.image_url || undefined,
      github_url: formData.github_url || undefined,
      live_url: formData.live_url || undefined,
      twitter_url: formData.twitter_url || undefined,
    };

    if (project && onUpdate) {
      await onUpdate({ ...cleanData, id: project.id });
    } else if (onCreate) {
      await onCreate(cleanData as CreateProjectData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6">
        {project ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Project Title *
          </Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter your project title"
            required
          />
        </div>

        {/* Project Image */}
        <div className="space-y-2">
          <ImageUpload
            currentImageUrl={formData.image_url}
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
          />
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Project Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            placeholder="Describe your project..."
            className="resize-vertical"
            required
          />
        </div>
        
        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button type="button" onClick={addTag} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Project Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <div className="relative">
                    <Input id="github_url" type="url" value={formData.github_url} onChange={(e) => handleInputChange('github_url', e.target.value)} placeholder="github.com/your-repo" className="pl-10" />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
                    </span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="live_url">Live URL</Label>
                <Input id="live_url" type="url" value={formData.live_url} onChange={(e) => handleInputChange('live_url', e.target.value)} placeholder="https://yourproject.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="twitter_url">X (Twitter) URL</Label>
                <div className="relative">
                    <Input id="twitter_url" type="url" value={formData.twitter_url} onChange={(e) => handleInputChange('twitter_url', e.target.value)} placeholder="x.com/your-handle" className="pl-10" />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M18 4H6l-4 8 4 8h12l4-8z"/><path d="m12 12 4 8"/><path d="m8 12-4 8"/></svg>
                    </span>
                </div>
            </div>
        </div>
        
        {/* Status */}
        <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-4">
                {(['showcase', 'NS-Only', 'Archive', 'Draft'] as const).map(status => (
                    <Label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={formData.status === status}
                            onChange={(e) => handleInputChange('status', e.target.value as Project['status'])}
                        />
                        {status}
                    </Label>
                ))}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </Button>
          <div className="flex gap-2">
            {project && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                    onDelete(project.id);
                  }
                }}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
