import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const messageUtil = findByProps("sendMessage", "editMessage");
const EXTENSIONS = ["png", "jpg", "webp"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function getRandomCatboxLink() {
  const maxAttempts = 100; // Reduced to avoid rate limiting
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let j = 0; j < 6; j++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    
    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/${code}.${ext}`;
    
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
    
    // Increased delay to be more respectful
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return null;
}

let unregisterCommand;

export default {
  onLoad: () => {
    unregisterCommand = registerCommand({
      name: "catbox",
      displayName: "Catbox Roulette",
      description: "Sends random Catbox link",
      options: [],
      execute: async (_, ctx) => {
        const link = await getRandomCatboxLink();
        if (link) {
          messageUtil.sendMessage(ctx.channel.id, { content: link });
        } else {
          messageUtil.sendMessage(ctx.channel.id, { 
            content: "Couldn't find a Catbox link this time. Try again." 
          });
        }
      },
      applicationId: "-1",
      inputType: 1,
      type: 1,
    });
  },
  
  onUnload: () => {
    if (unregisterCommand) {
      unregisterCommand();
    }
  }
};
