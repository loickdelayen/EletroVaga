import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Home, Trash2 } from 'lucide-react';

export default function MembersList({ accountId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [accountId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_id', accountId)
        .order('full_name'); // Ordem alfabética

      if (error) throw error;
      setMembers(data);
    } catch (error) {
      console.error('Erro ao buscar moradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if(!confirm("Tem certeza que deseja remover este morador do condomínio?")) return;
    
    // Remove o vinculo do usuario com o condominio
    const { error } = await supabase
        .from('profiles')
        .update({ account_id: null, apartamento: null, role: 'morador' }) // Reseta ele
        .eq('id', userId);

    if (!error) {
        fetchMembers(); // Atualiza a lista
    } else {
        alert("Erro ao remover: " + error.message);
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-400">Carregando moradores...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 animate-fade-in">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <User className="text-blue-600" size={20}/> 
          Moradores Cadastrados ({members.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Apt / Bloco</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {member.full_name?.charAt(0)}
                    </div>
                    {member.full_name} 
                    {member.role === 'admin' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Síndico</span>}
                </td>
                <td className="p-4"><span className="flex items-center gap-1"><Home size={14}/> {member.apartamento || '-'}</span></td>
                <td className="p-4"><span className="flex items-center gap-1"><Mail size={14}/> {member.email}</span></td>
                <td className="p-4 text-right">
                    {member.role !== 'admin' && ( // Não pode apagar a si mesmo ou outros admins por aqui pra evitar acidentes
                        <button 
                            onClick={() => handleRemoveUser(member.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Remover do condomínio"
                        >
                            <Trash2 size={16}/>
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {members.length === 0 && (
            <div className="p-8 text-center text-gray-400">Nenhum morador cadastrado ainda.</div>
        )}
      </div>
    </div>
  );
}