interface Env {
  DB: D1Database;
}

interface JoinRequest {
  seasonId: string;
  userId: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json() as JoinRequest;
    const { seasonId, userId } = body;

    if (!seasonId || !userId) {
      return new Response('Season ID and User ID are required', { status: 400 });
    }

    // Check if the season exists
    const season = await env.DB.prepare(`
      SELECT id FROM seasons WHERE id = ?
    `).bind(seasonId).first();

    if (!season) {
      return new Response('Season not found', { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await env.DB.prepare(`
      SELECT id FROM Season_Members WHERE season_id = ? AND user_id = ?
    `).bind(seasonId, userId).first();

    if (existingMember) {
      return new Response('User is already a member of this season', { status: 409 });
    }

    // Add user as a member
    await env.DB.prepare(`
      INSERT INTO Season_Members (season_id, user_id, joined_at, status)
      VALUES (?, ?, datetime('now'), 'active')
    `).bind(seasonId, userId).run();

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
