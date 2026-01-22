import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

// Define everything here to avoid undefined errors
const EXTENSIONS = ["png", "jpg", "webp", "gif", "webm", "mp4"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxUrl(maxAttempts = 80) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
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

    // Polite delay: ~0.7–1.4 seconds
    await new Promise(r => setTimeout(r, 700 + Math.random() * 700));
  }
  return null;
}

const command = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Fetches a random working Catbox.moe link",
  displayDescription: "Fetches a random working Catbox.moe link",
  options: [],
  execute: async (_, ctx) => {
    const url = await getRandomCatboxUrl();

    if (!url) {
      sendBotMessage(ctx.channel.id, "No valid link found after tries. Try again later.");
      return;
    }

    const nonce = Date.now().toString();
    messageUtil.sendMessage(ctx.channel.id, { content: url }, undefined, { nonce });
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default command;
