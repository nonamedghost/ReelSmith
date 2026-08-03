/**
 * Manual OAuth testing utility.
 *
 * Run from terminal:
 * node src/youtube/testAuth.js
 *
 * Not used by the Express application.
 */

import readline from "readline";

import {
  getAuthUrl,
  saveToken,
} from "./auth.js";

async function main() {
  // Generate Google login URL
  const authUrl = getAuthUrl();

  console.log("\nOpen this URL in browser:\n");
  console.log(authUrl);

  // Ask for auth code
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nPaste the code here: ", async (code) => {
    try {
      await saveToken(code);

      console.log("\nToken saved successfully.");

    } catch (err) {
      console.error("Auth failed:", err);
    }

    rl.close();
  });
}

main();