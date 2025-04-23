import { Server } from "socket.io";
// import { origin } from "./config/urls";

export const socket = new Server({
  cors: {
    origin: "0.0.0.0",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

import { getBalances, wallets } from "./walletTracker";
export async function establishWSConnection() {
  console.log(`Awaiting socket connection.`);
  try {
    // Connect to the WebSocket service
    socket.on("connect", (io) => {
      console.log(
        "Connected to the TGBot WebSocket service. Requesting wallets.",
      );
      // Request wallets to track
      io.emit("REQUEST_WALLETS");
      // Listen for wallets to track
      io.on("WALLETS_TO_TRACK", (data: Record<number, string>) => {
        console.log("Received wallets to track:", data);

        // Update the wallets object with the received data
        for (const chainKey in data) {
          if (!wallets[chainKey]) {
            wallets[chainKey] = [];
          }

          for (const address of data[chainKey]!) {
            if (!wallets[chainKey]!.some((w) => w.address === address)) {
              wallets[chainKey]!.push({
                address,
              });
            }
          }
        }

        getBalances();

        console.log("Updated wallets");
      });

      // Handle disconnection
      io.on("disconnect", () => {
        console.log("Disconnected from the WebSocket service");
      });

      io.conn.on("message", (msg) => {
        if (!Object.keys(io.eventNames()).includes(msg.split('"')[1])) {
          console.log(`WARNING: Unhandled Event: ${msg}`);
        }
      });
    });
  } catch (error) {
    console.error("Error establishing WebSocket connection:", error);
  }
}
