import { supabase } from './supabaseClient';
import { Project, CreateProjectData, UpdateProjectData } from '@/types/project';

export class ProjectService {
  // Get all projects for a user
  static async getUserProjects(walletAddress: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }

    return data || [];
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
    walletAddress: string, 
    userId?: string
  ): Promise<Project> {
    try {
      // First check if user already has 3 projects
      const existingProjects = await this.getUserProjects(walletAddress);
      if (existingProjects.length >= 3) {
        throw new Error('You can only create up to 3 projects');
      }

      // Clean the data to remove undefined values
      const cleanProjectData = {
        project_name: projectData.project_name,
        elevator_pitch: projectData.elevator_pitch,
        links: projectData.links,
        founders: projectData.founders,
        looking_for: projectData.looking_for,
        ...(projectData.logo_url && { logo_url: projectData.logo_url }),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...cleanProjectData,
          wallet_address: walletAddress,
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
    walletAddress: string
  ): Promise<Project> {
    const { id, ...updateData } = projectData;

    // Clean the data to remove undefined values, but allow null for logo_url to clear it
    const cleanUpdateData: any = {};
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      if (value !== undefined) {
        cleanUpdateData[key] = value;
      }
    });

    const { data, error } = await supabase
      .from('projects')
      .update(cleanUpdateData)
      .eq('id', id)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  }

  // Delete a project
  static async deleteProject(id: string, walletAddress: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Search projects by expertise
  static async searchProjectsByExpertise(expertise: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .contains('looking_for', [expertise])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching projects:', error);
      throw error;
    }

    return data || [];
  }

  // Search projects by name or description
  static async searchProjects(query: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`project_name.ilike.%${query}%,elevator_pitch.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching projects:', error);
      throw error;
    }

    return data || [];
  }
}