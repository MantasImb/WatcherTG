import { Router } from "express";
import { addWallet, removeWallet } from "./walletTracker";
import { sendSepoliaEth } from "./test";

const router = Router();

// Wallet Routes
router.post("/wallet", async (req, res) => {
  const { address, chain } = req.body;
  const result = await addWallet(address, chain);

  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success", data: result });
  }
});

router.delete("/wallet", (req, res) => {
  const { address, chain } = req.body;
  const result = removeWallet(address, chain);

  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success" });
  }
});

// Test Route
router.get("/test", async (_req, res) => {
  let result = await sendSepoliaEth();
  if (result instanceof Error) {
    res.status(400).json({ status: "error", message: result.message });
  } else {
    res.status(200).json({ status: "success", data: result });
  }
});

export default router;
