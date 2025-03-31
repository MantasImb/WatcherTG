const User = require("../models/User");
const Notification = require("../models/Notification");
const { createError } = require("./error");

async function addNotification(userCA, notification) {
  try {
    let user = await User.findOne({ userCA });
    let newNotification = await Notification.create({
      ...notification,
    });
    // remove oldest notification if user has more than 50 notifications
    // BUG: When two notifications are added on the same block, it errors out
    // if (user.notifications.length >= 50) {
    //   await Notification.findOneAndDelete({
    //     _id: user.notifications[0],
    //   })
    //   user.notifications.shift()
    // }
    user.notifications.push(newNotification._id);
    user.save();
    return newNotification._id;
  } catch (error) {
    createError(error);
  }
}

async function getNotifications(userCA) {
  try {
    let list = await User.where("userCA")
      .equals(userCA)
      .populate("notifications");

    // If the user does not exist, return an empty array
    if (!list.length) return [];

    let [{ notifications }] = list;
    if (notifications) {
      return notifications.reverse();
    } else {
      return [];
    }
  } catch (error) {
    createError(error);
  }
}

async function notificationSeenAll(userCA) {
  try {
    let user = await User.findOne({ userCA }).populate("notifications");
    user.notifications.forEach((notification) => {
      notification.seen = true;
      notification.save();
    });
  } catch (error) {
    createError(error);
  }
}

async function notificationSeen(notificationId) {
  try {
    let notification = await Notification.findById(notificationId);
    notification.seen = true;
    notification.save();
  } catch (error) {
    createError(error);
  }
}

// delete all user notifications
async function notificationDeleteAll(userCA) {
  try {
    const user = await User.findOne({ userCA }).populate("notifications");
    user.notifications.forEach(async (notificationId) => {
      await Notification.findByIdAndDelete(notificationId);
    });
    user.notifications = [];
    user.save();
  } catch (error) {
    createError(error);
  }
}

module.exports = {
  addNotification,
  getNotifications,
  notificationSeenAll,
  notificationSeen,
  notificationDeleteAll,
};
