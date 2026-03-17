import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Layout, MapPin, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddHiveModal({ onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',    // Ce qui sera tapé dans # IDENTIFICATION
    address: '', // Ce qui sera tapé dans @ LOCALISATION
    alert_phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // ON UTILISE ICI LES COLONNESname ET address DU SQL
      const { error } = await supabase.from('hives').insert([
        {
          name: formData.name,      
          address: formData.address,
          alert_phone: formData.alert_phone,
          user_id: user.id
        }
      ]);

      if (error) throw error;

      toast.success('Ruche enregistrée !');
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Nouvelle <span className="text-amber-500">Ruche</span></h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <Layout size={14} className="text-amber-500" /> # Identification
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Ruche Alpha 1"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
              <MapPin size={14} className="text-amber-500" /> @ Localisation
            </label>
            <input
              required
              type="text"
              placeholder="Ex: 3 rue des martyrs, Annecy"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Enregistrer la ruche'}
          </button>
        </form>
      </div>
    </div>
  );
}