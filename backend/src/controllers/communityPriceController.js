import * as communityPriceService from "../services/communityPriceService.js";
import { communityPriceBodySchema } from "../validations/mandiValidation.js";

export const submitCommunityPrice = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const payload = communityPriceBodySchema.parse(req.body);
    
    const result = await communityPriceService.submitPrice({ ...payload, userId });
    
    res.status(201).json({
      success: true,
      message: "Price submitted successfully",
      data: result.data
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const getCommunityPrices = async (req, res, next) => {
  try {
    const { crop, location, state, limit } = req.query;
    const result = await communityPriceService.getCommunityPrices({ 
      crop, 
      location, 
      state, 
      limit: limit ? parseInt(limit) : 20 
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteCommunityPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Price ID is required" });
    }

    const result = await communityPriceService.deletePrice(id, userId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "unauthorized") {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this entry" });
    }
    if (error.message === "Price entry not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
