import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/projects/[projectId]/collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Get project collaborators
    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('project_collaborators')
      .select(`
        *,
        collaborator:user_profiles!collaborator_id(id, username, avatar_url, discord_username)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (collaboratorsError) {
      console.error('Error fetching project collaborators:', collaboratorsError);
      return NextResponse.json(
        { error: 'Failed to fetch project collaborators' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: collaborators || []
    });

  } catch (error) {
    console.error('Get project collaborators API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/collaborators/[collaboratorId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const url = new URL(request.url);
    const collaboratorId = url.searchParams.get('collaboratorId');

    if (!collaboratorId) {
      return NextResponse.json(
        { error: 'Collaborator ID is required' },
        { status: 400 }
      );
    }

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

    // Get project info to check ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, current_collaborators')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if the authenticated user is the project owner or the collaborator themselves
    if (project.user_id !== user.id && collaboratorId !== user.id) {
      return NextResponse.json(
        { error: 'Only project owners or the collaborator themselves can remove a collaborator' },
        { status: 403 }
      );
    }

    // Check if the collaborator exists
    const { data: existingCollaborator, error: collaboratorError } = await supabase
      .from('project_collaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('collaborator_id', collaboratorId)
      .eq('is_active', true)
      .single();

    if (collaboratorError || !existingCollaborator) {
      return NextResponse.json(
        { error: 'Collaborator not found in this project' },
        { status: 404 }
      );
    }

    // Remove the collaborator (set as inactive)
    const { error: removeError } = await supabase
      .from('project_collaborators')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCollaborator.id);

    if (removeError) {
      console.error('Error removing collaborator:', removeError);
      return NextResponse.json(
        { error: 'Failed to remove collaborator' },
        { status: 500 }
      );
    }

    // Decrement the current_collaborators count
    if (project.current_collaborators > 0) {
      const { error: decrementError } = await supabase
        .from('projects')
        .update({ 
          current_collaborators: Math.max(0, project.current_collaborators - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (decrementError) {
        console.error('Error decrementing collaborator count:', decrementError);
      }

      // If project was full but now has space, update collaboration status
      if (project.current_collaborators > 0) {
        const { data: updatedProject } = await supabase
          .from('projects')
          .select('current_collaborators, max_collaborators, collaboration_status')
          .eq('id', projectId)
          .single();

        if (updatedProject && 
            updatedProject.collaboration_status === 'team-full' && 
            updatedProject.current_collaborators < updatedProject.max_collaborators) {
          await supabase
            .from('projects')
            .update({ 
              collaboration_status: 'open',
              updated_at: new Date().toISOString()
            })
            .eq('id', projectId);
        }
      }
    }

    // Archive any pending collaboration requests from this user for this project
    await supabase
      .from('collaboration_requests')
      .update({ 
        status: 'archived',
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('requester_id', collaboratorId)
      .eq('status', 'pending');

    return NextResponse.json({
      success: true,
      message: 'Collaborator removed successfully'
    });

  } catch (error) {
    console.error('Remove collaborator API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}