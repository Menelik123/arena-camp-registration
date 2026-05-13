import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createCheckout } from "@/lib/square";
import { saveRegistration } from "@/lib/redis";
import { RegistrationData } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const data: RegistrationData = await req.json();

    const id = randomUUID();
    await saveRegistration(id, data);

    const amountCents = data.price * 100;
    const description = `The Arena Summer Camp — ${data.weekLabel} ${data.sessionLabel}`;

    const checkoutUrl = await createCheckout(id, amountCents, description, data.email);

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
