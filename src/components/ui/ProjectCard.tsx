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
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="space-y-4">
        {/* Project Logo and Name */}
        <div className="flex items-start gap-4">
          {project.logo_url ? (
            <img
              src={project.logo_url}
              alt={`${project.project_name} logo`}
              className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200 dark:border-slate-600 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {project.project_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Elevator Pitch */}
        <div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {project.elevator_pitch}
          </p>
        </div>

        {/* Founders */}
        {project.founders.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Founders&apos; X Handles
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.founders.map((founder, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
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
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Looking For
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.looking_for.slice(0, 3).map((expertise, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                >
                  {expertise}
                </span>
              ))}
              {project.looking_for.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-sm">
                  +{project.looking_for.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        {project.links.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{project.links.length - 2} more link{project.links.length - 2 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-600">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(project)}
                className="flex-1 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
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
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}