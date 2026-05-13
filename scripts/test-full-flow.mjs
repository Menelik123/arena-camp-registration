import { readFileSync } from "fs";
import { createHmac } from "crypto";

// Load .env.local
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && !key.startsWith("#") && rest.length) {
    process.env[key.trim()] = rest.join("=").trim();
  }
}

const BASE_URL = "https://arena-camp-registration.vercel.app";
const WEBHOOK_SIG_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

// Step 1: Submit test registration (saves to Redis + gets Square checkout URL)
console.log("Step 1: Submitting test registration...");
const reg = {
  parentName: "Menelik Garrick",
  email: "menelikgarrick@gmail.com",
  address: "562 Waterview Ln, Stone Mountain, GA 30088",
  phoneMom: "404-000-0001",
  phoneDad: "404-000-0002",
  childName: "Test Child",
  dob: "2016-06-01",
  age: "10",
  school: "Test Elementary",
  sports: ["Basketball", "Soccer"],
  weekId: 1,
  weekLabel: "Week 1 — June 16–19",
  session: "morning",
  sessionLabel: "Morning Session",
  sessionTime: "9AM – 12PM",
  price: 75,
  emergencyContactName: "Test Contact",
  emergencyContactPhone: "404-000-0003",
  hasAllergies: "no", allergyDetails: "",
  hasMedicalConditions: "no", medicalDetails: "",
  parentInstagram: "@testparent", childInstagram: "",
  foodRestrictions: "None",
  pickupAuthorized: "Test Person, friend",
  pickupRestricted: "None",
  goalImproveSkills: "high", goalFun: "high", goalActive: "moderate", goalTeamwork: "high",
  howHeard: "Instagram", referredBy: "", comments: "This is a test registration.",
  waiverAccepted: true,
};

const regRes = await fetch(`${BASE_URL}/api/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(reg),
});
const regData = await regRes.json();

if (!regRes.ok) {
  console.error("❌ Registration failed:", regData);
  process.exit(1);
}

const { checkoutUrl, registrationId } = regData;
console.log("✅ Registration saved. ID:", registrationId);
console.log("   Checkout URL:", checkoutUrl);

// Step 2: Simulate Square payment.completed webhook
console.log("\nStep 2: Simulating Square payment webhook...");

const webhookUrl = `${BASE_URL}/api/webhook`;
const payload = JSON.stringify({
  type: "payment.completed",
  data: {
    object: {
      payment: {
        id: "TEST_PAYMENT_" + Date.now(),
        created_at: new Date().toISOString(),
        order: {
          reference_id: registrationId,
        },
      },
    },
  },
});

// Sign the payload the way Square does
const hmac = createHmac("sha256", WEBHOOK_SIG_KEY);
hmac.update(webhookUrl + payload);
const signature = hmac.digest("base64");

const webhookRes = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-square-hmacsha256-signature": signature,
  },
  body: payload,
});

const webhookData = await webhookRes.text();
console.log("Webhook response:", webhookRes.status, webhookData);

if (webhookRes.ok) {
  console.log("\n✅ Full flow complete!");
  console.log("   → Check menelikgarrick@gmail.com for confirmation email");
  console.log("   → Check the Google Sheet for the new row");
} else {
  console.log("\n❌ Webhook failed. Check the response above.");
}
