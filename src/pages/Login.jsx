import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Import de tes pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';

// --- COMPOSANT DE NAVIGATION (Pour utiliser useNavigate correctement) ---
function AppContent({ session, setSession }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouteur de session unique
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // Si l'utilisateur est déconnecté ou supprimé, on nettoie et on redirige
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate, setSession]);

  return (
    <Routes>
      {/* Routes Publiques */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      {/* Routes Privées */}
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/admin-dashboard" element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" replace />} />
      
      {/* Sécurité : Si l'URL n'existe pas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- COMPOSANT RACINE ---
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // RÈGLE D'OR : Les Hooks (useEffect) doivent TOUJOURS être en haut, 
  // jamais après un "if (loading) return..."
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  // On n'affiche le chargement qu'APRES avoir déclaré les hooks
  if (loading) {
    return (
      <div className="bg-[#020617] h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest">Initialisation...</p>
      </div>
    );
  }

  return (
    <Router>
      <AppContent session={session} setSession={setSession} />
    </Router>
  );
}