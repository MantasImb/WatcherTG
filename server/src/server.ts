import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

import { socket } from "./ws";
import { createServer } from "http";

const httpServer = createServer(app);
socket.attach(httpServer);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

import router from "./router";
app.use(router);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import { main } from "./walletTracker";
main();
