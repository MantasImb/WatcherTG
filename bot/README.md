# Telegram Transaction Notification Bot

A Telegram bot that listens to blockchain transactions via WebSocket
and notifies users when their tracked wallets make transactions.

## Project Structure

```
telegram-bot/
├── modules/
│   ├── userManager.ts      # User management functions
│   ├── walletManager.ts   # Wallet-related functions
│   ├── notificationManager.ts # Notification-related functions
│   └── dbManager.ts       # Database interactions
├── services/
│   └── websocket.ts      # WebSocket client setup
├── utils/
│   └── helpers.ts          # Helper functions (validation, formatting, etc.)
└── index.ts               # Main bot logic
```

## Available Commands

1. **/start**

   - _Description_: Initialize the bot and display a welcome message.
   - _Usage_: `/start`

2. **/help**

   - _Description_: Display a list of available commands and their usage.
   - _Usage_: `/help`

3. **/track `wallet_address` `name`**

   - _Description_: Start tracking a wallet by its address and assign a user-friendly name.
   - _Example_: `/track 0x1234567890abcdef MyWallet`

4. **/untrack `name`**

   - _Description_: Stop tracking a wallet by its user-specified name.
   - _Example_: `/untrack MyWallet`

5. **/untrackall**

   - _Description_: Stop tracking all wallets at once.
   - _Usage_: `/untrackall`

6. **/list**

   - _Description_: Display all wallets currently being tracked, including their names.
   - _Usage_: `/list`

# Tech stack
