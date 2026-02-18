import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Calendar, Share, Check, RefreshCw, Clock, Trash2, Home, User, Lock, CreditCard } from 'lucide-react';
import logo from '../assets/eletrovagas-logo.png'; 
import MembersList from '../components/MembersList';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  
  // ESTADO NOVO: Controla a tela de bloqueio
  const [isLocked, setIsLocked] = useState(false);

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
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profile.account_id)
          .single();
        
        // --- 🔒 AQUI ESTAVA O ERRO! LÓGICA CORRIGIDA: ---
        // Antes: navigate('/checkout') -> Errado, mandava recriar conta
        // Agora: setIsLocked(true) -> Certo, mostra a tela de pagar faturas
        if (['canceled', 'past_due', 'unpaid'].includes(accountData.status)) {
            setAccount(accountData); // Salva os dados para mostrar o nome
            setIsLocked(true);       // Ativa o bloqueio
            setLoading(false);       // Para o loading
            return;                  // Para a execução aqui
        }
        
        setAccount({ ...accountData, role: profile.role });
        fetchReservations(profile.account_id);
      } else {
        navigate('/login');
      }
    } catch (error) { 
        console.error(error);
        navigate('/login');
    } finally { 
        setLoading(false); 
    }
  };

  // --- FUNÇÃO QUE CHAMA O SEU BACKEND 'portal-link' ---
  const handleManageSubscription = async () => {
    try {
        // Chama a função que criamos no Supabase
        const { data, error } = await supabase.functions.invoke('portal-link');
        
        if (error) throw error;
        
        // Redireciona o usuário para o link mágico do Stripe
        if (data?.url) window.location.href = data.url; 
        
    } catch (err) {
        alert('Erro ao conectar com o sistema de pagamento. Tente novamente.');
        console.error(err);
    }
  };

  // ... (Funções auxiliares continuam iguais: fetchReservations, etc)
  const fetchReservations = async (accountId) => {
    const dataSegura = new Date();
    dataSegura.setDate(dataSegura.getDate() - 1); 
    const { data } = await supabase.from('reservations').select('*, profiles(full_name, apartamento, id)').eq('account_id', accountId).gte('data_inicio', dataSegura.toISOString()).order('data_inicio', { ascending: true });
    setReservations(data || []);
  };
  const handleDeleteReservation = async (id) => { if (!window.confirm("Cancelar?")) return; await supabase.from('reservations').delete().eq('id', id); fetchReservations(account.id); };
  const isInviteExpired = () => account?.invite_expires_at && new Date(account.invite_expires_at) < new Date();
  const handleRotateLink = async () => { setRotating(true); await supabase.rpc('rotate_invite_code', { account_id_param: account.id }); window.location.reload(); };
  const handleCopyLink = () => { navigator.clipboard.writeText(`${window.location.origin}/cadastro?convite=${account.invite_code}`); setCopied(true); setTimeout(() => setCopied(false), 3000); };
  const getDaysLeft = () => Math.ceil((new Date(account?.invite_expires_at) - new Date()) / (86400000));

  if (loading) return <div className="h-screen flex items-center justify-center">Verificando...</div>;

  // --- 🔒 TELA DE BLOQUEIO (RENDERIZAÇÃO) ---
  if (isLocked) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                    <Lock size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Suspenso</h1>
                <p className="text-gray-500 mb-8">
                    A assinatura do condomínio <strong>{account?.nome_condominio}</strong> precisa de atenção.
                </p>
                
                {/* BOTÃO QUE LEVA PARA O STRIPE */}
                <button 
                    onClick={handleManageSubscription}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                    <CreditCard size={20}/>
                    Resolver Pendência
                </button>
                
                <button 
                    onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
                    className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline"
                >
                    Sair da conta
                </button>
            </div>
        </div>
      );
  }

  // --- TELA NORMAL DO DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        {/* ... (Seu conteúdo normal do Dashboard: Botões, Lista, Reservas) ... */}
        {/* Vou resumir aqui para não ficar gigante, mas mantenha o código original de renderização abaixo */}
        
        {account?.role === 'admin' && (
          <div className={`p-5 rounded-2xl shadow-sm border ${isInviteExpired() ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Share size={24}/></div>
                    <div><h3 className="font-bold">Convidar Moradores</h3><p className="text-xs text-gray-500">Convite: {account.invite_code}</p></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopyLink} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">{copied ? "Copiado!" : "Copiar"}</button>
                    <button onClick={handleRotateLink} className="p-2 border rounded-lg hover:bg-gray-50"><RefreshCw size={20}/></button>
                </div>
             </div>
          </div>
        )}

        {account?.role === 'admin' && <MembersList accountId={account.id} />}

        <button onClick={() => navigate('/nova-reserva')} className="w-full bg-blue-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full"><Plus size={32}/></div>
                <div className="text-left"><h2 className="text-2xl font-bold">Nova Reserva</h2></div>
             </div>
             <Calendar size={40} className="opacity-50"/>
        </button>

        <div>
            <h3 className="font-bold text-lg mb-4 flex gap-2"><Calendar className="text-blue-600"/> Próximos</h3>
            <div className="space-y-3">
                {reservations.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-2 rounded text-center"><span className="text-xl font-bold">{new Date(r.data_inicio).getDate()}</span></div>
                            <div>
                                <p className="font-bold">{new Date(r.data_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                <p className="text-sm text-gray-500">{r.profiles?.full_name} - {r.profiles?.apartamento}</p>
                            </div>
                        </div>
                        {(account.role === 'admin' || user.id === r.profiles?.id) && <button onClick={() => handleDeleteReservation(r.id)}><Trash2 className="text-gray-300 hover:text-red-500"/></button>}
                    </div>
                ))}
            </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t py-3 px-6 flex justify-around safe-area-bottom">
        <button className="flex flex-col items-center text-blue-600"><Home/><span className="text-xs">Início</span></button>
        <button onClick={() => navigate('/perfil')} className="flex flex-col items-center text-gray-400"><User/><span className="text-xs">Perfil</span></button>
      </nav>
    </div>
  );
}