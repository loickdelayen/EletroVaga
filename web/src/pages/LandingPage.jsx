import { Link } from 'react-router-dom';
import { Calendar, Shield, Smartphone, ArrowRight, Sun, MessageCircle, CheckCircle, Zap, Check, Mail, MapPin } from 'lucide-react';
import conceitoSolarLogo from '../assets/conceito-solar-logo.png';
import eletroVagaLogo from '../assets/eletrovagas-logo.svg';

export default function LandingPage() {
  
  // Link direto para o WhatsApp da Conceito Solar
  const whatsappLink = "https://wa.me/5571999579525?text=Ol%C3%A1%2C%20vi%20pelo%20site%20EletroVaga%20e%20gostaria%20de%20saber%20mais%20sobre%20instala%C3%A7%C3%A3o%20de%20carregadores.";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* HEADER / NAV */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center">
          <img src={eletroVagaLogo} alt="EletroVaga Logo" className="h-12 md:h-14 w-auto object-contain py-1" />
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
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <Calendar size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-3">Agenda Inteligente</h3>
                <p className="text-gray-500 leading-relaxed">
                    Evite filas e brigas. O sistema bloqueia horários duplicados e limita o tempo de uso automaticamente.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-6">
                    <Smartphone size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-3">App para Moradores</h3>
                <p className="text-gray-500 leading-relaxed">
                    Cada morador agenda pelo próprio celular. O síndico só acompanha pelo painel administrativo.
                </p>
            </div>

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

      {/* --- NOVA SEÇÃO DE PLANOS (3 COLUNAS) --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planos simples e transparentes</h2>
            <p className="text-gray-500 text-lg">Sem taxas escondidas. Escolha o plano ideal para a estrutura do seu condomínio.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-center">
            
            {/* Plano 2 Carregadores */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano 2 Vagas</h3>
                <p className="text-gray-500 mb-6">Ideal para condomínios que estão começando a eletrificar.</p>
                <div className="mb-8">
                    <span className="text-4xl font-extrabold text-gray-900">R$ 99</span>
                    <span className="text-xl text-gray-500 font-medium">,90/mês</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Até 2 Carregadores</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Moradores Ilimitados</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Suporte via WhatsApp</li>
                </ul>
                <Link to="/checkout" className="block w-full bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 text-center py-4 rounded-xl font-bold transition-all">
                    Assinar Plano
                </Link>
            </div>

            {/* Plano 3 Carregadores (Destaque Central) */}
            <div className="relative bg-white border-2 border-blue-600 rounded-3xl p-8 shadow-2xl shadow-blue-900/10 transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                    Mais Escolhido
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano 3 Vagas</h3>
                <p className="text-gray-500 mb-6">A escolha perfeita para condomínios em crescimento.</p>
                <div className="mb-8">
                    <span className="text-5xl font-extrabold text-gray-900">R$ 129</span>
                    <span className="text-xl text-gray-500 font-medium">,90/mês</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Até 3 Carregadores</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Moradores Ilimitados</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Relatórios de Uso</li>
                </ul>
                <Link to="/checkout" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-bold transition-all shadow-lg">
                    Assinar Plano
                </Link>
            </div>

            {/* Plano 4 Carregadores */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plano 4 Vagas</h3>
                <p className="text-gray-500 mb-6">Para grandes complexos com alta demanda de recarga.</p>
                <div className="mb-8">
                    <span className="text-4xl font-extrabold text-gray-900">R$ 159</span>
                    <span className="text-xl text-gray-500 font-medium">,90/mês</span>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Até 4 Carregadores</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Moradores Ilimitados</li>
                    <li className="flex items-center gap-3 text-gray-600"><div className="bg-green-100 p-1 rounded-full text-green-600"><Check size={16} strokeWidth={3}/></div> Suporte Prioritário</li>
                </ul>
                <Link to="/checkout" className="block w-full bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 text-center py-4 rounded-xl font-bold transition-all">
                    Assinar Plano
                </Link>
            </div>

        </div>
      </section>

      {/* SEÇÃO: QUEM SOMOS & PARCEIROS */}
      <section className="py-24 px-6 bg-slate-50 overflow-hidden relative">
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

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

                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-green-900/20">
                        <MessageCircle size={20}/>
                        Falar com Conceito Solar
                    </a>
                </div>

                <div className="flex-1 w-full md:w-auto z-10">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center">
                        <div className="flex justify-center mb-6">
                            <img src={conceitoSolarLogo} alt="Conceito Solar Logo" className="h-20 w-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">Precisa instalar?</h3>
                        <p className="text-sm text-slate-300 mb-4">Entre em contato direto pelo WhatsApp</p>
                        <p className="text-lg md:text-2xl font-mono font-bold text-white tracking-wider whitespace-nowrap">
                            (71) 9 9957-9525
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Atendimento Especializado</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Pronto para modernizar seu condomínio?</h2>
        <Link to="/checkout" className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">
            Criar Conta do Condomínio
        </Link>
        <p className="mt-4 text-gray-500 text-sm">Configuração em menos de 2 minutos.</p>
      </section>

      {/* --- RODAPÉ (FOOTER) PROFISSIONAL --- */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="md:col-span-2">
                <img src={eletroVagaLogo} alt="EletroVaga" className="h-10 w-auto mb-6 brightness-0 invert opacity-90" />
                <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
                    A primeira plataforma dedicada a resolver o conflito de recarga de veículos elétricos em condomínios residenciais e comerciais.
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16}/> Salvador e Lauro de Freitas, BA
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Plataforma</h4>
                <ul className="space-y-4">
                    <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login do Síndico</Link></li>
                    {/* AQUI: O link foi atualizado para levar o morador direto pro Login */}
                    <li><Link to="/login" className="hover:text-blue-400 transition-colors">Portal do Morador</Link></li>
                    <li><Link to="/checkout" className="hover:text-blue-400 transition-colors">Planos e Preços</Link></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                        <Mail size={18} className="text-slate-500"/>
                        <a href="mailto:contato@eletrovaga.com.br" className="hover:text-blue-400 transition-colors">contato@eletrovaga.com</a>
                    </li>
                    <li className="flex items-center gap-3">
                        <MessageCircle size={18} className="text-slate-500"/>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Suporte Comercial</a>
                    </li>
                </ul>
            </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} EletroVaga. Desenvolvido por <span className="text-white font-medium">Loick Delayen</span>.</p>
            <div className="flex gap-6">
                <span className="cursor-pointer hover:text-white transition-colors">Termos de Uso</span>
                <span className="cursor-pointer hover:text-white transition-colors">Privacidade</span>
            </div>
        </div>
      </footer>

    </div>
  );
}