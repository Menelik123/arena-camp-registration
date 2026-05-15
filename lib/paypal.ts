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
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/capture?registrationId=${registrationId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
        user_action: "PAY_NOW",
        brand_name: "The Arena Lilburn",
        shipping_preference: "NO_SHIPPING",
        landing_page: "BILLING",
      },
    }),
  });

  const order = await res.json();

  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${JSON.stringify(order)}`);
  }

  const approvalLink = order.links?.find((l: { rel: string }) => l.rel === "approve")?.href;
  if (!approvalLink) throw new Error("No PayPal approval URL returned");

  return approvalLink;
}

// Returns the captured order data, or null if already captured (safe to ignore)
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

  // ORDER_ALREADY_CAPTURED means the redirect already handled it — not an error
  if (!res.ok) {
    const alreadyCaptured = data.details?.some(
      (d: { issue: string }) => d.issue === "ORDER_ALREADY_CAPTURED"
    );
    if (alreadyCaptured) return null;
    throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  rawBody: string
): Promise<boolean> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
