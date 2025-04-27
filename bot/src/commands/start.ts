import { createContextLogger } from "../utils/logger.ts";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import type { Context } from "grammy";

const logger = createContextLogger("Start Command");

export async function startFn(ctx: Context) {
  const message = `👋 Welcome to Wallet Tracker Bot!

Track your blockchain wallets and receive real-time notifications for transactions.

Available commands:
/track <address> <name> - Start tracking a wallet
/untrack <name> - Stop tracking a wallet
/list - Show your tracked wallets
/help - Show this help message`;

  await ctx.reply(message);

  // Register user in database
  try {
    if (!ctx.from) {
      throw new Error("No user information available");
    }
    const telegramId = ctx.from.id.toString();
    const userId = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
    });
    if (!userId) {
      await db.insert(users).values({
        telegramId,
        createdAt: new Date(),
      });
      logger.info("New user registered", { telegramId });
    }
  } catch (error) {
    logger.error("Error registering user", { error });
  }
}
