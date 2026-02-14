import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Shield, Zap, Loader2, ArrowLeft, CreditCard, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

// ---------------------------------------------------------
// ⚠️ ÁREA DE CONFIGURAÇÃO DOS PLANOS
// Vá no Stripe > Catálogo > Clique no preço > Copie o ID (price_...)
// ---------------------------------------------------------
const PLANOS = {
  2: { 
    id: "price_1T0khyRrLPlA3VndsHEh8ize", // <--- COLOCAR ID REAL (2 Carregadores)
    price: 99.90, 
    label: "Até 2 Carregadores" 
  },
  3: { 
    id: "price_1T0koGRrLPlA3VnduVLOw2KH", // <--- COLOCAR ID REAL (3 Carregadores)
    price: 129.90, 
    label: "Até 3 Carregadores" 
  },
  4: { 
    id: "price_1T0lVLRrLPlA3Vnd8OgMzdWC", // <--- COLOCAR ID REAL (4 Carregadores)
    price: 159.90, 
    label: "Até 4 Carregadores" 
  }
};

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar qual plano está selecionado (Começa com 2)
  const [chargersCount, setChargersCount] = useState(2); 

  const [formData, setFormData] = useState({
    nome_condominio: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Função para aumentar/diminuir carregadores
  const changePlan = (increment) => {
    const current = chargersCount;
    const next = increment ? current + 1 : current - 1;
    // Só muda se o plano existir na lista PLANOS definida lá em cima
    if (PLANOS[next]) {
      setChargersCount(next);
    }
  };

const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      let userId = null;

      // 1. Tenta Criar o Usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.full_name, role: 'admin' } }
      });

      if (authError) {
        // SE O ERRO FOR "USUÁRIO JÁ EXISTE", VAMOS TENTAR LOGAR ELE
        if (authError.message.includes("User already registered") || authError.status === 422) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });
            
            if (loginError) {
                throw new Error("Este e-mail já existe. Tente fazer login ou use outro e-mail.");
            }
            // Se logou, pegamos o ID dele para continuar o pagamento
            userId = loginData.user.id;
        } else {
            throw authError; // Se for outro erro, estoura
        }
      } else {
        // Se criou agora
        userId = authData.user?.id;
      }

      if (!userId) throw new Error("Erro ao identificar usuário.");

      // 2. Verifica se ele já tem uma Account (Condomínio)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('account_id')
        .eq('id', userId)
        .single();

      let accountId = existingProfile?.account_id;

      // Se não tem conta, cria uma nova
      if (!accountId) {
          const codeName = formData.nome_condominio.split(' ')[0].toUpperCase().substring(0, 5);
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const inviteCode = `${codeName}-${randomNum}`;

          const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .insert({
              nome_condominio: formData.nome_condominio,
              plano: 'pro',
              max_chargers: chargersCount,
              status: 'pending_payment', 
              invite_code: inviteCode
            })
            .select()
            .single();

          if (accountError) throw accountError;
          accountId = accountData.id;

          // Cria/Atualiza o Perfil
          await supabase.from('profiles').upsert({
              id: userId,
              email: formData.email,
              full_name: formData.full_name,
              nome: formData.full_name,
              role: 'admin',
              account_id: accountId,
              apartamento: 'ADM'
          });
      } else {
          // Se já existe conta mas ele voltou, atualiza o plano/carregadores escolhidos
           await supabase
            .from('accounts')
            .update({ max_chargers: chargersCount })
            .eq('id', accountId);
      }

      // 3. Manda pro Stripe (Isso sempre acontece)
      const selectedPlanId = PLANOS[chargersCount].id; 

      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          price_base_id: selectedPlanId,
          email: formData.email,
          user_id: userId,
          return_url: window.location.origin 
        }
      });

      if (functionError) throw functionError;

      if (data?.url) {
        window.location.href = data.url; 
      } else {
        throw new Error("Erro ao gerar link de pagamento.");
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="p-6 border-b border-gray-100 flex items-center gap-4">
        <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Zap className="fill-blue-600"/> EletroVaga
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-12 mt-8">
        
        {/* Lado Esquerdo - Seletor de Plano */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Escolha seu Plano</h1>
            
            {/* SELETOR VISUAL DE PREÇO */}
            <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-2xl mb-6 transition-all hover:shadow-md">
              <p className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2">Quantidade de Carregadores</p>
              
              <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm mb-4">
                <button 
                  type="button"
                  onClick={() => changePlan(false)}
                  disabled={!PLANOS[chargersCount - 1]} // Desabilita se não tiver plano menor
                  className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-30 text-blue-600 transition-colors"
                >
                  <Minus size={20}/>
                </button>
                
                <span className="text-3xl font-black text-gray-800 tabular-nums">{chargersCount}</span>
                
                <button 
                  type="button"
                  onClick={() => changePlan(true)}
                  disabled={!PLANOS[chargersCount + 1]} // Desabilita se não tiver plano maior
                  className="p-3 hover:bg-gray-100 rounded-lg disabled:opacity-30 text-blue-600 transition-colors"
                >
                  <Plus size={20}/>
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-blue-600">
                    R$ {PLANOS[chargersCount].price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-500 font-medium">/mês</span>
              </div>
            </div>

            <p className="text-lg text-gray-600">Gestão completa para o seu condomínio.</p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex gap-3 items-center"><div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div><span className="font-medium text-gray-700">{PLANOS[chargersCount].label} Inclusos</span></li>
            <li className="flex gap-3 items-center"><div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div><span className="font-medium text-gray-700">App Ilimitado para Moradores</span></li>
            <li className="flex gap-3 items-center"><div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div><span className="font-medium text-gray-700">Gestão Financeira Automática</span></li>
            <li className="flex gap-3 items-center"><div className="bg-gray-100 p-2 rounded-full"><Shield size={20} className="text-gray-600"/></div><span className="font-medium text-gray-500">Pagamento seguro via Stripe</span></li>
          </ul>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex-1">
            <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Dados do Condomínio</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome do Condomínio</label><input required type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Residencial Flores" onChange={e => setFormData({...formData, nome_condominio: e.target.value})}/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome do Síndico</label><input required type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Seu nome completo" onChange={e => setFormData({...formData, full_name: e.target.value})}/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">E-mail do Síndico</label><input required type="email" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="sindico@email.com" onChange={e => setFormData({...formData, email: e.target.value})}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input required type="password" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, password: e.target.value})}/></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label><input required type="password" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, confirmPassword: e.target.value})}/></div>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                    {loading ? <><Loader2 className="animate-spin"/> Preparando...</> : <><CreditCard size={20}/> Pagar R$ {PLANOS[chargersCount].price.toFixed(2).replace('.', ',')}</>}
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}