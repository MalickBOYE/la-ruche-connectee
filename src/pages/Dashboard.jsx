import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Imports des sous-programmes (Composants)
import HiveCard from '../components/HiveCard';
import BackgroundSlider from '../components/BackgroundSlider';
import Footer from '../components/Footer';
import AddHiveModal from '../components/AddHiveModal';

export default function Dashboard() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHives();
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hives' }, () => fetchHives())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchHives() {
    const { data } = await supabase.from('hives').select('*').order('created_at', { ascending: false });
    if (data) setHives(data);
    setLoading(false);
  }

  const handleDelete = async (e, hive) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer définitivement la ruche "${hive.location}" ?`)) {
      const { error } = await supabase.from('hives').delete().eq('id', hive.id);
      if (!error) toast.success("Ruche supprimée");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-x-hidden">
      <Toaster position="bottom-center" />
      <BackgroundSlider />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain" />
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Bee Monitor</h1>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.3em]">Live Intelligence</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-white text-black font-black py-3 px-6 rounded-2xl transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20">
          <Plus size={18} /> Ajouter une ruche
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16 w-full flex-grow">
        <h2 className="text-5xl font-black mb-12 uppercase italic tracking-tighter">Tableau <span className="text-amber-500">de bord</span></h2>
        
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* APPEL DU SOUS-PROGRAMME HIVECARD */}
            {hives.map((hive) => (
              <HiveCard 
                key={hive.id} 
                hive={hive} 
                onNavigate={(id) => navigate(`/hive/${id}`)} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      {showAddModal && <AddHiveModal onClose={() => setShowAddModal(false)} onRefresh={fetchHives} />}
    </div>
  );
}