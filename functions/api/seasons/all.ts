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

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Query ALL seasons regardless of owner (for admin use)
    const { results } = await env.DB.prepare(`
      SELECT * FROM seasons 
      ORDER BY created_at DESC
    `).all();

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
    console.error('Error fetching all seasons:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
