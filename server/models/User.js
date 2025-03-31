const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  userCA: { type: String, required: true },
  trackedWallets: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Wallet" }],
  email: String,
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  referral: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  notifications: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Notification" }],
})

module.exports = mongoose.model("User", userSchema)
