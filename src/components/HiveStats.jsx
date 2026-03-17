import React from 'react';
import { Scale, Thermometer, Droplets, Battery } from 'lucide-react';

const Kpi = ({ icon, label, value, unit }) => (
  <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/10 transition-all group">
    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4 group-hover:text-amber-500 transition-colors">
      {icon} {label}
    </div>
    <div className="text-4xl font-black">
      {value ?? '--'} 
      <span className="text-sm text-slate-600 ml-1 font-medium">{unit}</span>
    </div>
  </div>
);

export default function HiveStats({ lastData }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <Kpi icon={<Scale/>} label="Poids" value={lastData?.weight} unit="kg" />
      <Kpi icon={<Thermometer/>} label="Temp." value={lastData?.temperature} unit="°C" />
      <Kpi icon={<Droplets/>} label="Humi." value={lastData?.humidity} unit="%" />
      <Kpi icon={<Battery/>} label="Batterie" value={lastData?.battery} unit="%" />
    </div>
  );
}