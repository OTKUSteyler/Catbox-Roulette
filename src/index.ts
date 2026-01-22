import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/toasts";

const { sendBotMessage } = findByProps("sendBotMessage");

// Self-contained – no external files needed
const EXTENSIONS = ["png", "jpg", "webp"]; // Best hit rates on Catbox
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxLink() {
  const maxAttempts = 450; // Balanced – usually finds something in <300 tries
  const triedCodes = new Set<string>();

  showToast({ content: "Rolling Catbox roulette... (1–5 min max)", type: "info" });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code: string;
    do {
      code = Array(6).fill(0).map(() => 
        CHARS.charAt(Math.floor(Math.random() * CHARS.length))
      ).join("");
    } while (triedCodes.has(code));
    triedCodes.add(code);

    // Random extension each time for variety
    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/\( {code}. \){ext}`;

    try {
      const res = await fetch(url, { 
        method: "HEAD", 
        redirect: "follow",
        cache: "no-store" // Avoid caching false negatives
      });

      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("image/")) { // Catbox images most common
          return url;
        }
      }
    } catch {
      // Network/error → skip
    }

    // Polite random delay: 0.8–1.6 seconds
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
  }

  return null;
}

const cmd = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Gets random Catbox link & copies to clipboard",
  displayDescription: "Gets random Catbox link & copies to clipboard",
  options: [],
  execute: async (_, ctx) => {
    const link = await getRandomCatboxLink();

    if (!link) {
      showToast({
        content: "Didn't find anything after 450 rolls – try again!",
        type: "failure"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      showToast({
        content: `Copied to clipboard: ${link}`,
        type: "success"
      });

      // Uncomment next 3 lines if you ALSO want to send it in chat
      // const nonce = Date.now().toString();
      // const sendMsg = findByProps("sendMessage");
      // sendMsg.sendMessage(ctx.channel.id, { content: link }, undefined, { nonce });
    } catch (e) {
      showToast({ content: `Found but copy failed: ${link}`, type: "failure" });
      sendBotMessage(ctx.channel.id, `Found (copy failed): ${link}`);
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default cmd;
