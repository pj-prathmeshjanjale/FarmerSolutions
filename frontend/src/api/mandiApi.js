import api from "./axios";

export const getMandiPrices = (crop, market) => {
  return api.get(`/mandi-prices?crop=${crop}&market=${market}`);
};
