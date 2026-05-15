import { NextRequest, NextResponse } from "next/server";
import { captureOrder, verifyWebhookSignature } from "@/lib/paypal";
import { getRegistration, deleteRegistration } from "@/lib/redis";
import { appendRegistration } from "@/lib/sheets";
import { sendConfirmationEmail } from "@/lib/gmail";
import { RegistrationData } from "@/lib/types";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const headers: Record<string, string> = {
    "paypal-auth-algo": req.headers.get("paypal-auth-algo") || "",
    "paypal-cert-url": req.headers.get("paypal-cert-url") || "",
    "paypal-transmission-id": req.headers.get("paypal-transmission-id") || "",
    "paypal-transmission-sig": req.headers.get("paypal-transmission-sig") || "",
    "paypal-transmission-time": req.headers.get("paypal-transmission-time") || "",
  };

  const isValid = await verifyWebhookSignature(headers, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // Only handle order approval — this fires when user pays regardless of redirect
  if (event.event_type !== "CHECKOUT.ORDER.APPROVED") {
    return NextResponse.json({ received: true });
  }

  const orderId = event.resource?.id;
  const registrationId = event.resource?.purchase_units?.[0]?.reference_id;

  if (!orderId || !registrationId) {
    return NextResponse.json({ error: "Missing order or registration ID" }, { status: 400 });
  }

  // Check if registration still exists — if not, redirect already handled it
  const reg = await getRegistration(registrationId) as RegistrationData | null;
  if (!reg) {
    return NextResponse.json({ received: true, note: "Already processed by redirect" });
  }

  // Try to capture — returns null if redirect already captured it
  const capture = await captureOrder(orderId);
  if (!capture) {
    return NextResponse.json({ received: true, note: "Already captured by redirect" });
  }

  const paymentId = capture.id;
  const paidAt = capture.update_time || new Date().toISOString();

  await Promise.all([
    appendRegistration(reg, paymentId, paidAt),
    sendConfirmationEmail(reg, paymentId),
  ]);

  await deleteRegistration(registrationId);

  return NextResponse.json({ received: true });
}
