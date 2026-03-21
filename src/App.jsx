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
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        setSession(currentSession);

        if (currentSession) {
          // Si c'est l'admin
          if (currentSession.user.email === ADMIN_EMAIL) {
            navigate('/admin', { replace: true });
          } else {
            // Vérifier le profil utilisateur
            const { data: profile, error: profileError } = await supabase
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
      } catch (err) {
        console.error("Erreur d'initialisation:", err);
      } finally {
        // QUOI QU'IL ARRIVE, on arrête le chargement après 1 seconde max
        setTimeout(() => setLoading(false), 500);
      }
    };

    checkSessionAndStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (_event === 'SIGNED_OUT') navigate('/login', { replace: true });
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div className="bg-[#020617] h-screen flex flex-col items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
      <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest animate-pulse">
        Initialisation Beemonitor...
      </p>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<UpdatePassword />} />
      
      <Route path="/pending" element={session ? <PendingValidation /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/hive/:id" element={session ? <HiveDetail /> : <Navigate to="/login" />} />
      
      <Route path="/admin" element={
        session && session.user.email === ADMIN_EMAIL ? <AdminDashboard /> : <Navigate to="/dashboard" />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}