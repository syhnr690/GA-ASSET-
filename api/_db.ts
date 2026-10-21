import fs from 'fs';
import path from 'path';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  password: string;
  role: string;
  email?: string;
  createdAt: string;
}

export interface DatabaseSchema {
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

export const defaultDb: DatabaseSchema = {
  users: [
    {
      id: 'usr-admin-1',
      username: 'admin',
      name: 'Administrator GA',
      password: 'admin',
      role: 'Super Admin General Affairs',
      createdAt: '2026-10-19T23:50:00.000Z'
    },
    {
      id: 'usr-admin-2',
      username: 'syahnur',
      name: 'S. Syahnur',
      password: 'password123',
      role: 'Koordinator General Affairs',
      createdAt: '2026-10-19T23:50:00.000Z'
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

// Check if Vercel KV / Upstash Redis REST is available in environment
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const isKvConfigured = Boolean(kvUrl && kvToken);

// Local / serverless disk fallback
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export async function getDatabase(): Promise<DatabaseSchema> {
  // 1. Try Vercel KV / Upstash Redis
  if (isKvConfigured && kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/ga_inventory_db`, {
        headers: {
          Authorization: `Bearer ${kvToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          return {
            users: Array.isArray(parsed.users) ? parsed.users : defaultDb.users,
            assets: Array.isArray(parsed.assets) ? parsed.assets : [],
            loans: Array.isArray(parsed.loans) ? parsed.loans : [],
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
            logs: Array.isArray(parsed.logs) ? parsed.logs : [],
            settings: parsed.settings || defaultDb.settings
          };
        }
      }
    } catch (kvErr) {
      console.warn('Vercel KV fetch failed, falling back to disk cache:', kvErr);
    }
  }

  // 2. Fallback to filesystem (/tmp on Vercel, ./data locally)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // On Vercel, copy bundled seed db.json to /tmp if not yet present
    if (isVercel && !fs.existsSync(DB_FILE)) {
      const bundledPath = path.resolve(process.cwd(), 'data', 'db.json');
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, DB_FILE);
        } catch {}
      }
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : defaultDb.users,
        assets: Array.isArray(parsed.assets) ? parsed.assets : [],
        loans: Array.isArray(parsed.loans) ? parsed.loans : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        settings: parsed.settings || defaultDb.settings
      };
    }
  } catch (err) {
    console.error('Error reading filesystem DB:', err);
  }

  return defaultDb;
}

export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  // 1. Try Vercel KV / Upstash Redis
  if (isKvConfigured && kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/ga_inventory_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`
        },
        body: JSON.stringify(data)
      });
    } catch (kvErr) {
      console.warn('Failed saving to Vercel KV:', kvErr);
    }
  }

  // 2. Also save to filesystem (/tmp or ./data) for immediate local read consistency
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn('Filesystem write warning:', err);
  }
}

export function setCorsAndJsonHeaders(res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}
