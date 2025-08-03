'use client';

import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Globe, Users, Target, Link as LinkIcon, Pencil, Trash2, Loader } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDeleteTrigger?: () => void;
  canEdit?: boolean;
  isDeleting?: boolean;
}

export function ProjectCard({ project, onEdit, onDeleteTrigger, canEdit = false, isDeleting = false }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full relative">
        {isDeleting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="flex items-center space-x-3">
                    <Loader className="h-6 w-6 animate-spin text-destructive" />
                    <span className="text-destructive-foreground font-medium">Deleting...</span>
                </div>
            </div>
        )}
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            {project.logo_url ? (
            <img
              src={project.logo_url}
              alt={`${project.project_name} logo`}
              className="w-16 h-16 object-cover rounded-lg border shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center shrink-0">
              <Globe className="w-8 h-8 text-secondary-foreground" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{project.project_name}</CardTitle>
            <CardDescription>
              {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {project.elevator_pitch}
            </p>

             {project.founders.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Founders
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.founders.map((founder, index) => (
                    <Badge key={index} variant="secondary">
                      {founder}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.looking_for.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Looking For
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.looking_for.slice(0, 3).map((expertise, index) => (
                    <Badge key={index} variant="default">
                      {expertise}
                    </Badge>
                  ))}
                  {project.looking_for.length > 3 && (
                    <Badge variant="outline">
                      +{project.looking_for.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {project.links.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Links
                    </h4>
                    <div className="space-y-1">
                    {project.links.slice(0, 2).map((link, index) => (
                        <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline text-sm font-medium truncate"
                        >
                        {link.replace(/^https?:\/\//, '')}
                        </a>
                    ))}
                    {project.links.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                        +{project.links.length - 2} more link{project.links.length - 2 !== 1 ? 's' : ''}
                        </p>
                    )}
                    </div>
                </div>
            )}
        </CardContent>
        {canEdit && (
            <CardFooter className="flex gap-2 pt-4 border-t">
                {onEdit && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(project)}
                    className="flex-1"
                >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                </Button>
                )}
                {onDeleteTrigger && (
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDeleteTrigger}
                        className="flex-1"
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                )}
            </CardFooter>
        )}
    </Card>
  );
}
