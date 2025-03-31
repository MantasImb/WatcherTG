// This is a list of dev wallets that can be used for testing and preview purposes
require("dotenv").config();

const devWallets = [
  {
    address: process.env.devwalletaddress1,
    privateKey: process.env.devwalletprivatekey1,
  },
  {
    address: process.env.devwalletaddress2,
    privateKey: process.env.devwalletprivatekey2,
  },
];

module.exports = { devWallets };
