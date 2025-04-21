import { relations } from "drizzle-orm";
import {
  pgTable, // Base function to declare a PostgreSQL table
  serial, // Auto-incrementing integer primary key (SERIAL)
  integer, // Standard integer type (INTEGER)
  varchar, // Variable-length character string (VARCHAR)
  timestamp,
  pgEnum, // Timestamp with time zone (TIMESTAMP WITH TIME ZONE)
} from "drizzle-orm/pg-core";

export const subscriptionEnum = pgEnum("subscription", ["free", "premium"]);

/**
 * Users Table
 * Stores information about Telegram users interacting with the bot.
 */
export const users = pgTable("users", {
  // Core Fields
  id: serial("id").primaryKey(),
  telegramId: integer("telegram_id").notNull().unique(),

  // Premium Status
  subscription: subscriptionEnum().default("free").notNull(),
  subscriptionExpires: timestamp("subscription_expires_at"),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
}));

/**
 * Wallets Table
 * Stores the blockchain wallets being tracked by users.
 * A user can track multiple wallets, and can give each tracked instance a unique name.
 */
export const wallets = pgTable("wallets", {
  // Core Fields
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull(),
  chainId: integer("chain_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  userId: integer("user-id").notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const walletsRelations = relations(wallets, ({ one }) => ({
  userId: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));
