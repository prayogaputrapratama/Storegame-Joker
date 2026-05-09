export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const crypto = await import('crypto');

  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  const { buyer_sku_code, customer_no } = req.body;
  const ref_id = Date.now().toString();

  const sign = crypto.default
    .createHash('md5')
    .update(username + apiKey + ref_id)
    .digest('hex');

  const response = await fetch('https://api.digiflazz.com/v1/transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      buyer_sku_code,
      customer_no,
      ref_id,
      sign,
      cmd: 'prepaid',
      testing: true,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
