import api from "./axios";

export const getMandiPrices = (params) => {
  return api.get("/mandi-prices", { params });
};

export const getMandiTrends = (crop, state, days = 7) => {
  return api.get("/mandi-prices/trends", { params: { crop, state, days } });
};

export const getBestMandi = (crop, state) => {
  return api.get("/mandi-prices/best", { params: { crop, state } });
};

export const compareMandis = (crop, state, mandis) => {
  return api.post("/mandi-prices/compare", { crop, state, mandis });
};

export const getAIRecommendation = (crop, state) => {
  return api.get("/mandi-prices/ai-recommend", { params: { crop, state, language: "en" } });
};

export const getSystemStatus = () => {
  return api.get("/mandi-prices/status");
};

export const submitCommunityPrice = (data) => {
  return api.post("/community-price", data);
};

export const getCommunityPrices = (params) => {
  return api.get("/community-price", { params });
};

export const deleteCommunityPrice = (id) => {
  return api.delete(`/community-price/${id}`);
};
