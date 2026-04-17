import api from "./axios";

export const getWeatherDashboard = (city) => {
  return api.post("/weather/dashboard", { city });
};

// Backward compatibility wrapper to fix app crash
export const getCurrentWeather = async (city) => {
  const res = await getWeatherDashboard(city);
  // Map new intelligence data format back to old simple format for legacy components
  return {
    ...res,
    data: {
      location: res.data.data.location,
      temperature: res.data.data.current.temperature,
      humidity: res.data.data.current.humidity,
      weather: res.data.data.current.condition
    }
  };
};
