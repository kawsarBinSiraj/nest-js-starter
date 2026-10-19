/**
 * File: src/shared/utils/client.helper.ts
 * Purpose: Decides how the React client is served — the single place for
 *          the dev vs production client logic. Called once from main.ts.
 *
 *   Development → spawn Vite and proxy page requests to it (hot reload).
 *   Production  → serve the pre-built files from dist/public (`npm run build`).
 */
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { startViteDevServer } from './vite-dev.helper.js';
import { isServerPath } from './app.helpers.js';

export async function setupClient(
   app: NestFastifyApplication,
   config: ConfigService,
   isProduction: boolean,
): Promise<void> {
   if (isProduction) {
      const distPath = join(process.cwd(), config.get<string>('client.distPath', 'dist/public'));
      await serveClientBuild(app, distPath);
   } else {
      const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:5173');
      await startViteDevServer(app, clientUrl);
   }
}

/**
 * Serves the built SPA: real files (JS, CSS, images) are served as-is, and
 * every other page URL (e.g. /dashboard) gets index.html so React Router
 * can handle it in the browser.
 */
async function serveClientBuild(app: NestFastifyApplication, distPath: string): Promise<void> {
   await app.useStaticAssets({
      root: distPath,
      setHeaders: (res, filePath) => {
         /* index.html must never be cached, so new deploys are picked up immediately. */
         if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
         }
      },
   });

   const fastify = app.getHttpAdapter().getInstance();
   fastify.addHook('onRequest', async (request: any, reply: any) => {
      const url = (request.url as string).split('?')[0];
      const lastSegment = url.split('/').pop() ?? '';
      const isPageRequest = request.method === 'GET' && !isServerPath(url) && !lastSegment.includes('.');

      if (isPageRequest) {
         reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
         return reply.sendFile('index.html', distPath);
      }
   });
}
