export const EXTENSIONS = ["png", "jpg", "webp", "gif", "webm", "mp4"];

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function getRandomCatboxUrl(maxAttempts = 100): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/\( {code}. \){ext}`;

    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("image/") || contentType.includes("video/")) {
          return url;
        }
      }
    } catch {
      // Ignore errors like network issues
    }

    // Delay to avoid rate limits (random 0.6–1.3 seconds)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 700));
  }

  return null;
}
