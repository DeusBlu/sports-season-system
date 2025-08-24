interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { env: Env }) {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { DB } = context.env;
    
    // Get all games from the database
    const gamesResult = await DB.prepare(`
      SELECT 
        id,
        season_id,
        title,
        start_datetime,
        end_datetime,
        is_my_game,
        opponent,
        game_type,
        is_home,
        player_id
      FROM games 
      ORDER BY start_datetime ASC
    `).all();

    // Transform the data to match frontend expectations
    const games = gamesResult.results.map(game => ({
      id: game.id,
      seasonId: game.season_id,
      title: game.title,
      start: game.start_datetime,
      end: game.end_datetime,
      isMyGame: Boolean(game.is_my_game),
      opponent: game.opponent,
      gameType: game.game_type,
      isHome: Boolean(game.is_home),
      playerId: game.player_id
    }));

    return new Response(JSON.stringify(games), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch games' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export async function onRequestPost(context: { env: Env, request: Request }) {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { DB } = context.env;
    const gameData = await context.request.json();
    
    // Generate a UUID for the new game
    const gameId = crypto.randomUUID();
    
    // Insert new game into database
    const insertResult = await DB.prepare(`
      INSERT INTO games (
        id, season_id, title, start_datetime, end_datetime,
        is_my_game, opponent, game_type, is_home, player_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gameId,
      gameData.seasonId,
      gameData.title,
      gameData.start,
      gameData.end,
      gameData.isMyGame ? 1 : 0,
      gameData.opponent,
      gameData.gameType,
      gameData.isHome ? 1 : 0,
      gameData.playerId
    ).run();

    if (insertResult.success) {
      return new Response(JSON.stringify({ 
        id: gameId,
        message: 'Game created successfully' 
      }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else {
      throw new Error('Failed to create game');
    }
  } catch (error) {
    console.error('Error creating game:', error);
    return new Response(JSON.stringify({ error: 'Failed to create game' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
