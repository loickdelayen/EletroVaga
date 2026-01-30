import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// IMPORTANDO TODAS AS PÁGINAS
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import RegisterMorador from './pages/RegisterMorador';
import NewReservation from './pages/NewReservation'; // <--- O IMPORT TEM QUE ESTAR AQUI
import UserProfile from './pages/UserProfile';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center">Carregando...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cadastro" element={<RegisterMorador />} />
        
        <Route 
          path="/login" 
          element={!session ? <LoginPage /> : <Navigate to="/app" />} 
        />

        {/* Rotas Privadas (Só entra logado) */}
        <Route 
          path="/app" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* AQUI ESTÁ A ROTA QUE FALTAVA: */}
        <Route 
           path="/nova-reserva"
           element={session ? <NewReservation /> : <Navigate to="/login" />} 
        />
        
        <Route 
           path="/perfil"
           element={session ? <UserProfile /> : <Navigate to="/login" />} 
        />

        {/* Se não achar nada, joga pra Landing Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}