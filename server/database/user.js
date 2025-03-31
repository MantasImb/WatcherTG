const User = require("../models/User")
const { createError } = require("./error")

async function createUser(userCA, referral) {
  try {
    const user = await User.create({
      userCA,
      referral,
    })
    return user
  } catch (error) {
    createError(error)
  }
}

async function findOrCreateUser(userCA, referral) {
  try {
    const userFound = await User.findOne({
      userCA,
    })
    if (userFound) {
      return userFound
    } else {
      let user = await createUser(userCA, referral)
      return user
    }
  } catch (error) {
    createError(error)
  }
}

async function getUsersByWallet(walletCA) {
  try {
    let users = await User.find({ trackedWallets: walletCA })
    return users
  } catch (error) {
    createError(error)
  }
}

module.exports = {
  findOrCreateUser,
  getUsersByWallet,
}
