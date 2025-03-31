const mongoose = require("mongoose")

const errorSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  message: {
    type: String,
    required: true,
  },
  errorStack: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("Error", errorSchema)
