import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Clock, Calendar, Zap, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

export default function NewReservation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    charger_id: '1',
    data_reserva: '',
    hora_inicio: '',
    hora_fim: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // REGRA 1: Validar horário (Max 2h)
      const inicio = new Date(`2000-01-01T${formData.hora_inicio}`);
      const fim = new Date(`2000-01-01T${formData.hora_fim}`);
      const diffHoras = (fim - inicio) / 1000 / 60 / 60;

      if (diffHoras <= 0) throw new Error("A hora final deve ser maior que a inicial.");
      if (diffHoras > 2) throw new Error("Regra: Máximo de 2 horas por reserva.");

      // 2. Pega usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      // 3. Busca Perfil do Usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, apartamento')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado.");

      // --- CORREÇÃO AQUI ---
      // 4. REGRA DE JUSTIÇA (POR APARTAMENTO)
      // Primeiro: Descobre quem são TODOS os moradores desse apartamento (João, Pedro, etc)
      const { data: moradoresDoAp } = await supabase
        .from('profiles')
        .select('id')
        .eq('account_id', profile.account_id)
        .eq('apartamento', profile.apartamento); // <--- Pega todos do Apt 101

      const idsDoApartamento = moradoresDoAp.map(m => m.id);

      // Segundo: Verifica se ALGUM desses moradores já tem reserva ativa
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: reservasDoAp } = await supabase
        .from('bookings')
        .select('*')
        .in('user_id', idsDoApartamento) // <--- Verifica a lista de moradores, não só o logado
        .gte('data_reserva', hoje);

      if (reservasDoAp && reservasDoAp.length > 0) {
        throw new Error(`O Apartamento ${profile.apartamento} já possui uma reserva agendada. A regra é uma por vez por apartamento.`);
      }

      // 5. Verifica choque de horário no carregador (padrão)
      const { data: choque } = await supabase
        .from('bookings')
        .select('*')
        .eq('charger_id', formData.charger_id)
        .eq('data_reserva', formData.data_reserva)
        .or(`and(hora_inicio.lte.${formData.hora_inicio},hora_fim.gt.${formData.hora_inicio}),and(hora_inicio.lt.${formData.hora_fim},hora_fim.gte.${formData.hora_fim})`);

      if (choque && choque.length > 0) {
         throw new Error("Já existe uma reserva neste horário e carregador.");
      }

      // 6. Salva
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        account_id: profile.account_id,
        charger_id: parseInt(formData.charger_id),
        data_reserva: formData.data_reserva,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim
      });

      if (error) throw error;

      alert('Agendado com sucesso!');
      navigate('/app');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/app')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600"/>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Nova Reserva</h1>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 mb-6">
            <AlertTriangle className="text-orange-600 shrink-0" size={20}/>
            <div className="text-xs text-orange-800 space-y-1">
                <p><strong>Regra de Boa Vizinhança:</strong></p>
                <p>O sistema limita 1 agendamento ativo por apartamento. Combine com os moradores da sua unidade.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            
            {/* Seleção de Carregador */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carregador</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, charger_id: '1'})}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.charger_id === '1' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                        <Zap size={24} className={formData.charger_id === '1' ? 'fill-blue-600' : 'text-gray-400'}/>
                        <span className="font-bold text-sm">Carregador 01</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, charger_id: '2'})}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.charger_id === '2' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                        <Zap size={24} className={formData.charger_id === '2' ? 'fill-blue-600' : 'text-gray-400'}/>
                        <span className="font-bold text-sm">Carregador 02</span>
                    </button>
                </div>
            </div>

            {/* Data */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input 
                        type="date" 
                        required
                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={e => setFormData({...formData, data_reserva: e.target.value})}
                    />
                </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input 
                            type="time" 
                            required
                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                            onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input 
                            type="time" 
                            required
                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                            onChange={e => setFormData({...formData, hora_fim: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Agendar'}
            </button>

        </form>
      </main>

      <BottomNav />
    </div>
  );
}