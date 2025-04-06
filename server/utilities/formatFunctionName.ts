import type { EtherscanTransaction } from "../scanners";

export default function formatFunctionName(item: EtherscanTransaction) {
  let method = item.methodId;
  if (method == "0x") method = "Transfer";
  if (item.functionName && item.functionName.length && item.functionName[0]) {
    let capitalized =
      item.functionName[0].toUpperCase() + item.functionName.substring(1);
    let split = capitalized.split("(");
    if (!split[0]) return method;
    method = split[0].replace(/([A-Z])/g, " $1").trim();
  }
  return method;
}
