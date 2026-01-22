import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { getRandomCatboxUrl } from "./utils";

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

let catboxRoulette = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Get a random valid Catbox.moe file link",
  displayDescription: "Get a random valid Catbox.moe file link",
  options: [],
  execute: async (args, ctx) => {
    const url = await getRandomCatboxUrl();

    if (!url) {
      sendBotMessage(ctx.channel.id, "Couldn't find a valid link after many attempts. Try again later.");
      return;
    }

    // Send as message (slash command compatible fix)
    const nonce = Date.now().toString();
    messageUtil.sendMessage(ctx.channel.id, { content: url }, undefined, { nonce });
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default catboxRoulette;
