import { put, list, del } from '@vercel/blob';

const BLOB_NAME = 'tracker-data.json';
const BLOB_PREFIX = 'tracker-data';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    console.log('GET: found blobs:', blobs.map(b => ({ url: b.url, size: b.size, uploadedAt: b.uploadedAt })));
    if (!blobs.length) {
      return res.status(200).json({ entries: [], clients: {}, priorities: {} });
    }
    // Always use the most recently uploaded blob
    blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    console.log('GET: entries count:', data.entries?.length);
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('POST: entries count:', body.entries?.length);

    // Delete all existing blobs with this name before writing
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length) {
      await del(blobs.map(b => b.url));
      console.log('POST: deleted', blobs.length, 'old blob(s)');
    }

    await put(BLOB_NAME, JSON.stringify(body), {
      access: 'public',
      contentType: 'application/json',
    });
    console.log('POST: saved successfully');
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
