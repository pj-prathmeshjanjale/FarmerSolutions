import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ["BUY", "RENT"],
      default: "BUY"
    },

    // ===== BUY ORDER FIELDS =====
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },

    quantity: {
      type: Number
    },

    priceAtOrder: {
      type: Number
    },

    // ===== RENT ORDER FIELDS =====
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment"
    },

    rentalStartDate: Date,
    rentalEndDate: Date,
    totalDays: Number,
    pricePerDay: Number,
    shippingCharge: Number,

    // ===== COMMON FIELDS =====
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD"
    },

    shippingAddress: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "PLACED",
        "PENDING_PAYMENT",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PLACED"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
