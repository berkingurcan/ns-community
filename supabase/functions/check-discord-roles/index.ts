// @ts-nocheck
// This file runs in Deno runtime, not Node.js. TypeScript errors are expected in VS Code.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function handles CORS preflight requests.
// It's a standard requirement for web applications making cross-origin API calls.
function handleCors() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

// Main function to check Discord roles.
async function checkRoles(req: Request) {
  console.log("=== Discord Role Check Started ===");
  
  // Create a Supabase client with the user's authorization.
  // This allows us to securely access the user's session and provider token.
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  // Get the user's session from the Supabase client.
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError) {
    console.error("Session error:", sessionError);
    throw sessionError;
  }
  if (!session) {
    console.error("No session found");
    throw new Error("User not authenticated. Please log in.");
  }
  
  console.log("Session found, user ID:", session.user?.id);

  // Retrieve the provider token from the session. This token is essential for making
  // requests to the Discord API on behalf of the user.
  const providerToken = session.provider_token;
  if (!providerToken) {
    console.error("Provider token missing. Session:", JSON.stringify(session, null, 2));
    throw new Error("Discord provider token not found. Please log out and log in again to refresh your Discord permissions.");
  }

  // Get the Discord server (Guild) ID and the required role IDs from the environment variables.
  // These are set as secrets in the Supabase project.
  const guildId = Deno.env.get("DISCORD_GUILD_ID");
  console.log("Guild ID:", guildId);
  if (!guildId) throw new Error("Discord Guild ID is not configured in secrets.");
  
  const requiredRoleIds = (Deno.env.get("DISCORD_REQUIRED_ROLE_IDS") || "").split(',');
  console.log("Required Role IDs:", requiredRoleIds);
  if (requiredRoleIds.length === 0 || requiredRoleIds[0] === '') {
    throw new Error("Required Discord Role IDs are not configured in secrets.");
  }

  // Use the provider token to fetch the user's member information for the specified guild.
  // The '@me' endpoint is a shortcut for the currently authenticated user.
  const discordApiUrl = `https://discord.com/api/v10/guilds/${guildId}/members/@me`;
  const response = await fetch(discordApiUrl, {
    headers: {
      Authorization: `Bearer ${providerToken}`,
    },
  });

  // If the user is not a member of the server, Discord API returns a 404.
  // This is not an error; it simply means they don't have the roles.
  if (response.status === 404) {
    return { hasRequiredRole: false, userRoles: [] };
  }
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Discord API Error: ${response.status} ${errorBody}`);
    console.error(`Guild ID: ${guildId}, Provider Token exists: ${!!providerToken}`);
    throw new Error(`Discord API error (${response.status}): ${errorBody}`);
  }

  const memberData = await response.json();
  const userRoles = memberData.roles || [];

  // Check if the user's roles include any of the required roles.
  const hasRequiredRole = requiredRoleIds.some((requiredId: string) => userRoles.includes(requiredId.trim()));

  return { hasRequiredRole, userRoles };
}

// Serve the function, handling CORS and responding with JSON.
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const data = await checkRoles(req);
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      status: 400,
    });
  }
});
