interface Env {
  DB: D1Database;
}

interface DatabaseRow {
  id: string;
  name: string;
  game: string | null;
  sports_type: string | null;
  sport: string | null;
  number_of_players: number | null;
  number_of_games: number | null;
  can_reschedule: number;
  day_span_per_game: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  owner_id: string;
  status: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const rawUserId = url.pathname.split('/').pop();
  const userId = rawUserId ? decodeURIComponent(rawUserId) : null;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!userId) {
    return new Response('User ID is required', { status: 400 });
  }

  try {
    // Query seasons where the user is a member (through Season_Members table)
    const { results } = await env.DB.prepare(`
      SELECT s.* FROM seasons s
      INNER JOIN Season_Members sm ON s.id = sm.season_id
      WHERE sm.user_id = ? AND sm.status = 'active'
      ORDER BY s.created_at DESC
    `).bind(userId).all();

    // Convert database results to Season objects
    const seasons = (results as DatabaseRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      game: row.game,
      sportsType: row.sports_type,
      sport: row.sport,
      numberOfPlayers: row.number_of_players,
      numberOfGames: row.number_of_games,
      canReschedule: row.can_reschedule === 1,
      daySpanPerGame: row.day_span_per_game,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      ownerId: row.owner_id,
      status: row.status
    }));

    return new Response(JSON.stringify(seasons), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error fetching member seasons:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
