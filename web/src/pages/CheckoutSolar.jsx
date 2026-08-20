import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Shield, Sun, Loader2, ArrowLeft, CreditCard, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PLANOS_SOLAR = {
  50: { id: "price_solar_starter", price: 149.90, label: "Até 50 Clientes" },
  200: { id: "price_solar_growth", price: 299.90, label: "Até 200 Clientes" },
  500: { id: "price_solar_corp", price: 499.90, label: "Clientes Ilimitados" }
};

export default function CheckoutSolar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientsCount, setClientsCount] = useState(50); 

  // 1. ADICIONADO O CAMPO DOCUMENTO NO ESTADO
  const [formData, setFormData] = useState({
    nome_empresa: '',
    documento: '', 
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const changePlan = (increment) => {
    const keys = Object.keys(PLANOS_SOLAR).map(Number);
    const currentIndex = keys.indexOf(clientsCount);
    
    if (increment && currentIndex < keys.length - 1) {
      setClientsCount(keys[currentIndex + 1]);
    } else if (!increment && currentIndex > 0) {
      setClientsCount(keys[currentIndex - 1]);
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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.full_name, role: 'admin' } }
      });

      if (authError) {
        if (authError.message.includes("User already registered") || authError.status === 422) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });
            if (loginError) throw new Error("Este e-mail já existe. Tente fazer login na página inicial.");
            userId = loginData.user.id;
        } else {
            throw authError;
        }
      } else {
        userId = authData.user?.id;
      }

      if (!userId) throw new Error("Erro ao identificar usuário.");

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('solar_account_id')
        .eq('id', userId)
        .single();

      let accountId = existingProfile?.solar_account_id;

      if (!accountId) {
          const codeName = formData.nome_empresa.split(' ')[0].toUpperCase().substring(0, 5);
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const inviteCode = `${codeName}-SOLAR-${randomNum}`;

          // 2. SALVANDO O DOCUMENTO NO BANCO DE DADOS
          const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .insert({
              nome_condominio: formData.nome_empresa, 
              documento: formData.documento, // <--- SALVANDO O CPF/CNPJ AQUI
              plano: 'pro',
              max_chargers: clientsCount, 
              tipo_sistema: 'solar', 
              status: 'pending_payment', 
              invite_code: inviteCode
            })
            .select()
            .single();

          if (accountError) throw accountError;
          accountId = accountData.id;

          await supabase.from('profiles').upsert({
              id: userId,
              email: formData.email,
              full_name: formData.full_name,
              nome: formData.full_name,
              role: 'admin',
              solar_account_id: accountId, 
              apartamento: 'TÉCNICO'
          });
      }

      const selectedPlanId = PLANOS_SOLAR[clientsCount].id; 

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
    <div className="min-h-screen bg-white font-sans selection:bg-orange-500 selection:text-white">
      <header className="p-6 border-b border-gray-100 flex items-center gap-4 max-w-6xl mx-auto">
        <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
          <Sun className="fill-orange-100"/> EletroVaga Solar
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-12 mt-8">
        
        <div className="flex-1 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                Planos de Manutenção
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Escale sua operação solar</h1>
            <p className="text-lg text-gray-600 mb-8">Transforme clientes de instalação em receita recorrente. Nós organizamos a gestão.</p>
            
            <div className="bg-orange-50 border-2 border-orange-200 p-8 rounded-3xl mb-6 transition-all shadow-lg shadow-orange-900/5">
              <p className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3">Capacidade de Contratos</p>
              
              <div className="flex items-center justify-between bg-white rounded-xl p-2 shadow-sm mb-6">
                <button 
                  type="button"
                  onClick={() => changePlan(false)}
                  disabled={clientsCount === 50}
                  className="p-3 hover:bg-orange-100 rounded-lg disabled:opacity-30 text-orange-600 transition-colors"
                >
                  <Minus size={20}/>
                </button>
                
                <span className="text-2xl font-black text-gray-800 tracking-tight">{PLANOS_SOLAR[clientsCount].label}</span>
                
                <button 
                  type="button"
                  onClick={() => changePlan(true)}
                  disabled={clientsCount === 500}
                  className="p-3 hover:bg-orange-100 rounded-lg disabled:opacity-30 text-orange-600 transition-colors"
                >
                  <Plus size={20}/>
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-orange-600">
                    R$ {PLANOS_SOLAR[clientsCount].price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-500 font-medium">/mês</span>
              </div>
            </div>
          </div>
          
          <ul className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <li className="flex gap-4 items-center"><div className="bg-green-100 p-1.5 rounded-full"><Check size={18} strokeWidth={3} className="text-green-600"/></div><span className="font-medium text-gray-700">Contratos baseados em {PLANOS_SOLAR[clientsCount].label}</span></li>
            <li className="flex gap-4 items-center"><div className="bg-green-100 p-1.5 rounded-full"><Check size={18} strokeWidth={3} className="text-green-600"/></div><span className="font-medium text-gray-700">App para cliente final abrir chamados</span></li>
            <li className="flex gap-4 items-center"><div className="bg-green-100 p-1.5 rounded-full"><Check size={18} strokeWidth={3} className="text-green-600"/></div><span className="font-medium text-gray-700">Dashboard de agendamento de lavagens</span></li>
            <li className="flex gap-4 items-center"><div className="bg-gray-200 p-1.5 rounded-full"><Shield size={18} className="text-gray-600"/></div><span className="font-medium text-gray-500">Pagamento seguro via Stripe</span></li>
          </ul>
        </div>

        <div className="flex-1">
            <form onSubmit={handleSignup} className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Dados da Integradora</h2>
                <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Ex: Conceito Solar" onChange={e => setFormData({...formData, nome_empresa: e.target.value})}/>
                    </div>

                    {/* 3. O NOVO CAMPO DE DOCUMENTO NA TELA */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / CPF</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" placeholder="00.000.000/0000-00 ou 000.000.000-00" onChange={e => setFormData({...formData, documento: e.target.value})}/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Gestor/Técnico</label>
                      <input required type="text" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" placeholder="Seu nome completo" onChange={e => setFormData({...formData, full_name: e.target.value})}/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Profissional</label>
                      <input required type="email" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" placeholder="contato@empresa.com" onChange={e => setFormData({...formData, email: e.target.value})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                          <input required type="password" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" onChange={e => setFormData({...formData, password: e.target.value})}/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                          <input required type="password" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors" onChange={e => setFormData({...formData, confirmPassword: e.target.value})}/>
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
                    {loading ? <><Loader2 className="animate-spin"/> Configurando Painel...</> : <><CreditCard size={20}/> Assinar por R$ {PLANOS_SOLAR[clientsCount].price.toFixed(2).replace('.', ',')}</>}
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}