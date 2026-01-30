import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, Building } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Sucesso
  const [formData, setFormData] = useState({ condominio: '', sindicoEmail: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handlePaymentSimulation() {
    setLoading(true);
    
    // 1. Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // 2. CRIA O CONDOMÍNIO
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .insert({ 
            nome_condominio: formData.condominio, 
            status_pagamento: 'active' 
        })
        .select()
        .single();

      if (accError) throw accError;

      // 3. CRIA O USUÁRIO (SÍNDICO) COM SENHA
      const { error: authError } = await supabase.auth.signUp({
        email: formData.sindicoEmail,
        password: formData.password, // Usa a senha criada
        options: {
          data: { 
            auto_link_account_id: account.id, 
            role: 'admin' 
          }
        }
      });

      if (authError) throw authError;

      setStep(3); // Sucesso

    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-10 px-4 font-sans text-gray-900">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* ETAPA 1: DADOS */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                    <Building size={24}/>
                </div>
                <h2 className="text-2xl font-bold">Criar Conta Síndico</h2>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Condomínio</label>
                <input 
                    placeholder="Ex: Residencial Flores" 
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    onChange={e => setFormData({...formData, condominio: e.target.value})} 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label>
                <input 
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    onChange={e => setFormData({...formData, sindicoEmail: e.target.value})} 
                />
            </div>

            {/* CAMPO NOVO: SENHA */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crie uma Senha</label>
                <input 
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                />
            </div>

            <button 
                onClick={() => setStep(2)} 
                disabled={!formData.condominio || !formData.sindicoEmail || !formData.password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50 mt-4"
            >
              Ir para Pagamento
            </button>
          </div>
        )}

        {/* ETAPA 2: PAGAMENTO */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Pagamento Seguro</h2>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
              <CreditCard className="mx-auto text-gray-400 mb-2" size={32}/>
              <p className="text-gray-600 font-medium">Simulação de Pagamento</p>
              <p className="text-xs text-gray-400 mt-1">Nenhum valor será cobrado.</p>
            </div>
            
            <button 
                onClick={handlePaymentSimulation} 
                disabled={loading} 
                className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-green-200"
            >
              {loading ? <Loader2 className="animate-spin"/> : 'Confirmar e Criar'}
            </button>
            <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:underline">Voltar</button>
          </div>
        )}

        {/* ETAPA 3: SUCESSO */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="text-green-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Conta Criada!</h2>
            <p className="text-gray-600">
              Seu condomínio foi registrado com sucesso.
            </p>
            <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold">
              Ir para Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}