import CommunityPrice from "../models/CommunityPrice.js";
import User from "../models/User.js";

/**
 * Submit a community price
 */
export const submitPrice = async ({ crop, price, location, state, userId }) => {
  const normalizedCrop = crop.toLowerCase().trim();
  const normalizedLocation = location.toLowerCase().trim();
  
  // Calculate initial trust score
  const trustScore = await computeTrustScore(userId);

  const entry = new CommunityPrice({
    crop: normalizedCrop,
    price: Number(price),
    location: normalizedLocation,
    state: state ? state.toLowerCase().trim() : "",
    userId,
    trustScore
  });

  await entry.save();
  return { success: true, data: entry };
};

/**
 * Compute initial trust score based on user verification
 */
export const computeTrustScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return 30; // base score for unknown
    
    let score = 30;
    if (user.verificationStatus === "approved") {
      score += 30; // verified farmers get significant boost
    }
    
    // Future: Add score based on past successful submissions
    // const priorAccurate = await CommunityPrice.countDocuments({ userId, isOutlier: false });
    // score += Math.min(40, priorAccurate * 5); 
    
    return Math.min(100, score);
  } catch (error) {
    return 30;
  }
};

/**
 * Get community prices
 */
export const getCommunityPrices = async ({ crop, location, state, limit = 20 }) => {
  const query = { isOutlier: false }; // Only fetch valid prices
  if (crop) query.crop = crop.toLowerCase().trim();
  if (location) query.location = location.toLowerCase().trim();
  if (state) query.state = state.toLowerCase().trim();

  // Prioritize higher trust scores and newer entries
  const prices = await CommunityPrice.find(query)
    .sort({ trustScore: -1, createdAt: -1 })
    .limit(limit)
    .populate("userId", "name verificationStatus")
    .lean();

  return { success: true, data: prices };
};

/**
 * Delete a community price if the user owns it
 */
export const deletePrice = async (priceId, userId) => {
  const price = await CommunityPrice.findById(priceId);
  
  if (!price) {
    throw new Error("Price entry not found");
  }

  // Check if the user is the owner
  if (price.userId.toString() !== userId.toString()) {
    throw new Error("unauthorized"); // Using "unauthorized" string to trigger 403 in controller
  }

  await CommunityPrice.findByIdAndDelete(priceId);
  return { success: true, message: "Entry deleted successfully" };
};
