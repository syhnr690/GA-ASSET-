import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & JSON content-type protection
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Data storage path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface UserAccount {
  id: string;
  username: string;
  name: string;
  password: string; // Plain/simple hashed for lightweight deployment
  role: string;
  email?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserAccount[];
  assets: any[];
  loans: any[];
  tasks: any[];
  logs: any[];
  settings: {
    companyName: string;
    officeLocation: string;
    gaDivisionName: string;
    contactEmail: string;
    contactPhone: string;
    currency: string;
  };
}

// Initial Clean Database for Real Work (Zero dummy assets)
const defaultDb: DatabaseSchema = {
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
  assets: [], // Clean slate for real work
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

function ensureDbExists(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, recreating clean db:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function saveDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Initialize DB on startup
ensureDbExists();

// ================= API ROUTES =================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const db = ensureDbExists();
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    assetsCount: db.assets.length,
    usersCount: db.users.length
  });
});

// Authentication: Login (Username & Password)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const username = (req.body.username || req.body.email || '').trim().toLowerCase();
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).json({ error: 'Username dan password wajib diisi.' });
    return;
  }

  const db = ensureDbExists();
  const user = db.users.find(
    u => (u.username?.toLowerCase() === username || u.email?.toLowerCase() === username) && u.password === password
  );

  if (!user) {
    res.status(401).json({ error: 'Username atau password salah.' });
    return;
  }

  // Generate lightweight session token
  const token = `ga-token-${user.id}-${Date.now()}`;
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
});

// Authentication: Register (Username, Password, Name, Role)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name) {
    res.status(400).json({ error: 'Username, password, dan nama wajib diisi.' });
    return;
  }

  const db = ensureDbExists();
  const normalizedUser = username.trim().toLowerCase();
  const existing = db.users.find(
    u => u.username?.toLowerCase() === normalizedUser || (u.email && u.email.toLowerCase() === normalizedUser)
  );

  if (existing) {
    res.status(409).json({ error: 'Username ini sudah terdaftar. Silakan gunakan username lain atau langsung masuk.' });
    return;
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    username: username.trim(),
    name: name.trim(),
    password: password.trim(),
    role: role?.trim() || 'General Affairs Officer',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  const token = `ga-token-${newUser.id}-${Date.now()}`;
  res.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    }
  });
});

// GET all inventory data from server
app.get('/api/data', (_req: Request, res: Response) => {
  const db = ensureDbExists();
  res.json({
    assets: db.assets || [],
    loans: db.loans || [],
    tasks: db.tasks || [],
    logs: db.logs || [],
    settings: db.settings || defaultDb.settings
  });
});

// POST save all inventory data to server (atomic persistence)
app.post('/api/data', (req: Request, res: Response) => {
  try {
    const { assets, loans, tasks, logs, settings } = req.body;
    const db = ensureDbExists();

    if (Array.isArray(assets)) db.assets = assets;
    if (Array.isArray(loans)) db.loans = loans;
    if (Array.isArray(tasks)) db.tasks = tasks;
    if (Array.isArray(logs)) db.logs = logs;
    if (settings && typeof settings === 'object') {
      db.settings = { ...db.settings, ...settings };
    }

    saveDb(db);
    res.json({
      success: true,
      message: 'Data inventaris berhasil disimpan di server.',
      savedAt: new Date().toISOString(),
      counts: {
        assets: db.assets.length,
        loans: db.loans.length,
        tasks: db.tasks.length,
        logs: db.logs.length
      }
    });
  } catch (err: any) {
    console.error('Failed to save data to server:', err);
    res.status(500).json({ error: 'Gagal menyimpan data ke server: ' + err.message });
  }
});

// POST reset data to clean state
app.post('/api/data/reset', (req: Request, res: Response) => {
  try {
    const db = ensureDbExists();
    db.assets = [];
    db.loans = [];
    db.tasks = [];
    db.logs = [];
    if (req.body.settings) {
      db.settings = req.body.settings;
    }
    saveDb(db);
    res.json({
      success: true,
      message: 'Semua data contoh telah dibersihkan. Aplikasi siap untuk data pekerjaan riil.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mereset data: ' + err.message });
  }
});

// Explicit 404 for any unmatched /api routes so they NEVER fall through to HTML or Vite SPA
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Endpoint API tidak ditemukan: ${req.method} ${req.path}` });
});

// Global API error handler returning clean JSON
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Terjadi kesalahan pada server.' });
});

// ================= STATIC / VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GA Inventory server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
