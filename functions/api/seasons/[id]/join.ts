interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const seasonId = url.pathname.split('/')[3]; // /api/seasons/{seasonId}/join

  if (!seasonId) {
    return new Response('Season ID is required', { status: 400 });
  }

  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    // Check if season exists
    const { results: seasons } = await env.DB.prepare(`
      SELECT id FROM seasons WHERE id = ?
    `).bind(seasonId).all();

    if (seasons.length === 0) {
      return new Response('Season not found', { status: 404 });
    }

    // Check if user is already a member
    const { results: existingMembers } = await env.DB.prepare(`
      SELECT id FROM Season_Members 
      WHERE season_id = ? AND user_id = ?
    `).bind(seasonId, userId).all();

    if (existingMembers.length > 0) {
      return new Response('User is already a member of this season', { status: 409 });
    }

    // Add user as member
    await env.DB.prepare(`
      INSERT INTO Season_Members (season_id, user_id, joined_at, status)
      VALUES (?, ?, ?, 'active')
    `).bind(seasonId, userId, new Date().toISOString()).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error joining season:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
