import nodemailer from "nodemailer";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && !key.startsWith("#") && rest.length) {
    process.env[key.trim()] = rest.join("=").trim();
  }
}

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

console.log("Sending test email to", process.env.GMAIL_USER, "...");

await transport.sendMail({
  from: `"The Arena Lilburn" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER,
  subject: "Test — Arena Camp Email Working",
  text: "If you got this, the email system is working correctly.",
});

console.log("✅ Email sent successfully!");
