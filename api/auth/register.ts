import { getDatabase, saveDatabase, setCorsAndJsonHeaders, UserAccount } from '../_db';

export default async function handler(req: any, res: any) {
  setCorsAndJsonHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { username, password, name, role } = body || {};
    if (!username || !password || !name) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Username, password, dan nama lengkap wajib diisi.' }));
      return;
    }

    const db = await getDatabase();
    const normalized = username.trim().toLowerCase();

    if (db.users.some((u: any) => u.username?.toLowerCase() === normalized)) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: 'Username ini sudah terdaftar. Silakan gunakan username lain atau login.' }));
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
    await saveDatabase(db);

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
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Gagal mendaftarkan akun baru: ' + err.message }));
  }
}
