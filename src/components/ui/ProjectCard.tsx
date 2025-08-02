'use client';

import { Project } from '@/types/project';
import { Button } from './Button';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  canEdit?: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, canEdit = false }: ProjectCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        {/* Project Logo and Name */}
        <div className="flex items-start gap-4">
          {project.logo_url && (
            <img
              src={project.logo_url}
              alt={`${project.project_name} logo`}
              className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">
              {project.project_name}
            </h3>
          </div>
        </div>

        {/* Elevator Pitch */}
        <div>
          <p className="text-secondary-foreground leading-relaxed">
            {project.elevator_pitch}
          </p>
        </div>

        {/* Founders */}
        {project.founders.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Founders</h4>
            <div className="flex flex-wrap gap-2">
              {project.founders.map((founder, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {founder}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking For */}
        {project.looking_for.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Looking For</h4>
            <div className="flex flex-wrap gap-2">
              {project.looking_for.map((expertise, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                >
                  {expertise}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Links</h4>
            <div className="space-y-1">
              {project.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:text-primary/80 text-sm underline"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-2 pt-4 border-t border-border">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(project)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(project.id)}
              >
                Delete
              </Button>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground">
          Created {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}