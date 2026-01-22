import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/toasts";

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

// Self-contained random Catbox logic
const EXTENSIONS = ["png", "jpg", "webp"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxLink() {
  const maxAttempts = 400;
  const tried = new Set();

  showToast({ content: "Rolling for Catbox link...", type: "info" });

  for (let i = 0; i < maxAttempts; i++) {
    let code = Array(6).fill(0).map(() => CHARS.charAt(Math.floor(Math.random() * 36))).join("");
    while (tried.has(code)) {
      code = Array(6).fill(0).map(() => CHARS.charAt(Math.floor(Math.random() * 36))).join("");
    }
    tried.add(code);

    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/${code}.${ext}`;

    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("image/")) {
          return url;
        }
      }
    } catch {}

    await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
  }
  return null;
}

const command = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Random Catbox image → sends to chat & copies to clipboard",
  displayDescription: "Random Catbox image → sends to chat & copies to clipboard",
  options: [],
  execute: async (_, ctx) => {
    const link = await getRandomCatboxLink();

    if (!link) {
      showToast({ content: "No link found after tries – try again", type: "failure" });
      sendBotMessage(ctx.channel.id, "Couldn't find a valid Catbox link. Try again.");
      return;
    }

    // Send to chat like KonoChan does
    const nonce = Date.now().toString();
    messageUtil.sendMessage(ctx.channel.id, { content: link }, undefined, { nonce });

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(link);
      showToast({ content: `Sent & copied: ${link}`, type: "success" });
    } catch {
      showToast({ content: `Sent but copy failed: ${link}`, type: "warning" });
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default command;
