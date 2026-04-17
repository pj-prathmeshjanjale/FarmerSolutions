/**
 * Generates actionable insights and alerts from weather data
 */

export const generateInsightsAndAlerts = (current, forecast) => {
  const alerts = [];
  const systemInsights = {
    rainAnalysis: null,
    soilMoistureEstimate: null
  };

  // 1. Alert Generation (Threshold checks)
  
  // Heatwave check (> 35°C)
  if (current.temperature > 35) {
    alerts.push({
      type: "heatwave",
      severity: "high",
      message: `High temperature (${Math.round(current.temperature)}°C) detected. Extreme risk of crop heat stress.`
    });
  } else {
    // Check forecast for upcoming heatwaves
    const hotDays = forecast.filter(day => day.maxTemp > 35);
    if (hotDays.length > 0) {
      alerts.push({
        type: "heatwave",
        severity: "medium",
        message: `Temperatures above 35°C expected on ${hotDays[0].date}. Prepare cooling irrigation.`
      });
    }
  }

  // Wind speed check (> 30 km/h)
  if (current.windSpeed > 30) {
    alerts.push({
      type: "wind",
      severity: "high",
      message: `High wind speeds (${Math.round(current.windSpeed)} km/h). High risk of physical crop damage and rapid evaporation.`
    });
  }

  // 2. Rain Analysis Engine
  let nextRainDay = null;
  let totalRainfall = 0;
  
  for (const day of forecast) {
    if (day.rainProbability > 30 || day.rainfallMM > 1 || day.condition === "Rain") {
      if (!nextRainDay) nextRainDay = day;
    }
    totalRainfall += day.rainfallMM;
  }

  if (nextRainDay) {
    let intensity = "light";
    if (totalRainfall > 20) intensity = "moderate";
    if (totalRainfall > 50) intensity = "heavy";

    systemInsights.rainAnalysis = {
      expected: true,
      nextRainDate: nextRainDay.date,
      probability: nextRainDay.rainProbability,
      intensity: intensity,
      summary: `Rain expected in the upcoming days starting ${nextRainDay.date} (${intensity} intensity).`
    };

    if (intensity === "heavy") {
      alerts.push({
        type: "flood",
        severity: "high",
        message: `Heavy rainfall expected (${Math.round(totalRainfall)}mm total). High risk of waterlogging.`
      });
    }
  } else {
    systemInsights.rainAnalysis = {
      expected: false,
      summary: "No significant rain expected for the next 5 days."
    };
    
    // Drought/Dry alert
    if (current.temperature > 30 && current.humidity < 40) {
      alerts.push({
        type: "drought",
        severity: "medium",
        message: "Prolonged dry spell with high temps and low humidity. High irrigation needed."
      });
    }
  }

  // 3. Soil Moisture Logic (Heuristic based on Weather)
  // Real implementation would require past week rainfall. Without it, we guess based on current humidity + temp.
  if (current.humidity < 40 && current.temperature > 28) {
    systemInsights.soilMoistureEstimate = "Soil likely dry. Immediate irrigation recommended.";
  } else if (current.humidity > 80 || (nextRainDay && nextRainDay.date === forecast[0].date && nextRainDay.rainfallMM > 5)) {
    systemInsights.soilMoistureEstimate = "Soil moisture adequate due to high humidity/recent rain. Delay watering.";
  } else {
    systemInsights.soilMoistureEstimate = "Soil moisture dropping. Maintain regular irrigation schedule.";
  }

  return { alerts, systemInsights };
};
