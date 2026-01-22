import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const messageUtil = findByProps("sendMessage", "editMessage");

const EXTENSIONS = ["png", "jpg", "webp"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxLink() {
  const maxAttempts = 600; // More attempts for better odds

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
    } catch (e) {
      // Silent ignore
    }

    // Short polite delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
  }

  return null;
}

const cmd = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Sends random Catbox link",
  options: [],
  execute: async (_, ctx) => {
    const link = await getRandomCatboxLink();

    if (link) {
      const nonce = Date.now().toString();
      messageUtil.sendMessage(ctx.channel.id, { content: link }, undefined, { nonce });
    } else {
      messageUtil.sendMessage(ctx.channel.id, { content: "Couldn't find a Catbox link this time. Try again." });
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default cmd;
