import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Form, 2 = Pagamento, 3 = Sucesso
  
  const [formData, setFormData] = useState({
    nome_condominio: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    
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
            full_name: 'Síndico (Admin)', // Nome provisório
            role: 'admin' // Já nasce como admin
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // 2. Gerar um Código de Convite Automático (Ex: SOLAR-9283)
      const codeName = formData.nome_condominio.split(' ')[0].toUpperCase().substring(0, 5);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = `${codeName}-${randomNum}`;

      // 3. Criar o Condomínio (Account)
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          nome_condominio: formData.nome_condominio,
          plano: 'pro',
          status: 'active',
          invite_code: inviteCode // Salva o código gerado
        })
        .select() // IMPORTANTE: Pede para o banco devolver os dados criados
        .single(); // Pega apenas um resultado

      if (accountError) throw accountError;

      // 4. O PULO DO GATO: Vincular o Usuário ao Condomínio
      // Atualizamos o perfil do usuário recém-criado com o ID do condomínio
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          account_id: accountData.id, // <--- AQUI ESTÁ A CORREÇÃO
          role: 'admin',
          apartamento: 'ADM' // Já define como ADM para não travar na reserva
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Sucesso!
      setStep(3); // Vai para tela de sucesso
      
      // Espera 2 segundos e manda pro Login
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      alert('Erro no cadastro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header com Botão Voltar */}
      <header className="p-6 border-b border-gray-100 flex items-center gap-4">
        <Link 
          to="/" 
          className="p-2 -ml-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          title="Voltar para o início"
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
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Comece a organizar seu condomínio hoje.</h1>
            <p className="text-lg text-gray-600">O sistema completo para gestão de recargas de veículos elétricos.</p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex gap-3 items-center">
              <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
              <span className="font-medium text-gray-700">Agenda inteligente anti-conflito</span>
            </li>
            <li className="flex gap-3 items-center">
              <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
              <span className="font-medium text-gray-700">Link de convite fácil para moradores</span>
            </li>
            <li className="flex gap-3 items-center">
              <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
              <span className="font-medium text-gray-700">Painel do Síndico incluso</span>
            </li>
          </ul>

          <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-start">
             <Shield className="text-blue-600 mt-1"/>
             <p className="text-sm text-gray-500">Seus dados estão seguros. Pagamento processado via Stripe (Simulação).</p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex-1">
            {step === 3 ? (
                <div className="bg-green-50 p-8 rounded-2xl border border-green-200 text-center animate-bounce-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Sucesso!</h2>
                    <p className="text-green-700">Sua conta foi criada. Redirecionando para o login...</p>
                </div>
            ) : (
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail (Síndico)</label>
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
                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : 'Criar Conta e Acessar'}
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">Ao criar conta, você aceita os termos de uso.</p>
                </form>
            )}
        </div>

      </main>
    </div>
  );
}