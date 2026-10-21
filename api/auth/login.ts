import { getDatabase, setCorsAndJsonHeaders } from '../_db';

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

    const username = (body?.username || body?.email || '').trim().toLowerCase();
    const password = body?.password;

    if (!username || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Username dan password wajib diisi.' }));
      return;
    }

    const db = await getDatabase();
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
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Terjadi kesalahan pada server saat login: ' + err.message }));
  }
}
