function weekLabel(mondayStr) {
  const [y, mo, d] = mondayStr.split('-').map(Number);
  const mon = new Date(y, mo - 1, d);
  const sun = new Date(y, mo - 1, d + 6);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'SLACK_WEBHOOK_URL not set' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { week, priorities } = body;
  if (!week || !priorities) return res.status(400).json({ error: 'week and priorities required' });

  const slack = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `*Priorities for ${weekLabel(week)}*\n${priorities}` }),
  });

  if (!slack.ok) return res.status(502).json({ error: 'Slack webhook failed', status: slack.status });
  return res.status(200).json({ ok: true });
}
