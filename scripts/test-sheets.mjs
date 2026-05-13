const URL = "https://script.google.com/macros/s/AKfycbwyNpE1Of14BVU-DeBjzIX33cgDbYzYrYa4Gxa-cm0N-Kd33MBeS_W7n8veV6e25THK/exec";

const payload = {
  date: "5/13/2026",
  parentName: "TEST PARENT",
  email: "test@test.com",
  address: "123 Test St",
  phoneMom: "555-0001",
  phoneDad: "555-0002",
  childName: "TEST CHILD",
  dob: "2016-01-01",
  age: "10",
  school: "Test School",
  sports: "Basketball, Soccer",
  weekLabel: "Week 1 — June 16–19",
  sessionLabel: "Morning Session",
  sessionTime: "9AM – 12PM",
  price: "$75",
  paymentId: "TEST_PAYMENT_123",
  paidAt: new Date().toISOString(),
  emergencyContactName: "Test Contact",
  emergencyContactPhone: "555-0003",
  hasAllergies: "no", allergyDetails: "",
  hasMedicalConditions: "no", medicalDetails: "",
  parentInstagram: "", childInstagram: "",
  foodRestrictions: "None",
  pickupAuthorized: "Test Person",
  pickupRestricted: "None",
  goalImproveSkills: "high", goalFun: "high", goalActive: "moderate", goalTeamwork: "high",
  howHeard: "Instagram", referredBy: "", comments: "",
};

console.log("Sending test row to Google Sheet...");
const res = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const text = await res.text();
console.log("Response:", res.status, text);
