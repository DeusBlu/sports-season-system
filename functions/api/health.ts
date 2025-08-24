// Cloudflare Function for health check
// Uses Cloudflare D1 database

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

export async function onRequest(context: CloudflareContext) {
  try {
    const db = context.env.DB;
    
    if (!db) {
      return new Response(JSON.stringify({ 
        status: 'error',
        message: 'D1 database not configured'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500
      });
    }
    
    // Test D1 connection
    const result = await db.prepare('SELECT 1 as test').first();
    
    return new Response(JSON.stringify({ 
      status: 'connected',
      database: 'D1',
      test: result?.test
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      message: 'Database connection failed'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500
    });
  }
}
