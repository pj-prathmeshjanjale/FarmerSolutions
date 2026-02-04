import { useEffect, useState } from "react";
import { getCurrentWeather } from "../../api/weatherApi";

const CITIES = [
  { label: "Pune", value: "Pune" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Indore", value: "Indore" },
  { label: "Kolhapur", value: "Kolhapur" }
];

export default function WeatherCard() {
  const [city, setCity] = useState("Pune");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const fetchWeather = async (selectedCity) => {
    try {
      setLoading(true);
      const res = await getCurrentWeather(selectedCity);
      setWeather(res.data);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/30 shadow-lg p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          🌤 Weather
        </h3>

        {/* City selector */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="
            rounded-lg bg-white/60 backdrop-blur
            border border-white/40
            px-3 py-1 text-sm text-slate-700
            focus:outline-none focus:ring-2 focus:ring-sky-500
          "
        >
          {CITIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Body */}
      <div className="mt-4">
        {loading && (
          <p className="text-sm text-slate-500">
            Fetching weather...
          </p>
        )}

        {!loading && weather && (
          <div className="space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Location:</span>{" "}
              {weather.location}
            </p>
            <p>
              <span className="font-medium">Temperature:</span>{" "}
              {weather.temperature}°C
            </p>
            <p>
              <span className="font-medium">Humidity:</span>{" "}
              {weather.humidity}%
            </p>
            <p className="capitalize">
              <span className="font-medium">Condition:</span>{" "}
              {weather.weather}
            </p>
          </div>
        )}

        {!loading && !weather && (
          <p className="text-sm text-slate-500">
            Weather data not available
          </p>
        )}
      </div>
    </div>
  );
}
