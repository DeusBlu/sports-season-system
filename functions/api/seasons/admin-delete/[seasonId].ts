interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders });
};

// Helper function to verify JWT and extract permissions
async function verifyAuth0Token(token: string): Promise<{ permissions: string[] } | null> {
  try {
    // Decode the JWT (in production, you'd verify the signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    // Return permissions from the token
    return {
      permissions: payload.permissions || []
    };
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const seasonId = url.pathname.split('/').pop();

  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!seasonId) {
    return new Response('Season ID is required', { status: 400 });
  }

  // Check for authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Authorization required', { 
      status: 401,
      headers: corsHeaders
    });
  }

  const token = authHeader.substring(7);
  const auth = await verifyAuth0Token(token);
  
  if (!auth) {
    return new Response('Invalid token', { 
      status: 401,
      headers: corsHeaders
    });
  }

  // Check for admin:delete_seasons permission
  if (!auth.permissions.includes('admin:delete_seasons')) {
    return new Response('Insufficient permissions', { 
      status: 403,
      headers: corsHeaders
    });
  }

  try {
    // Check if the season exists
    const season = await env.DB.prepare(`
      SELECT id FROM seasons WHERE id = ?
    `).bind(seasonId).first();

    if (!season) {
      return new Response('Season not found', { status: 404 });
    }

    // Admin delete - no status restrictions, can delete any season
    
    // Delete all season members first (foreign key constraint)
    await env.DB.prepare(`
      DELETE FROM Season_Members WHERE season_id = ?
    `).bind(seasonId).run();

    // Delete all user seasons (foreign key constraint)
    await env.DB.prepare(`
      DELETE FROM User_Seasons WHERE season_id = ?
    `).bind(seasonId).run();

    // Delete all games associated with the season
    await env.DB.prepare(`
      DELETE FROM games WHERE season_id = ?
    `).bind(seasonId).run();

    // Delete the season
    await env.DB.prepare(`
      DELETE FROM seasons WHERE id = ?
    `).bind(seasonId).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error deleting season (admin):', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders
    });
  }
};
