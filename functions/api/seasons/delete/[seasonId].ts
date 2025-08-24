interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders });
};

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

  try {
    // Check if the season exists
    const season = await env.DB.prepare(`
      SELECT id FROM seasons WHERE id = ?
    `).bind(seasonId).first();

    if (!season) {
      return new Response('Season not found', { status: 404 });
    }

    // Delete all season members first (foreign key constraint)
    await env.DB.prepare(`
      DELETE FROM Season_Members WHERE season_id = ?
    `).bind(seasonId).run();

    // Delete all user seasons (foreign key constraint)
    await env.DB.prepare(`
      DELETE FROM User_Seasons WHERE season_id = ?
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
    console.error('Error deleting season:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
