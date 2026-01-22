// src/index.ts (modified for Catbox)
import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { getRandomCatboxUrl } from "./utils";  // ← new function

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

const EXTENSIONS = ["png", "jpg", "webp", "gif", "webm"];

let catboxRoulette = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Fetch a random working Catbox.moe link.",
  displayDescription: "Fetch a random working Catbox.moe link.",
  options: [],  // no options needed
  execute: async function (args, ctx) {
    const url = await getRandomCatboxUrl();

    if (!url) {
      sendBotMessage(ctx.channel.id, "Couldn't find a valid link after many tries. Try again later.");
      return;
    }

    const fixNonce = Date.now().toString();
    messageUtil.sendMessage(ctx.channel.id, { content: url }, void 0, { nonce: fixNonce });
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default catboxRoulette;
