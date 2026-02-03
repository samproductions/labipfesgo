import React from 'react';
import { LEAGUE_INFO } from './constants';
import { ViewState } from './types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  memberCount: number;
  projectCount: number;
}

const Home: React.FC<HomeProps> = ({ onNavigate, memberCount, projectCount }) => {
  // Formata o número para ter sempre pelo menos 2 dígitos
  const formatNumber = (num: number) => num < 10 ? `0${num}` : num.toString();

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      <section className="bg-gradient-to-br from-[#055c47] to-[#044a3a] rounded-[3rem] p-8 md:p-20 text-white shadow-2xl relative overflow-hidden">
        {/* Bio Patterns Overlay */}
        <div className="absolute top-[-10%] right-[-5%] opacity-10 text-[200px] rotate-12 animate-pulse">
           <i className="fa-solid fa-dna"></i>
        </div>
        <div className="absolute bottom-[-10%] left-[-5%] opacity-5 text-[150px] -rotate-12">
           <i className="fa-solid fa-atom"></i>
        </div>
        
        <div className="max-w-2xl relative z-10 text-left">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black w-fit mb-6 border border-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            {LEAGUE_INFO.location}
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">Inovação que pulsa ciência.</h2>
          <p className="text-emerald-50/80 text-lg md:text-xl mb-12 leading-relaxed font-medium">
            Fomentar a pesquisa científica de ponta e a divulgação técnica no campo da Biomedicina, unindo teoria, prática laboratorial e comunicação com a comunidade acadêmica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <button 
              onClick={() => onNavigate('projects')}
              className="bg-white text-[#055c47] px-10 py-5 rounded-[2rem] font-black hover:scale-105 transition-all shadow-xl text-xs uppercase tracking-widest active:scale-95"
            >
              Explorar Projetos
            </button>
            <a href={LEAGUE_INFO.instagram} target="_blank" rel="noreferrer" className="bg-black/20 backdrop-blur-xl text-white border border-white/30 px-10 py-5 rounded-[2rem] font-black hover:bg-black/40 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
              <i className="fa-brands fa-instagram text-lg"></i> Instagram
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        <StatCard 
          icon="fa-dna" 
          label="Linhas de Pesquisa" 
          value={formatNumber(projectCount)} 
          color="bg-blue-600" 
        />
        <StatCard 
          icon="fa-microscope" 
          label="Membros Ativos" 
          value={formatNumber(memberCount)} 
          color="bg-emerald-600" 
        />
        <StatCard 
          icon="fa-vials" 
          label="Horas Práticas" 
          value="+1.2k" 
          color="bg-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 text-left">
        <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-sm transition-standard hover:shadow-xl">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-[#055c47] uppercase tracking-tighter">
            <i className="fa-solid fa-vial-circle-check"></i>
            Excelência Laboratorial
          </h3>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium text-base">
            A {LEAGUE_INFO.acronym} atua no coração da inovação tecnológica aplicada à saúde. Nosso objetivo é transformar o conhecimento acadêmico em soluções diagnósticas reais através de metodologias rigorosas.
          </p>
          <div className="flex items-center gap-5 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
             <i className="fa-solid fa-quote-left text-emerald-300 text-3xl"></i>
             <p className="text-xs text-emerald-900 font-black italic uppercase tracking-wider">"Ciência é o processo de transformar curiosidade em progresso coletivo."</p>
          </div>
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-sm transition-standard hover:shadow-xl">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-[#055c47] uppercase tracking-tighter">
            <i className="fa-solid fa-fingerprint"></i>
            Identidade LAPIB
          </h3>
          <ul className="space-y-10">
            <li className="flex items-start gap-6 group">
              <div className="w-16 h-16 bg-[#055c47] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transition-transform group-hover:scale-110 shrink-0">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mb-2">Divulgação Científica</p>
                <p className="font-bold text-slate-700 text-sm leading-snug">
                  Levar o conhecimento biomédico para além dos laboratórios, comunicando a ciência de forma clara e acessível.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-6 group">
              <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-2xl flex items-center justify-center text-[#055c47] text-2xl transition-transform group-hover:scale-110 shrink-0">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <div>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mb-2">Conhecimento Científico</p>
                <p className="font-bold text-slate-700 text-sm leading-snug">
                  Produção e estudo de dados rigorosos para fundamentar a excelência acadêmica na Biomedicina.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] flex items-center gap-8 transition-standard hover:scale-105 border border-slate-100 shadow-sm hover:shadow-xl">
    <div className={`w-20 h-20 ${color} rounded-[1.8rem] flex items-center justify-center text-white text-3xl shadow-lg relative overflow-hidden group`}>
      <i className={`fa-solid ${icon} relative z-10 transition-transform group-hover:rotate-12`}></i>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
    <div className="text-left">
      <div className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</div>
      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">{label}</div>
    </div>
  </div>
);

export default Home;