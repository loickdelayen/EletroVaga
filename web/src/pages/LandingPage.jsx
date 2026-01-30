import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle, Calendar, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">EletroVaga</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="text-sm font-medium text-gray-600 hover:text-blue-600 mr-4">
                Já tenho conta
              </button>
            </Link>
            {/* LINK CORRIGIDO AQUI: */}
            <Link to="/checkout">
              <button className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-medium transition-all">
                Contratar Agora
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
          Sistema para Condomínios
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-slate-900">
          O App Oficial do <br/>
          <span className="text-blue-600">EletroVaga.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Organize a fila de recarga do seu condomínio com agendamento inteligente, justo e sem conflitos.
        </p>
        
        <div className="flex justify-center gap-4">
            {/* BOTÃO PRINCIPAL CORRIGIDO: */}
            <Link to="/checkout" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2">
                Contratar Agora <ArrowRight size={20} />
            </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Agendamento Justo</h3>
              <p className="text-gray-600">Limite de reservas por apartamento para garantir que todos usem.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-green-600">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança Total</h3>
              <p className="text-gray-600">Saiba exatamente quem está usando o carregador em tempo real.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-purple-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instalação Rápida</h3>
              <p className="text-gray-600">O síndico cadastra o condomínio e libera o acesso em minutos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10 text-center">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} EletroVaga Tecnologia. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;