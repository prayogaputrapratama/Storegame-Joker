import { updateTransaction } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { data } = req.body;

  if (!data) return res.status(400).json({ error: 'No data' });

  await updateTransaction({
    ref_id: data.ref_id,
    status: data.status,
    message: data.message,
    sn: data.sn || null,
  });

  res.status(200).json({ success: true });
}
