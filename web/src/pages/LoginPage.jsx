import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // LOGIN COM SENHA
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert('Erro: ' + error.message);
      setLoading(false);
    } else {
      // Sucesso! O App.jsx vai detectar a sessão e redirecionar
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="bg-blue-600 p-3 rounded-xl mb-6 shadow-lg shadow-blue-200">
        <Zap className="text-white w-8 h-8" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Entrar no EletroVaga</h1>
      <p className="text-gray-500 mb-8 text-center">Digite suas credenciais.</p>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" 
            required 
            className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input 
            type="password" 
            required 
            className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
        </button>
      </form>
    </div>
  );
}