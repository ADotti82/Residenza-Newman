export const config = { runtime: 'edge' };

export default async function handler(request) {
  // Gestione preflight CORS (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Leggi il target dalla query string
  const url = new URL(request.url);
  const target = url.searchParams.get('target');

  if (!target) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Parametro "target" mancante' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Sicurezza: consenti solo script.google.com
  try {
    const targetUrl = new URL(target);
    if (!targetUrl.hostname.endsWith('script.google.com')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Target non autorizzato. Solo script.google.com è permesso.' 
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'URL target non valido' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Inoltra la richiesta al backend GAS
  try {
    const init = {
      method: request.method,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      redirect: 'follow'
    };

    if (request.method === 'POST') {
      init.body = await request.text();
    }

    const gasResponse = await fetch(target, init);
    const responseText = await gasResponse.text();

    return new Response(responseText, {
      status: gasResponse.status,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Errore proxy: ' + err.message 
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}