import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Building, LogOut, ShieldCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionButton from '../components/SubscriptionButton'; // <--- Importamos o botão aqui

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, accounts(nome_condominio, plano)') // Busca dados do perfil + condomínio
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <User className="text-blue-600" /> Meu Perfil
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-md uppercase text-xs font-bold">
              {profile?.role === 'admin' ? 'Síndico / Admin' : 'Morador'}
            </span>
          </div>
        </div>

        {/* Detalhes */}
        <div className="p-6 space-y-6">
          
          <div className="flex items-center gap-3 text-gray-700">
            <Mail size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">E-mail</p>
              <p className="font-medium">{profile?.email || 'email@oculto.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Building size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Condomínio</p>
              <p className="font-medium">{profile?.accounts?.nome_condominio || 'Não vinculado'}</p>
            </div>
          </div>

          {/* --- AQUI ESTÁ A PROTEÇÃO --- */}
          {/* Só mostra essa área se o user for ADMIN */}
          {profile?.role === 'admin' && (
            <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <ShieldCheck className="text-green-600" size={20}/> 
                    Assinatura e Cobrança
                </h3>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Plano Atual</p>
                            <p className="text-xl font-bold text-blue-900 capitalize">{profile?.accounts?.plano || 'Gratuito'}</p>
                        </div>
                        <CreditCard className="text-blue-300" size={32}/>
                    </div>
                    
                    {/* O BOTÃO MÁGICO QUE CRIAMOS */}
                    <SubscriptionButton />
                    
                    <p className="text-xs text-blue-600 mt-3">
                        Gerencie faturas, troque o cartão ou altere o número de carregadores.
                    </p>
                </div>
            </div>
          )}

        </div>

        {/* Rodapé Logout */}
        <div className="bg-gray-50 p-4 border-t border-gray-100">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium w-full justify-center p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
                <LogOut size={18} /> Sair da conta
            </button>
        </div>
      </div>
    </div>
  );
}