import FarmerProfile from "../models/FarmerProfile.js";

export const createOrUpdateFarmerProfile = async (req, res) => {
  try {
    // Role check
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Farmer only."
      });
    }

    const profileData = {
      user: req.user.id,
      ...req.body
    };

    const profile = await FarmerProfile.findOneAndUpdate(
      { user: req.user.id },
      profileData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Farmer profile saved successfully",
      profile
    });

  } catch (error) {
    console.error("Farmer Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
