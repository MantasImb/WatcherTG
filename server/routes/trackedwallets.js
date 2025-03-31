const express = require("express")
const router = express.Router()

const {
  getTrackedWallets,
  addTrackedWallet,
  deleteTrackedWallet,
} = require("../controllers/trackedWalletsController")

router
  .route("/")
  .get(getTrackedWallets)
  .post(addTrackedWallet)
  .delete(deleteTrackedWallet)

module.exports = router
