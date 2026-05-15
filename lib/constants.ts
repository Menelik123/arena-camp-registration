export const MULTISPORT_WEEKS = [
  { id: 1, label: "Week 1 — June 16–19" },
  { id: 2, label: "Week 2 — June 23–26" },
  { id: 3, label: "Week 3 — June 30 – July 3" },
  { id: 4, label: "Week 4 — July 7–10" },
  { id: 5, label: "Week 5 — July 14–17" },
  { id: 6, label: "Week 6 — July 21–24" },
  { id: 7, label: "Week 7 — July 28–31" },
  { id: 8, label: "Week 8 — August 4–7" },
];

export const BASKETBALL_WEEKS = [
  { id: 1, label: "Week 1 — June 1–4" },
  { id: 2, label: "Week 2 — June 8–11" },
  { id: 3, label: "Week 3 — July 6–9" },
  { id: 4, label: "Week 4 — July 13–16" },
];

// Legacy alias kept for any remaining imports
export const CAMP_WEEKS = MULTISPORT_WEEKS;

export const CAMPS = [
  {
    id: "multisport",
    label: "Multi-Sport Summer Camp",
    tagline: "Basketball · Soccer · Volleyball · Futsal · Pickleball",
    weeks: MULTISPORT_WEEKS,
    sessions: [
      { id: "morning", label: "Morning Session", time: "9AM – 12PM", price: 75 },
      { id: "afternoon", label: "Afternoon Session", time: "1PM – 4PM", price: 75 },
      { id: "fullday", label: "Full Day", time: "9AM – 4PM", price: 150 },
    ],
  },
  {
    id: "basketball",
    label: "Basketball Training Camp",
    tagline: "Train Like a Pro · Play Like a Champion",
    weeks: BASKETBALL_WEEKS,
    sessions: [
      { id: "morning", label: "Morning Session", time: "9AM – 12PM", price: 95 },
      { id: "afternoon", label: "Afternoon Session", time: "1PM – 4PM", price: 95 },
      { id: "fullday", label: "Full Day", time: "9AM – 4PM", price: 175 },
    ],
  },
];

// TODO: Replace Square checkout with PayPal when ready.
// In lib/square.ts swap createCheckout() for a PayPal Orders API call.
// PayPal client ID and secret go in .env.local as PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.
export const PAYMENT_PROVIDER = "square"; // change to "paypal" when switching

export const SESSIONS = [
  { id: "morning", label: "Morning Session", time: "9AM – 12PM", price: 75 },
  { id: "afternoon", label: "Afternoon Session", time: "1PM – 4PM", price: 75 },
  { id: "fullday", label: "Full Day", time: "9AM – 4PM", price: 150 },
];

export const SPORTS = [
  "Basketball",
  "Soccer",
  "Volleyball",
  "Futsal",
  "Pickleball",
];

export const HOW_HEARD_OPTIONS = [
  "Instagram",
  "Facebook",
  "Word of mouth",
  "Flyer",
  "Google search",
  "School",
  "Other",
];

export const ORGANIZER_EMAIL = "robohanna4@gmail.com";
export const SHEETS_ID = "10RZ9777f5ftyiBYLfY5XLx6TQ5DCQjH58S-6_EPgbKY";
