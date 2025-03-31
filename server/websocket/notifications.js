const {
  getNotifications,
  notificationSeen,
  notificationSeenAll,
  notificationDeleteAll,
} = require("../database/notification")

let connectedUsers = {}

function handleSocketConnection(socket) {
  console.log(`User connected: ${socket.id}`)
  // Validates and sends the user their notifications
  socket.on("validate", async (walletCA) => {
    connectedUsers[walletCA] = socket.id
    console.log(`User validated: ${walletCA}`)
    let notifications = await getNotifications(walletCA)
    if (notifications) {
      socket.emit("notifications", notifications)
    }
  })

  // Notification status update (seen and seenAll)
  socket.on("notificationSeen", async (notificationId) => {
    await notificationSeen(notificationId)
  })

  socket.on("notificationsSeenAll", async (walletCA) => {
    await notificationSeenAll(walletCA)
  })

  socket.on("notificationsDeleteAll", async (walletCA) => {
    await notificationDeleteAll(walletCA)
  })

  // On user disconnect, removes the user from the connectedUsers object
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
    for (let user in connectedUsers) {
      if (connectedUsers[user] === socket.id) {
        delete connectedUsers[user]
      }
    }
  })
}

module.exports = { connectedUsers, handleSocketConnection }
