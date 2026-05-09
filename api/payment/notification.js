import { updateTransaction } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { order_id, transaction_status, fraud_status } = req.body;

  let status = 'pending';

  if (transaction_status === 'capture' && fraud_status === 'accept') {
    status = 'paid';
  } else if (transaction_status === 'settlement') {
    status = 'paid';
  } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
    status = 'failed';
  }

  await updateTransaction({ ref_id: order_id, status });

  // Kalau sudah bayar, proses otomatis ke Digiflazz
  if (status === 'paid') {
    const crypto = await import('crypto');
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    const ref_id = order_id;

    const sign = crypto.default
      .createHash('md5')
      .update(username + apiKey + ref_id)
      .digest('hex');

    await fetch('https://api.digiflazz.com/v1/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        buyer_sku_code: req.body.item_details?.[0]?.id || '',
        customer_no: req.body.customer_details?.phone || '',
        ref_id,
        sign,
