import { useState } from "react";
import { getCurrentWeather } from "../../api/weatherApi";

export default function WeatherModal({ isOpen, onClose }) {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getCurrentWeather(city);
      setWeather(res.data);
    } catch (err) {
      setWeather(null);
      setError("Unable to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      
      {/* Modal Card */}
      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl p-6 animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            🌤 Check Weather
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter city (e.g. Pune)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="
              w-full rounded-xl
              bg-white/60 backdrop-blur
              border border-white/40
              px-4 py-2
              text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-sky-500
            "
          />
        </div>

        {/* Action */}
        <button
          onClick={fetchWeather}
          className="
            mt-4 w-full
            rounded-xl
            bg-sky-600
            py-2
            text-white text-sm font-medium
            hover:bg-sky-700
            transition
          "
        >
          Get Weather
        </button>

        {/* Status */}
        <div className="mt-4">
          {loading && (
            <p className="text-sm text-slate-500">
              Fetching weather...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {!loading && weather && (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p><b>Location:</b> {weather.location}</p>
              <p><b>Temperature:</b> {weather.temperature}°C</p>
              <p><b>Humidity:</b> {weather.humidity}%</p>
              <p className="capitalize">
                <b>Condition:</b> {weather.weather}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
