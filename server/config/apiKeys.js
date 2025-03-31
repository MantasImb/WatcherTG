require("dotenv").config();

const etherscanKey = process.env.etherscankey;
// below are commented out because the project is sunset and is only used as a showcase
// const bscscanKey = process.env.bscscankey
// const arbiscanKey = process.env.arbiscankey
// const optimismscanKey = process.env.optimismscankey

module.exports = {
  etherscanKey,
  // bscscanKey,
  // arbiscanKey,
  // optimismscanKey
};
