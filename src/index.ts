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
      options: [],
      execute: async (args, ctx) => {
        const result = await findValidCatboxUrl(100);
        
        if (result) {
          messageUtil.sendMessage(ctx.channel.id, { 
            content: result.url 
          });
        } else {
          messageUtil.sendMessage(ctx.channel.id, { 
            content: `❌ Couldn't find a valid Catbox file. Try again!` 
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

 */
