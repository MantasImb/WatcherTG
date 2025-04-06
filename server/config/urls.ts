import dotenv from "dotenv";
dotenv.config();
import { validateString } from "../utilities/envValidation";

export const sepoliaSocket = validateString(process.env.sepoliaurl);
// below are commented out because the project is sunset and is only used as a showcase
// const mainnetSocket = process.env.etherurl
// const binanceSocket = process.env.binanceurl
// const arbitrumSocket = process.env.arbitrumurl
// const optimismSocket = process.env.optimismurl
// export const origin = validateString(process.env.origin);
