import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { isLoggedIn } from "../utils/auth";
import { getSocket } from "../utils/socket";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState({ total: 0, owner: 0, renter: 0 });

    const fetchUnreadCount = async () => {
        try {
            if (isLoggedIn()) {
                const res = await api.get("/chat/unread-count");
                // API now returns { unreadCount: { total, owner, renter } }
                setUnreadCount(res.data.unreadCount);
            }
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    useEffect(() => {
        if (isLoggedIn()) {
            fetchUnreadCount();

            // Real-time listener
            const socket = getSocket();
            if (socket) {
                const handleNewMessage = () => fetchUnreadCount();
                socket.on("incomingMessage", handleNewMessage);

                return () => {
                    socket.off("incomingMessage", handleNewMessage);
                };
            }
        }
    }, []);

    const incrementCount = () => fetchUnreadCount(); // Re-fetch for accuracy
    const clearCount = () => setUnreadCount({ total: 0, owner: 0, renter: 0 });
    const refreshCount = () => fetchUnreadCount();

    return (
        <NotificationContext.Provider value={{ unreadCount, incrementCount, clearCount, refreshCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
