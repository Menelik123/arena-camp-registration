import { NextRequest, NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { getRegistration, deleteRegistration } from "@/lib/redis";
import { appendRegistration } from "@/lib/sheets";
import { sendConfirmationEmail } from "@/lib/gmail";
import { RegistrationData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const registrationId = searchParams.get("registrationId");
  const token = searchParams.get("token"); // PayPal order ID

  if (!registrationId || !token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=missing_params`);
  }

  try {
    const capture = await captureOrder(token);

    const paymentId = capture.id;
    const paidAt = capture.update_time || new Date().toISOString();
    const status = capture.status;

    if (status !== "COMPLETED") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=payment_incomplete`);
    }

    const reg = await getRegistration(registrationId) as RegistrationData | null;
    if (!reg) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    }

    await Promise.all([
      appendRegistration(reg, paymentId, paidAt),
      sendConfirmationEmail(reg, paymentId),
    ]);

    await deleteRegistration(registrationId);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/success`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=capture_failed`);
  }
}
