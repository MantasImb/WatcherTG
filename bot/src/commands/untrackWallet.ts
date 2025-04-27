import type { Context } from "grammy";
import { createContextLogger, ExtendedError } from "../utils/logger";
import { deleteWalletByName } from "../db/functions";
import { config } from "../config";

const logger = createContextLogger("Untrack Command");

export async function untrackWalletFn(ctx: Context) {
  try {
    if (!ctx.from) {
      throw new Error("No user information available");
    }
    const telegramId = ctx.from.id.toString();

    if (!ctx.message || !ctx.message.text) throw new Error("No message text");
    const message = ctx.message!.text.trim();

    const parts = message.split(" ");
    logger.info("Untracking wallet", { telegramId, message });

    if (parts.length != 2 || !parts[1]) {
      return ctx.reply("Please follow this format: /untrack <name>");
    }

    const name = parts[1];

    const [wallet] = await deleteWalletByName(name, telegramId);

    if (!wallet) {
      return ctx.reply(`Wallet of name "${name}" not found.`);
    }

    removeRecord(wallet.address);

    return ctx.reply(
      `Wallet of name "${name}" and address "${wallet.address}" removed from tracking list.`,
    );
  } catch (error) {
    logger.error("Error in untrack command", { error });
    ctx.reply("Sorry, there was an error processing your request.");
  }
}

async function removeRecord(address: string) {
  try {
    logger.info("Deleting wallet from the service track list", { address });
    const response = await fetch(`${config.TRACKING_SERVER_URL}/wallet`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    if (response.status != 200)
      throw new ExtendedError("Error removing wallet in the service", {
        address,
        response,
      });
    return true;
  } catch (error) {
    logger.error("Error removing wallet from the service", { error });
  }
}
