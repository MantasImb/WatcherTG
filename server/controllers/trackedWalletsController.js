const { getWallets, addWallet, deleteWallet } = require("../database/wallet");
const { createError } = require("../database/error");
const { wallets, sepoliaProvider } = require("../services/walletTracker");
const { getLatestTimestamp } = require("../external-api/scanners");

async function getTrackedWallets(req, res) {
  try {
    let { userCA } = req.query;
    let wallets = await getWallets(userCA);
    let updatedWallets = [];
    for (const wallet of wallets) {
      // let balance = await getBalance(wallet.walletCA, wallet.chainId)
      let updatedWallet = {
        tag: wallet.tag,
        walletCA: wallet.walletCA,
        chainId: wallet.chainId,
        highlight: wallet.highlight,
        lastTimestamp: wallet.lastTimestamp,
        id: wallet._id,
      };
      updatedWallets.push(updatedWallet);
    }
    res.json(updatedWallets);
  } catch (error) {
    createError(error);
    res.json(error);
  }
}

async function addTrackedWallet(req, res) {
  try {
    let { body } = req;
    console.log(body);
    let latestTimestamp = await getLatestTimestamp(body.address, body.chainId);
    let wallet = await addWallet(
      body.currentAccount,
      body.address,
      body.tag,
      body.chainId,
      body.highlight,
      latestTimestamp
    );
    // Adds wallet to the wallets object
    let index = wallets[body.chainId].findIndex(
      (item) => item.walletCA === body.address
    );

    if (index > -1) {
      wallets[body.chainId][index].users.push({
        userCA: body.currentAccount,
        highlight: body.highlight,
        tag: body.tag,
      });
    } else {
      let provider;
      if (body.chainId == "11155111") provider = sepoliaProvider;
      // if (body.chainId == "1") provider = mainnetProvider;
      // if (body.chainId == "56") provider = binanceProvider;
      // if (body.chainId == "42161") provider = arbitrumProvider;
      // if (body.chainId == "10") provider = optimismProvider;

      let balance = await provider.getBalance(body.address);

      wallets[body.chainId].push({
        walletCA: body.address,
        users: [
          {
            userCA: body.currentAccount,
            highlight: body.highlight,
            tag: body.tag,
          },
        ],
        balance: balance,
      });
    }
    res.json(wallet);
  } catch (error) {
    createError(error);
    res.sendStatus(404);
  }
}

async function deleteTrackedWallet(req, res) {
  try {
    let { userCA, id } = req.query;
    let wallet = await deleteWallet(userCA, id);
    // delete wallet from the wallets object
    let index = wallets[wallet.chainId].findIndex(
      (item) => item.walletCA === wallet.walletCA
    );
    if (index > -1) {
      let userIndex = wallets[wallet.chainId][index].users.findIndex(
        (item) => item.userCA === userCA
      );
      if (userIndex > -1) {
        wallets[wallet.chainId][index].users.splice(userIndex, 1);
      }
    }
    if (wallets[wallet.chainId][index].users.length === 0) {
      wallets[wallet.chainId].splice(index, 1);
    }
    res.sendStatus(200);
  } catch (error) {
    createError(error);
    res.sendStatus(404);
  }
}

module.exports = {
  getTrackedWallets,
  addTrackedWallet,
  deleteTrackedWallet,
};
