const Wallet = require("../models/Wallet");
const User = require("../models/User");
const { createError } = require("./error");
const { findOrCreateUser } = require("./user");

async function addWallet(
  userCA,
  walletCA,
  tag,
  chainId,
  highlight,
  lastTimestamp,
  referral
) {
  try {
    let user = await findOrCreateUser(userCA, referral);
    let wallet = await Wallet.create({
      trackedByCA: userCA,
      tag,
      walletCA,
      chainId,
      highlight,
      lastTimestamp,
    });
    user.trackedWallets.push(wallet._id);
    user.save();
    return wallet;
  } catch (error) {
    createError(error);
  }
}

async function getWallets(userCA) {
  try {
    await findOrCreateUser(userCA);
    let list = await User.where("userCA")
      .equals(userCA)
      .populate("trackedWallets");
    let [{ trackedWallets }] = list;
    return trackedWallets;
  } catch (error) {
    createError(error);
  }
}

async function getAllChainWallets(chainId) {
  try {
    let wallets = await Wallet.find({ chainId: chainId });
    return wallets;
  } catch (error) {
    createError(error);
  }
}

async function deleteWallet(userCA, walletId) {
  try {
    let user = await User.findOne({ userCA: userCA });
    user.trackedWallets.pull(walletId);
    user.save();
    let wallet = await Wallet.findByIdAndDelete(walletId);
    return wallet;
  } catch (error) {
    createError(error);
  }
}

async function updateWalletTimestamp(walletCA, chainId) {
  try {
    let wallets = await Wallet.find({ walletCA: walletCA, chainId: chainId });
    for (const wallet of wallets) {
      wallet.updateTimestamp();
    }
  } catch (error) {
    createError(error);
  }
}

module.exports = {
  addWallet,
  getWallets,
  getAllChainWallets,
  deleteWallet,
  updateWalletTimestamp,
};
