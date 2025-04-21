import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, wallets } from "./db/schema";
import { webSocketClient, type TransactionData } from "./services/websocket";
import { createContextLogger, ExtendedError } from "./utils/logger";
import { createWallet, getWalletEntries } from "./db/functions";
import type { Bot } from "grammy";
import { fetch } from "bun";
import { config } from "./config";

const logger = createContextLogger("Notifications");

/**
 * Initialize the notification system
 */
export function initializeNotifications(bot: Bot) {
  const transactionHandler = createTransactionHandler(bot);
  // Register the transaction handler
  webSocketClient.setNotificationHandler(transactionHandler);
  logger.info("Transaction notification handler registered");
}

/**
 * Process incoming transaction notifications
 */
function createTransactionHandler(bot: Bot) {
  return async function handleTransaction(
    transaction: TransactionData,
  ): Promise<void> {
    try {
      logger.info("Transaction received!", {
        hash: transaction.hash,
        wallet: transaction.walletCA,
      });

      // 1. Find users tracking this wallet
      const wallets = await getWalletEntries(transaction.walletCA);

      // 2. Send notification to each user
      for (const wallet of wallets) {
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.id, wallet.userId),
          });

          // Create message
          const message =
            `New transaction for wallet *${wallet.name}*\n` +
            `Hash: ${transaction.hash}`;

          if (!user) throw new ExtendedError("Couldn't find user", wallet);

          // Send to user via Telegram
          // Replace with your actual bot.sendMessage call
          await bot.api.sendMessage(user.telegramId, message);

          logger.info("Notification sent", { userId: user.id });
        } catch (error) {
          logger.error(
            error instanceof Error
              ? error
              : "Failed sending notification to user",
          );
        }
      }
    } catch (error) {
      logger.error("Error processing transaction", { error });
    }
  };
}

export async function trackWallet(
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

// Example of untracking a wallet
export function untrackWallet(userId: number, address: string) {}
