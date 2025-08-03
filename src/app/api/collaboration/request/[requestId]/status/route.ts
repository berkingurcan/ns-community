import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  try {

    const { status } = await request.json();

    // Get the authenticated user from the session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Validate status
    const validStatuses = ['accepted', 'denied', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: accepted, denied, or archived' },
        { status: 400 }
      );
    }

    // Get the collaboration request with project info
    const { data: collaborationRequest, error: requestError } = await supabase
      .from('collaboration_requests')
      .select(`
        *,
        project:projects!project_id(id, user_id, current_collaborators, max_collaborators)
      `)
      .eq('id', requestId)
      .single();

    if (requestError || !collaborationRequest) {
      return NextResponse.json(
        { error: 'Collaboration request not found' },
        { status: 404 }
      );
    }

    // Check if the authenticated user is the project owner
    if (collaborationRequest.project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only project owners can update collaboration request status' },
        { status: 403 }
      );
    }

    // If accepting, check if there are still spots available
    if (status === 'accepted') {
      const project = collaborationRequest.project;
      if (project.current_collaborators >= project.max_collaborators) {
        return NextResponse.json(
          { error: 'Project has reached its collaboration limit' },
          { status: 400 }
        );
      }

      // Check if the requester is already a collaborator
      const { data: existingCollaborator } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', collaborationRequest.project_id)
        .eq('collaborator_id', collaborationRequest.requester_id)
        .eq('is_active', true)
        .single();

      if (existingCollaborator) {
        return NextResponse.json(
          { error: 'User is already a collaborator on this project' },
          { status: 400 }
        );
      }
    }

    // Start a transaction to update both the request status and potentially add collaborator

    // Update the collaboration request status
    const updateData: {
      status: string;
      updated_at: string;
      archived_at?: string;
    } = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'archived') {
      updateData.archived_at = new Date().toISOString();
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('collaboration_requests')
      .update(updateData)
      .eq('id', requestId)
      .select(`
        *,
        requester:user_profiles!requester_id(id, username, avatar_url, discord_username),
        project:projects!project_id(id, title, user_id)
      `)
      .single();

    if (updateError) {
      console.error('Error updating collaboration request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update collaboration request' },
        { status: 500 }
      );
    }

    // If accepted, add the user as a collaborator and increment the count
    if (status === 'accepted') {
      // Add to project_collaborators table
      const { error: collaboratorError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: collaborationRequest.project_id,
          collaborator_id: collaborationRequest.requester_id,
          collaboration_type: collaborationRequest.collaboration_type
        });

      if (collaboratorError) {
        console.error('Error adding collaborator:', collaboratorError);
        // Rollback the request status update
        await supabase
          .from('collaboration_requests')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', requestId);
        
        return NextResponse.json(
          { error: 'Failed to add collaborator' },
          { status: 500 }
        );
      }

      // Increment the current_collaborators count
      const { error: incrementError } = await supabase
        .from('projects')
        .update({ 
          current_collaborators: collaborationRequest.project.current_collaborators + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaborationRequest.project_id);

      if (incrementError) {
        console.error('Error incrementing collaborator count:', incrementError);
        // This is not critical, so we won't rollback
      }

      // If project is now full, update collaboration status
      if (collaborationRequest.project.current_collaborators + 1 >= collaborationRequest.project.max_collaborators) {
        await supabase
          .from('projects')
          .update({ 
            collaboration_status: 'team-full',
            updated_at: new Date().toISOString()
          })
          .eq('id', collaborationRequest.project_id);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update collaboration request status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
