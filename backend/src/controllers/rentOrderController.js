import Order from "../models/Order.js";
import RentalRequest from "../models/RentalRequest.js";
import Equipment from "../models/Equipment.js";

export const createRentOrder = async (req, res) => {
  try {
    const { rentalRequestId } = req.body;

    if (!rentalRequestId) {
      return res.status(400).json({
        success: false,
        message: "rentalRequestId is required"
      });
    }

    const rentalRequest = await RentalRequest.findById(rentalRequestId);

    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: "Rental request not found"
      });
    }

    if (rentalRequest.status !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message: "Rental request is not accepted"
      });
    }

    // Only renter can create rent order
    if (rentalRequest.renter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // 🛑 Prevent duplicate rent orders
    const existingOrder = await Order.findOne({
      rentalRequest: rentalRequestId
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Rent order already created for this request"
      });
    }

    const start = new Date(rentalRequest.startDate);
    const end = new Date(rentalRequest.endDate);

    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const totalAmount =
      totalDays * rentalRequest.proposedPricePerDay +
      rentalRequest.shippingCharge;

    // 1️⃣ Create rent order
    const order = await Order.create({
      orderType: "RENT",
      renter: rentalRequest.renter,
      seller: rentalRequest.owner,
      equipment: rentalRequest.equipment,

      rentalRequest: rentalRequest._id,

      rentalStartDate: start,
      rentalEndDate: end,
      totalDays,
      pricePerDay: rentalRequest.proposedPricePerDay,
      shippingCharge: rentalRequest.shippingCharge,

      amount: totalAmount,
      status: "PENDING_PAYMENT"
    });

    // 2️⃣ Lock equipment
    await Equipment.findByIdAndUpdate(
      rentalRequest.equipment,
      { availability: false }
    );

    // 3️⃣ Mark rental request as COMPLETED
    rentalRequest.status = "COMPLETED";
    await rentalRequest.save();

    // 4️⃣ Send response (LAST STEP)
    res.status(201).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Rent Order Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to create rent order"
    });
  }
};
