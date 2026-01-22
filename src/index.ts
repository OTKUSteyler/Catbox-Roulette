import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/toasts";  // For nice feedback (optional but recommended)

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

// Define here to avoid undefined errors
const EXTENSIONS = ["png", "jpg", "webp", "gif"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxUrl(maxAttempts = 250) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let j = 0; j < 6; j++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/\( {code}. \){ext}`;

    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("image/") || ct.includes("video/")) {
          return url;
        }
      }
    } catch {}

    // Delay to be polite
    await new Promise(r => setTimeout(r, 500 + Math.random() * 600));
  }
  return null;
}

const command = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Finds a random Catbox link and copies it to clipboard",
  displayDescription: "Finds a random Catbox link and copies it to clipboard",
  options: [],
  execute: async (_, ctx) => {
    const url = await getRandomCatboxUrl();

    if (!url) {
      showToast({ content: "No valid link found after tries. Try again!", type: "failure" });
      // Or fallback: sendBotMessage(ctx.channel.id, "No valid link found. Try again.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast({ 
        content: "Copied to clipboard! " + url, 
        type: "success" 
      });
      
      // Optional: still send in chat
      // const nonce = Date.now().toString();
      // messageUtil.sendMessage(ctx.channel.id, { content: url }, undefined, { nonce });
    } catch (err) {
      showToast({ content: "Copy failed: " + err.message, type: "failure" });
      // Fallback: send anyway if copy fails
      sendBotMessage(ctx.channel.id, "Found but copy failed: " + url);
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default command;
