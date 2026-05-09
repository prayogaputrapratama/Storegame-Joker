export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { service, link, quantity } = req.body;

  const params = new URLSearchParams({
    action: 'add',
    key: process.env.BUZZERPANEL_API_KEY,
    service,
    link,
    quantity,
  });

  const response = await fetch(process.env.BUZZERPANEL_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const data = await response.json();
  res.status(200).json(data);
}
