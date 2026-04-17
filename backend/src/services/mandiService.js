import MandiPrice from "../models/MandiPrice.js";
import CommunityPrice from "../models/CommunityPrice.js";
import ScraperLog from "../models/ScraperLog.js";

/**
 * Get paginated list of mandi prices
 */
export const getPrices = async ({ crop, state, district, mandi, page = 1, limit = 20 }) => {
  const query = {};
  if (crop) query.crop = crop.toLowerCase().trim();
  if (state) query.state = state.toLowerCase().trim();
  if (district) query.district = district.toLowerCase().trim();
  if (mandi) query.mandi = { $regex: mandi.toLowerCase().trim(), $options: "i" };

  // Get most recent prices per mandi
  const prices = await MandiPrice.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
    
  const total = await MandiPrice.countDocuments(query);
  
  return {
    success: true,
    data: prices,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get 7/30 days trends for a crop in a state
 */
export const getTrends = async ({ crop, state, days = 7 }) => {
  if (!crop || !state) throw new Error("Crop and state are required for trends");

  const normalizedCrop = crop.toLowerCase().trim();
  const normalizedState = state.toLowerCase().trim();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - parseInt(days));

  const trends = await MandiPrice.aggregate([
    {
      $match: {
        crop: normalizedCrop,
        state: normalizedState,
        date: { $gte: dateFrom }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        avgModalPrice: { $avg: "$modalPrice" },
        minPrice: { $min: "$minPrice" },
        maxPrice: { $max: "$maxPrice" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return { success: true, crop: normalizedCrop, state: normalizedState, trends };
};

/**
 * Get the best mandi for a crop in a state (highest modal price)
 */
export const getBestMandi = async ({ crop, state }) => {
  if (!crop) throw new Error("Crop is required to find best mandi");
  
  const query = { crop: crop.toLowerCase().trim() };
  if (state) query.state = state.toLowerCase().trim();
  
  // Only look at data from the last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  query.date = { $gte: threeDaysAgo };

  const best = await MandiPrice.findOne(query).sort({ modalPrice: -1 }).lean();
  
  if (!best) return { success: true, data: null, message: "No recent data available" };
  
  return { success: true, data: best };
};

/**
 * Compare specific mandis
 */
export const compareMandis = async ({ crop, state, mandiList }) => {
  if (!crop || !mandiList || !Array.isArray(mandiList) || mandiList.length === 0) {
    throw new Error("Crop and mandiList are required");
  }

  const normalizedCrop = crop.toLowerCase().trim();
  const normalizedMandis = mandiList.map(m => m.toLowerCase().trim());
  const query = { crop: normalizedCrop, mandi: { $in: normalizedMandis } };
  
  if (state) query.state = state.toLowerCase().trim();

  // Get most recent for each
  // Aggregate to get latest date only
  const prices = await MandiPrice.aggregate([
    { $match: query },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: "$mandi",
        latestPrice: { $first: "$$ROOT" }
      }
    }
  ]);
  
  return { 
    success: true, 
    data: prices.map(p => p.latestPrice).filter(p => p) 
  };
};

/**
 * Get system status / last scrape
 */
export const getSystemStatus = async () => {
  const lastLog = await ScraperLog.findOne().sort({ runAt: -1 }).lean();
  const totalMandiRecords = await MandiPrice.estimatedDocumentCount();
  const totalCommunityRecords = await CommunityPrice.estimatedDocumentCount();
  
  return {
    success: true,
    lastUpdated: lastLog ? lastLog.runAt : null,
    status: lastLog ? lastLog.status : "unknown",
    recordsSavedLastRun: lastLog ? lastLog.recordsSaved : 0,
    totalMandiRecords,
    totalCommunityRecords
  };
};
