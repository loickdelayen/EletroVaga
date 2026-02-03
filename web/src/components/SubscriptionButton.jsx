import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Loader2 } from 'lucide-react';

export default function SubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('portal-link');
      if (error) throw error;
      if (data?.url) window.location.href = data.url; // Redireciona
    } catch (err) {
      alert('Erro ao abrir portal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleOpenPortal}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
    >
      {loading ? <Loader2 className="animate-spin" size={16}/> : <CreditCard size={16}/>}
      Gerenciar Assinatura
    </button>
  );
}