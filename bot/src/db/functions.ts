import { db } from "."; // Import your database instance
import { users, wallets } from "./schema"; // Import the users table schema
import { eq } from "drizzle-orm";

// --- USER ---
export async function createUser(telegramId: string) {
  const [user] = await db
    .insert(users)
    .values({ telegramId })
    .returning({ id: users.id });

  return user;
}

export async function getUser(telegramId: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.telegramId, telegramId),
  });

  return user;
}

// --- Wallets ---
export async function createWallet(
  userId: number,
  name: string,
  address: string,
  chainId: number,
) {
  const [wallet] = await db
    .insert(wallets)
    .values({ name, chainId, address, userId })
    .returning({ id: wallets.id });

  return wallet;
}

// Gets all the user wallets
export async function getUserWallets(userId: number) {
  const wallets = await db.query.wallets.findMany({
    where: (wallets, { eq }) => eq(wallets.userId, userId),
  });

  return wallets;
}

// Used for getting users that track a specific wallet
// TODO: Implement this so that this function returns an array of user id's (also change functionality in serviceManager.ts)
export async function getWalletEntries(address: string) {
  const result = await db
    .select()
    .from(wallets)
    .where(eq(wallets.address, address));
  return result;
}

// Get an array of wallets to provide the server. These wallets will be tracked
export async function getWalletsToTrack(): Promise<Record<number, string[]>> {
  const wallets = await db.query.wallets.findMany();
  let result: Record<number, string[]> = {};

  for (const wallet of wallets) {
    if (!result[wallet.chainId]) {
      result[wallet.chainId] = [];
    }
    if (!result[wallet.chainId]?.includes(wallet.address)) {
      result[wallet.chainId]?.push(wallet.address);
    }
  }

  return result;
}
