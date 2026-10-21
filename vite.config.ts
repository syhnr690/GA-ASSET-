import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

// Built-in API middleware so Vite directly answers /api requests with JSON
function gaApiPlugin(): Plugin {
  const DATA_DIR = path.resolve(__dirname, 'data');
  const DB_FILE = path.join(DATA_DIR, 'db.json');

  const defaultDb = {
    users: [
      {
        id: 'usr-admin-1',
        username: 'admin',
        name: 'Administrator GA',
        password: 'admin',
        role: 'Super Admin General Affairs',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-admin-2',
        username: 'syahnur',
        name: 'S. Syahnur',
        password: 'password123',
        role: 'Koordinator General Affairs',
        createdAt: new Date().toISOString()
      }
    ],
    assets: [],
    loans: [],
    tasks: [],
    logs: [],
    settings: {
      companyName: 'PT Operasional Saya',
      officeLocation: 'Kantor Pusat',
      gaDivisionName: 'General Affairs & Facility Management',
      contactEmail: 's.syahnur1@gmail.com',
      contactPhone: '-',
      currency: 'IDR'
    }
  };

  const getDb = () => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      return defaultDb;
    }
  };

  const saveDb = (data: any) => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  };

  return {
    name: 'ga-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];

        if (!url.startsWith('/api/')) {
          return next();
        }

        // Common response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        }

        if (url === '/api/health' && req.method === 'GET') {
          const db = getDb();
          res.statusCode = 200;
          res.end(JSON.stringify({ status: 'ok', assetsCount: db.assets.length }));
          return;
        }

        if (url === '/api/data' && req.method === 'GET') {
          const db = getDb();
          res.statusCode = 200;
          res.end(JSON.stringify({
            assets: db.assets || [],
            loans: db.loans || [],
            tasks: db.tasks || [],
            logs: db.logs || [],
            settings: db.settings || defaultDb.settings
          }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          let parsed: any = {};
          try {
            parsed = body ? JSON.parse(body) : {};
          } catch {
            parsed = {};
          }

          if (url === '/api/auth/login' && req.method === 'POST') {
            const db = getDb();
            const username = (parsed.username || parsed.email || '').trim().toLowerCase();
            const password = parsed.password;

            const user = db.users.find(
              (u: any) =>
                (u.username?.toLowerCase() === username || u.email?.toLowerCase() === username) &&
                u.password === password
            );

            if (!user) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Username atau password salah.' }));
              return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              token: `ga-token-${user.id}-${Date.now()}`,
              user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email
              }
            }));
            return;
          }

          if (url === '/api/auth/register' && req.method === 'POST') {
            const db = getDb();
            const { username, password, name, role } = parsed;
            if (!username || !password || !name) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Username, password, dan nama wajib diisi.' }));
              return;
            }

            const normalized = username.trim().toLowerCase();
            if (db.users.some((u: any) => u.username?.toLowerCase() === normalized)) {
              res.statusCode = 409;
              res.end(JSON.stringify({ error: 'Username ini sudah terdaftar.' }));
              return;
            }

            const newUser = {
              id: `usr-${Date.now()}`,
              username: username.trim(),
              name: name.trim(),
              password: password.trim(),
              role: role?.trim() || 'General Affairs Officer',
              createdAt: new Date().toISOString()
            };
            db.users.push(newUser);
            saveDb(db);

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              token: `ga-token-${newUser.id}-${Date.now()}`,
              user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                role: newUser.role
              }
            }));
            return;
          }

          if (url === '/api/data' && req.method === 'POST') {
            const db = getDb();
            if (Array.isArray(parsed.assets)) db.assets = parsed.assets;
            if (Array.isArray(parsed.loans)) db.loans = parsed.loans;
            if (Array.isArray(parsed.tasks)) db.tasks = parsed.tasks;
            if (Array.isArray(parsed.logs)) db.logs = parsed.logs;
            if (parsed.settings && typeof parsed.settings === 'object') {
              db.settings = { ...db.settings, ...parsed.settings };
            }
            saveDb(db);

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              message: 'Data inventaris berhasil disimpan di server.',
              savedAt: new Date().toISOString()
            }));
            return;
          }

          if (url === '/api/data/reset' && req.method === 'POST') {
            const db = getDb();
            db.assets = [];
            db.loans = [];
            db.tasks = [];
            db.logs = [];
            if (parsed.settings) db.settings = parsed.settings;
            saveDb(db);

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              message: 'Semua data contoh telah dibersihkan.'
            }));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: `Endpoint API tidak ditemukan: ${req.method} ${url}` }));
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), gaApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
