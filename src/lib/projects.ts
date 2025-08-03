import { supabase } from './supabaseClient';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';

export class ProjectService {
  // Get all projects for a user
  static async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }

    // Ensure all projects have default collaboration values
    const projectsWithDefaults = (data || []).map(project => ({
      ...project,
      category: project.category || 'other',
      collaboration_status: project.collaboration_status || 'not-looking',
      looking_for_collaboration: project.looking_for_collaboration || [],
      max_collaborators: project.max_collaborators || 5,
      current_collaborators: project.current_collaborators || 0
    }));

    return projectsWithDefaults;
  }

  // Get all projects (for browsing)
  static async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }

    return data || [];
  }

  // Get paginated projects
  static async getPaginatedProjects(page: number = 1, limit: number = 9): Promise<{ projects: Project[], total: number, hasMore: boolean }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated projects:', error);
      throw error;
    }

    const total = count || 0;
    const hasMore = (page * limit) < total;

    return {
      projects: data || [],
      total,
      hasMore
    };
  }

  // Get a single project by ID
  static async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Project not found
      }
      console.error('Error fetching project:', error);
      throw error;
    }

    return data;
  }

  // Create a new project
  static async createProject(
    projectData: CreateProjectData, 
    userId: string
  ): Promise<Project> {
    try {
      // First check if user already has 3 projects
      const existingProjects = await this.getUserProjects(userId);
      if (existingProjects.length >= 3) {
        throw new Error('You can only create up to 3 projects');
      }

      // Clean the data to remove undefined values
      const cleanProjectData = {
        title: projectData.title,
        description: projectData.description,
        tags: projectData.tags,
        status: projectData.status || 'draft',
        ...(projectData.image_url && { image_url: projectData.image_url }),
        ...(projectData.github_url && { github_url: projectData.github_url }),
        ...(projectData.live_url && { live_url: projectData.live_url }),
        ...(projectData.twitter_url && { twitter_url: projectData.twitter_url }),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...cleanProjectData,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Project creation failed: No data returned');
      }

      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      // Re-throw with more context if needed
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create project: Unknown error');
    }
  }

  // Update an existing project
  static async updateProject(
    projectData: UpdateProjectData,
    userId: string
  ): Promise<Project> {
    const { id, ...updateData } = projectData;

    // Clean the data to remove undefined values, but allow null for image_url to clear it
    const cleanUpdateData: Record<string, unknown> = {};
    Object.keys(updateData).forEach(key => {
      const value = (updateData as Record<string, unknown>)[key];
      if (value !== undefined) {
        cleanUpdateData[key] = value;
      }
    });

    const { data, error } = await supabase
      .from('projects')
      .update(cleanUpdateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  }

  // Quick update project (for collaboration settings, status, etc.)
  static async quickUpdateProject(
    projectId: string, 
    updates: Partial<Project>,
    userId: string
  ): Promise<Project> {
    // Filter out read-only fields
    const allowedUpdates = {
      status: updates.status,
      collaboration_status: updates.collaboration_status,
      looking_for_collaboration: updates.looking_for_collaboration,
      collaboration_description: updates.collaboration_description,
      category: updates.category,
      max_collaborators: updates.max_collaborators,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('projects')
      .update(cleanUpdates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error quick updating project:', error);
      throw error;
    }

    return data;
  }

  // Delete a project
  static async deleteProject(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Search projects by tag
  static async searchProjectsByTag(tag: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching projects:', error);
      throw error;
    }

    return data || [];
  }

  // Search projects by title or description
  static async searchProjects(query: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching projects:', error);
      throw error;
    }

    return data || [];
  }

  // Get all projects for a specific founder
  static async getProjectsByFounder(founderId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', founderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects by founder:', error);
      throw error;
    }

    // Ensure all projects have default collaboration values
    const projectsWithDefaults = (data || []).map(project => ({
      ...project,
      category: project.category || 'other',
      collaboration_status: project.collaboration_status || 'not-looking',
      looking_for_collaboration: project.looking_for_collaboration || [],
      max_collaborators: project.max_collaborators || 5,
      current_collaborators: project.current_collaborators || 0
    }));

    return projectsWithDefaults;
  }
}