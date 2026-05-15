const BASE = "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function createOrder(
  registrationId: string,
  amountUsd: number,
  description: string
): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: registrationId,
          description,
          amount: {
            currency_code: "USD",
            value: amountUsd.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/capture?registrationId=${registrationId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
            user_action: "PAY_NOW",
            brand_name: "The Arena Lilburn",
          },
        },
      },
    }),
  });

  const order = await res.json();

  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${JSON.stringify(order)}`);
  }

  const approvalLink = order.links?.find((l: { rel: string }) => l.rel === "payer-action")?.href;
  if (!approvalLink) throw new Error("No PayPal approval URL returned");

  return approvalLink;
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);
  }

  return data;
}
