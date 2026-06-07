import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom Vite plugin to handle CSES solved data syncing via local backend proxy
const csesSyncPlugin = () => ({
  name: 'cses-sync-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Intercept local API request
      if (req.url.startsWith('/api/cses-sync')) {
        res.setHeader('Content-Type', 'application/json');
        
        try {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const phpSessId = urlObj.searchParams.get('cookie');
          
          if (!phpSessId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'PHPSESSID session cookie is required.' }));
            return;
          }

          // Fetch the problemset page from CSES using the session cookie
          const response = await fetch('https://cses.fi/problemset/', {
            headers: {
              'Cookie': `PHPSESSID=${phpSessId}`,
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: `CSES server responded with status: ${response.status}` }));
            return;
          }

          const html = await response.text();

          // Check if session cookie is valid
          // Logged in pages on CSES contain a logout link, whereas guests see a login link
          const isLoggedIn = html.includes('logout') || !html.includes('href="/login"');
          
          if (!isLoggedIn) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Invalid or expired session cookie. Please log in to CSES and copy a fresh PHPSESSID cookie.' }));
            return;
          }

          // Extract solved problem IDs from HTML
          const solvedIds = [];
          const parts = html.split('<li class="task">');
          for (let i = 1; i < parts.length; i++) {
            const taskHtml = parts[i];
            // If task is solved, task-score icon will contain class "full"
            if (taskHtml.includes('task-score') && taskHtml.includes('full')) {
              const hrefMatch = taskHtml.match(/href="\/problemset\/task\/(\d+)"/);
              if (hrefMatch) {
                solvedIds.push(hrefMatch[1]);
              }
            }
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ solvedIds }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: `Internal Server Error: ${err.message}` }));
        }
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), csesSyncPlugin()],
})
