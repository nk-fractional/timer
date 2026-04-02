import { put, list } from '@vercel/blob';

const BLOB_NAME = 'tracker-data.json';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (!blobs.length) {
      return res.status(200).json({ entries: [], clients: {}, priorities: {} });
    }
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    await put(BLOB_NAME, JSON.stringify(req.body), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
