import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Tag, MapPin, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HiveSettingsModal({ hive, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    location: hive.location,
    address: hive.address
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('hives')
      .update({ location: formData.location, address: formData.address })
      .eq('id', hive.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Informations mises à jour !");
      onRefresh();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
        <h3 className="text-2xl font-black italic text-amber-500 mb-8 uppercase tracking-tighter">Paramètres Ruche</h3>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom de la ruche</label>
            <div className="relative mt-2">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={formData.location}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-amber-500"
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Localisation (Adresse)</label>
            <div className="relative mt-2">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={formData.address}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-amber-500"
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all uppercase tracking-widest">
            <Save size={18}/> Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}