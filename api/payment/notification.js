export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { order_id, transaction_status, fraud_status } = req.body;

  console.log('Midtrans notification:', req.body);

  let status = 'pending';

  if (transaction_status === 'capture' && fraud_status === 'accept') {
    status = 'paid';
  } else if (transaction_status === 'settlement') {
    status = 'paid';
  } else if (transaction_status === 'cancel' || transaction_status === 'expire') {
    status = 'failed';
  }

  console.log('Order:', order_id, '| Status:', status);

  // Nanti di sini kita proses otomatis ke Digiflazz/Buzzerpanel setelah bayar

  res.status(200).json({ success: true });
}
