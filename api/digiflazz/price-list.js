export default async function handler(req, res) {
  const crypto = await import('crypto');
  
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;
  
  const sign = crypto.default
    .createHash('md5')
    .update(username + apiKey + 'pricelist')
    .digest('hex');

  const response = await fetch('https://api.digiflazz.com/v1/price-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'prepaid', username, sign }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
