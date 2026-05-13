import nodemailer from "nodemailer";
import { RegistrationData } from "./types";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  });
}

export async function sendConfirmationEmail(reg: RegistrationData, paymentId: string) {
  const transport = createTransport();

  const priorityLabel = (val: string) =>
    val === "high" ? "High Priority" : val === "moderate" ? "Moderate Priority" : "Low Priority";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #111; }
    .header { background: #000; padding: 32px 24px; text-align: center; border-bottom: 3px solid #FFD700; }
    .header h1 { margin: 0; color: #FFD700; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
    .header p { margin: 6px 0 0; color: #aaa; font-size: 14px; }
    .body { padding: 32px 24px; }
    .confirm-box { background: #1a1a1a; border: 1px solid #FFD700; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .confirm-box h2 { color: #FFD700; margin: 0 0 8px; font-size: 20px; }
    .confirm-box p { color: #ccc; margin: 0; font-size: 14px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #222; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 13px; }
    .detail-value { color: #fff; font-size: 13px; font-weight: bold; text-align: right; }
    .price-row { background: #1a1a1a; border-radius: 6px; padding: 14px 16px; margin: 20px 0; display: flex; justify-content: space-between; }
    .price-label { color: #aaa; font-size: 14px; }
    .price-value { color: #FFD700; font-size: 20px; font-weight: bold; }
    .section-title { color: #FFD700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; }
    .what-to-expect li { color: #ccc; font-size: 13px; margin-bottom: 6px; }
    .footer { background: #000; padding: 20px 24px; text-align: center; border-top: 1px solid #222; }
    .footer p { color: #555; font-size: 12px; margin: 4px 0; }
    .payment-id { color: #444; font-size: 11px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>The Arena Lilburn</h1>
      <p>Multi-Sport Summer Camp</p>
    </div>
    <div class="body">
      <div class="confirm-box">
        <h2>You're Registered!</h2>
        <p>Payment confirmed. A spot has been reserved for ${reg.childName}.</p>
      </div>

      <div class="section-title">Registration Summary</div>
      <div class="detail-row">
        <span class="detail-label">Child</span>
        <span class="detail-value">${reg.childName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Camp Week</span>
        <span class="detail-value">${reg.weekLabel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Session</span>
        <span class="detail-value">${reg.sessionLabel} (${reg.sessionTime})</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Days</span>
        <span class="detail-value">Monday – Thursday</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Sports</span>
        <span class="detail-value">${reg.sports.join(", ") || "N/A"}</span>
      </div>

      <div class="price-row">
        <span class="price-label">Amount Paid</span>
        <span class="price-value">$${reg.price}.00</span>
      </div>

      <div class="section-title">What to Expect</div>
      <ul class="what-to-expect">
        <li>Check-in opens 15 minutes before your session starts</li>
        <li>Wear comfortable athletic clothing and bring water</li>
        <li>Campers will rotate through Basketball, Soccer, Volleyball, Futsal & Pickleball</li>
        <li>Camp runs Monday through Thursday — no Friday sessions</li>
        <li>For questions contact us at thearenalilburn.com</li>
      </ul>

      <p class="payment-id">Payment ID: ${paymentId}</p>
    </div>
    <div class="footer">
      <p>The Arena Lilburn — Sports & Entertainment</p>
      <p>thearenalilburn.com</p>
    </div>
  </div>
</body>
</html>
  `;

  await transport.sendMail({
    from: `"The Arena Lilburn" <${process.env.GMAIL_USER}>`,
    to: reg.email,
    subject: `Registration Confirmed — ${reg.childName} | ${reg.weekLabel}`,
    html,
  });

  // Notify organizer of each new signup
  await transport.sendMail({
    from: `"The Arena Lilburn" <${process.env.GMAIL_USER}>`,
    to: process.env.ORGANIZER_EMAIL!,
    subject: `New Signup — ${reg.childName} | ${reg.weekLabel}`,
    text: [
      `New camp registration received.`,
      ``,
      `Child: ${reg.childName} (Age ${reg.age})`,
      `Parent: ${reg.parentName}`,
      `Email: ${reg.email}`,
      `Phone: ${reg.phoneMom}`,
      `Week: ${reg.weekLabel}`,
      `Session: ${reg.sessionLabel} · ${reg.sessionTime}`,
      `Amount Paid: $${reg.price}.00`,
      `Payment ID: ${paymentId}`,
    ].join("\n"),
  });
}

export async function sendDailySummaryEmail(registrations: { week: string; count: number }[], total: number) {
  const transport = createTransport();

  const rows = registrations
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;color:#ccc;font-size:13px;border-bottom:1px solid #222;">${r.week}</td>
        <td style="padding:8px 12px;color:#FFD700;font-weight:bold;font-size:13px;border-bottom:1px solid #222;text-align:right;">${r.count}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:0;">
  <div style="max-width:520px;margin:0 auto;background:#111;">
    <div style="background:#000;padding:24px;text-align:center;border-bottom:3px solid #FFD700;">
      <h1 style="margin:0;color:#FFD700;font-size:20px;letter-spacing:2px;">Daily Signup Report</h1>
      <p style="margin:6px 0 0;color:#aaa;font-size:13px;">The Arena Lilburn — Summer Camp ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
    </div>
    <div style="padding:24px;">
      <div style="background:#1a1a1a;border:1px solid #FFD700;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
        <p style="margin:0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Total Registrations</p>
        <p style="margin:6px 0 0;color:#FFD700;font-size:36px;font-weight:bold;">${total}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:8px 12px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;border-bottom:1px solid #333;">Week</th>
            <th style="padding:8px 12px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:right;border-bottom:1px solid #333;">Signups</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="background:#000;padding:16px;text-align:center;border-top:1px solid #222;">
      <p style="color:#444;font-size:11px;margin:0;">Auto-sent daily at 8:00 AM</p>
    </div>
  </div>
</body>
</html>
  `;

  await transport.sendMail({
    from: `"The Arena Camp" <${process.env.GMAIL_USER}>`,
    to: process.env.ORGANIZER_EMAIL!,
    subject: `Camp Signups Today — ${total} Total | ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    html,
  });
}
