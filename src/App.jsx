import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HiveDetail from './pages/HiveDetail';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import PendingValidation from './pages/PendingValidation';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'admin@rucheconnectee.com';

  useEffect(() => {
    const checkSessionAndStatus = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        // 1. Si c'est l'admin, on fonce vers /admin
        if (currentSession.user.email === ADMIN_EMAIL) {
          navigate('/admin', { replace: true });
        } 
        else {
          // 2. Si c'est un utilisateur, on vérifie son statut dans la table profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', currentSession.user.id)
            .single();

          if (profile?.status === 'active') {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/pending', { replace: true });
          }
        }
      }
      setLoading(false);
    };

    checkSessionAndStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      
      if (_event === 'SIGNED_IN' && currentSession) {
        if (currentSession.user.email === ADMIN_EMAIL) {
          navigate('/admin', { replace: true });
        } else {
          // Vérification rapide du statut au login
          const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', currentSession.user.id)
            .single();

          if (profile?.status === 'active') navigate('/dashboard', { replace: true });
          else navigate('/pending', { replace: true });
        }
      }

      if (_event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex items-center justify-center text-amber-500 font-black uppercase text-[10px] tracking-widest">
      Chargement du système...
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      {/* Route de salle d'attente */}
      <Route path="/pending" element={session ? <PendingValidation /> : <Navigate to="/login" />} />

      {/* Accès restreint au statut 'active' géré par le useEffect au-dessus, 
          mais on laisse les routes ici pour le rendu */}
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" />} />
      
      <Route path="/admin" element={
        session && session.user.email === ADMIN_EMAIL ? <AdminDashboard /> : <Navigate to="/dashboard" />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}