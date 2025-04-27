import { Bot } from "grammy";
import { startFn } from "./start.ts";
import { helpFn } from "./help.ts";
import { trackWalletFn } from "./trackWallet.ts";
import { untrackWalletFn } from "./untrackWallet.ts";
import { listFn } from "./list.ts";

export function setupCommands(bot: Bot) {
  // Start command
  bot.command("start", startFn);

  // Help command
  bot.command("help", helpFn);

  // Track wallet command
  bot.command("track", trackWalletFn);

  // Untrack wallet command
  bot.command("untrack", untrackWalletFn);

  // List tracked wallets command
  bot.command("list", listFn);
}
