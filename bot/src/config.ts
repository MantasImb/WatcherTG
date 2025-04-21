import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Define config schema with Zod
const ConfigSchema = z.object({
  // Server connection
  TRACKING_SERVER_URL: z.string().url({
    message: "TRACKING_SERVER_URL must be a valid URL",
  }),

  BOT_TOKEN: z.string().min(1, {
    message: "BOT_TOKEN is required",
  }),

  NODE_ENV: z.enum(["development", "production", "test"], {
    errorMap: () => ({
      message: "NODE_ENV must be one of 'development', 'production', or 'test'",
    }),
  }),

  SENTRY_DSN: z.string().url(),

  DB_URL: z.string().min(1),
});

// Extract environment variables
const env = {
  TRACKING_SERVER_URL: process.env.TRACKING_SERVER_URL,
  BOT_TOKEN: process.env.BOT_TOKEN,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  SENTRY_DSN: process.env.SENTRY_DSN,
};

// Parse and validate configuration
function validateConfig() {
  try {
    return ConfigSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");

      console.error("❌ Invalid configuration:\n", errorMessages);
      process.exit(1);
    }

    console.error("❌ Unknown configuration error:", error);
    process.exit(1);
  }
}

// Export validated config
export const config = validateConfig();

// Type for configuration
export type Config = z.infer<typeof ConfigSchema>;
