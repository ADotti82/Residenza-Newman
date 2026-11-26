import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, type Plugin } from 'vite';

function createGasProxyMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const reqUrl = req.url || '';
    if (!reqUrl.startsWith('/api/proxy')) {
      next();
      return;
    }

    const setCorsHeaders = () => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'no-store');
    };

    if (req.method === 'OPTIONS') {
      setCorsHeaders();
      res.statusCode = 204;
      res.end();
      return;
    }

    const parsed = new URL(reqUrl, 'http://localhost');
    const target = parsed.searchParams.get('target');

    if (!target) {
      setCorsHeaders();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'Parametro "target" mancante' }));
      return;
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(target);
      if (targetUrl.protocol !== 'https:' || targetUrl.hostname !== 'script.google.com') {
        setCorsHeaders();
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.end(JSON.stringify({ success: false, error: 'Target non autorizzato. Solo script.google.com è permesso.' }));
        return;
      }
    } catch {
      setCorsHeaders();
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'URL target non valido' }));
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      let bodyText = '';
      if (req.method === 'POST') {
        bodyText = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          req.on('error', reject);
        });
      }

      const gasResponse = await fetch(targetUrl.toString(), {
        method: req.method || 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: req.method === 'POST' ? bodyText : undefined,
        redirect: 'follow',
        signal: controller.signal,
      });

      const responseText = await gasResponse.text();
      setCorsHeaders();
      res.statusCode = gasResponse.status;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      res.end(responseText);
    } catch (err: unknown) {
      setCorsHeaders();
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      const msg = err instanceof Error ? err.message : String(err);
      res.end(JSON.stringify({ success: false, error: 'Errore proxy locale: ' + msg }));
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

function gasProxyPlugin(): Plugin {
  const middleware = createGasProxyMiddleware();
  return {
    name: 'newman-gas-api-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [gasProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: true,
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          slides: path.resolve(__dirname, 'slides.html'),
          manutenzioni: path.resolve(__dirname, 'manutenzioni.html'),
        },
      },
    },
  };
});
