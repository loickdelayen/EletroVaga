import { Link } from 'react-router-dom';
import { Zap, Sun, ArrowRight, Shield, BarChart3, Users, Building, Wrench, ChevronRight } from 'lucide-react';
import conceitoSolarLogo from '../assets/conceito-solar-logo.png'; // Ajuste o caminho se necessário
import eletroVagaLogo from '../assets/eletrovagas-logo.png'; // Ajuste o caminho se necessário

export default function LandingPageHub() {
  const whatsappLink = "https://wa.me/5571999579525";

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-blue-500 selection:text-white">
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2">
            {/* Se o logo tiver fundo branco, você pode usar um texto estilizado aqui para o Dark Mode */}
            <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Zap className="text-blue-400 fill-blue-400" size={24}/> 
              EletroVaga
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors hidden md:block">
                Já sou cliente
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2">
                Acessar Portal <ChevronRight size={16}/>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - O HUB COM EFEITOS DARK/NEON */}
      <header className="relative pt-40 pb-32 px-6 bg-slate-950 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Efeitos de Luz no Fundo */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 text-slate-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-slate-700 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                O Ecossistema Definitivo de Energia
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Inteligência para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Vagas</span> e <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Solar</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Escolha a sua solução. Software especializado para gestão de carregadores em condomínios e gestão de manutenção para integradores solares.
            </p>
        </div>

        {/* OS DOIS CARDS DE DECISÃO (GATEWAY) */}
        <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 w-full">
            
            {/* Card EV (Condomínios) */}
            <div className="group relative bg-slate-900 border border-slate-800 p-1 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                <div className="bg-slate-900 p-8 rounded-[1.4rem] h-full flex flex-col relative z-10">
                    <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Zap size={32} className="fill-blue-500/50"/>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">EletroVaga <span className="text-blue-400">EV</span></h2>
                    <p className="text-slate-400 mb-8 flex-1 text-lg">
                        Para Síndicos e Moradores. Acabe com os conflitos de garagem organizando o agendamento e a cobrança dos carregadores veiculares.
                    </p>
                    <Link to="/checkout" className="inline-flex items-center justify-between w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-4 rounded-xl transition-colors">
                        Ver Planos para Condomínio <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>
            </div>

            {/* Card Solar (Empresas) */}
            <div className="group relative bg-slate-900 border border-slate-800 p-1 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                <div className="bg-slate-900 p-8 rounded-[1.4rem] h-full flex flex-col relative z-10">
                    <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-orange-400 mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Sun size={32} className="fill-orange-500/20" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">EletroVaga <span className="text-orange-400">Solar</span></h2>
                    <p className="text-slate-400 mb-8 flex-1 text-lg">
                        Para Empresas e Integradores. Transforme clientes de instalação em receita recorrente com gestão inteligente de contratos de manutenção.
                    </p>
                    <Link to="/checkout-solar" className="inline-flex items-center justify-between w-full bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-4 rounded-xl transition-colors">
                        Ver Planos para Integradores <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </div>
            </div>

        </div>
      </header>

      {/* SEÇÃO DE BENEFÍCIOS COMPARTILHADOS (Por que usar nosso software?) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tecnologia que gera previsibilidade</h2>
            <p className="text-slate-500 text-lg">Seja na garagem ou no telhado, nós organizamos a sua operação.</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <Shield className="text-slate-700 mb-6" size={40}/>
                <h3 className="text-xl font-bold mb-3">Jurídico e Regras</h3>
                <p className="text-slate-500">Termos de uso para moradores e contratos de SLA para clientes de manutenção gerados e aceitos digitalmente.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <BarChart3 className="text-slate-700 mb-6" size={40}/>
                <h3 className="text-xl font-bold mb-3">Gestão Financeira</h3>
                <p className="text-slate-500">Assinaturas, limites de horas e cobranças automatizadas com a segurança da infraestrutura global da Stripe.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <Users className="text-slate-700 mb-6" size={40}/>
                <h3 className="text-xl font-bold mb-3">Portais Exclusivos</h3>
                <p className="text-slate-500">Telas separadas para quem administra e para quem consome. Sem confusão, sem necessidade de treinamento.</p>
            </div>
        </div>
      </section>

      {/* PARCEIRO OFICIAL */}
      <section className="py-20 px-6 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Parceria Técnica Oficial</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                <img src={conceitoSolarLogo} alt="Conceito Solar" className="h-20 opacity-90 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer" />
            </div>
            <p className="mt-8 text-slate-400 max-w-xl">
                A EletroVaga foca 100% no software. Para instalações físicas de infraestrutura elétrica e fotovoltaica de alto padrão, contamos com a expertise da <strong>Conceito Solar</strong>.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold">
                Falar com Engenharia Física <ArrowRight size={16}/>
            </a>
        </div>
      </section>

      {/* RODAPÉ SIMPLIFICADO */}
      <footer className="bg-slate-950 text-slate-500 py-12 px-6 border-t border-slate-900 text-center">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-blue-500" size={20}/>
              <span className="text-xl font-bold text-slate-300 tracking-tight">EletroVaga</span>
            </div>
            <p className="mb-6 text-sm">A plataforma definitiva para transição energética.</p>
            <div className="flex gap-6 text-sm font-medium">
                <Link to="/checkout" className="hover:text-blue-400 transition-colors">Planos EV</Link>
                <Link to="/checkout-solar" className="hover:text-orange-400 transition-colors">Planos Solar</Link>
                <Link to="/login" className="hover:text-white transition-colors">Login do Ecossistema</Link>
            </div>
            <p className="mt-12 text-xs border-t border-slate-800 pt-8 w-full">
                © {new Date().getFullYear()} EletroVaga SaaS. Desenvolvido por Loick Delayen.
            </p>
        </div>
      </footer>

    </div>
  );
}