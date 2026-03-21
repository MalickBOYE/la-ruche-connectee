import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

// --- IMPORTS DES PAGES ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Register from './pages/Register'; // <--- ON AJOUTE CET IMPORT
import AdminDashboard from './pages/AdminDashboard'; // Pour la suite

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const timeoutTimer = useRef(null);
  const navigate = useNavigate();

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setShowTimeoutModal(false);
    setSession(null);
    navigate('/login');
  };

  const resetTimer = () => {
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    if (session) {
      timeoutTimer.current = setTimeout(() => {
        setShowTimeoutModal(true);
      }, 3600000); // 1 heure
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (_event === 'SIGNED_OUT') navigate('/login');
    });

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [session, navigate]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex items-center justify-center text-amber-500 font-black uppercase text-xs">
      Chargement...
    </div>
  );

  return (
    <>
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-amber-500/50 p-8 rounded-[2.5rem] max-w-sm">
            <h2 className="text-2xl font-black text-amber-500 mb-4 uppercase italic">Sécurité</h2>
            <p className="text-slate-300 text-sm mb-8">Session expirée après 1 heure d'inactivité.</p>
            <button onClick={() => { setShowTimeoutModal(false); resetTimer(); }} className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl mb-2">CONTINUER</button>
            <button onClick={logoutUser} className="text-slate-500 text-xs font-bold uppercase">Se déconnecter</button>
          </div>
        </div>
      )}

      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        {/* LA LIGNE MAGIQUE ICI : */}
        <Route path="/register" element={<Register />} /> 
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<UpdatePassword />} />
        
        {/* --- ROUTES PRIVÉES --- */}
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/admin-dashboard" element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}