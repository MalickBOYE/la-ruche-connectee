import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (error) throw error;
      alert("Inscription réussie ! Votre compte est en attente de validation par l'administrateur.");
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md z-10 bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-3xl font-black text-white text-center mb-8 uppercase">Créer un compte</h1>
        
        {error && <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm"><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Prénom" required className="bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <input type="text" placeholder="Nom" required className="bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white focus:outline-none focus:border-amber-500/50" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="tel" placeholder="Téléphone (facultatif)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 text-white focus:outline-none focus:border-amber-500/50" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          <input type="password" placeholder="Mot de passe" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <input type="password" placeholder="Confirmer" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-amber-500/50" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />

          <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
            {loading ? 'Chargement...' : <><UserPlus size={20}/> S'inscrire</>}
          </button>
        </form>
      </div>
    </div>
  );
}