/**
 * File: src/shared/utils/app.helpers.ts
 * Purpose: Reusable bootstrap helpers used by main.ts.
 */
import { createConnection } from 'net';

/**
 * Resolves a Vite dev port from either a full URL (e.g. "http://localhost:5173")
 * or a plain port string (e.g. "5173"). Falls back to `fallback` if parsing fails.
 */
export function resolvePort(urlOrPort: string, fallback: number): number {
   if (urlOrPort.includes('://')) {
      return parseInt(new URL(urlOrPort).port || String(fallback), 10);
   }
   return parseInt(urlOrPort, 10) || fallback;
}

/**
 * Returns `true` if a process is already listening on the given port.
 * Used to avoid spawning a duplicate Vite dev server on watch-mode restarts.
 */
export function isPortListening(port: number): Promise<boolean> {
   return new Promise((resolve) => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
         socket.destroy();
         resolve(true);
      });
      socket.once('error', () => resolve(false));
   });
}
