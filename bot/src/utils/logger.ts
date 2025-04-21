import winston from "winston";
import * as Sentry from "@sentry/node";
import { config } from "../config";
import { ExtendedError } from "./extendedError";

// Initialize Sentry with minimal configuration
Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV || "development",
  attachStacktrace: true,
});

// Create Winston logger with simple configuration
const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    }),
  ),
  transports: [
    // Console for all environments
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),

    // File transport only in production
    ...(config.NODE_ENV === "production"
      ? [new winston.transports.File({ filename: "logs/combined.log" })]
      : []),
  ],
});

// Simple combined logger with both Winston and Sentry
const logger = {
  error: (messageOrError: string | Error, extra?: Record<string, any>) => {
    let errorInstance: Error;
    let logMessage: string;
    let combinedExtra: Record<string, any> = { ...extra }; // Start with explicitly passed extra

    if (messageOrError instanceof ExtendedError) {
      errorInstance = messageOrError;
      logMessage = errorInstance.message;
      // Merge context from the error, giving precedence to explicitly passed 'extra'
      combinedExtra = { ...messageOrError.context, ...extra };
    } else if (messageOrError instanceof Error) {
      errorInstance = messageOrError;
      logMessage = errorInstance.message;
    } else {
      // It's just a string message
      errorInstance = new Error(messageOrError); // Create a basic error for Sentry
      logMessage = messageOrError;
    }

    // Log with Winston
    winstonLogger.error(logMessage, {
      // Include stack and combined extra data for Winston
      stack: errorInstance.stack,
      ...combinedExtra,
    });

    // Track with Sentry
    Sentry.captureException(errorInstance, {
      extra: combinedExtra, // Pass combined extra data to Sentry
    });
  },

  warn: (message: string, extra?: Record<string, any>) => {
    winstonLogger.warn(message, extra);
    // Add breadcrumb for context if an error happens later
    Sentry.addBreadcrumb({
      category: "warning",
      message,
      data: extra,
      level: "warning",
    });
  },

  info: (message: string, extra?: Record<string, any>) => {
    winstonLogger.info(message, extra);
  },

  debug: (message: string, extra?: Record<string, any>) => {
    winstonLogger.debug(message, extra);
  },

  // Set user context in Sentry
  setUser: (user: { id: string | number; username?: string }) => {
    Sentry.setUser(user);
  },
};

// Simple context helper
const createContextLogger = (context: string) => {
  return {
    error: (message: string | Error, extra?: Record<string, any>) =>
      logger.error(
        message instanceof Error ? message : `[${context}] ${message}`,
        extra,
      ),
    warn: (message: string, extra?: Record<string, any>) =>
      logger.warn(`[${context}] ${message}`, extra),
    info: (message: string, extra?: Record<string, any>) =>
      logger.info(`[${context}] ${message}`, extra),
    debug: (message: string, extra?: Record<string, any>) =>
      logger.debug(`[${context}] ${message}`, extra),
  };
};

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(error, { unhandled: true });
  Sentry.close(2000).then(() => process.exit(1));
});

export { logger, createContextLogger, Sentry, ExtendedError };
