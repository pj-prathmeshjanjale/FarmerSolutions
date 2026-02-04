import axios from "axios";

export const getCurrentWeather = async (req, res) => {
  try {
    let city = req.body?.city || req.query?.city;

    // Validate city
    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required for weather data"
      });
    }

    // Ensure country code
    if (!city.includes(",")) {
      city = `${city},IN`;
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric"
        }
      }
    );

    const data = response.data;

    res.json({
      success: true,
      location: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      weather: data.weather[0].description
    });

  } catch (error) {
    console.error("Weather API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch weather data"
    });
  }
};
