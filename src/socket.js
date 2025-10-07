import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
let socket;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");  // must exist!
    // console.log(token)
    socket = io(API_BASE, {
      transports: ["websocket"],
      auth: { token }, // send JWT in handshake
    });

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Connect error:", err.message);
    });
  }
  return socket;
}
