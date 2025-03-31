const mongoose = require("mongoose")

const walletSchema = new mongoose.Schema({
  tag: String,
  walletCA: { type: String, required: true, lowercase: true },
  trackedByCA: { type: String, required: true, lowercase: true },
  chainId: Number,
  highlight: String,
  lastTimestamp: Number,
  dateAdded: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
})

walletSchema.methods.updateTimestamp = function () {
  this.lastTimestamp = Date.now() / 1000
  return this.save()
}

module.exports = mongoose.model("Wallet", walletSchema)
