import type { Context } from "grammy";
import { createContextLogger } from "../utils/logger";
import { getUser, getUserWallets } from "../db/functions";

const logger = createContextLogger("List Command");

export async function listFn(ctx: Context) {
  try {
    if (!ctx.from) {
      throw new Error("No user information available");
    }
    const telegramId = ctx.from.id;

    // Get user ID
    const userResult = await getUser(telegramId.toString());

    if (!userResult) {
      return ctx.reply("You haven't tracked any wallets yet.");
    }

    const userId = userResult.id;

    // Get tracked wallets
    const trackedWallets = await getUserWallets(userId);

    if (trackedWallets.length === 0) {
      return ctx.reply("You haven't tracked any wallets yet.");
    }

    // Format response
    let message = "🔍 <b>Your tracked wallets:</b>\n\n";

    trackedWallets.forEach((wallet, index) => {
      message += `${index + 1}. <b>${wallet.name}</b>: <code>${wallet.address}</code>\n`;
    });

    return ctx.reply(message, { parse_mode: "HTML" });
  } catch (error) {
    logger.error("Error in list command", { error });
    return ctx.reply("Sorry, there was an error processing your request.");
  }
}
