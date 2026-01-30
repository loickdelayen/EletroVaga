import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Car, Home, User, Building, Loader2 } from 'lucide-react';

export default function RegisterMorador() {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('convite'); 
  const navigate = useNavigate();

  const [condominio, setCondominio] = useState(null);
  const [formData, setFormData] = useState({ nome: '', email: '', password: '', apt: '', carro: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // FUNÇÃO MOVIDA PARA DENTRO DO USEEFFECT
    async function buscarCondominio() {
      if (!inviteCode) return;
      
      const { data } = await supabase
        .from('accounts')
        .select('id, nome_condominio')
        .eq('invite_code', inviteCode)
        .single();
      
      if (data) setCondominio(data);
    }

    buscarCondominio();
  }, [inviteCode]); // Agora o React sabe que só roda se o código mudar

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Removemos a variável 'data' que não estava sendo usada
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nome,
            apt: formData.apt,
            car_model: formData.carro,
            account_id: condominio.id,
            role: 'user'
          }
        }
      });

      if (error) throw error;
      
      alert('Cadastro realizado! Faça login com sua senha.');
      navigate('/login');

    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!inviteCode) return <div className="p-10 text-center text-red-500">Link inválido.</div>;
  if (!condominio) return <div className="p-10 text-center text-gray-500">Buscando condomínio...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Bem-vindo(a)</h2>
        <p className="mt-2 text-gray-600">Cadastro para moradores do <br/> <strong className="text-blue-600 text-lg">{condominio.nome_condominio}</strong></p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18}/></div>
                <input required type="text" className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" 
                  onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input required type="email" className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" 
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crie uma Senha</label>
              <input required type="password" className="block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" 
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartamento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Home size={18}/></div>
                  <input required type="text" className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="Ex: 101"
                    onChange={e => setFormData({...formData, apt: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carro</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Car size={18}/></div>
                  <input required type="text" className="pl-10 block w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="Ex: BYD"
                    onChange={e => setFormData({...formData, carro: e.target.value})} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all">
              {loading ? <Loader2 className="animate-spin"/> : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}