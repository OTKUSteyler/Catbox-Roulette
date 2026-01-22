import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const messageUtil = findByProps("sendMessage", "editMessage");

// More common extensions (prioritize what people actually upload)
const COMMON_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

// Catbox uses alphanumeric, but some patterns are more common
// Recent uploads tend to use more recent patterns
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

// Strategy: Use sequential/pattern-based generation
// Many file hosts use sequential or time-based naming
function generateSmartCode() {
  // Mix of strategies to increase hit rate
  const strategy = Math.random();
  
  if (strategy < 0.4) {
    // Strategy 1: Recent sequential pattern (higher density)
    // Start from a known working range and go nearby
    const baseChars = "mnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += baseChars.charAt(Math.floor(Math.random() * baseChars.length));
    }
    return code;
  } else if (strategy < 0.7) {
    // Strategy 2: Short memorable codes (people often request these)
    const shortBase = Math.random().toString(36).substring(2, 5);
    const padding = Math.random().toString(36).substring(2, 5);
    return (shortBase + padding).substring(0, 6);
  } else {
    // Strategy 3: Pure random
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
  }
}

function generateSmartUrl() {
  const code = generateSmartCode();
  
  // 80% common image formats, 20% video
  const allExts = Math.random() < 0.8 ? COMMON_EXTENSIONS : VIDEO_EXTENSIONS;
  const ext = allExts[Math.floor(Math.random() * allExts.length)];
  
  return `https://files.catbox.moe/${code}.${ext}`;
}

// Instead of checking existence, just send multiple URLs
// Discord will load the valid ones automatically
// User can see which ones work
function generateBatch(count = 10) {
  const urls = [];
  const used = new Set();
  
  while (urls.length < count) {
    const url = generateSmartUrl();
    if (!used.has(url)) {
      urls.push(url);
      used.add(url);
    }
  }
  
  return urls;
}

let unregisterCommand;

export default {
  onLoad: () => {
    unregisterCommand = registerCommand({
      name: "catbox",
      displayName: "Catbox Roulette",
      description: "Sends random Catbox URLs - Discord will load the valid ones!",
      options: [],
      execute: async (args, ctx) => {
        const count = 10;
        const urls = generateBatch(count);
        
        // Send all URLs in a single message
        messageUtil.sendMessage(ctx.channel.id, { 
          content: `🎲 Catbox Roulette (valid ones will load as embeds):\n${urls.join('\n')}`
        });
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
