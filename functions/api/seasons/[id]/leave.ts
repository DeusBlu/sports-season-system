interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const seasonId = url.pathname.split('/')[3]; // /api/seasons/{seasonId}/leave

  if (!seasonId) {
    return new Response('Season ID is required', { status: 400 });
  }

  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    // Remove user from members
    const result = await env.DB.prepare(`
      DELETE FROM Season_Members 
      WHERE season_id = ? AND user_id = ?
    `).bind(seasonId, userId).run();

    if (result.changes === 0) {
      return new Response('User is not a member of this season', { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error leaving season:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
