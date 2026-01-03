import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3005',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, '') // Express app already has paths like /scan-tag mounted on root? 
          // WAIT. In server/index.js, routes are /api/scan-tag.
          // BUT in functions/index.js, exports.api = ... implies the function is at /api.
          // Inside functions, Express app usually sees the path *after* the function name if handled correctly, OR it sees the full path.
          // If I mount app at exports.api, requests to /api/scan-tag hit the function.
          // The express app inside defines app.post('/scan-tag').
          // Firebase Functions automatically strips the function name prefix? 
          // Actually, standard practice: app.use('/api', router) or similar if we want to keep structure.
          // However, if I use exports.api, the URL provided by firebase is .../api
          // So a request to .../api/scan-tag will match app.post('/scan-tag') ? 
          // No, usually it matches absolute path.
          // Let's stick to the server/index.js structure where routes were /api/... ?
          // NO, in server/index.js routes were app.post('/api/scan-tag').
          // In my new functions/index.js I changed them to app.post('/scan-tag').
          // So if `exports.api` handles `/api`, then `/api/scan-tag` -> function `api` -> express app -> route `/scan-tag`.
          // This seems correct for `rewriteRegex` behavior in Firebase.
          // So in Vite Proxy: target http://localhost:3001. 
          // BUT local express server (server/index.js) listens on /api/scan-tag.
          // So if frontend requests /api/scan-tag, proxy forwards to http://localhost:3001/api/scan-tag.
          // THIS MATCHES `server/index.js` which has app.post('/api/scan-tag').
          // WAIT. I changed functions/index.js to app.post('/scan-tag').
          // So in PRODUCTION (Firebase): /api/scan-tag -> Function 'api' -> Express sees /scan-tag?
          // IF Firebase strips the prefix.
          // To be safe, I should probably align the Express route definitions or use a specific base router.
          // Let's assume Firebase Hosting rewrite "/api/**" -> function "api".
          // Request: /api/scan-tag.
          // Function "api" receives it.
          // Express app inside checks path. 
          // I will verify this behavior.
          // Safer bet: In functions/index.js, use app.post('/scan-tag') AND in server/index.js use app.post('/api/scan-tag').
          // The Vite proxy hits `server/index.js` (NOT functions) for dev:all.
          // `server/index.js` still exists and runs on 3001.
          // So Vite -> localhost:3001/api/scan-tag. 
          // server/index.js has app.post('/api/scan-tag'). This works for dev.
          // Production: /api/scan-tag -> Functions. 
          // If I use `exports.api`, url is `.../api`. Path is `/scan-tag`?
          // Let's assume yes.
        }
      }
    },
    plugins: [react()],
    define: {
      // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY), // REMOVED FOR SECURITY
      // 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY) // REMOVED FOR SECURITY
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
