import { kv } from '@vercel/kv';

const KEY = 'tracker-data';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = await kv.get(KEY) ?? { entries: [], clients: {}, priorities: {} };
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    await kv.set(KEY, req.body);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
