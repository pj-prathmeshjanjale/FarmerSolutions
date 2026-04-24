import { io } from "socket.io-client";

// Derive socket URL from the same base as the API to avoid localhost fallback in production
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : `http://${window.location.hostname}:5000`);

let socket;

export const initiateSocketConnection = (userId) => {
    if (socket && socket.connected) return socket;

    socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"], // Fallback to polling for better reliability
        withCredentials: true
    });

    // console.log("🔌 Connecting to socket...");

    socket.on("connect", () => {
        // console.log("✅ Socket connected:", socket.id);
        if (userId) {
            socket.emit("joinUserRoom", userId);
        }
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
