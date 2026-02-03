import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Calendar, Share, Check, Zap, Users, Trash2, User, Home } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [reservations, setReservations] = useState([]); // Estado para as reservas
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      setUser(user);

      // 1. Busca Perfil e Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, role')
        .eq('id', user.id)
        .single();

      if (profile?.account_id) {
        // 2. Busca Dados do Condomínio
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profile.account_id)
          .single();
        
        setAccount({ ...accountData, role: profile.role });

        // 3. Busca Reservas (Somente futuras)
        fetchReservations(profile.account_id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (accountId) => {
    // Supondo que sua tabela tenha: id, data_inicio, profiles(full_name, apartamento)
    // Ajuste os campos conforme seu banco de dados real
    const { data, error } = await supabase
      .from('reservations')
      .select('*, profiles(full_name, apartamento)')
      .eq('account_id', accountId)
      .gte('data_inicio', new Date().toISOString()) // Apenas futuras
      .order('data_inicio', { ascending: true });

    if (!error) setReservations(data);
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Erro ao deletar: " + error.message);
    } else {
      // Atualiza a lista na tela removendo o item deletado
      setReservations(reservations.filter(r => r.id !== id));
    }
  };

  const handleCopyLink = () => {
    if (!account?.invite_code) return;
    const link = `${window.location.origin}/cadastro?convite=${account.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24"> {/* pb-24 para não esconder conteudo atrás do menu */}
      
      {/* --- CABEÇALHO --- */}
      <header className="bg-white py-6 px-6 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-2xl">
              <Zap className="fill-blue-600" size={28}/> EletroVaga
          </div>
          <p className="text-gray-500 text-sm mt-1">{account?.nome_condominio}</p>
        </div>
        {/* Botão Sair discreto no topo */}
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="text-gray-400 hover:text-red-600">
          <LogOut size={20} />
        </button>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-6">

        {/* --- ÁREA DO SÍNDICO (Convite) --- */}
        {account?.role === 'admin' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <Users size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Convite Moradores</h3>
                    <p className="text-gray-500 text-xs">Link para cadastro no condomínio.</p>
                </div>
            </div>
            <button 
                onClick={handleCopyLink}
                className={`w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}
            >
                {copied ? <><Check size={16}/> Copiado</> : <><Share size={16}/> Copiar Link</>}
            </button>
          </div>
        )}

        {/* --- BOTÃO NOVA RESERVA --- */}
        <button 
          onClick={() => navigate('/nova-reserva')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Nova Reserva</h2>
              <p className="text-blue-100">Agendar horário</p>
            </div>
          </div>
          <Calendar size={40} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* --- MURAL DE RESERVAS --- */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-4 ml-1 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600"/> Próximos Agendamentos
          </h3>
          
          {reservations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
              <p className="text-gray-400 font-medium">A fila está livre! ⚡</p>
              <p className="text-gray-400 text-sm">Nenhum agendamento futuro.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reserva) => (
                <div key={reserva.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  
                  {/* Informações da Reserva */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 h-12 w-12 rounded-lg flex flex-col items-center justify-center text-gray-600 font-bold leading-none">
                      <span className="text-xs uppercase">{new Date(reserva.data_inicio).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                      <span className="text-xl">{new Date(reserva.data_inicio).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {new Date(reserva.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {reserva.profiles?.full_name || 'Morador'} • Apt {reserva.profiles?.apartamento || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Lixeira (Só para Admin ou Dono da reserva) */}
                  {(account?.role === 'admin' || user.id === reserva.user_id) && (
                    <button 
                      onClick={() => handleDeleteReservation(reserva.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancelar Reserva"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- MENU INFERIOR (App Style) --- */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center z-20 safe-area-bottom">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <Home size={24} className="fill-current"/>
          <span className="text-xs font-medium">Início</span>
        </button>
        
        <div className="w-px h-8 bg-gray-200"></div>

        <button 
          onClick={() => navigate('/perfil')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <User size={24} />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </nav>

    </div>
  );
}