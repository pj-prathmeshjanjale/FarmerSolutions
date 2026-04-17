import axios from "axios";
import WeatherCache from "../models/WeatherCache.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export const fetchWeatherData = async (city) => {
  if (!city) throw new Error("City is required");
  
  // Format city string
  let queryCity = city;
  if (!queryCity.includes(",")) {
    queryCity = `${queryCity},IN`;
  }
  
  const locationKey = queryCity.toLowerCase().replace(/\s+/g, "");

  // 1. Check Cache
  const cached = await WeatherCache.findOne({ locationKey });
  if (cached) {
    console.log(`[WeatherService] Serving cached weather for ${locationKey}`);
    return {
      success: true,
      data: {
        location: queryCity,
        current: cached.current,
        forecast: cached.forecast,
        insights: cached.insights
      },
      cached: true
    };
  }

  console.log(`[WeatherService] Fetching fresh weather for ${locationKey}`);

  try {
    // 2. Fetch Current Weather
    const currentRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { q: queryCity, appid: OPENWEATHER_API_KEY, units: "metric" }
    });

    const currData = currentRes.data;
    const current = {
      temperature: currData.main.temp,
      feelsLike: currData.main.feels_like,
      humidity: currData.main.humidity,
      windSpeed: currData.wind.speed * 3.6, // Convert m/s to km/h
      condition: currData.weather[0].main,
      description: currData.weather[0].description,
      visibility: currData.visibility / 1000 // Convert meters to km
    };

    // 3. Fetch Forecast (5 days / 3-hour chunks)
    const forecastRes = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
      params: { q: queryCity, appid: OPENWEATHER_API_KEY, units: "metric" }
    });

    const forecastData = forecastRes.data.list;
    const dailyForecastMap = new Map();

    // Aggregate 3-hour chunks into Daily Summaries
    forecastData.forEach(item => {
      // item.dt_txt format: "2023-10-25 15:00:00"
      const dateStr = item.dt_txt.split(" ")[0]; 
      
      if (!dailyForecastMap.has(dateStr)) {
        dailyForecastMap.set(dateStr, {
          date: dateStr,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          humiditySum: item.main.humidity,
          windSpeedSum: item.wind.speed,
          rainProbMax: item.pop || 0, // pop is probability of precipitation 0-1
          rainfallMM: item.rain?.["3h"] || 0,
          conditions: [item.weather[0].main],
          count: 1
        });
      } else {
        const day = dailyForecastMap.get(dateStr);
        day.minTemp = Math.min(day.minTemp, item.main.temp_min);
        day.maxTemp = Math.max(day.maxTemp, item.main.temp_max);
        day.humiditySum += item.main.humidity;
        day.windSpeedSum += item.wind.speed;
        day.rainProbMax = Math.max(day.rainProbMax, item.pop || 0);
        day.rainfallMM += item.rain?.["3h"] || 0;
        day.conditions.push(item.weather[0].main);
        day.count += 1;
      }
    });

    // Format Aggregated Forecast
    const forecast = Array.from(dailyForecastMap.values()).map(day => {
      // Find most frequent condition
      const conditionCounts = day.conditions.reduce((acc, cond) => {
        acc[cond] = (acc[cond] || 0) + 1;
        return acc;
      }, {});
      const primaryCondition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);

      return {
        date: day.date,
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp),
        humidity: Math.round(day.humiditySum / day.count),
        windSpeed: Math.round((day.windSpeedSum / day.count) * 3.6), // avg km/h
        rainProbability: Math.round(day.rainProbMax * 100), // convert 0-1 to percentage
        rainfallMM: Math.round(day.rainfallMM * 10) / 10,
        condition: primaryCondition
      };
    }).slice(0, 5); // Ensure exactly 5 days

    return {
      success: true,
      data: {
        location: currData.name,
        current,
        forecast,
        insights: null // Will be populated by Insight Engine later
      },
      cached: false
    };

  } catch (error) {
    console.error("[WeatherService] Fetch Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch data from weather provider.");
  }
};
