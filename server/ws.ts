import { Server } from "socket.io";
// import { origin } from "./config/urls";

export const io = new Server({
  cors: {
    origin: "0.0.0.0",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
