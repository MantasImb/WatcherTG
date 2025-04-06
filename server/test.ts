// This controller is used for testing and preview purposes
import { ethers } from "ethers";
import { devWallets } from "./config/devWallets";

// Will be used to programatically send sepolia eth between dev wallets
export async function sendSepoliaEth() {
  try {
    const amount = ethers.utils.parseEther("0.001");

    // Randomly select a dev wallet to send the eth from. 1/2 chance
    // This is an easy way to ensure that one wallet doesn't run out of funds without having to manually check
    // And delay the transaction, while also without introducing unnecessary complexity
    const { fromWallet, toWallet } = randomlySelectWallets();

    // Connect to the sepolia network
    const provider = new ethers.providers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com",
    );

    // Connect wallet
    const signer = new ethers.Wallet(fromWallet!.privateKey, provider);

    // Send transaction
    const tx = await signer.sendTransaction({
      to: toWallet!.address,
      value: amount,
      gasLimit: 21000,
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
    });
    console.log(tx);
    return tx;
  } catch (error) {
    console.error(error as Error);
    return error;
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
