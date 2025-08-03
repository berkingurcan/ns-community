'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from './ImageUpload';
import { CreateProjectData, UpdateProjectData, EXPERTISE_OPTIONS, Project } from '@/types/project';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  walletAddress: string;
}

export function ProjectForm({ project, onSubmit, onCancel, isLoading = false, walletAddress }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    project_name: '',
    elevator_pitch: '',
    links: [''],
    founders: [''],
    looking_for: [],
    logo_url: '',
  });

  const [currentLink, setCurrentLink] = useState('');
  const [currentFounder, setCurrentFounder] = useState('');

  // Populate form if editing existing project
  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        elevator_pitch: project.elevator_pitch,
        links: project.links.length > 0 ? project.links : [''],
        founders: project.founders.length > 0 ? project.founders : [''],
        looking_for: project.looking_for,
        logo_url: project.logo_url || '',
      });
    }
  }, [project]);

  const handleInputChange = (field: keyof CreateProjectData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(expertise)
        ? prev.looking_for.filter(e => e !== expertise)
        : [...prev.looking_for, expertise]
    }));
  };

  const addLink = () => {
    if (currentLink.trim()) {
      setFormData(prev => ({
        ...prev,
        links: prev.links.filter(link => link.trim() !== '')
          .concat([currentLink.trim()])
      }));
      setCurrentLink('');
    }
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const addFounder = () => {
    if (currentFounder.trim()) {
      setFormData(prev => ({
        ...prev,
        founders: prev.founders.filter(founder => founder.trim() !== '')
          .concat([currentFounder.trim()])
      }));
      setCurrentFounder('');
    }
  };

  const removeFounder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index)
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      logo_url: imageUrl
    }));
  };

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      logo_url: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_name.trim() || !formData.elevator_pitch.trim()) {
      alert('Please fill in the project name and elevator pitch');
      return;
    }

    if (formData.founders.filter(f => f.trim() !== '').length === 0) {
      alert('Please add at least one founder');
      return;
    }

    // Clean up the data
    const cleanData = {
      ...formData,
      links: formData.links.filter(link => link.trim() !== ''),
      founders: formData.founders.filter(founder => founder.trim() !== ''),
      logo_url: formData.logo_url || undefined, // Convert empty string to undefined
    };

    const submitData = project 
      ? { ...cleanData, id: project.id } as UpdateProjectData
      : cleanData;

    await onSubmit(submitData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        {project ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="project_name">Project Name *</Label>
          <Input
            id="project_name"
            type="text"
            value={formData.project_name}
            onChange={(e) => handleInputChange('project_name', e.target.value)}
            placeholder="Enter your project name"
            required
          />
        </div>

        {/* Project Logo */}
        <ImageUpload
          currentImageUrl={formData.logo_url}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
          walletAddress={walletAddress}
          isLoading={isLoading}
        />

        {/* Elevator Pitch */}
        <div className="space-y-2">
          <Label htmlFor="elevator_pitch">Elevator Pitch *</Label>
          <Textarea
            id="elevator_pitch"
            value={formData.elevator_pitch}
            onChange={(e) => handleInputChange('elevator_pitch', e.target.value)}
            rows={4}
            placeholder="Describe your project in a few sentences..."
            required
          />
        </div>

        {/* Founders */}
        <div className="space-y-2">
          <Label>Founders' X Handles</Label>
          <div className="space-y-2">
            {formData.founders.filter(f => f.trim() !== '').map((founder, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-md">
                  {founder}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeFounder(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="text"
                value={currentFounder}
                onChange={(e) => setCurrentFounder(e.target.value)}
                placeholder="Add founder name..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFounder())}
              />
              <Button type="button" onClick={addFounder} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <Label>Project Links</Label>
          <div className="space-y-2">
            {formData.links.filter(l => l.trim() !== '').map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-secondary text-primary rounded-md underline hover:text-primary/80 truncate"
                >
                  {link}
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="url"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                placeholder="https://..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
              />
              <Button type="button" onClick={addLink} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Looking For */}
        <div className="space-y-4">
          <Label>Looking For (Expertise)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXPERTISE_OPTIONS.map((expertise) => (
              <div key={expertise} className="flex items-center space-x-2">
                <Checkbox
                  id={expertise}
                  checked={formData.looking_for.includes(expertise)}
                  onCheckedChange={() => handleExpertiseToggle(expertise)}
                />
                <Label
                  htmlFor={expertise}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {expertise}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
