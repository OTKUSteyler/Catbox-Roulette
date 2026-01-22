const EXTENSIONS = ["png", "jpg", "webp", "gif", "webm", "mp4"];

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function getRandomCatboxUrl(maxAttempts = 100): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random 6-char code
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }

    // Pick random extension
    const ext = EXTENSIONS[Math.floor(Math.random() * EXTENSIONS.length)];
    const url = `https://files.catbox.moe/\( {code}. \){ext}`;

    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        mode: "no-cors", // Helps avoid some CORS issues in plugin env
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
          return url;
        }
      }
    } catch {
      // Ignore network/timeout errors
    }

    // Polite random delay: 500–1200 ms between attempts
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 700));
  }

  return null; // Failed after max attempts → no loop forever
}
