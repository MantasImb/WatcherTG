const express = require("express");
const { createServer } = require("http");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Database
const { dbUrl } = require("./config/urls");
const connectDB = require("./database/connection");
connectDB(dbUrl);

// Websocket
const io = require("./websocket/setup");
const { handleSocketConnection } = require("./websocket/notifications");
const httpServer = createServer(app);
io.attach(httpServer);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/trackedwallets", require("./routes/trackedwallets"));
app.use("/history", require("./routes/history"));

// Test route
app.use("/test", require("./routes/test"));

// Status
const serverStatus = require("./controllers/statusController");
app.get("/status", serverStatus);

io.on("connection", handleSocketConnection);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
