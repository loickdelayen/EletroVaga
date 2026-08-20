import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Sun, Loader2, ArrowLeft, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ESTADO NOVO: null = Tela de Escolha | 'ev' = EletroVaga | 'solar' = Solar
  const [portalSelecionado, setPortalSelecionado] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Tenta fazer o login no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // SE O E-MAIL NÃO EXISTIR OU A SENHA ESTIVER ERRADA
      if (authError) {
          alert(`Ops! E-mail ou senha incorretos. Se você ainda não tem uma conta no portal ${portalSelecionado === 'ev' ? 'EV' : 'Solar'}, feche esta mensagem e clique em 'Criar Conta' logo abaixo!`);
          setLoading(false);
          return; // Para a execução aqui
      }

      const userId = authData.user.id;

      // 2. Busca o Perfil do usuário (Agora ele tem duas "chaves")
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, solar_account_id')
        .eq('id', userId)
        .single();

      // 3. A REGRA DE BLOQUEIO / REDIRECIONAMENTO

      if (portalSelecionado === 'solar') {
          // Tentou entrar no Solar, mas a "chave" solar está vazia
          if (!profile?.solar_account_id) {
              await supabase.auth.signOut(); // Desloga por segurança
              alert("Você ainda não ativou um Plano de Manutenção Solar nesta conta. Redirecionando para a página de planos...");
              navigate('/checkout-solar'); // Rota (que vamos criar) para vender o plano Solar
              return;
          }
          // Se tem a chave, entra no painel!
          navigate('/solar');
      } 
      
      else if (portalSelecionado === 'ev') {
          // Tentou entrar no EV, mas a "chave" de condomínio está vazia
          if (!profile?.account_id) {
              await supabase.auth.signOut();
              alert("Você ainda não tem um Condomínio cadastrado. Redirecionando para a criação de conta...");
              navigate('/checkout'); // Vai para a venda do EV
              return;
          }
          // Se tem a chave, entra no painel!
          navigate('/app');
      }

    } catch (error) {
      alert('Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TELA 1: A ESCOLHA DO PORTAL ---
  if (!portalSelecionado) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
        <Link 
          to="/" 
          className="absolute top-6 left-6 p-3 bg-white text-gray-500 hover:text-blue-600 hover:shadow-md rounded-full transition-all border border-gray-200 flex items-center gap-2 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
          <span className="text-sm font-medium hidden sm:inline">Voltar para o site</span>
        </Link>

        <div className="max-w-3xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Bem-vindo ao Ecossistema</h1>
            <p className="text-slate-500">Selecione o seu portal de acesso abaixo para continuar.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Botão Portal EV (Condomínios) */}
            <button 
                onClick={() => setPortalSelecionado('ev')}
                className="group bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all text-left flex flex-col items-center text-center gap-4"
            >
                <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Zap size={40} className="fill-blue-600"/>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">EletroVaga <span className="text-blue-600">EV</span></h2>
                    <p className="text-slate-500 mt-2 text-sm">Portal para Síndicos e Moradores. Gestão de carregadores veiculares.</p>
                </div>
            </button>

            {/* Botão Portal Solar (Empresas) */}
            <button 
                onClick={() => setPortalSelecionado('solar')}
                className="group bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all text-left flex flex-col items-center text-center gap-4"
            >
                <div className="bg-orange-50 w-20 h-20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Sun size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">EletroVaga <span className="text-orange-500">Solar</span></h2>
                    <p className="text-slate-500 mt-2 text-sm">Portal para Empresas e Clientes. Gestão de manutenção fotovoltaica.</p>
                </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA 2: O FORMULÁRIO DE LOGIN (Com cores dinâmicas) ---
  
  // Objeto de temas para o Tailwind não se perder nas cores
  const temas = {
      ev: {
          bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', fillIcon: 'fill-blue-600',
          btnBase: 'bg-blue-600 hover:bg-blue-700', shadow: 'shadow-blue-200', ring: 'focus:ring-blue-500',
          link: 'text-blue-600',
          icone: <Zap className="text-blue-600 fill-blue-600" size={32}/>
      },
      solar: {
          bgIcon: 'bg-orange-50', textIcon: 'text-orange-500', fillIcon: '',
          btnBase: 'bg-orange-500 hover:bg-orange-600', shadow: 'shadow-orange-200', ring: 'focus:ring-orange-500',
          link: 'text-orange-500',
          icone: <Sun className="text-orange-500" size={32}/>
      }
  };

  const tema = temas[portalSelecionado];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      
      {/* Caixa de Login */}
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Botão de Voltar para a Tela de Escolha */}
        <button 
            type="button"
            onClick={() => setPortalSelecionado(null)}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        >
            <ArrowLeft size={16}/> Trocar Portal
        </button>

        <div className="text-center mb-8">
            <div className={`inline-flex ${tema.bgIcon} p-3 rounded-xl mb-4`}>
                {tema.icone}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
                Acesso <span className={tema.textIcon}>{portalSelecionado === 'ev' ? 'EV' : 'Solar'}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Insira suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                    <input 
                        type="email" 
                        required
                        className={`w-full pl-10 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 ${tema.ring} transition-all`}
                        placeholder="seu@email.com"
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                    <input 
                        type="password" 
                        required
                        className={`w-full pl-10 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 ${tema.ring} transition-all`}
                        placeholder="••••••••"
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full ${tema.btnBase} text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${tema.shadow} disabled:opacity-50 mt-6`}
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Entrar no Sistema'}
            </button>
        </form>
        
        {/* Mostrar o link de criar conta apenas no portal EV por enquanto */}
        {portalSelecionado === 'ev' && (
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Não tem um condomínio?{' '}
                    <Link to="/checkout" className={`${tema.link} font-bold hover:underline`}>
                        Criar Conta
                    </Link>
                </p>
            </div>
        )}
      </div>
    </div>
  );
}