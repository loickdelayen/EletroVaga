import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Clock, Calendar, Zap, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

export default function NewReservation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // NOVO ESTADO: Guarda o limite de carregadores do condomínio (Padrão: 2)
  const [maxChargers, setMaxChargers] = useState(2); 

  const [formData, setFormData] = useState({
    charger_id: '1',
    data_reserva: '',
    hora_inicio: '',
    hora_fim: ''
  });

  // --- NOVA FUNÇÃO: Busca o limite de carregadores ao abrir a tela ---
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Pega o condomínio do morador
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_id')
          .eq('id', user.id)
          .single();

        if (profile?.account_id) {
          // Pega o limite de carregadores na tabela accounts
          const { data: account } = await supabase
            .from('accounts')
            .select('max_chargers')
            .eq('id', profile.account_id)
            .single();

          if (account?.max_chargers) {
            setMaxChargers(account.max_chargers);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar limite de carregadores:", error);
      }
    };

    fetchAccountData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // REGRA 1: Validar horário (Max 2h)
      const inicioTemp = new Date(`2000-01-01T${formData.hora_inicio}`);
      const fimTemp = new Date(`2000-01-01T${formData.hora_fim}`);
      const diffHoras = (fimTemp - inicioTemp) / 1000 / 60 / 60;

      if (diffHoras <= 0) throw new Error("A hora final deve ser maior que a inicial.");
      if (diffHoras > 2) throw new Error("Regra: Máximo de 2 horas por reserva.");

      // REGRA EXTRA: Não reservar no passado
      const hoje = new Date().toISOString().split('T')[0];
      if (formData.data_reserva < hoje) {
          throw new Error("Você não pode fazer reservas em datas passadas.");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, apartamento')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado.");

      // REGRA DE JUSTIÇA (POR APARTAMENTO)
      const { data: moradoresDoAp } = await supabase
        .from('profiles')
        .select('id')
        .eq('account_id', profile.account_id)
        .eq('apartamento', profile.apartamento);

      const idsDoApartamento = moradoresDoAp.map(m => m.id);
      
      const { data: reservasDoAp } = await supabase
        .from('reservations')
        .select('id')
        .in('user_id', idsDoApartamento)
        .gte('data_inicio', new Date().toISOString()) 
        .limit(1);

      if (reservasDoAp && reservasDoAp.length > 0) {
        throw new Error(`O Apartamento ${profile.apartamento} já possui uma reserva ativa. A regra é uma por vez por apartamento.`);
      }

      // CORREÇÃO DE FUSO HORÁRIO
      const dataLocalInicio = new Date(`${formData.data_reserva}T${formData.hora_inicio}`);
      const dataLocalFim = new Date(`${formData.data_reserva}T${formData.hora_fim}`);

      const startDateTime = dataLocalInicio.toISOString();
      const endDateTime = dataLocalFim.toISOString();

      // Verifica choque de horário no carregador ESPECÍFICO
      const { data: choque, error: errorChoque } = await supabase
        .from('reservations')
        .select('id')
        .eq('account_id', profile.account_id)
        .eq('charger_id', parseInt(formData.charger_id)) // <-- Valida se o carregador X está livre
        .lt('data_inicio', endDateTime)
        .gt('data_fim', startDateTime);

      if (errorChoque) throw new Error("Erro ao verificar disponibilidade: " + errorChoque.message);
      
      if (choque && choque.length > 0) {
         throw new Error(`Ops! O Carregador ${formData.charger_id} já está reservado nesse horário. Tente selecionar outro carregador ou alterar o horário.`);
      }

      const { error } = await supabase.from('reservations').insert({
        user_id: user.id,
        account_id: profile.account_id,
        charger_id: parseInt(formData.charger_id),
        data_inicio: startDateTime, 
        data_fim: endDateTime       
      });

      if (error) throw new Error("Erro ao salvar reserva: " + error.message);

      alert('Agendado com sucesso!');
      navigate('/app'); // Ajustado para voltar pro /dashboard

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
            
            {/* SELEÇÃO DINÂMICA DE CARREGADOR */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Carregador</label>
                <div className="grid grid-cols-2 gap-4">
                    {/* Esse código cria a quantidade exata de botões baseada no banco */}
                    {Array.from({ length: maxChargers }, (_, i) => i + 1).map((num) => (
                        <button 
                            key={num}
                            type="button"
                            onClick={() => setFormData({...formData, charger_id: num.toString()})}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.charger_id === num.toString() ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <Zap size={24} className={formData.charger_id === num.toString() ? 'fill-blue-600' : 'text-gray-400'}/>
                            <span className="font-bold text-sm">Carregador {num.toString().padStart(2, '0')}</span>
                        </button>
                    ))}
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