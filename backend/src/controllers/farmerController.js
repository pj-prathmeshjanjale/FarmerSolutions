import { getFarmerProfile, createOrUpdateProfile } from "../services/farmerService.js";

export const getFarmerProfileController = async (req, res) => {
  try {
    const profile = await getFarmerProfile(req.user.id);
    if (!profile) {
      return res.status(200).json({ success: true, profile: null }); // Don't 404, just signify empty profile for initial form rendering
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Fetch Farmer Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createOrUpdateFarmerProfile = async (req, res) => {
  try {
    const profile = await createOrUpdateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Farmer profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("Farmer Profile Error:", error.message);
    // Zod Validation Error handling
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation Failed", errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};
