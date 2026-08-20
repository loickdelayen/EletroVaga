import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sun, LogOut, Plus, Settings, Wrench, Droplets, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';

export default function DashboardSolar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [manutencoes, setManutencoes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Busca o perfil para achar o ID da conta solar
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      if (profileData?.solar_account_id) {
        // Busca os dados da Empresa
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profileData.solar_account_id)
          .single();
        
        setAccount(accountData);

        // Busca a lista de manutenções dessa empresa
        const { data: manutencoesData } = await supabase
          .from('manutencoes')
          .select('*')
          .eq('account_id', profileData.solar_account_id)
          .order('data_agendada', { ascending: true });

        setManutencoes(manutencoesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar painel solar:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Função para retornar o ícone e cor certa dependendo do serviço
  const getBadgeServico = (tipo) => {
    switch (tipo) {
      case 'Limpeza':
        return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold uppercase"><Droplets size={12}/> Limpeza</span>;
      case 'Revisão':
        return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-bold uppercase"><CheckCircle2 size={12}/> Revisão Anual</span>;
      case 'Falha':
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-bold uppercase"><AlertTriangle size={12}/> Falha / Erro</span>;
      default:
        return <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-bold uppercase"><Wrench size={12}/> Manutenção</span>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-orange-500"><Sun className="animate-spin" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* CABEÇALHO SOLAR */}
      <header className="bg-slate-900 text-white p-6 shadow-md rounded-b-3xl">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-4">
                    <Sun size={20} className="fill-orange-400/20"/> EletroVaga Solar
                </div>
                <h1 className="text-2xl font-bold">Olá, {profile?.full_name?.split(' ')[0]}</h1>
                <p className="text-slate-400 text-sm mt-1">{account?.nome_condominio}</p>
                {/* Etiqueta de plano */}
                <div className="mt-3 inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs text-slate-300 font-medium tracking-wide uppercase">
                    Plano {account?.max_chargers} Clientes
                </div>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <LogOut size={20} className="text-slate-300"/>
            </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        
        {/* BOTÃO PRINCIPAL: NOVA MANUTENÇÃO */}
        {/* Futuramente, criaremos a tela '/nova-manutencao' */}
        <button 
            onClick={() => alert('Em breve: Tela de Agendamento!')} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl flex items-center justify-between font-bold text-lg shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 mb-10"
        >
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Plus size={24}/></div>
                Agendar Manutenção
            </div>
            <Calendar className="opacity-50" size={24}/>
        </button>

        {/* LISTA DE MANUTENÇÕES */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Wrench className="text-orange-500" size={20}/> Próximos Chamados
        </h2>

        {manutencoes.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun className="text-orange-400" size={32}/>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum chamado agendado</h3>
                <p className="text-slate-500">Sua agenda de manutenções está livre por enquanto.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {manutencoes.map(chamado => (
                    <div key={chamado.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                        <div className="flex items-center gap-5">
                            <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[4rem] border border-slate-100">
                                <span className="block text-xs text-slate-500 font-bold uppercase mb-1">
                                    {new Date(chamado.data_agendada).toLocaleDateString('pt-BR', { month: 'short' })}
                                </span>
                                <span className="block text-2xl font-black text-slate-800 leading-none">
                                    {new Date(chamado.data_agendada).getDate()}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{chamado.cliente_nome}</h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-sm text-slate-500 font-medium">
                                        {new Date(chamado.data_agendada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    {getBadgeServico(chamado.tipo_servico)}
                                </div>
                            </div>
                        </div>
                        <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                            <Settings size={20} className="text-slate-400"/>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </main>

    </div>
  );
}