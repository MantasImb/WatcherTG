const { wallets } = require("../services/walletTracker")

function serverStatus(req, res) {
  res.json({ wallets })
}

module.exports = serverStatus
