export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { data } = req.body;

  console.log('Webhook Digiflazz:', data);

  res.status(200).json({ success: true });
}
