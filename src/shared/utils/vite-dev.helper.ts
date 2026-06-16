/**
 * File: src/shared/utils/vite-dev.helper.ts
 * Purpose: Spawns the Vite dev server and proxies non-API requests to it.
 *          Only called in development mode from main.ts.
 */
import { spawn } from 'child_process';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import replyFrom from '@fastify/reply-from';
import { resolvePort, isPortListening } from './app.helpers.js';

/**
 * Starts the Vite dev server if it is not already listening on the resolved
 * port, then registers a Fastify reverse-proxy hook that forwards all
 * non-API / non-health traffic to it.
 *
 * Safe to call on every watch-mode restart — if Vite is already up the
 * spawn step is skipped and only the proxy hook is (re-)registered.
 */
export async function startViteDevServer(app: NestFastifyApplication, clientUrl: string): Promise<void> {
   const clientPort = resolvePort(clientUrl, 5173);

   /* Spawn Vite only if it isn't already running (guards against watch-mode restarts). */
   const viteRunning = await isPortListening(clientPort);
   if (!viteRunning) {
      const vite = spawn('npx', ['vite', '--config', 'client/vite.config.ts'], {
         stdio: 'inherit',
         shell: process.platform === 'win32',
      });

      vite.on('error', (err) => console.error('[Vite] Failed to start:', err.message));

      const killVite = () => {
         try {
            vite.kill('SIGTERM');
         } catch {
            /** process already gone */
         }
      };

      process.once('exit', killVite);
      process.once('SIGINT', () => {
         killVite();
         process.exit(0);
      });
      process.once('SIGTERM', () => {
         killVite();
         process.exit(0);
      });

      console.log(`[Vite] Starting dev server on port ${clientPort}...`);
   }

   /** Proxy all non-API requests to the Vite dev server. */
   const fastify = app.getHttpAdapter().getInstance();
   await fastify.register(replyFrom, { base: clientUrl });
   fastify.addHook('onRequest', async (request: any, reply: any) => {
      const url = request.url as string;
      if (!url.startsWith('/api') && url !== '/health') {
         return reply.from(url, {
            onError: (_reply: any, _err: any) => {
               _reply.statusCode = 503;
               _reply.send({
                  success: false,
                  statusCode: 503,
                  message: 'Frontend is starting up — please refresh in a moment.',
               });
            },
         });
      }
   });
}
