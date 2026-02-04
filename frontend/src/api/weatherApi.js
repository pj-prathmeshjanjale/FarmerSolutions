import api from "./axios";

export const getCurrentWeather = (city) => {
  return api.post("/weather/current", { city });
};
