// Cloudflare Function for individual season operations
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
  params: {
    id: string;
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
    const { id } = context.params;
    
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    const season = await db.prepare('SELECT * FROM seasons WHERE id = ?').bind(id).first();
    
    if (!season) {
      return new Response(JSON.stringify({ error: 'Season not found' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404
      });
    }
    
    return new Response(JSON.stringify(season), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error fetching season:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch season' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
}

export async function onRequestPut(context: CloudflareContext) {
  try {
    const db = context.env.DB;
    const { id } = context.params;
    
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    const request = context.request as Request;
    const updates: Partial<Season> = await request.json();
    
    const result = await db.prepare(`
      UPDATE seasons SET 
        name = COALESCE(?, name),
        game = COALESCE(?, game),
        sports_type = COALESCE(?, sports_type),
        sport = COALESCE(?, sport),
        number_of_players = COALESCE(?, number_of_players),
        number_of_games = COALESCE(?, number_of_games),
        can_reschedule = COALESCE(?, can_reschedule),
        day_span_per_game = COALESCE(?, day_span_per_game),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status)
      WHERE id = ?
    `).bind(
      updates.name || null,
      updates.game || null,
      updates.sportsType || null,
      updates.sport || null,
      updates.numberOfPlayers || null,
      updates.numberOfGames || null,
      updates.canReschedule ? 1 : 0,
      updates.daySpanPerGame || null,
      updates.startDate || null,
      updates.endDate || null,
      updates.status || null,
      id
    ).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Season not found' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404
      });
    }

    const updatedSeason = await db.prepare('SELECT * FROM seasons WHERE id = ?').bind(id).first();
    
    return new Response(JSON.stringify(updatedSeason), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error updating season:', error);
    return new Response(JSON.stringify({ error: 'Failed to update season' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
}

export async function onRequestDelete(context: CloudflareContext) {
  try {
    const db = context.env.DB;
    const { id } = context.params;
    
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    const result = await db.prepare('DELETE FROM seasons WHERE id = ?').bind(id).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Season not found' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error deleting season:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete season' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
}
