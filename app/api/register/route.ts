import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createOrder } from "@/lib/paypal";
import { saveRegistration } from "@/lib/redis";
import { RegistrationData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: RegistrationData = await req.json();

    const id = randomUUID();
    await saveRegistration(id, data);

    const description = `The Arena Lilburn — ${data.campLabel} | ${data.weekLabel} ${data.sessionLabel}`;
    const approvalUrl = await createOrder(id, data.price, description);

    return NextResponse.json({ checkoutUrl: approvalUrl, registrationId: id });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
