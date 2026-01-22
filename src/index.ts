import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";

const messageUtil = findByProps("sendMessage", "editMessage");

const EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "mp4", "webm", "mov"];
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

// CORS proxies to bypass browser restrictions
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

let currentProxyIndex = 0;

function generateRandomCatboxUrl() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  
  const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
  return `https://files.catbox.moe/${code}.${ext}`;
}

async function checkIfExists(url) {
  const proxy = CORS_PROXIES[currentProxyIndex];
  const proxyUrl = proxy + encodeURIComponent(url);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(proxyUrl, {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");
      
      // Check if it's actual media content with reasonable size
      if ((contentType.includes("image/") || 
           contentType.includes("video/") ||
           contentType.includes("octet-stream")) &&
          contentLength && parseInt(contentLength) > 1000) {
        return true;
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
    // Try next proxy on failure
    if (e.name === "AbortError" || e.message.includes("fetch")) {
      currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
    }
  }
  
  return false;
}

async function findValidCatboxUrl(maxAttempts = 100) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const url = generateRandomCatboxUrl();
    
    const exists = await checkIfExists(url);
    if (exists) {
      return { url, attempts: attempt + 1 };
    }
    
    // Small delay every 10 attempts
    if (attempt > 0 && attempt % 10 === 0) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  return null;
}

let unregisterCommand;

export default {
  onLoad: () => {
    unregisterCommand = registerCommand({
      name: "catbox",
      displayName: "Catbox Roulette",
      description: "Finds and sends a random valid Catbox file",
      options: [
        {
          name: "attempts",
          displayName: "Max Attempts",
          description: "Maximum attempts to find a valid file (default: 100)",
          required: false,
          type: 4,
        }
      ],
      execute: async (args, ctx) => {
        const maxAttempts = Math.max(10, Math.min(200, args[0]?.value || 100));
        
        messageUtil.sendMessage(ctx.channel.id, { 
          content: `🎲 Searching for a valid Catbox file (max ${maxAttempts} attempts)...` 
        });
        
        const startTime = Date.now();
        const result = await findValidCatboxUrl(maxAttempts);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (result) {
          messageUtil.sendMessage(ctx.channel.id, { 
            content: `✅ Found one in ${result.attempts} attempts (${duration}s)!\n${result.url}` 
          });
        } else {
          messageUtil.sendMessage(ctx.channel.id, { 
            content: `❌ No valid file found after ${maxAttempts} attempts (${duration}s).\n\nTip: The odds are very low (~0.05% per try). You might want to try again or increase attempts!` 
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

