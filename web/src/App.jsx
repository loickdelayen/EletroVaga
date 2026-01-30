import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Capacitor } from '@capacitor/core'; // <--- Importante para detectar se é App

// IMPORTANDO TODAS AS PÁGINAS
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import RegisterMorador from './pages/RegisterMorador';
import NewReservation from './pages/NewReservation'; 
import UserProfile from './pages/UserProfile';

// Componente que decide: É App ou Site?
function HomeRedirect() {
  // Se for "Native" (App instalado), manda pro Login
  if (Capacitor.isNativePlatform()) {
    return <Navigate to="/login" replace />;
  }
  // Se for navegador normal, mostra a Landing Page
  return <LandingPage />;
}

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
        {/* Rota Inteligente: Decide se mostra Landing ou Login */}
        <Route path="/" element={<HomeRedirect />} />
        
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cadastro" element={<RegisterMorador />} />
        
        {/* Ajuste no Login: Se já estiver logado, vai pro App */}
        <Route 
          path="/login" 
          element={!session ? <LoginPage /> : <Navigate to="/app" />} 
        />

        {/* Rotas Privadas (Só entra logado) */}
        <Route 
          path="/app" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
           path="/nova-reserva"
           element={session ? <NewReservation /> : <Navigate to="/login" />} 
        />
        
        <Route 
           path="/perfil"
           element={session ? <UserProfile /> : <Navigate to="/login" />} 
        />

        {/* Se não achar nada, joga pra raiz (que vai decidir de novo) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}