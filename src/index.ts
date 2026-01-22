import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const messageUtil = findByProps("sendMessage", "editMessage");

// Self-contained random Catbox guessing
const EXTENSIONS = ["png", "jpg", "webp"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxLink(maxAttempts = 400) {
  for (let i = 0; i < maxAttempts; i++) {
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

    // Delay to avoid rate-limit ban
    await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
  }
  return null;
}

const cmd = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Sends a random Catbox link in chat",
  displayDescription: "Sends a random Catbox link in chat",
  options: [],
  execute: async (_, ctx) => {
    const link = await getRandomCatboxLink();

    if (!link) {
      // Fallback: send failure as normal message too (or remove if unwanted)
      messageUtil.sendMessage(ctx.channel.id, { content: "No valid Catbox link found after tries. Try again!" });
      return;
    }

    // Send as normal user message (no bot tag)
    const nonce = Date.now().toString(); // Helps with slash command quirks
    messageUtil.sendMessage(ctx.channel.id, { content: link }, undefined, { nonce });
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default cmd;
