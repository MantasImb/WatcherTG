import { Bot, Context } from "grammy";
import { trackWallet, untrackWallet } from "./serviceManager.ts";
import { createContextLogger } from "./utils/logger";
import { db } from "./db";
import { users, wallets } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { deleteWalletByName, getUser, getUserWallets } from "./db/functions.ts";

const logger = createContextLogger("Commands");

export function setupCommands(bot: Bot) {
  // Start command
  bot.command("start", async (ctx) => {
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
  });

  // Help command
  bot.command("help", async (ctx) => {
    const message = `🔍 <b>Available Commands</b>

<b>/track</b> <code>&lt;address&gt; &lt;name&gt;</code> - Start tracking a wallet
Example: /track 0x123456789abcdef MyWallet

<b>/untrack</b> <code>&lt;name&gt;</code> - Stop tracking a wallet
Example: /untrack MyWallet

<b>/untrackall</b> - Stop tracking all wallets

<b>/list</b> - Show all your tracked wallets`;

    await ctx.reply(message, { parse_mode: "HTML" });
  });

  // Track wallet command
  bot.command("track", async (ctx) => {
    try {
      if (!ctx.from) {
        throw new Error("No user information available");
      }
      const telegramId = ctx.from.id.toString();
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
      const success = await trackWallet(userId, address, name, 11155111);

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
  });

  // Untrack wallet command
  bot.command("untrack", async (ctx) => {
    try {
      if (!ctx.from) {
        throw new Error("No user information available");
      }
      const telegramId = ctx.from.id.toString();
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
      } else {
        return ctx.reply(
          `Wallet of name "${name}" and address "${wallet.address}" removed from tracking list.`,
        );
      }
    } catch (error) {
      logger.error("Error in untrack command", { error });
      ctx.reply("Sorry, there was an error processing your request.");
    }
  });

  // List tracked wallets command
  bot.command("list", async (ctx) => {
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

      ctx.reply(message, { parse_mode: "HTML" });
    } catch (error) {
      logger.error("Error in list command", { error });
      ctx.reply("Sorry, there was an error processing your request.");
    }
  });

  // Add other commands...
}

// Helper function to validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper to shorten address for display
function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
