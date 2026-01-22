// src/utils.ts (new or replace existing)
const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function getRandomCatboxUrl(maxAttempts = 80): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    let code = "";
    for (let j = 0; j < 6; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/\( {code}. \){ext}`;

    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
          return url;
        }
      }
    } catch (e) {
      // silent fail on network/error
    }

    // Be nice to their servers
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));  // 400-700ms delay
  }

  return null;  // failed after max attempts → no infinite loop
}
