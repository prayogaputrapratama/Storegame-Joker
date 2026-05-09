export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { data } = req.body;

  console.log('Webhook Digiflazz:', data);

  // Nanti di sini kita update status transaksi ke Supabase

  res.status(200).json({ success: true });
}
