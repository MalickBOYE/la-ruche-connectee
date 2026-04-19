import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, AlertTriangle, CheckCircle, Cloud, Snowflake } from 'lucide-react';

export default function WeatherWidget({ lat, lng }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // URL Open-Meteo : Pas besoin de clé API !
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur réseau");
        
        const data = await response.json();
        
        // On formate les données pour simplifier le reste du composant
        setWeather({
          temp: data.current_weather.temperature,
          windSpeed: data.current_weather.windspeed,
          weatherCode: data.current_weather.weathercode,
          // On prend la précipitation actuelle si dispo, sinon 0
          rain: data.hourly?.precipitation?.[0] || 0 
        });
        setError(false);
      } catch (err) {
        console.error("Erreur météo:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (lat && lng) fetchWeather();
  }, [lat, lng]);

  if (loading) return (
    <div className="p-4 bg-black/20 rounded-2xl border border-white/5 animate-pulse">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Analyse du ciel...</span>
    </div>
  );

  if (error || !weather) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <p className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <AlertTriangle size={12} /> Service Météo Indisponible
      </p>
    </div>
  );

  // --- LOGIQUE D'ANALYSE ---
  const { temp, windSpeed, rain, weatherCode } = weather;
  
  // Traduction simplifiée des codes Open-Meteo
  const isRaining = weatherCode >= 51; // Codes 51+ correspondent à la pluie/neige
  const isVeryCold = temp < 12;
  const isVeryHot = temp > 35;

  let comment = "Conditions idéales pour le butinage ! 🐝";
  if (isRaining) comment = "Il pleut. Les abeilles restent à l'abri. 🌧️";
  else if (isVeryCold) comment = "Il fait frais : activité de vol réduite. ❄️";
  else if (isVeryHot) comment = "Forte chaleur : les ouvrières ventilent. 🔥";

  let alert = null;
  if (windSpeed > 45) alert = `Vent fort (${windSpeed} km/h) : Vol difficile. 💨`;
  else if (rain > 1) alert = `Précipitations (${rain}mm) : Risque pour le couvain.`;
  else if (temp > 38) alert = "Alerte Canicule : Surveillez l'eau !";

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARTE STATUT */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Météo Locale</span>
            {isRaining ? <CloudRain size={16} className="text-blue-400" /> : <Sun size={16} className="text-amber-400" />}
          </div>
          
          <p className="text-white text-xl font-black mb-1 italic">{temp}°C</p>
          <p className="text-slate-400 text-[11px] italic leading-tight border-l-2 border-amber-500/50 pl-2">
            "{comment}"
          </p>

          <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black">Vent</span>
              <span className="text-xs text-white font-bold">{windSpeed} <span className="text-[8px]">km/h</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-black">Pluie</span>
              <span className="text-xs text-white font-bold">{rain} <span className="text-[8px]">mm</span></span>
            </div>
          </div>
        </div>

        {/* CARTE ALERTES */}
        <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all ${alert ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[9px] font-black uppercase tracking-widest ${alert ? 'text-red-400' : 'text-emerald-400'}`}>
              {alert ? "Vigilance" : "Statut Ciel"}
            </span>
            {alert ? <AlertTriangle size={18} className="text-red-400" /> : <CheckCircle size={18} className="text-emerald-400" />}
          </div>
          <p className="text-white text-sm leading-snug">{alert || "Aucun danger climatique détecté pour vos colonies."}</p>
        </div>

      </div>
    </div>
  );
}