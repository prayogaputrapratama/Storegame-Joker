export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userid, zoneid } = req.body;
  if (!userid || !zoneid) return res.status(400).json({ error: 'Missing fields' });

  const crypto = await import('crypto');
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  const sign = crypto.default
    .createHash('md5')
    .update(username + apiKey + 'inq-pasca')
    .digest('hex');

  try {
    const response = await fetch('https://api.digiflazz.com/v1/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: 'inq-pasca',
        username,
        buyer_sku_code: 'ml-inquiry',
        customer_no: userid + '(' + zoneid + ')',
        sign,
      }),
    });

    const data = await response.json();
    const nickname = data?.data?.buyer_last_saldo || data?.data?.desc || null;

    res.status(200).json({ nickname });
  } catch(e) {
    res.status(200).json({ nickname: null });
  }
}
