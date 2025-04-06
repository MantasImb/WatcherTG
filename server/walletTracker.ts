import ethers from "ethers";
import { fetchHistory, getLatestTimestamp } from "./scanners";
import { io } from "./ws";

import { sepoliaSocket } from "./config/urls";

import formatFunctionName from "./utilities/formatFunctionName";

// using dev wallets for now to develop faster
import { devWallets } from "./config/devWallets";

import { type EtherscanTransaction } from "./scanners";

type Wallet = {
  address: string;
  balance?: ethers.BigNumberish;
};

// Could be better performance-wise to use Map with Set for the wallets object
export let wallets: Record<number, Wallet[]> = {
  11155111: [
    { address: devWallets[0]!.address },
    { address: devWallets[1]!.address },
  ], // sepolia
  // below are commented out because the project is sunset and is only used as a showcase
  // 1: [], // mainnet
  // 56: [], // binance
  // 42161: [], // arbitrum
  // 10: [], // optimism
};

export let sepoliaProvider: ethers.providers.JsonRpcProvider;

// fetches all the balances on all the wallets on all the chains on the wallets object
async function getBalances() {
  for (const chain in wallets) {
    try {
      const provider = getProvider(chain);
      const chainWallets = wallets[chain];

      if (!chainWallets) {
        console.error(`No wallets found for chain: ${chain}`);
        continue;
      }

      await fetchAndSetBalances(chainWallets, provider);
      console.log("Balances fetched for chain: " + chain);
    } catch (error) {
      console.error(error as Error);
    }
  }
}

function getProvider(chain: string): ethers.providers.JsonRpcProvider {
  let provider!: ethers.providers.JsonRpcProvider;
  if (chain === "11155111") provider = sepoliaProvider;
  // if (chain === "1") provider = mainnetProvider;
  // if (chain === "56") provider = binanceProvider;
  // if (chain === "42161") provider = arbitrumProvider;
  // if (chain === "10") provider = optimismProvider;
  if (!provider) throw new Error("Provider not found for chain: " + chain);
  return provider;
}

async function fetchAndSetBalances(
  chainWallets: any[],
  provider: ethers.providers.JsonRpcProvider,
) {
  const promises = chainWallets.map((wallet) =>
    provider.getBalance(wallet.address),
  );

  const results = await Promise.all(promises);

  for (let i = 0; i < results.length; i++) {
    chainWallets[i].balance = results[i];
  }
}

// checks if the balance has changed and if so, fetches the transactions after a 15s delay
// (waits for the transactions to be indexed by etherscan)
// this is a workaround for the fact that etherscan does not provide a websocket API
// then updates the balance in the wallets object and sends the notifications
async function balanceChangedDelayed(
  wallet: Wallet,
  blockNumber: number,
  provider: ethers.providers.JsonRpcProvider,
  chain: number,
) {
  try {
    const newBalance = await provider.getBalance(wallet.address);
    // return if the balance has not changed
    if (!wallet.balance) {
      console.log(wallet);
      throw new Error(`Balance not found for ${wallet.address}`);
    }
    if (newBalance.eq(wallet.balance)) return;

    setTimeout(async () => {
      let txs = await fetchHistory(wallet.address, chain, blockNumber);
      if (!txs) throw new Error("Failed to fetch transactions");
      console.log(
        `Balance for wallet ${wallet.address} has changed on block ${blockNumber}. Fetching transactions.`,
      );
      handleNotifications(wallet, chain, txs);
    }, 30 * 1000);

    wallet.balance = newBalance;
  } catch (error) {
    console.error(error as Error);
  }
}

interface ExtraTransactionValues {
  direction: string;
}

export type Notification = {
  walletCA: string;
  chainId: number;
  direction: string;
  from: string;
  to: string;
  value: string;
  method: string;
  timestamp: string;
  hash: string;
};

async function handleNotifications(
  wallet: Wallet,
  chainId: number,
  transactions: EtherscanTransaction[],
) {
  for (const transaction of transactions) {
    let extendedTransaction = setToOrFromTransaction(transaction, wallet);

    let method = formatFunctionName(extendedTransaction);

    let notification: Notification = {
      walletCA: wallet.address,
      chainId: chainId,
      direction: extendedTransaction.direction,
      from: extendedTransaction.from,
      to: extendedTransaction.to,
      value: extendedTransaction.value,
      method: method,
      timestamp: extendedTransaction.timeStamp,
      hash: extendedTransaction.hash,
    };

    io.emit("transaction", notification);
  }
}

function setToOrFromTransaction(
  transaction: EtherscanTransaction,
  wallet: Wallet,
): EtherscanTransaction & ExtraTransactionValues {
  const transactionWithExtraValues = transaction as EtherscanTransaction &
    ExtraTransactionValues;
  if (transaction.to === wallet.address) {
    transactionWithExtraValues.direction = "in";
  } else {
    transactionWithExtraValues.direction = "out";
  }
  return transactionWithExtraValues;
}

export async function addWallet(address: string, chain: number) {
  if (wallets[chain] === undefined) {
    return Error("Chain not found");
  }
  // check if has balance
  let provider = getProvider(String(chain));
  let balance = await provider.getBalance(address);
  if (!balance) return "Wallet hasn't been found";

  wallets[chain].push({ address, balance });
  let latestTimetimestamp = await getLatestTimestamp(address, chain);
  return { latestTimetimestamp, balance };
}

export function removeWallet(address: string, chain: number) {
  if (wallets[chain] === undefined) {
    return Error("Chain not found");
  }
  wallets[chain] = wallets[chain].filter(
    (wallet) => wallet.address !== address,
  );
}

async function main() {
  try {
    sepoliaProvider = new ethers.providers.JsonRpcProvider(sepoliaSocket);
    // below are commented out because the project is sunset and is only used as a showcase
    // mainnetProvider = new ethers.providers.JsonRpcProvider(mainnetSocket)
    // binanceProvider = new ethers.providers.JsonRpcProvider(binanceSocket)
    // arbitrumProvider = new ethers.providers.JsonRpcProvider(arbitrumSocket)
    // optimismProvider = new ethers.providers.JsonRpcProvider(optimismSocket)

    // await getAllWallets();
    await getBalances();

    // add a new block event listener for each chain
    for (const chain in wallets) {
      let provider = getProvider(chain);
      provider.on("block", (blockNumber) => {
        for (const wallet of wallets[chain]!) {
          balanceChangedDelayed(wallet, blockNumber, provider, Number(chain));
        }
      });
      console.log("Listening for blocks on chain: " + chain);
    }
  } catch (error) {
    console.error(error as Error);
    main();
  }
}

main();
