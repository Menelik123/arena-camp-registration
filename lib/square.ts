import { SquareClient, SquareEnvironment, WebhooksHelper } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
});

export async function createCheckout(
  registrationId: string,
  amountCents: number,
  description: string,
  buyerEmail: string
): Promise<string | undefined> {
  const response = await client.checkout.paymentLinks.create({
    idempotencyKey: registrationId,
    order: {
      locationId: process.env.SQUARE_LOCATION_ID!,
      referenceId: registrationId,
      lineItems: [
        {
          name: description,
          quantity: "1",
          basePriceMoney: {
            amount: BigInt(amountCents),
            currency: "USD",
          },
        },
      ],
    },
    checkoutOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?ref=${registrationId}`,
      askForShippingAddress: false,
    },
    prePopulatedData: {
      buyerEmail,
    },
  });

  return response.paymentLink?.url;
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  url: string
): Promise<boolean> {
  return WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: signature,
    signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    notificationUrl: url,
  });
}
