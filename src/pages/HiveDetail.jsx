import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  ArrowLeft, Bluetooth, Wifi, Thermometer, Droplets, 
  Battery, Scale, Download, MapPin, Activity, Settings, Trash2 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Sous-composants
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import HiveSettingsModal from '../components/HiveSettingsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function HiveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [hiveInfo, setHiveInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const last = data.length > 0 ? data[data.length - 1] : null;

  useEffect(() => {
    loadInitialData();

    // ECOUTE CLOUD (WIFI)
    const channel = supabase.channel(`live_hive_${id}`)
      .on('postgres_changes', 
        { event: 'INSERT', table: 'measurements', filter: `hive_id=eq.${id}` }, 
        (payload) => {
          setData(prev => [...prev, payload.new]);
          toast.success("Synchronisation WiFi : Donnée reçue");
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  async function loadInitialData() {
    setLoading(true);
    // On sélectionne name et address suite au changement de SQL
    const { data: hive } = await supabase.from('hives').select('*').eq('id', id).single();
    const { data: m } = await supabase.from('measurements').select('*').eq('hive_id', id).order('created_at', { ascending: true });
    
    setHiveInfo(hive);
    setData(m || []);
    setLoading(false);
  }

  // --- BLUETOOTH ---
  const connectBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({ 
        filters: [{ namePrefix: 'BeeMonitor' }], 
        optionalServices: ['environmental_sensing'] 
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('environmental_sensing');
      const characteristic = await service.getCharacteristic('temperature');
      
      setIsBleConnected(true);
      toast.success("Liaison Directe Bluetooth Active");

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const raw = new TextDecoder().decode(e.target.value);
        const [temp, humi, weight, batt] = raw.split(',');
        
        const measure = { 
          hive_id: id, 
          temperature: +temp, 
          humidity: +humi, 
          weight: +weight, 
          battery: +batt, 
          created_at: new Date().toISOString() 
        };
        setData(prev => [...prev, measure]);
      });
    } catch { 
      toast.error("Connexion Bluetooth échouée"); 
    }
  };

  // --- EXPORT fichier CSV ---
  const exportToCSV = () => {
    const headers = "Date,Heure,Poids(kg),Temp(C),Humi(%),Bat(%)\n";
    const csvContent = data.map(m => {
      const d = new Date(m.created_at);
      return `${d.toLocaleDateString()},${d.toLocaleTimeString()},${m.weight},${m.temperature},${m.humidity},${m.battery}`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // On utilise name ici pour le nom du fichier
    link.setAttribute('download', `${hiveInfo?.name || 'Ruche'}_Data.csv`);
    link.click();
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-amber-500 gap-4">
      <Activity className="animate-spin" size={32} />
      <span className="font-black tracking-[0.3em] text-[10px] uppercase">Liaison en cours...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden font-sans">
      <Toaster position="bottom-center" />
      <BackgroundSlider />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft size={18}/> Retour
        </button>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-4 border-r border-white/10 pr-4">
            <button onClick={() => setShowSettings(true)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-amber-500 transition-all border border-white/5" title="Paramètres">
              <Settings size={18} />
            </button>
            <button onClick={() => setShowDelete(true)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-white/5" title="Supprimer">
              <Trash2 size={18} />
            </button>
          </div>

          <button onClick={exportToCSV} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all text-slate-300 uppercase tracking-widest">
            <Download size={14}/> CSV
          </button>
          
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-2 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                <Wifi size={14} className="animate-pulse" /> Cloud
              </div>
              <button onClick={connectBluetooth} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${isBleConnected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>
                <Bluetooth size={14}/> {isBleConnected ? 'Direct' : 'Bluetooth'}
              </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12 w-full flex-grow">
        <div className="bg-slate-900/40 border border-white/10 rounded-[3.5rem] p-8 md:p-16 backdrop-blur-3xl shadow-2xl">
          
          {/* TITRE ET ADRESSE : CORRIGÉS ICI */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-amber-500 uppercase leading-none">
              {hiveInfo?.name || "Sans Nom"}
            </h1>
            <p className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mt-4 tracking-[0.3em]">
              <MapPin size={16} className="text-amber-500" /> {hiveInfo?.address || "Lieu non défini"}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Kpi icon={<Scale/>} label="Masse" value={last?.weight} unit="kg" color="text-amber-500" />
            <Kpi icon={<Thermometer/>} label="Interne" value={last?.temperature} unit="°C" color="text-orange-500" />
            <Kpi icon={<Droplets/>} label="Humidité" value={last?.humidity} unit="%" color="text-blue-500" />
            <Kpi icon={<Battery/>} label="Batterie" value={last?.battery} unit="%" color="text-green-500" />
          </div>

          <div className="bg-black/30 rounded-[2.5rem] p-4 md:p-10 border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 mb-8 ml-4">
              <Activity size={18} className="text-amber-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Live Data Analytics</h3>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer>
                <LineChart data={data}>
                  <XAxis dataKey="created_at" hide />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '12px'}} 
                    itemStyle={{fontWeight: '900', textTransform: 'uppercase'}}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '30px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}} />
                  <Line name="Poids" type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={5} dot={false} animationDuration={1000} />
                  <Line name="Temp" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line name="Humi" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showSettings && (
        <HiveSettingsModal 
          hive={hiveInfo} 
          onClose={() => setShowSettings(false)} 
          onRefresh={loadInitialData} 
        />
      )}
      
      {showDelete && (
        <DeleteConfirmModal 
          hive={hiveInfo} 
          onClose={() => setShowDelete(false)} 
          onDeleted={() => navigate('/dashboard')} 
        />
      )}
    </div>
  );
}

const Kpi = ({ icon, label, value, unit, color }) => (
  <div className="bg-[#0f172a]/60 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/5 transition-all group shadow-xl">
    <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${color} opacity-80 group-hover:opacity-100`}>
      {icon} {label}
    </div>
    <div className="text-4xl font-black tracking-tighter">
      {value ?? '--'}
      <span className="text-xs text-slate-500 ml-2 font-bold uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);