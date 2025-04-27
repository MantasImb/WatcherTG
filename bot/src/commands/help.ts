import type { Context } from "grammy";

export async function helpFn(ctx: Context) {
  const message = `🔍 <b>Available Commands</b>

<b>/track</b> <code>&lt;address&gt; &lt;name&gt;</code> - Start tracking a wallet
Example: /track 0x123456789abcdef MyWallet

<b>/untrack</b> <code>&lt;name&gt;</code> - Stop tracking a wallet
Example: /untrack MyWallet

<b>/untrackall</b> - Stop tracking all wallets

<b>/list</b> - Show all your tracked wallets`;

  await ctx.reply(message, { parse_mode: "HTML" });
}
