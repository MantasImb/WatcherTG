function formatFunctionName(item) {
  let method = item.methodId;
  if (method == "0x") method = "Transfer";
  if (item.functionName && item.functionName.length) {
    let capitalized =
      item.functionName[0].toUpperCase() + item.functionName.substring(1);
    method = capitalized
      .split("(")[0]
      .replace(/([A-Z])/g, " $1")
      .trim();
  }
  return method;
}

module.exports = formatFunctionName;
