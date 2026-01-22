import { registerCommand } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { getRandomCatboxUrl } from "./utils";

const { sendBotMessage } = findByProps("sendBotMessage");
const messageUtil = findByProps("sendMessage", "editMessage");

let catboxCommand = registerCommand({
  name: "catbox",
  displayName: "Catbox Roulette",
  description: "Fetches a random valid Catbox.moe link",
  displayDescription: "Fetches a random valid Catbox.moe link",
  options: [],
  execute: async (_, ctx) => {
    const url = await getRandomCatboxUrl();

    if (!url) {
      sendBotMessage(ctx.channel.id, "No valid link found after attempts. Try again.");
      return;
    }

    const nonce = Date.now().toString();
    messageUtil.sendMessage(ctx.channel.id, { content: url }, undefined, { nonce });
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
});

export default catboxCommand;
