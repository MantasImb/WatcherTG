import { io, Socket } from "socket.io-client";
import { config } from "../config";
import { createContextLogger } from "../utils/logger";
import { getWalletsToTrack } from "../db/functions";

// Create context-specific logger
const logger = createContextLogger("WebSocket");

// Types
interface WalletData {
  address: string;
  userId: number;
  name?: string;
}

interface TransactionData {
  walletCA: string;
  chainId: number;
  direction: string;
  from: string;
  to: string;
  value: string;
  method: string;
  timestamp: string;
  hash: string;
}

// Module variables
let socket: Socket | null = null;
let pingInterval: NodeJS.Timeout | null = null;

// Function to handle notifications (to be defined externally)
let notificationHandler: (transaction: TransactionData) => Promise<void> | void;

// Initialize socket connection
const initSocket = (): void => {
  try {
    logger.info("Initializing WebSocket connection");
    socket = io(config.TRACKING_SERVER_URL);

    setupEventListeners();
  } catch (error) {
    logger.error("Failed to initialize WebSocket connection", { error });
  }
};

// Setup core event listeners
const setupEventListeners = (): void => {
  if (!socket) return;

  socket.on("connect", () => {
    logger.info("Connected to blockchain server");
  });

  socket.on("disconnect", (reason) => {
    logger.warn(`Disconnected: ${reason}`);
  });

  socket.on("connect_error", (error) => {
    logger.error("Connection error", { error });
  });

  socket.on("WALLET_STATUS_UPDATE", (data) => {
    logger.info("Wallet status updated", { wallet: data.address });
    logger.debug("Wallet status update details", data);
  });

  // Core notification handler - this is the main functionality
  socket.on("NEW_TRANSACTION", (transaction: TransactionData) => {
    logger.info("New transaction detected", {
      hash: transaction.hash,
      wallet: transaction.walletCA,
    });

    // Forward to the notification handler if defined
    if (notificationHandler) {
      try {
        notificationHandler(transaction);
      } catch (error) {
        logger.error("Error in notification handler", { error, transaction });
      }
    } else {
      logger.warn("No notification handler registered for transaction", {
        transactionHash: transaction.hash,
      });
    }
  });

  socket.on("ERROR", (error) => {
    logger.error("Server reported error", { error });
  });

  socket.on("REQUEST_WALLETS", async () => {
    try {
      logger.info(
        "Received wallet data request from the server. Sending wallets.",
      );
      const result = await getWalletsToTrack();
      sendMessage("WALLETS_TO_TRACK", result);
    } catch (error) {
      logger.error(error as Error);
    }
  });
};

// Send message
const sendMessage = (eventType: string, payload?: any): void => {
  if (!socket || !socket.connected) {
    logger.warn("Cannot send message, socket not connected", { eventType });
    return;
  }

  try {
    socket.emit(eventType, payload);
    logger.debug(`Sent ${eventType} message`, payload);
  } catch (error) {
    logger.error(`Error sending ${eventType} message`, { error, payload });
  }
};

// Reconnect to server
const reconnect = (): void => {
  logger.info("Reconnecting to WebSocket server");
  if (socket) {
    socket.disconnect();
  }
  initSocket();
};

// Check connection status
const isConnected = (): boolean => {
  return !!socket?.connected;
};

// Disconnect from server
const disconnect = (): void => {
  logger.info("Disconnecting from WebSocket server");
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Register notification handler
const setNotificationHandler = (
  handler: (transaction: TransactionData) => Promise<void> | void,
): void => {
  notificationHandler = handler;
  logger.info("Notification handler registered");
};

// Initialize the WebSocket on module import
initSocket();

// Export the public API
export const webSocketClient = {
  sendMessage,
  isConnected,
  disconnect,
  reconnect,
  setNotificationHandler,
};

// Export TransactionData type for the notification handler
export type { TransactionData, WalletData };
