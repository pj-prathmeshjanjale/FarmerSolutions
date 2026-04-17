import * as mandiService from "../services/mandiService.js";
import { generateSellRecommendation } from "../services/mandiAiService.js";
import {
  mandiQuerySchema,
  mandiTrendsQuerySchema,
  mandiBestQuerySchema,
  mandiCompareSchema
} from "../validations/mandiValidation.js";

export const getMandiPrices = async (req, res, next) => {
  try {
    const params = mandiQuerySchema.parse(req.query);
    const result = await mandiService.getPrices(params);
    res.status(200).json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const getMandiTrends = async (req, res, next) => {
  try {
    const params = mandiTrendsQuerySchema.parse(req.query);
    const result = await mandiService.getTrends(params);
    res.status(200).json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const getBestMandi = async (req, res, next) => {
  try {
    const params = mandiBestQuerySchema.parse(req.query);
    const result = await mandiService.getBestMandi(params);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const compareMandis = async (req, res, next) => {
  try {
    // Validate request body
    const params = mandiCompareSchema.parse(req.body);
    const result = await mandiService.compareMandis(params);
    res.status(200).json(result);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
};

export const getAIRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { crop, state, language } = req.query;
    
    if (!crop || !state) {
      return res.status(400).json({ success: false, message: "crop and state are required" });
    }

    const result = await generateSellRecommendation(userId, crop, state, language);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSystemStatus = async (req, res, next) => {
  try {
    const result = await mandiService.getSystemStatus();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
