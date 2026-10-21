import { getDatabase, saveDatabase, setCorsAndJsonHeaders, defaultDb } from '../_db';

export default async function handler(req: any, res: any) {
  setCorsAndJsonHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // GET: Fetch all inventory data
  if (req.method === 'GET') {
    try {
      const db = await getDatabase();
      res.statusCode = 200;
      res.end(JSON.stringify({
        assets: db.assets || [],
        loans: db.loans || [],
        tasks: db.tasks || [],
        logs: db.logs || [],
        settings: db.settings || defaultDb.settings
      }));
    } catch (err: any) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Gagal mengambil data dari server: ' + err.message }));
    }
    return;
  }

  // POST: Atomic persistence of inventory state
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { assets, loans, tasks, logs, settings } = body || {};
      const db = await getDatabase();

      if (Array.isArray(assets)) db.assets = assets;
      if (Array.isArray(loans)) db.loans = loans;
      if (Array.isArray(tasks)) db.tasks = tasks;
      if (Array.isArray(logs)) db.logs = logs;
      if (settings && typeof settings === 'object') {
        db.settings = { ...db.settings, ...settings };
      }

      await saveDatabase(db);

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        message: 'Data inventaris berhasil disimpan di server.',
        savedAt: new Date().toISOString(),
        counts: {
          assets: db.assets.length,
          loans: db.loans.length,
          tasks: db.tasks.length,
          logs: db.logs.length
        }
      }));
    } catch (err: any) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Gagal menyimpan data ke server: ' + err.message }));
    }
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
