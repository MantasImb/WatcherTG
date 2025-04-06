import fetch from "node-fetch";
import {
  etherscanKey,
  //   bscscanKey,
  //   arbiscanKey,
  //   optimismscanKey,
} from "./config/apiKeys";

interface EtherscanResponse {
  status: string;
  message: string;
  result: EtherscanTransaction[];
}

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

// async function bscScanFetch(walletCA: string, block = 0) {
//   let response = await fetch(
//     `https://api.bscscan.com/api?module=account&action=txlist&address=${walletCA}&startblock=${block}&endblock=99999999&apikey=${bscscanKey}`,
//   );
//   let result = await response.json();
//   return result.result;
// }

async function ethScanFetch(walletCA: string, block = 0) {
  let response = await fetch(
    `https://api.etherscan.io/api?module=account&action=txlist&address=${walletCA}&startblock=${block}&endblock=99999999&apikey=${etherscanKey}`,
  );
  let result: EtherscanResponse = await response.json();
  return result.result;
}

async function sepoliaScanFetch(walletCA: string, block = 0) {
  let response = await fetch(
    `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${walletCA}&startblock=${block}&endblock=99999999&apikey=${etherscanKey}`,
  );
  let result: EtherscanResponse = await response.json();
  return result.result;
}

// async function arbitrumScanFetch(walletCA: string, block = 0) {
//   let response = await fetch(
//     `https://api.arbiscan.io/api?module=account&action=txlist&address=${walletCA}&startblock=${block}&endblock=99999999&apikey=${arbiscanKey}`,
//   );
//   let result = await response.json();
//   return result.result;
// }
//
// async function optimismScanFetch(walletCA: string, block = 0) {
//   let response = await fetch(
//     `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${walletCA}&startblock=${block}&endblock=99999999&apikey=${optimismscanKey}`,
//   );
//   let result = await response.json();
//   return result.result;
// }

export async function fetchHistory(
  walletCA: string,
  chain: number,
  block?: number,
) {
  try {
    let response;
    if (chain == 1) response = await ethScanFetch(walletCA, block || undefined);
    if (chain == 11155111)
      response = await sepoliaScanFetch(walletCA, block || undefined);
    // if (chain == 56)
    //   response = await bscScanFetch(walletCA, block || undefined);
    // if (chain == 42161)
    //   response = await arbitrumScanFetch(walletCA, block || undefined);
    // if (chain == 10)
    //   response = await optimismScanFetch(walletCA, block || undefined);

    let history = response;
    if (!history) return [];
    return history.reverse();
  } catch (error) {
    console.log(error as Error);
  }
}

export async function getLatestTimestamp(walletCA: string, chainId: number) {
  let history = await fetchHistory(walletCA, chainId);
  if (!history || !history[0]?.timeStamp) return "0";
  return history[0].timeStamp;
}
