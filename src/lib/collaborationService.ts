import { supabase } from './supabaseClient';
import { 
  CollaborationRequest, 
  ProjectCollaborator, 
  CreateCollaborationRequestData 
} from '@/types/project';

export class CollaborationService {
  // Get current user's auth token for API calls
  private static async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  // Create a collaboration request
  static async createCollaborationRequest(data: CreateCollaborationRequestData): Promise<CollaborationRequest> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/collaboration/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create collaboration request');
    }

    return result.data;
  }

  // Get collaboration requests for a user (founder)
  static async getCollaborationRequests(
    userId: string, 
    status?: string, 
    limit?: number
  ): Promise<CollaborationRequest[]> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/collaboration/requests/${userId}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch collaboration requests');
    }

    return result.data;
  }

  // Update collaboration request status
  static async updateCollaborationRequestStatus(
    requestId: string, 
    status: 'accepted' | 'denied' | 'archived'
  ): Promise<CollaborationRequest> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/collaboration/request/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update collaboration request status');
    }

    return result.data;
  }

  // Accept collaboration request
  static async acceptCollaborationRequest(requestId: string): Promise<CollaborationRequest> {
    return this.updateCollaborationRequestStatus(requestId, 'accepted');
  }

  // Deny collaboration request
  static async denyCollaborationRequest(requestId: string): Promise<CollaborationRequest> {
    return this.updateCollaborationRequestStatus(requestId, 'denied');
  }

  // Archive collaboration request
  static async archiveCollaborationRequest(requestId: string): Promise<CollaborationRequest> {
    return this.updateCollaborationRequestStatus(requestId, 'archived');
  }

  // Get project collaborators
  static async getProjectCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    const response = await fetch(`/api/projects/${projectId}/collaborators`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch project collaborators');
    }

    return result.data;
  }

  // Remove collaborator from project
  static async removeCollaborator(projectId: string, collaboratorId: string): Promise<void> {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/projects/${projectId}/collaborators?collaboratorId=${collaboratorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to remove collaborator');
    }
  }

  // Get pending requests count for a user
  static async getPendingRequestsCount(userId: string): Promise<number> {
    try {
      const requests = await this.getCollaborationRequests(userId, 'pending', 50);
      return requests.length;
    } catch (error) {
      console.error('Error getting pending requests count:', error);
      return 0;
    }
  }

  // Real-time subscription for collaboration requests
  static subscribeToCollaborationRequests(
    userId: string,
    callback: (payload: { eventType: string; new: CollaborationRequest; old?: CollaborationRequest }) => void
  ) {
    return supabase
      .channel('collaboration_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaboration_requests',
          filter: `project.user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Check if user can request collaboration
  static async canRequestCollaboration(
    projectId: string, 
    userId: string
  ): Promise<{ canRequest: boolean; reason?: string }> {
    try {
      // Check if project exists and get info
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id, collaboration_status, current_collaborators, max_collaborators')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        return { canRequest: false, reason: 'Project not found' };
      }

      // Check if it's user's own project
      if (project.user_id === userId) {
        return { canRequest: false, reason: 'Cannot request collaboration on your own project' };
      }

      // Check collaboration status
      if (project.collaboration_status === 'not-looking') {
        return { canRequest: false, reason: 'Project is not looking for collaborators' };
      }

      if (project.collaboration_status === 'team-full') {
        return { canRequest: false, reason: 'Project team is full' };
      }

      // Check if there are available spots
      if (project.current_collaborators >= project.max_collaborators) {
        return { canRequest: false, reason: 'Project has reached its collaboration limit' };
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('collaboration_requests')
        .select('id')
        .eq('project_id', projectId)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        return { canRequest: false, reason: 'You already have a pending request for this project' };
      }

      // Check if user is already a collaborator
      const { data: existingCollaborator } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', projectId)
        .eq('collaborator_id', userId)
        .eq('is_active', true)
        .single();

      if (existingCollaborator) {
        return { canRequest: false, reason: 'You are already a collaborator on this project' };
      }

      return { canRequest: true };

    } catch (error) {
      console.error('Error checking collaboration eligibility:', error);
      return { canRequest: false, reason: 'Unable to check collaboration eligibility' };
    }
  }
}