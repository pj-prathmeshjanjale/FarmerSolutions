import RentalRequest from "../models/RentalRequest.js";
import Equipment from "../models/Equipment.js";
import ChatMessage from "../models/ChatMessage.js";

/* =========================
   CREATE RENTAL REQUEST
========================= */
export const createRentalRequest = async (req, res) => {

  try {
    const {
      equipmentId,
      startDate,
      endDate,
      proposedPricePerDay,
      message
    } = req.body;

    if (!equipmentId || !startDate || !endDate || !proposedPricePerDay) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const equipment = await Equipment.findById(equipmentId);

    if (!equipment || !equipment.availability) {
      return res.status(404).json({
        success: false,
        message: "Equipment not available"
      });
    }

    if (equipment.owner.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot rent your own equipment"
      });
    }

    const rentalRequest = await RentalRequest.create({
      equipment: equipmentId,
      owner: equipment.owner,
      renter: req.user.id,
      startDate,
      endDate,
      proposedPricePerDay,
      shippingCharge: equipment.shippingCharge,
      message
    });

    res.status(201).json({
      success: true,
      rentalRequest
    });

  } catch (error) {
    console.error("Create RentalRequest Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to create rental request"
    });
  }
};

/* =========================
   OWNER: ACCEPT REQUEST
========================= */
export const acceptRentalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const rentalRequest = await RentalRequest.findById(requestId);

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found"
      });
    }

    if (rentalRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (rentalRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Rental request already processed"
      });
    }

    rentalRequest.status = "ACCEPTED";
    await rentalRequest.save();

    res.json({
      success: true,
      message: "Rental request accepted"
    });

  } catch (error) {
    console.error("Accept RentalRequest Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to accept rental request"
    });
  }
};

/* =========================
   OWNER: REJECT REQUEST
========================= */
export const rejectRentalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const rentalRequest = await RentalRequest.findById(requestId);

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found"
      });
    }

    if (rentalRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (rentalRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Rental request already processed"
      });
    }

    rentalRequest.status = "REJECTED";
    await rentalRequest.save();

    res.json({
      success: true,
      message: "Rental request rejected"
    });

  } catch (error) {
    console.error("Reject RentalRequest Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to reject rental request"
    });
  }
};
/* =========================
   OWNER: VIEW RENTAL REQUESTS
========================= */
export const getOwnerRentalRequests = async (req, res) => {
  try {
    const requestsRaw = await RentalRequest.find({
      owner: req.user.id
    })
      .populate("equipment", "name images pricePerDay location")
      .populate("renter", "name email")
      .sort({ createdAt: -1 });

    // Calculate unread messages for each request
    // This could be optimized with aggregation, but loop is fine for MVP
    const requests = await Promise.all(
      requestsRaw.map(async (reqDoc) => {
        const unreadCount = await ChatMessage.countDocuments({
          rentalRequest: reqDoc._id,
          receiver: req.user.id,
          read: false
        });
        return { ...reqDoc.toObject(), unreadCount };
      })
    );

    res.status(200).json({
      success: true,
      requests
    });

  } catch (error) {
    console.error("Owner Rental Requests Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch rental requests"
    });
  }
};


/* =========================
   RENTER: VIEW MY REQUESTS
========================= */
export const getRenterRentalRequests = async (req, res) => {
  try {
    const requestsRaw = await RentalRequest.find({
      renter: req.user.id
    })
      .populate("equipment", "name pricePerDay")
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    const requests = await Promise.all(
      requestsRaw.map(async (reqDoc) => {
        const unreadCount = await ChatMessage.countDocuments({
          rentalRequest: reqDoc._id,
          receiver: req.user.id,
          read: false
        });
        return { ...reqDoc.toObject(), unreadCount };
      })
    );

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error("Renter Rental Requests Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch rental requests"
    });
  }
};
