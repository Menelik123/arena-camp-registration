import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createOrder } from "@/lib/paypal";
import { saveRegistration } from "@/lib/redis";
import { RegistrationData } from "@/lib/types";
import { BUNDLE_PRICE } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const data: RegistrationData = await req.json();

    const id = randomUUID();
    await saveRegistration(id, data);

    let description: string;
    let amount: number;

    if (data.isBundle) {
      description = `The Arena Lilburn — 2-Week Bundle (Flash Sale) | Wk1: ${data.campLabel} ${data.weekLabel} | Wk2: ${data.camp2Label} ${data.week2Label} | Full Day`;
      amount = BUNDLE_PRICE;
    } else {
      description = `The Arena Lilburn — ${data.campLabel} | ${data.weekLabel} ${data.sessionLabel}`;
      amount = data.price;
    }

    const approvalUrl = await createOrder(id, amount, description);

    return NextResponse.json({ checkoutUrl: approvalUrl, registrationId: id });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
