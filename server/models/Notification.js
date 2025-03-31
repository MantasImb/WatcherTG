const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  highlight: String,
  walletCA: { type: String, required: true, lowercase: true },
  chainId: Number,
  direction: String,
  hash: String,
  from: String,
  to: String,
  value: Number,
  method: String,
  timestamp: { type: Number, required: true },
  seen: { type: Boolean, default: false },
})

module.exports = mongoose.model("Notification", notificationSchema)
