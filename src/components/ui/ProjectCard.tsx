'use client';

import { Project } from '@/types/project';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  User,
  Search,
  Link2,
  Edit,
  Trash2,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  canEdit?: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, canEdit = false }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        {/* Project Logo and Name */}
        <div className="flex items-start gap-4">
          {project.logo_url ? (
            <img
              src={project.logo_url}
              alt={`${project.project_name} logo`}
              className="w-16 h-16 object-cover rounded-xl border-2 border-border flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {project.project_name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Elevator Pitch */}
        <div>
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {project.elevator_pitch}
          </p>
        </div>

        {/* Founders */}
        {project.founders.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <User className="w-4 h-4 mr-1 text-muted-foreground" />
              Founders&apos; X Handles
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.founders.map((founder, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm font-medium"
                >
                  {founder}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Looking For */}
        {project.looking_for.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Search className="w-4 h-4 mr-1 text-purple-500" />
              Looking For
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.looking_for.slice(0, 3).map((expertise, index) => (
                <Badge
                  key={index}
                  className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                >
                  {expertise}
                </Badge>
              ))}
              {project.looking_for.length > 3 && (
                <Badge variant="secondary" className="text-muted-foreground">
                  +{project.looking_for.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
              <Link2 className="w-4 h-4 mr-1 text-blue-500" />
              Links
            </h4>
            <div className="space-y-1">
              {project.links.slice(0, 2).map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium truncate transition-colors duration-200"
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

      {/* Action Buttons */}
      {canEdit && (
        <CardFooter className="flex gap-2 pt-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className="flex-1 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}