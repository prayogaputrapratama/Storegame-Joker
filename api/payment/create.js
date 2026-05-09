export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { order_id, amount, customer_name, customer_email, item_name } = req.body;

  const authString = Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64');

  const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authString}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
      item_details: [
        {
          id: order_id,
          price: amount,
          quantity: 1,
          name: item_name,
        },
      ],
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
