import React from 'react';
import { MapPin, ArrowRight, Trash2, Thermometer, Droplets } from 'lucide-react';

export default function HiveCard({ hive, onNavigate, onDelete }) {
  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all group shadow-2xl relative">
      
      <div className="relative h-48 overflow-hidden pointer-events-none">
        <img src="/images/abeille.png" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-700" alt="Bee" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
      </div>
      
      <div className="p-8">
        {/* TITRE : On utilise 'name' (au lieu de location) */}
        <h3 className="text-3xl font-black mb-1 text-white uppercase italic tracking-tighter">
          {hive.name || "RUCHE SANS NOM"}
        </h3>
        
        {/* ADRESSE : On utilise 'address' */}
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-8 flex items-center gap-1 tracking-widest">
          <MapPin size={12} className="text-amber-500"/> {hive.address || "ADRESSE NON DÉFINIE"}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Temp</span>
            <div className="text-2xl font-black text-white">{hive.last_temp || '--'}°C</div>
          </div>
          <div className="bg-[#1e293b]/50 p-4 rounded-2xl border border-white/5">
            <span className="text-slate-400 text-[9px] font-black uppercase mb-1 block">Humi</span>
            <div className="text-2xl font-black text-white">{hive.last_hum || '--'}%</div>
          </div>
        </div>
        
        <button 
          onClick={() => onNavigate(hive.id)} 
          className="w-full flex items-center justify-between bg-amber-500 text-black p-5 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20"
        >
          Analyses détaillées <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}