export const EXTENSIONS = ["png", "jpg", "webp", "gif"];  // Higher hit-rate ones first; removed lower ones like mp4/webm for faster finds

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function getRandomCatboxUrl(maxAttempts = 200): Promise<string | null> {  // ↑ bumped to 200 – still fast (~2–4 min worst case with delays)
  const tried = new Set<string>();  // Avoid repeating exact same code.ext combo

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    // Try each extension in order until one works (or skip if combo tried)
    for (const ext of EXTENSIONS) {
      const fullKey = `\( {code}. \){ext}`;
      if (tried.has(fullKey)) continue;
      tried.add(fullKey);

      const url = `https://files.catbox.moe/${fullKey}`;

      try {
        const res = await fetch(url, { method: "HEAD", redirect: "follow" });
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("image/") || ct.includes("video/")) {
            return url;
          }
        }
      } catch {}

      // Short delay per check
      await new Promise(r => setTimeout(r, 400 + Math.random() * 400));  // 400–800ms
    }

    // Extra breath every 20 attempts
    if (attempt % 20 === 0 && attempt > 0) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return null;
}
