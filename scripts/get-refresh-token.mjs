/**
 * Run once to get your Gmail + Sheets refresh token.
 * Usage: node scripts/get-refresh-token.mjs
 */

import { createServer } from "http";
import { google } from "googleapis";

const CLIENT_ID = "1068173066939-6svmp423nq12pbg27rlkm2rpgboj4g7k.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:4000/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/spreadsheets",
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

console.log("\n==================================================");
console.log("Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n==================================================");
console.log("Waiting for Google to redirect back...\n");

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) return;

  const url = new URL(req.url, "http://localhost:4000");
  const code = url.searchParams.get("code");

  if (!code) {
    res.end("No code found.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.end(`
      <html><body style="font-family:monospace;padding:24px;background:#111;color:#0f0;">
        <h2 style="color:#FFD700;">Got your refresh token!</h2>
        <p>Copy this into .env.local as GMAIL_REFRESH_TOKEN and GOOGLE_SHEETS_REFRESH_TOKEN:</p>
        <pre style="background:#000;padding:16px;border-radius:8px;word-break:break-all;">${tokens.refresh_token}</pre>
        <p style="color:#888;">You can close this window and stop the script (Ctrl+C).</p>
      </body></html>
    `);
    console.log("\n✅ Refresh token obtained:\n");
    console.log(tokens.refresh_token);
    console.log("\nAdd this to .env.local as:");
    console.log("  GMAIL_REFRESH_TOKEN=" + tokens.refresh_token);
    console.log("  GOOGLE_SHEETS_REFRESH_TOKEN=" + tokens.refresh_token);
  } catch (err) {
    res.end("Error: " + err.message);
    console.error("Error getting token:", err);
  } finally {
    server.close();
  }
});

server.listen(4000, () => {
  console.log("Callback server listening on http://localhost:4000");
});
