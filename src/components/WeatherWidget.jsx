import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Loader2, CloudLightning, Snowflake, MapPin } from 'lucide-react';

export default function WeatherWidget({ lat, lng, cityName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWeatherInfo = (code) => {
    if (code === 0) return { icon: <Sun className="text-amber-400" size={24} />, text: "Ciel dégagé" };
    if (code >= 1 && code <= 3) return { icon: <Cloud className="text-slate-300" size={24} />, text: "Nuageux" };
    if (code >= 51 && code <= 67) return { icon: <CloudRain className="text-blue-400" size={24} />, text: "Pluvieux" };
    if (code >= 95) return { icon: <CloudLightning className="text-purple-400" size={24} />, text: "Orageux" };
    return { icon: <Cloud className="text-slate-400" size={24} />, text: "Météo variable" };
  };

  useEffect(() => {
    // Si on n'a pas de coordonnées, on ne peut rien faire
    if (!lat || !lng) {
      setError("Position GPS manquante");
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        // On interroge directement la station la plus proche via lat/lng
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();

        setWeather({
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          code: data.current.weather_code
        });
      } catch (err) {
        setError("Station météo indisponible");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  if (loading) return <div className="flex items-center gap-2 text-slate-500 p-4"><Loader2 className="animate-spin" size={16}/> Connexion station...</div>;
  if (error) return <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-[10px]">{error}</div>;

  const info = getWeatherInfo(weather.code);

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-lg w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
            <MapPin size={10} className="text-amber-500"/> Station locale
          </h4>
          <p className="text-white font-bold text-sm">{cityName || "Secteur Ruche"}</p>
        </div>
        {info.icon}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0f172a]/50 p-2 rounded-xl border border-white/5 flex flex-col items-center">
          <Thermometer size={12} className="text-orange-500 mb-1" />
          <span className="text-white font-black text-xs">{weather.temp}°</span>
        </div>
        <div className="bg-[#0f172a]/50 p-2 rounded-xl border border-white/5 flex flex-col items-center">
          <Droplets size={12} className="text-blue-500 mb-1" />
          <span className="text-white font-black text-xs">{weather.humidity}%</span>
        </div>
        <div className="bg-[#0f172a]/50 p-2 rounded-xl border border-white/5 flex flex-col items-center">
          <Wind size={12} className="text-teal-500 mb-1" />
          <span className="text-white font-black text-[10px]">{weather.wind}km/h</span>
        </div>
      </div>
    </div>
  );
}