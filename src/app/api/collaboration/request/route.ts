import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CreateCollaborationRequestData } from '@/types/project';

export async function POST(request: NextRequest) {
  try {
    const body: CreateCollaborationRequestData = await request.json();
    const { project_id, collaboration_type, intro_message } = body;

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

    // Validate input
    if (!project_id || !collaboration_type || !intro_message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (intro_message.length > 140) {
      return NextResponse.json(
        { error: 'Intro message must be 140 characters or less' },
        { status: 400 }
      );
    }

    // Check if project exists and get project info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, title, collaboration_status, current_collaborators, max_collaborators')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to request collaboration on their own project
    if (project.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot request collaboration on your own project' },
        { status: 400 }
      );
    }

    // Check if project is accepting collaborations
    if (project.collaboration_status === 'not-looking' || project.collaboration_status === 'team-full') {
      return NextResponse.json(
        { error: 'This project is not currently accepting collaborations' },
        { status: 400 }
      );
    }

    // Check if there are available spots
    if (project.current_collaborators >= project.max_collaborators) {
      return NextResponse.json(
        { error: 'This project has reached its collaboration limit' },
        { status: 400 }
      );
    }

    // Check if user has already requested collaboration for this project
    const { data: existingRequest } = await supabase
      .from('collaboration_requests')
      .select('id')
      .eq('project_id', project_id)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested collaboration for this project' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 5 requests per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayRequests } = await supabase
      .from('collaboration_requests')
      .select('id')
      .eq('requester_id', user.id)
      .gte('created_at', today.toISOString());

    if (todayRequests && todayRequests.length >= 5) {
      return NextResponse.json(
        { error: 'You can only send 5 collaboration requests per day' },
        { status: 429 }
      );
    }

    // Create the collaboration request
    const { data: newRequest, error: createError } = await supabase
      .from('collaboration_requests')
      .insert({
        project_id,
        requester_id: user.id,
        collaboration_type,
        intro_message: intro_message.trim(),
        status: 'pending'
      })
      .select(`
        *,
        requester:user_profiles!requester_id(id, username, avatar_url, discord_username),
        project:projects!project_id(id, title, user_id)
      `)
      .single();

    if (createError) {
      console.error('Error creating collaboration request:', createError);
      return NextResponse.json(
        { error: 'Failed to create collaboration request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newRequest
    });

  } catch (error) {
    console.error('Collaboration request API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}