// Cloudflare Function for seasons CRUD operations
// Uses Cloudflare D1 database

interface Season {
  id?: string;
  name: string;
  game?: string;
  sportsType?: string;
  sport?: string;
  numberOfPlayers?: number;
  numberOfGames?: number;
  canReschedule?: boolean;
  daySpanPerGame?: number;
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  status?: string;
  createdAt?: string;
}

interface CloudflareContext {
  env: {
    DB?: D1Database;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context: CloudflareContext) {
  try {
    const db = context.env.DB;
    
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    const { results } = await db.prepare('SELECT * FROM seasons ORDER BY created_at DESC').all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch seasons' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
}

export async function onRequestPost(context: CloudflareContext) {
  try {
    const db = context.env.DB;
    
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    const request = context.request as Request;
    const season: Season = await request.json();
    
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    await db.prepare(`
      INSERT INTO seasons (
        id, name, game, sports_type, sport, number_of_players, 
        number_of_games, can_reschedule, day_span_per_game, 
        start_date, end_date, owner_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      season.name,
      season.game || null,
      season.sportsType || null,
      season.sport || null,
      season.numberOfPlayers || null,
      season.numberOfGames || null,
      season.canReschedule ? 1 : 0,
      season.daySpanPerGame || null,
      season.startDate || null,
      season.endDate || null,
      season.ownerId || 'user-1',
      season.status || 'draft',
      createdAt
    ).run();

    const createdSeason = {
      id,
      ...season,
      ownerId: season.ownerId || 'user-1',
      status: season.status || 'draft',
      createdAt
    };

    return new Response(JSON.stringify(createdSeason), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 201
    });
  } catch (error) {
    console.error('Error creating season:', error);
    return new Response(JSON.stringify({ error: 'Failed to create season' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
}
