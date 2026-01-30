import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BottomNav } from '../components/BottomNav';
import { User, Car, Home, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [minhasReservas, setMinhasReservas] = useState([]);

  // Função principal movida para dentro do useEffect para evitar erro de dependência
  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // Busca dados pessoais
      const { data: perfilData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
      
      setProfile(perfilData);

      // Busca histórico de reservas SÓ DESSE USUÁRIO
      const { data: reservasData } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('data_reserva', { ascending: false });
      
      if (reservasData) setMinhasReservas(reservasData);
    }

    carregarPerfil();
  }, [navigate]); // Adicionamos 'navigate' que é externo, mas seguro

  async function cancelarReserva(id) {
    if(!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    
    if (error) {
        alert('Erro ao cancelar: ' + error.message);
    } else {
        // Recarrega a página ou remove o item da lista localmente para atualizar
        setMinhasReservas(minhasReservas.filter(r => r.id !== id));
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="bg-blue-600 pb-10 pt-12 px-6 rounded-b-[2.5rem] shadow-xl shadow-blue-200/50 text-white">
        <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <User size={32} className="text-white"/>
            </div>
            <div>
                <h1 className="text-2xl font-bold">{profile?.nome || 'Carregando...'}</h1>
                <p className="opacity-80">Condomínio Solar</p>
            </div>
        </div>
        
        {/* Cards de Info */}
        <div className="flex gap-3 mt-6">
            <div className="bg-blue-700/50 p-3 rounded-xl flex-1 flex items-center gap-2">
                <Home size={18} className="opacity-70"/>
                <span className="font-medium text-sm">Apt {profile?.apartamento}</span>
            </div>
            <div className="bg-blue-700/50 p-3 rounded-xl flex-1 flex items-center gap-2">
                <Car size={18} className="opacity-70"/>
                <span className="font-medium text-sm truncate">{profile?.modelo_carro}</span>
            </div>
        </div>
      </div>

      <main className="px-6 mt-8">
        <h2 className="font-bold text-gray-800 mb-4 text-lg">Meu Histórico</h2>
        
        {minhasReservas.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Você ainda não fez reservas.</p>
        ) : (
            <div className="space-y-3">
                {minhasReservas.map(reserva => (
                    <div key={reserva.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">
                                {new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {reserva.hora_inicio.slice(0,5)} até {reserva.hora_fim.slice(0,5)} • Carregador 0{reserva.charger_id}
                            </p>
                        </div>
                        <button 
                            onClick={() => cancelarReserva(reserva.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar Reserva"
                        >
                            <Trash2 size={18}/>
                        </button>
                    </div>
                ))}
            </div>
        )}

        <button onClick={handleLogout} className="mt-8 w-full border border-red-100 text-red-500 font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            <LogOut size={20}/> Sair da Conta
        </button>
      </main>

      <BottomNav />
    </div>
  );
}