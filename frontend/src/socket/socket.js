import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL?.replace("/api", "") || "https://farmersolutions.onrender.com", {
  withCredentials: true
});

export default socket;
