import { Link } from 'react-router-dom';
import { Calendar, Shield, Smartphone, ArrowRight, Sun, MessageCircle, CheckCircle, Zap } from 'lucide-react';
import conceitoSolarLogo from '../assets/conceito-solar-logo.png';
import eletroVagaLogo from '../assets/eletrovagas-logo.png';

export default function LandingPage() {
  
  // Link direto para o WhatsApp da Conceito Solar
  const whatsappLink = "https://wa.me/5571999579525?text=Ol%C3%A1%2C%20vi%20pelo%20site%20EletroVaga%20e%20gostaria%20de%20saber%20mais%20sobre%20instala%C3%A7%C3%A3o%20de%20carregadores.";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* HEADER / NAV */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center">
          {/* Logotipo da EletroVaga no cabeçalho */}
          <img src={eletroVagaLogo} alt="EletroVaga Logo" className="h-12 md:h-14 w-auto" />
        </div>
        <div className="flex gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2">
                Entrar
            </Link>
            <Link to="/checkout" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-200">
                Contratar Agora
            </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-16 pb-32 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sistema Online para Condomínios
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Recarregue seu carro sem <span className="text-blue-600">conflitos</span>.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            A solução completa para agendamento de carregadores elétricos em condomínios. 
            Organização, justiça e zero dor de cabeça para o síndico.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/checkout" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-200 hover:-translate-y-1">
                Começar Agora <ArrowRight size={20}/>
            </Link>
        </div>
      </header>

      {/* RECURSOS (FEATURES) */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <Calendar size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-3">Agenda Inteligente</h3>
                <p className="text-gray-500 leading-relaxed">
                    Evite filas e brigas. O sistema bloqueia horários duplicados e limita o tempo de uso automaticamente.
                </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-6">
                    <Smartphone size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-3">App para Moradores</h3>
                <p className="text-gray-500 leading-relaxed">
                    Cada morador agenda pelo próprio celular. O síndico só acompanha pelo painel administrativo.
                </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                    <Shield size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-3">Regras Justas</h3>
                <p className="text-gray-500 leading-relaxed">
                    Defina limites de horas por dia e garanta que todos tenham acesso aos carregadores.
                </p>
            </div>
        </div>
      </section>

      {/* SEÇÃO: QUEM SOMOS & PARCEIROS (CONCEITO SOLAR) */}
      <section className="py-24 px-6 bg-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                
                {/* Elemento Decorativo de Fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

                {/* Texto e Logotipo da Parceira */}
                <div className="flex-1 z-10">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">
                        <Sun size={18} />
                        Parceria Estratégica
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                        Software e Infraestrutura caminhando juntos.
                    </h2>
                    <p className="text-slate-300 mb-6 text-lg leading-relaxed">
                        A EletroVaga cuida da gestão inteligente, mas quem garante a energia é a <strong>Conceito Solar</strong>.
                    </p>
                    <p className="text-slate-400 mb-8">
                        Somos parceiros oficiais da Conceito Solar, referência em projetos de energia fotovoltaica e instalação de carregadores veiculares de alta performance.
                    </p>
                    
                    <ul className="space-y-3 mb-8 text-slate-300">
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Instalação de Carregadores Wallbox</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Projetos de Energia Solar</li>
                        <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Adequação Elétrica Predial</li>
                    </ul>

                    <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-900/20"
                    >
                        <MessageCircle size={20}/>
                        Falar com Conceito Solar
                    </a>
                </div>

                {/* Lado Visual / Contato */}
                <div className="flex-1 w-full md:w-auto z-10">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        {/* Logotipo da Conceito Solar centralizado no cartão de contato */}
                        <div className="flex justify-center mb-6">
                            <img src={conceitoSolarLogo} alt="Conceito Solar Logo" className="h-20 w-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Precisa instalar?</h3>
                        <p className="text-sm text-slate-300 mb-4">Entre em contato direto pelo WhatsApp</p>
                        <p className="text-2xl font-mono font-bold text-white tracking-wider">
                            (71) 9 9957-9525
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Atendimento Especializado</p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Pronto para modernizar seu condomínio?</h2>
        <Link to="/checkout" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-200 transition-all">
            Criar Conta do Condomínio
        </Link>
        <p className="mt-4 text-gray-500 text-sm">Cancele quando quiser.</p>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 flex flex-col items-center text-center text-gray-400 text-sm">
        {/* Logotipo da EletroVaga no rodapé */}
        <img src={eletroVagaLogo} alt="EletroVaga" className="h-10 w-auto mb-4 opacity-75" />
        <p>© 2025 Todos os direitos reservados.</p>
        <p className="mt-2">Em parceria com <span className="text-gray-600 font-bold">Conceito Solar</span></p>
      </footer>

    </div>
  );
}