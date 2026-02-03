import { useState } from 'react';
import { supabase } from '../lib/supabase';
// import { useNavigate } from 'react-router-dom'; // Não precisa navegar agora, o Stripe vai redirecionar
import { Check, Shield, Zap, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Form, 2 = Processando
  
  const [formData, setFormData] = useState({
    nome_condominio: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault(); // <--- ESSENCIAL PARA NÃO RECARREGAR A PÁGINA
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar o Usuário (Login)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: 'Síndico (Admin)', 
            role: 'admin' 
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      const userId = authData.user.id;

      // 2. Gerar Código de Convite
      const codeName = formData.nome_condominio.split(' ')[0].toUpperCase().substring(0, 5);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = `${codeName}-${randomNum}`;

      // 3. Criar o Condomínio no Banco (Status PENDENTE)
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          nome_condominio: formData.nome_condominio,
          plano: 'pro',
          status: 'pending_payment', // <--- IMPORTANTE: Começa bloqueado até pagar
          invite_code: inviteCode
        })
        .select()
        .single();

      if (accountError) throw accountError;

      // 4. Vincular Usuário ao Condomínio
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_id: accountData.id,
          role: 'admin',
          apartamento: 'ADM'
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // ------------------------------------------
      // 5. AQUI ENTRA A MÁGICA DO STRIPE 💸
      // ------------------------------------------
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          price_base_id: import.meta.env.VITE_STRIPE_PRICE_BASE,
          email: formData.email,
          user_id: userId,
          return_url: window.location.origin // Vai voltar para seu site depois de pagar
        }
      });

      if (functionError) throw functionError;

      // 6. Redirecionar para o Stripe
      if (data?.url) {
        window.location.href = data.url; // <--- TCHAU! Vai pro Stripe
      } else {
        throw new Error("O Stripe não devolveu o link de pagamento.");
      }

    } catch (error) {
      console.error(error);
      alert('Erro: ' + (error.message || "Erro desconhecido"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="p-6 border-b border-gray-100 flex items-center gap-4">
        <Link 
          to="/" 
          className="p-2 -ml-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Zap className="fill-blue-600"/> EletroVaga
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-12 mt-8">
        
        {/* Lado Esquerdo - Benefícios */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Plano Profissional</h1>
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-blue-600">R$ 99</span>
                <span className="text-gray-500 font-medium">/mês</span>
            </div>
            <p className="text-lg text-gray-600">Gestão completa de carregadores e cobranças.</p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex gap-3 items-center">
              <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
              <span className="font-medium text-gray-700">Até 2 Carregadores Inclusos</span>
            </li>
            <li className="flex gap-3 items-center">
              <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
              <span className="font-medium text-gray-700">App Ilimitado para Moradores</span>
            </li>
            <li className="flex gap-3 items-center">
               <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
               <span className="font-medium text-gray-700">Gestão Financeira Automática</span>
            </li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-start">
              <Shield className="text-blue-600 mt-1"/>
              <p className="text-sm text-gray-500">Pagamento seguro via Stripe. Cancele quando quiser.</p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex-1">
            <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-xl font-bold mb-6">Criar Conta do Condomínio</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Condomínio</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Residencial Flores"
                            onChange={e => setFormData({...formData, nome_condominio: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do Síndico</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="sindico@email.com"
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input 
                                required 
                                type="password" 
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                            <input 
                                required 
                                type="password" 
                                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                >
                    {loading ? (
                        <><Loader2 className="animate-spin"/> Preparando Pagamento...</>
                    ) : (
                        <><CreditCard size={20}/> Ir para Pagamento Seguro</>
                    )}
                </button>
            </form>
        </div>

      </main>
    </div>
  );
}