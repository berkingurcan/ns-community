import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

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

    // Check if the authenticated user is requesting their own collaboration requests
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get URL search parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build the query
    let query = supabase
      .from('collaboration_requests')
      .select(`
        *,
        requester:user_profiles!requester_id(id, username, avatar_url, discord_username),
        project:projects!project_id(id, title, user_id)
      `)
      .eq('project.user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('Error fetching collaboration requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch collaboration requests' },
        { status: 500 }
      );
    }

    // Filter out requests where the project doesn't belong to the user
    // This is an additional security check
    const filteredRequests = requests?.filter(req => req.project?.user_id === userId) || [];

    return NextResponse.json({
      success: true,
      data: filteredRequests
    });

  } catch (error) {
    console.error('Get collaboration requests API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}