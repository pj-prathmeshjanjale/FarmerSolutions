import SellerProfile from "../models/SellerProfile.js";
import User from "../models/User.js";

// ✅ NAMED EXPORT
export const applyForSeller = async (req, res) => {
  try {
    const { businessName, licenseNumber, address } = req.body;

    const existing = await SellerProfile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Seller application already exists"
      });
    }

    const sellerProfile = await SellerProfile.create({
      user: req.user.id,
      businessName,
      licenseNumber,
      address
    });

    res.status(201).json({
      success: true,
      message: "Seller application submitted",
      sellerProfile
    });
  } catch (error) {
    console.error("Seller Apply Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ✅ NAMED EXPORT
export const approveSeller = async (req, res) => {
  try {
    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    seller.approved = true;
    await seller.save();

    await User.findByIdAndUpdate(seller.user, {
      role: "seller"
    });

    res.status(200).json({
      success: true,
      message: "Seller approved successfully"
    });
  } catch (error) {
    console.error("Approve Seller Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// Get seller profile
export const getSellerProfile = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found"
      });
    }
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error("Get Seller Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
