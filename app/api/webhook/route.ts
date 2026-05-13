import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/square";
import { getRegistration, deleteRegistration } from "@/lib/redis";
import { appendRegistration } from "@/lib/sheets";
import { sendConfirmationEmail } from "@/lib/gmail";
import { RegistrationData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature") || "";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`;

  const isValid = await verifyWebhookSignature(rawBody, signature, url);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.type !== "payment.completed") {
    return NextResponse.json({ received: true });
  }

  const payment = event.data?.object?.payment;
  const registrationId = payment?.order?.reference_id || payment?.reference_id;

  if (!registrationId) {
    return NextResponse.json({ error: "No reference ID" }, { status: 400 });
  }

  const reg = await getRegistration(registrationId) as RegistrationData | null;
  if (!reg) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const paymentId = payment.id;
  const paidAt = payment.created_at || new Date().toISOString();

  await Promise.all([
    appendRegistration(reg, paymentId, paidAt),
    sendConfirmationEmail(reg, paymentId),
  ]);

  await deleteRegistration(registrationId);

  return NextResponse.json({ received: true });
}
