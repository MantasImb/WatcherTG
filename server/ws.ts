import { Server } from "socket.io";
// import { origin } from "./config/urls";

export const io = new Server({
  cors: {
    origin: "0.0.0.0",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

import { type Wallet, wallets } from "./walletTracker";
export async function establishWSConnection() {
  try {
    // Connect to the WebSocket service
    io.on("connect", () => {
      console.log("Connected to the TGBot WebSocket service");

      // Request wallets to track
      io.emit("requestWallets");
    });

    // Listen for wallets to track
    io.on("walletsToTrack", (data: { chain: number; wallets: Wallet[] }) => {
      console.log("Received wallets to track:", data);

      // Update the wallets object with the received data
      if (!wallets[data.chain]) {
        wallets[data.chain] = [];
      }

      for (const wallet of data.wallets) {
        if (!wallets[data.chain]!.some((w) => w.address === wallet.address)) {
          wallets[data.chain]!.push(wallet);
        }
      }

      console.log("Updated wallets:", wallets);
    });

    // Handle disconnection
    io.on("disconnect", () => {
      console.log("Disconnected from the WebSocket service");
    });
  } catch (error) {
    console.error("Error establishing WebSocket connection:", error);
  }
}
