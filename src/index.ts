import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/toasts";

const { sendBotMessage } = findByProps("sendBotMessage");

// All in one place – no separate file, no undefined variables
const EXTENSIONS = ["png", "jpg", "webp"]; // Highest hit-rate – focus here
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function findRandomCatboxLink() {
  const maxAttempts = 400; // Enough to get hits in most runs without being too slow
  const tried = new Set();

  showToast({ content: "Searching Catbox... (may take 1–4 minutes)", type: "info" });

  for (let i = 0; i < maxAttempts; i++) {
    let code = "";
    do {
      code = "";
      for (let j = 0; j < 6; j++) {
        code += CHARS.charAt(Math.floor(Math.random() * 36));
      }
    } while (tried.has(code));
    tried.add(code);

    for (const ext of EXTENSIONS) {
      const url = `https://files.catbox.moe/\( {code}. \){ext}`;

      try {
        const response = await fetch(url, { method: "HEAD", redirect: "follow" });
        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("image/")) {
            return url;
          }
        }
      } catch {
        // silent fail
      }

      // Be very polite – 0.7–1.5 sec delay per check
      await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 800));
    }

    // Small extra pause every 40 attempts
    if (i % 40 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  return null;
}

let catboxRouletteCommand = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Finds random Catbox image link & copies to clipboard",
  displayDescription: "Finds random Catbox image link & copies to clipboard",
  options: [],
  execute: async (_, ctx) => {
    const link = await findRandomCatboxLink();

    if (!link) {
      showToast({
        content: "No link found after 400 tries – Catbox is huge & sparse. Try again!",
        type: "failure"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      showToast({
        content: `Copied! ${link}`,
        type: "success"
      });

      // Optional: also send it (uncomment if you want)
      // const nonce = Date.now().toString();
      // findByProps("sendMessage").sendMessage(ctx.channel.id, { content: link }, undefined, { nonce });
    } catch (err) {
      showToast({ content: `Found but copy failed: ${link}`, type: "failure" });
      sendBotMessage(ctx.channel.id, `Found (copy failed): ${link}`);
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default catboxRouletteCommand;
