import { io } from "socket.io-client";

const SOCKET_URL = `http://${window.location.hostname}:5000`; // Dynamic for mobile dev
let socket;

export const initiateSocketConnection = (userId) => {
    socket = io(SOCKET_URL, {
        transports: ["websocket"],
    });

    if (userId) {
        socket.emit("joinUserRoom", userId);
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) socket.disconnect();
};

export const getSocket = () => socket;
