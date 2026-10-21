import { getDatabase, isKvConfigured, setCorsAndJsonHeaders } from './_db';

export default async function handler(req: any, res: any) {
  setCorsAndJsonHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  try {
    const db = await getDatabase();
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'ok',
      platform: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
      storageType: isKvConfigured ? 'Vercel KV / Upstash Redis' : 'Serverless Filesystem Cache (/tmp)',
      isKvConnected: isKvConfigured,
      serverTime: new Date().toISOString(),
      assetsCount: db.assets.length,
      usersCount: db.users.length
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Health check error' }));
  }
}
