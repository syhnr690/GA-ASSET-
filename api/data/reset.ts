import { getDatabase, saveDatabase, setCorsAndJsonHeaders } from '../_db';

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

    const db = await getDatabase();
    db.assets = [];
    db.loans = [];
    db.tasks = [];
    db.logs = [];

    if (body?.settings && typeof body.settings === 'object') {
      db.settings = body.settings;
    }

    await saveDatabase(db);

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'Semua data contoh telah dibersihkan. Aplikasi siap untuk data pekerjaan riil.'
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Gagal mereset data: ' + err.message }));
  }
}
