const { Server } = require("socket.io")
const { origin } = require("../config/urls")

const io = new Server({
  cors: {
    origin,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

module.exports = io
