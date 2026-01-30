import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BottomNav } from '../components/BottomNav';
import { Calendar, LogOut, Copy, Check, Plus, Zap, User, Building } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Busca perfil do usuário logado
      let { data: profile } = await supabase
        .from('profiles')
        .select('*, accounts(nome_condominio, invite_code)')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      if (profile?.accounts?.invite_code) {
        setInviteCode(profile.accounts.invite_code);
      }

      // 2. MURAL: Busca TODAS as reservas do condomínio
      if (profile && profile.account_id) { 
        const hoje = new Date().toISOString().split('T')[0];
        
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*, profiles(nome, apartamento)') // <-- O SQL que rodamos permite trazer isso
            .eq('account_id', profile.account_id) 
            .gte('data_reserva', hoje) // Só futuras
            .order('data_reserva', { ascending: true })
            .order('hora_inicio', { ascending: true });
            
        if (bookings) setReservas(bookings);
      }
      
      setLoading(false);
    }

    carregarDados();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const copyInvite = () => {
    const link = `${window.location.origin}/cadastro?convite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-blue-600 pt-12 pb-20 px-6 rounded-b-[2.5rem] shadow-xl shadow-blue-200/50 relative">
        <div className="flex justify-between items-center text-white mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="text-yellow-300 fill-yellow-300" size={24}/>
                EletroVaga
            </h1>
            <p className="opacity-80 text-sm">
                {userProfile?.accounts?.nome_condominio || 'Carregando...'}
            </p>
          </div>
          <button onClick={handleLogout} className="bg-blue-700 p-2 rounded-lg hover:bg-blue-800 transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Área do Síndico */}
      {inviteCode && userProfile?.role === 'admin' && (
        <div className="px-6 -mt-10 mb-6 relative z-10">
            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg border border-slate-800">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">💎 Área do Síndico</p>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/10" onClick={copyInvite}>
                    <code className="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-blue-200 font-mono">
                        {window.location.origin}/cadastro?convite={inviteCode}
                    </code>
                    <button className="text-white hover:text-blue-400 transition-colors">
                        {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18}/>}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Botão Nova Reserva */}
      <div className={`px-6 ${userProfile?.role === 'admin' ? '' : '-mt-8 relative z-10'}`}>
        <Link to="/nova-reserva" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-300 flex items-center justify-between group transition-all">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                    <Plus size={24} className="text-white"/>
                </div>
                <div className="text-left">
                    <p className="font-bold text-lg">Nova Reserva</p>
                    <p className="text-blue-100 text-sm">Agendar horário</p>
                </div>
            </div>
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition">
                <Calendar size={20}/>
            </div>
        </Link>
      </div>

      {/* MURAL DE RESERVAS */}
      <main className="px-6 mt-8">
        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-lg">
            Mural do Condomínio
        </h2>

        {loading ? (
            <div className="flex justify-center py-10"><span className="animate-spin text-blue-600"><Zap/></span></div>
        ) : reservas.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Calendar className="mx-auto text-gray-300 mb-2" size={40}/>
                <p className="text-gray-500">Nenhum agendamento futuro.</p>
                <p className="text-sm text-gray-400">A fila está livre!</p>
            </div>
        ) : (
            <div className="space-y-3">
              {reservas.map((reserva) => (
                <div key={reserva.id} className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center p-3 border-b border-gray-50">
                    <div className="bg-blue-50 text-blue-700 font-bold p-2 rounded-lg mr-3 text-center min-w-[60px]">
                        {reserva.hora_inicio.slice(0,5)}
                    </div>
                    <div>
                        {/* AQUI ESTÁ O MURAL VISÍVEL PARA TODOS */}
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                             <User size={16} className="text-gray-400"/> 
                             {reserva.profiles?.nome || 'Vizinho'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Building size={12}/>
                            Apt {reserva.profiles?.apartamento}
                        </div>
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="bg-gray-50 px-3 py-2 flex justify-between items-center text-xs text-gray-500">
                     <span>{new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                     <span className="font-bold text-blue-600">Carregador 0{reserva.charger_id}</span>
                  </div>
                </div>
              ))}
            </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}