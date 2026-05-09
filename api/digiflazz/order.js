import { saveTransaction } from '../../lib/db.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;

  const { buyer_sku_code, customer_no } = req.body;
  const ref_id = Date.now().toString();

  const sign = crypto
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

  await saveTransaction({
    ref_id,
    customer_no,
    sku: buyer_sku_code,
    status: data.data?.status || 'pending',
    provider: 'digifl
