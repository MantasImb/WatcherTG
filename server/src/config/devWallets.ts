// This is a list of dev wallets that can be used for testing and preview purposes
require("dotenv").config();
import { validateString } from "../utilities/envValidation";

export const devWallets = [
  {
    address: validateString(process.env.devwalletaddress1),
    privateKey: validateString(process.env.devwalletprivatekey1),
  },
  {
    address: validateString(process.env.devwalletaddress2),
    privateKey: validateString(process.env.devwalletprivatekey2),
  },
];
