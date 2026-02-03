import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Erro ao entrar: ' + error.message);
      setLoading(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 p-3 bg-white text-gray-500 hover:text-blue-600 hover:shadow-md rounded-full transition-all border border-gray-200 flex items-center gap-2 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span className="text-sm font-medium hidden sm:inline">Voltar</span>
      </Link>

      {/* Caixa de Login */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
            <div className="inline-flex bg-blue-50 p-3 rounded-xl mb-4">
                <Zap className="text-blue-600 fill-blue-600" size={32}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Acesse sua conta</h1>
            <p className="text-gray-500">Bem-vindo de volta ao EletroVaga</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input 
                    type="email" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="seu@email.com"
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input 
                    type="password" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Entrar'}
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                Ainda não tem conta?{' '}
                <Link to="/checkout" className="text-blue-600 font-bold hover:underline">
                    Criar Condomínio
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}