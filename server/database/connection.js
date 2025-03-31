const mongoose = require("mongoose")

async function connectDB(url) {
  mongoose.connect(url).then(() => console.log("DB connected"))
}

module.exports = connectDB
