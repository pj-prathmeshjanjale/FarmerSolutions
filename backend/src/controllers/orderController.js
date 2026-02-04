import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Farmer places order
export const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, paymentMethod, shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Product not available"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock"
      });
    }

    const order = await Order.create({
      orderType: "BUY",
      farmer: req.user.id,
      product: product._id,
      seller: product.seller,
      quantity,
      priceAtOrder: product.price,
      amount: quantity * product.price,
      paymentMethod: paymentMethod || "COD",
      shippingAddress,
      status: paymentMethod === "ONLINE" ? "PENDING_PAYMENT" : "PLACED"
    });

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Place Order Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Farmer views own orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ farmer: req.user.id }, { renter: req.user.id }]
    })
      .populate("product", "name brand")
      .populate("equipment", "name")
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get Orders Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// Seller views orders for their products
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate("product", "name brand")
      .populate("farmer", "name");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Seller Orders Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Seller updates order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Ensure seller owns the order
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order"
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    console.error("Update Order Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Admin views all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("product", "name brand")
      .populate("farmer", "name")
      .populate("seller", "name");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Admin Orders Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// User cancels their own order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("product");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check ownership (buyer/farmer)
    if (order.farmer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order"
      });
    }

    // Only allow cancellation if not yet confirmed/shipped
    if (!["PLACED", "PENDING_PAYMENT"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.status} status`
      });
    }

    order.status = "CANCELLED";
    await order.save();

    // Restore Product Stock
    if (order.product) {
      order.product.stock += order.quantity;
      await order.product.save();
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel Order Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
