import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Calendar, Share, Check, Zap, RefreshCw, Clock, Trash2, Home, User } from 'lucide-react';
import logo from '../assets/eletrovagas-logo.png'; 
import MembersList from '../components/MembersList'; // <--- Importamos a lista nova

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false); // Estado para o loading do botão de gerar link

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, role')
        .eq('id', user.id)
        .single();

      if (profile?.account_id) {
        // Busca condomínio
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profile.account_id)
          .single();
        
        setAccount({ ...accountData, role: profile.role });
        fetchReservations(profile.account_id);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchReservations = async (accountId) => {
    const { data } = await supabase
      .from('reservations')
      .select('*, profiles(full_name, apartamento, id)') // Pegamos o ID para saber se é dono da reserva
      .eq('account_id', accountId)
      .gte('data_inicio', new Date().toISOString())
      .order('data_inicio', { ascending: true });
    setReservations(data || []);
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (!error) setReservations(reservations.filter(r => r.id !== id));
  };

  // --- LÓGICA DO LINK DE CONVITE ---
  
  // Verifica se expirou
  const isInviteExpired = () => {
    if (!account?.invite_expires_at) return false;
    return new Date(account.invite_expires_at) < new Date();
  };

  // Gera novo link
  const handleRotateLink = async () => {
    setRotating(true);
    try {
        const { error } = await supabase.rpc('rotate_invite_code', { account_id_param: account.id });
        if (error) throw error;
        
        // Atualiza os dados na tela sem recarregar tudo
        const { data: newAccount } = await supabase.from('accounts').select('*').eq('id', account.id).single();
        setAccount({ ...newAccount, role: 'admin' });
        alert("Novo link gerado com sucesso! Validade: 7 dias.");
    } catch (err) {
        alert("Erro ao gerar link: " + err.message);
    } finally {
        setRotating(false);
    }
  };

  const handleCopyLink = () => {
    if (isInviteExpired()) return alert("Este link expirou. Gere um novo.");
    
    const link = `${window.location.origin}/cadastro?convite=${account.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Calcula dias restantes
  const getDaysLeft = () => {
    if (!account?.invite_expires_at) return 0;
    const diff = new Date(account.invite_expires_at) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };


  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER */}
      <header className="bg-white py-6 px-6 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div>
          <img src={logo} alt="Logo" className="h-8 w-auto object-contain mb-1" />
          <p className="text-gray-500 text-xs font-medium">{account?.nome_condominio}</p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="text-gray-400 hover:text-red-600">
          <LogOut size={20} />
        </button>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-6">

        {/* --- ÁREA DO SÍNDICO (Gerenciamento de Convite) --- */}
        {account?.role === 'admin' && (
          <div className={`p-5 rounded-2xl shadow-sm border transition-all ${isInviteExpired() ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                    <div className={`p-3 rounded-full ${isInviteExpired() ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isInviteExpired() ? <Clock size={24}/> : <Share size={24} />}
                    </div>
                    <div>
                        <h3 className={`font-bold ${isInviteExpired() ? 'text-red-700' : 'text-gray-900'}`}>
                            {isInviteExpired() ? 'Link de Convite Expirado' : 'Convidar Moradores'}
                        </h3>
                        <p className="text-gray-500 text-xs">
                            {isInviteExpired() 
                                ? 'Gere um novo link para permitir cadastros.' 
                                : `Válido por mais ${getDaysLeft()} dias.`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Botão Copiar (Só aparece se não expirou) */}
                    {!isInviteExpired() && (
                        <button 
                            onClick={handleCopyLink}
                            className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${copied ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {copied ? <><Check size={16}/> Copiado</> : 'Copiar Link'}
                        </button>
                    )}

                    {/* Botão Gerar Novo (Sempre aparece) */}
                    <button 
                        onClick={handleRotateLink}
                        disabled={rotating}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 bg-white"
                        title="Gerar novo código e renovar validade"
                    >
                        <RefreshCw size={20} className={rotating ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* --- LISTA DE MORADORES (NOVO) --- */}
        {account?.role === 'admin' && (
            <MembersList accountId={account.id} />
        )}

        {/* --- BOTÃO NOVA RESERVA --- */}
        <button 
          onClick={() => navigate('/nova-reserva')}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group mt-8"
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
          <h3 className="font-bold text-lg text-gray-900 mb-4 ml-1 flex items-center gap-2 mt-8">
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
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 h-12 w-12 rounded-lg flex flex-col items-center justify-center text-gray-600 font-bold leading-none">
                      <span className="text-xs uppercase">{new Date(reserva.data_inicio).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                      <span className="text-xl">{new Date(reserva.data_inicio).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {new Date(reserva.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User size={12}/> {reserva.profiles?.full_name} • <Home size={12}/> {reserva.profiles?.apartamento}
                      </p>
                    </div>
                  </div>

                  {(account?.role === 'admin' || user.id === reserva.profiles?.id) && (
                    <button 
                      onClick={() => handleDeleteReservation(reserva.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3 px-6 flex justify-around items-center z-20 safe-area-bottom">
        <button className="flex flex-col items-center gap-1 text-blue-600">
          <Home size={24} className="fill-current"/>
          <span className="text-xs font-medium">Início</span>
        </button>
        <div className="w-px h-8 bg-gray-200"></div>
        <button onClick={() => navigate('/perfil')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <User size={24} />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </nav>

    </div>
  );
}