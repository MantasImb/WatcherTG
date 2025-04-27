import { Bot } from "grammy";
import { config } from "./src/config.ts";
import { initializeNotifications } from "./src/notificationManager.ts";
import { setupCommands } from "./src/commands";
import { logger } from "./src/utils/logger.ts";

async function startBot() {
  try {
    // Initialize the bot
    const bot = new Bot(config.BOT_TOKEN);

    // Set up command handlers
    setupCommands(bot);
    logger.info("Bot commands initialized");

    // Set up notification handling
    initializeNotifications(bot);
    logger.info("Notification system initialized");

    // Start the bot
    await bot.start();
    logger.info("Bot started successfully");

    // Handle graceful shutdown
    const stopBot = () => {
      bot.stop();
      process.exit();
    };

    process.once("SIGINT", stopBot);
    process.once("SIGTERM", stopBot);
  } catch (error) {
    logger.error("Failed to start bot", { error });
    process.exit(1);
  }
}

startBot();
