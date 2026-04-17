import { fetchWeatherData } from "../services/weatherService.js";
import { generateInsightsAndAlerts } from "../services/insightEngine.js";
import { generateWeatherInsights } from "../services/weatherAiService.js";
import FarmerProfile from "../models/FarmerProfile.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import WeatherCache from "../models/WeatherCache.js";

export const getWeatherDashboard = async (req, res) => {
  try {
    let city = req.body?.city || req.query?.city;

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    // 1. Authenticate user if token exists (optional authentication)
    let farmerProfile = null;
    let language = req.query?.language || "en";
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          const profile = await FarmerProfile.findOne({ user: user._id });
          if (profile) {
            farmerProfile = profile;
            language = profile.preferredLanguage || language;
          }
        }
      } catch (authErr) {
        console.log("Weather Dashboard: Auth token provided but invalid/expired. Proceeding as guest.");
      }
    }

    // 2. Fetch Base Weather Data (Service handles OpenWeather API & Cache)
    const weatherRes = await fetchWeatherData(city);
    
    // 3. Process Insights & Alerts (if not cached inside weatherRes)
    let finalInsights = weatherRes.data.insights;
    let alerts = [];
    
    if (!finalInsights) {
      const insightData = generateInsightsAndAlerts(weatherRes.data.current, weatherRes.data.forecast);
      alerts = insightData.alerts;
      
      // 4. Generate AI Checklist
      const aiSummary = await generateWeatherInsights(language, {
        currentWeather: weatherRes.data.current,
        forecast: weatherRes.data.forecast,
        alerts,
        systemInsights: insightData.systemInsights,
        farmerProfile
      });

      finalInsights = {
        rainAnalysis: insightData.systemInsights.rainAnalysis,
        soilMoistureEstimate: insightData.systemInsights.soilMoistureEstimate,
        alerts,
        aiSummary
      };

      // Save to cache so next requests are instant
      try {
        let qs = city.includes(",") ? city : `${city},IN`;
        const locKey = qs.toLowerCase().replace(/\s+/g, "");
        
        await WeatherCache.findOneAndUpdate(
          { locationKey: locKey },
          { 
            current: weatherRes.data.current,
            forecast: weatherRes.data.forecast,
            insights: finalInsights
          },
          { upsert: true }
        );
      } catch (cacheErr) {
        console.error("Failed to cache weather data:", cacheErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        location: weatherRes.data.location,
        current: weatherRes.data.current,
        forecast: weatherRes.data.forecast,
        insights: finalInsights
      }
    });

  } catch (error) {
    console.error("Weather Dashboard error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to process Weather Intelligence Data"
    });
  }
};

