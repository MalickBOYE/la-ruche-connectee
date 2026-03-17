import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const timeoutTimer = useRef(null);

  // --- LOGIQUE DE SÉCURITÉ : TIMEOUT 1H ---
  
  const logoutUser = async () => {
    await supabase.auth.signOut();
    setShowTimeoutModal(false);
    setSession(null);
  };

  const resetTimer = () => {
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    
    // Si l'utilisateur est connecté, on lance le compte à rebours
    if (session) {
      timeoutTimer.current = setTimeout(() => {
        setShowTimeoutModal(true); // Affiche l'alerte après 1h d'inactivité
      }, 3600000); // 1 heure en millisecondes
    }
  };

  useEffect(() => {
    // 1. Initialisation
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Écoute des changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Détection d'activité (souris, clavier, tactile) pour reset le timer
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Lancement initial

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [session]); // Se relance quand la session change

  if (loading) return <div className="bg-[#020617] h-screen flex items-center justify-center text-amber-500">Chargement...</div>;

  return (
    <Router>
      {/* MODAL DE TIMEOUT (Pop-up de sécurité) */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-amber-500/50 p-8 rounded-[2.5rem] max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl font-black text-amber-500 mb-4">SÉCURITÉ</h2>
            <p className="text-slate-300 text-sm mb-8">Votre session a expiré après 1 heure d'inactivité. Souhaitez-vous rester connecté ?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setShowTimeoutModal(false); resetTimer(); }}
                className="bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all"
              >
                CONTINUER LA SESSION
              </button>
              <button 
                onClick={logoutUser}
                className="text-slate-500 text-xs font-bold uppercase tracking-widest py-2"
              >
                SE DÉCONNECTER
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}