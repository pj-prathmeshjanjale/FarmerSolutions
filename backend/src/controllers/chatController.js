import ChatMessage from "../models/ChatMessage.js";
import RentalRequest from "../models/RentalRequest.js";

/* =========================
   SEND CHAT MESSAGE
========================= */
export const sendChatMessage = async (req, res) => {
  try {
    const { rentalRequestId, message } = req.body;

    if (!rentalRequestId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "rentalRequestId and message are required"
      });
    }

    const rentalRequest = await RentalRequest.findById(rentalRequestId);

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found"
      });
    }

    const userId = req.user.id;

    if (
      rentalRequest.owner.toString() !== userId &&
      rentalRequest.renter.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (rentalRequest.status !== "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Chat is closed"
      });
    }

    const receiver =
      rentalRequest.owner.toString() === userId
        ? rentalRequest.renter
        : rentalRequest.owner;

    // ✅ CREATE MESSAGE
    let chatMessage = await ChatMessage.create({
      rentalRequest: rentalRequestId,
      sender: userId,
      receiver,
      message
    });

    // ✅ POPULATE sender BEFORE sending to frontend
    chatMessage = await chatMessage.populate("sender", "_id name");

    // Real-time emit to room
    global.io?.to(rentalRequestId).emit("newMessage", chatMessage);

    // Notification emit to receiver personal room
    global.io?.to(`user_${receiver}`).emit("incomingMessage", {
      ...chatMessage.toObject(),
      rentalRequestId: rentalRequestId
    });

    res.status(201).json({
      success: true,
      chatMessage
    });

  } catch (error) {
    console.error("Chat Send Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to send message"
    });
  }
};


/* =========================
   GET CHAT HISTORY
========================= */
export const getChatHistory = async (req, res) => {
  try {
    const { rentalRequestId } = req.params;

    // 1️⃣ Fetch rental request
    const rentalRequest = await RentalRequest.findById(rentalRequestId);

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found"
      });
    }

    // 2️⃣ Authorization
    const userId = req.user.id;

    if (
      rentalRequest.owner.toString() !== userId &&
      rentalRequest.renter.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this chat"
      });
    }

    // 3️⃣ Fetch messages
    const messages = await ChatMessage.find({
      rentalRequest: rentalRequestId
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    // 4️⃣ Mark as read if the recipient views it
    // Any message that isn't sent by current user should be marked as read
    await ChatMessage.updateMany(
      { rentalRequest: rentalRequestId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.error("Chat History Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch chat history"
    });
  }
};

/* =========================
   GET UNREAD COUNT
========================= */
/* =========================
   GET UNREAD COUNT (SPLIT)
========================= */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unread messages for this user
    const unreadMessages = await ChatMessage.find({
      receiver: userId,
      read: false
    }).populate("rentalRequest", "owner renter");

    let ownerUnread = 0;
    let renterUnread = 0;

    unreadMessages.forEach((msg) => {
      const request = msg.rentalRequest;
      if (!request) return;

      // If I am the owner of the equipment request
      if (request.owner.toString() === userId) {
        ownerUnread++;
      }
      // If I am the renter
      else if (request.renter.toString() === userId) {
        renterUnread++;
      }
    });

    res.json({
      success: true,
      unreadCount: {
        total: ownerUnread + renterUnread,
        owner: ownerUnread,
        renter: renterUnread
      }
    });
  } catch (error) {
    console.error("Unread Count Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch unread count"
    });
  }
};

