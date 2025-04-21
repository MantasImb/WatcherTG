# Documentation

## Logger usage

```typescript
import { logger } from "./logger";

logger.info("Bot started successfully");
logger.warn("Slow response from blockchain API", { responseTime: 3500 });

try {
  // Some operation that might fail
  throw new Error("Database connection failed");
} catch (error) {
  logger.error(error, { connectionAttempt: 3 });
}

// Context-specific logging
import { createContextLogger } from "./utils/logger";
const wsLogger = createContextLogger("WebSocket");

wsLogger.info("Connected to server");
wsLogger.debug("Received data", { payload: { type: "balance", data: {} } });

// User identification for Sentry
logger.setUser({ id: 123456789, username: "user123" });
```
