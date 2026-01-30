import { Link, useLocation } from 'react-router-dom';
import { Home, User, PlusCircle } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  // Função simples para saber qual aba está ativa e mudar a cor
  const isActive = (path) => location.pathname === path ? "text-blue-600" : "text-gray-400";

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-end pb-4">
        
        {/* Botão Home */}
        <Link to="/app" className={`flex flex-col items-center gap-1 ${isActive('/app')}`}>
          <Home size={24} strokeWidth={isActive('/app') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Agenda</span>
        </Link>

        {/* Botão Central de Nova Reserva (Destaque) */}
        <Link to="/nova-reserva" className="relative -top-5">
          <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
            <PlusCircle size={32} />
          </div>
        </Link>

        {/* Botão Perfil */}
        <Link to="/perfil" className={`flex flex-col items-center gap-1 ${isActive('/perfil')}`}>
          <User size={24} strokeWidth={isActive('/perfil') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>

      </div>
    </nav>
  );
}