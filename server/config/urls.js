require("dotenv").config();

const sepoliaSocket = process.env.sepoliaurl;
// below are commented out because the project is sunset and is only used as a showcase
// const mainnetSocket = process.env.etherurl
// const binanceSocket = "https://bsc-dataseed.binance.org"
// const arbitrumSocket = "https://rpc.ankr.com/arbitrum"
// const optimismSocket = process.env.optimismurl
const dbUrl = process.env.dburl;
const origin = process.env.origin;

module.exports = {
  sepoliaSocket,
  // below are commented out because the project is sunset and is only used as a showcase
  // mainnetSocket,
  // binanceSocket,
  // arbitrumSocket,
  // optimismSocket,
  dbUrl,
  origin,
};
