import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";
import { webSocketClient, type TransactionData } from "./services/websocket";
import { createContextLogger, ExtendedError } from "./utils/logger";
import { getWalletEntries } from "./db/functions";
import type { Bot } from "grammy";

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
