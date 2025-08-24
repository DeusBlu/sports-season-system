interface Env {
  DB: D1Database;
}

interface LeaveRequest {
  seasonId: string;
  userId: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json() as LeaveRequest;
    const { seasonId, userId } = body;

    if (!seasonId || !userId) {
      return new Response('Season ID and User ID are required', { status: 400 });
    }

    // Check if user is a member
    const member = await env.DB.prepare(`
      SELECT id FROM Season_Members WHERE season_id = ? AND user_id = ? AND status = 'active'
    `).bind(seasonId, userId).first();

    if (!member) {
      return new Response('User is not a member of this season', { status: 404 });
    }

    // Remove user from season (set status to inactive instead of deleting)
    await env.DB.prepare(`
      UPDATE Season_Members SET status = 'inactive' WHERE season_id = ? AND user_id = ?
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
    console.error('Error leaving season:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
