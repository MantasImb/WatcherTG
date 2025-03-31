// This controller is used for testing and preview purposes
const { ethers } = require("ethers");

const { createError } = require("../database/error");
const { devWallets } = require("../config/devWallets");

// Will be used to programatically send sepolia eth between dev wallets
async function sendSepoliaEth(req, res) {
  try {
    const ammount = ethers.utils.parseEther("0.001");

    // Randomly select a dev wallet to send the eth from. 1/2 chance
    // This is an easy way to ensure that one wallet doesn't run out of funds without having to manually check
    // And delay the transaction, while also without introducing unnecessary complexity
    const { fromWallet, toWallet } = randomlySelectWallets();

    // Connect to the sepolia network
    const provider = new ethers.providers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );

    // Connect wallet
    const signer = new ethers.Wallet(fromWallet.privateKey, provider);

    // Send transaction
    const tx = await signer.sendTransaction({
      to: toWallet.address,
      value: ammount,
      gasLimit: 21000,
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
    });

    res.json(tx);
  } catch (error) {
    createError(error);
  }
}

function randomlySelectWallets() {
  const randomNumber = Math.random();
  let fromWallet;
  let toWallet;
  if (randomNumber < 0.5) {
    fromWallet = devWallets[0];
    toWallet = devWallets[1];
  } else {
    fromWallet = devWallets[1];
    toWallet = devWallets[0];
  }

  return { fromWallet, toWallet };
}

module.exports = { sendSepoliaEth };
