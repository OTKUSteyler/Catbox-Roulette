export const EXTENSIONS = ["png", "jpg", "webp", "gif"]; // Top hit-rate ones

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function getRandomCatboxUrl(maxAttempts = 300) {
  const tried = new Set();

  for (let i = 0; i < maxAttempts; i++) {
    let code = "";
    for (let j = 0; j < 6; j++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    for (const ext of EXTENSIONS) {
      const key = `\( {code}. \){ext}`;
      if (tried.has(key)) continue;
      tried.add(key);

      const url = `https://files.catbox.moe/${key}`;

      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok && (res.headers.get("content-type")?.includes("image/") || res.headers.get("content-type")?.includes("video/"))) {
          return url;
        }
      } catch {}

      await new Promise(r => setTimeout(r, 500 + Math.random() * 500)); // 0.5–1s
    }
  }
  return null;
}
