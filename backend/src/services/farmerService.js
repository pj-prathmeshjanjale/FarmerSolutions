import FarmerProfile from "../models/FarmerProfile.js";
import { farmerProfileSchema } from "../validations/farmerValidation.js";

export const getFarmerProfile = async (userId) => {
  // Direct DB Fetch (Option B - No Redis)
  const profile = await FarmerProfile.findOne({ user: userId }).lean();
  return profile || null;
};

export const createOrUpdateProfile = async (userId, data) => {
  // Validate Input
  const validatedData = farmerProfileSchema.parse(data);

  // Upsert Profile
  const profile = await FarmerProfile.findOneAndUpdate(
    { user: userId },
    { ...validatedData, user: userId },
    { new: true, upsert: true }
  ).lean();

  return profile;
};

export const getFarmerContext = async (userId) => {
  const profile = await getFarmerProfile(userId);
  
  if (!profile) return null;

  // Return strictly what the AI needs to know
  return {
    soilType: profile.soilType || "Unknown",
    irrigationType: profile.irrigationType || "Unknown",
    waterSource: profile.waterSource || "Unknown",
    farmingExperience: profile.farmingExperience ? `${profile.farmingExperience} years` : "Unknown",
    farmSize: profile.farmSize ? `${profile.farmSize} acres` : "Unknown",
    soilPH: profile.soilPH || "Unknown",
    lastCropSeason: profile.lastCropSeason || "Unknown",
    budgetRange: profile.budgetRange || "Unknown",
    cropHistory: profile.cropHistory && profile.cropHistory.length > 0 
      ? profile.cropHistory.map(c => `${c.crop} (${c.season} ${c.year}, yield: ${c.yield})`).join("; ")
      : "No recorded history",
    location: profile.village || profile.district || profile.state || "Unknown"
  };
};
