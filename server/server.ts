import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

// Websocket
import { io } from "./ws";
import { createServer } from "http";
const httpServer = createServer(app);
io.attach(httpServer);

// Service
import { addWallet, removeWallet } from "./walletTracker";
import { sendSepoliaEth } from "./test";

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Wallet Routes
app.post("/wallet", async (req, res) => {
  const { address, chain } = req.body;
  const result = await addWallet(address, chain);

  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success", data: result });
  }
});

app.delete("/wallet", (req, res) => {
  const { address, chain } = req.body;
  const result = removeWallet(address, chain);

  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success" });
  }
});

// Test Route
app.get("/test", async (_req, res) => {
  let result = await sendSepoliaEth();
  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success", data: result });
  }
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
