import fs from "fs";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.upload",
];

const credentials = JSON.parse(
  fs.readFileSync("credentials.json")
);

const {
  client_secret,
  client_id,
  redirect_uris,
} = credentials.web;

export const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Generate login URL
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

// Exchange auth code for token
export async function saveToken(code) {
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  fs.writeFileSync(
    "token.json",
    JSON.stringify(tokens, null, 2)
  );

  console.log("YouTube authentication successful.");
}