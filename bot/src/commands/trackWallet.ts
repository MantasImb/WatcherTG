import { createContextLogger } from "../utils/logger.ts";
import { eq, and } from "drizzle-orm";
import type { Context } from "grammy";
import { db } from "../db";
import { users, wallets } from "../db/schema";
import { config } from "../config";
import { createWallet } from "../db/functions";
import { ExtendedError } from "../utils/extendedError";

const logger = createContextLogger("Track Command");

export async function trackWalletFn(ctx: Context) {
  try {
    if (!ctx.from) {
      throw new Error("No user information available");
    }
    const telegramId = ctx.from.id.toString();
    if (!ctx.message || !ctx.message.text) throw new Error("No message");
    const message = ctx.message!.text.trim();

    const parts = message.split(" ");
    logger.info("Adding tracked wallet", { telegramId, message });

    if (parts.length < 3) {
      return ctx.reply(
        "Please provide both wallet address and name: /track <address> <name>",
      );
    }

    const address = parts[1];
    if (!address) {
      throw new Error("No address provided");
    }
    const name = parts.slice(2).join(" ");

    // Validate address format
    if (!isValidAddress(address)) {
      return ctx.reply("Invalid wallet address format.");
    }
    // Ensure user exists in db
    let user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
    });

    let userId: number;
    if (!user) {
      // Create new user
      logger.info("User doesn't exist. Creating user.", { telegramId });
      const result = await db
        .insert(users)
        .values({
          telegramId,
          createdAt: new Date(),
        })
        .returning({ id: users.id });
      if (!result[0]) throw new Error("Error creating user");

      userId = result[0].id;
    } else {
      userId = user.id;
    }

    // Check if wallet with this name already exists
    const existingWallets = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.name, name)));

    if (existingWallets.length > 0) {
      return ctx.reply(
        `You already have a wallet named "${name}". Please choose a different name.`,
      );
    }

    // Track the wallet
    const success = await recordWallet(userId, address, name, 11155111);

    if (success) {
      ctx.reply(`Now tracking wallet "${name}" (${shortenAddress(address)})`);
    } else {
      ctx.reply(
        "Sorry, there was an error tracking this wallet. Please try again.",
      );
    }
  } catch (error) {
    logger.error("Error in track command", { error });
    ctx.reply("Sorry, there was an error processing your request.");
  }
}

export async function recordWallet(
  userId: number,
  address: string,
  name: string,
  chain: number,
) {
  try {
    logger.info("Creating a new wallet", { userId, address, name, chain });
    const result = await createWallet(userId, name, address, chain);
    if (!result)
      throw new ExtendedError("Failed creating new wallet in the db", {
        userId,
        address,
        name,
        chain,
      });
    logger.info("Sending new wallet to tracking server", {
      userId,
      address,
      name,
      chain,
    });
    const response = await fetch(`${config.TRACKING_SERVER_URL}/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chain, address }),
    });

    if (response.status !== 200)
      throw new ExtendedError(
        "Failed sending a new added wallet to the tracking server",
        { userId, name, address, chain, response },
      );
    return true;
  } catch (error) {
    logger.error(error instanceof Error ? error : "Error while adding wallet");
  }
}

// Helper function to validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
// Helper to shorten address for display
function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
