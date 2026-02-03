
import React, { useState } from 'react';
import { LEAGUE_INFO } from './constants';
import { MembershipSettings } from './types';

interface MembershipProps {
  settings: MembershipSettings;
  onApply: (formData: any) => void;
}

const Membership: React.FC<MembershipProps> = ({ settings, onApply }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    semester: '',
    registrationId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    onApply(formData);
    setSubmitting(false);
    setFormData({ fullName: '', email: '', semester: '', registrationId: '' });
  };

  const isSafeUrl = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return !lowerUrl.includes('.apk') && (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://'));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 text-left">
      {/* Header Section */}
      <header className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-50 rounded-bl-full -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute top-10 right-10 opacity-5">
           <i className="fa-solid fa-vials text-[120px]"></i>
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="bg-[#055c47] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit mb-8 shadow-xl">
            Protocolo de Admissão
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#055c47] uppercase tracking-tighter mb-10 leading-[1.1]">Elite Científica. <br/>Comprometimento Prático.</h2>
          <p className="text-slate-500 text-lg md:text-xl mb-12 leading-relaxed font-medium">
            O ingresso na {LEAGUE_INFO.acronym} é restrito a alunos do curso de Biomedicina da Estácio GO que buscam excelência técnica e ética acadêmica em patologia.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {settings.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-5 p-7 bg-slate-50 rounded-[2.5rem] border border-slate-100 transition-all hover:bg-white hover:border-[#055c47]/30 hover:shadow-xl group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#055c47] flex items-center justify-center text-sm font-black shrink-0 shadow-sm group-hover:bg-[#055c47] group-hover:text-white transition-all">
                  {idx + 1}
                </div>
                <span className="text-slate-700 text-sm font-bold leading-snug mt-2.5">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Visual Timeline Card */}
          <div className="bg-[#044a3a] p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-16 -bottom-16 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
               <i className="fa-solid fa-microscope text-[250px]"></i>
            </div>
            
            <h3 className="text-3xl font-black mb-12 flex items-center gap-5 uppercase tracking-tighter relative z-10">
              <i className="fa-solid fa-calendar-check text-emerald-400"></i>
              Cronograma de Seleção
            </h3>
            
            <div className="space-y-8 relative z-10">
              {settings.calendar.map((item, idx) => (
                <div key={idx} className="flex items-center gap-8 group/item">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-400 border-4 border-[#044a3a] shadow-[0_0_20px_rgba(52,211,153,0.5)] group-hover/item:scale-125 transition-all"></div>
                    {idx < settings.calendar.length - 1 && <div className="w-0.5 h-16 bg-white/10 my-1"></div>}
                  </div>
                  <div className="flex-1 pb-6 flex justify-between items-center border-b border-white/5 group-last/item:border-0">
                    <div className="space-y-1">
                       <span className="text-emerald-50 font-black text-xs uppercase tracking-[0.2em]">{item.stage}</span>
                       <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Etapa Técnica 0{idx + 1}</p>
                    </div>
                    <span className="font-black text-emerald-300 uppercase tracking-[0.2em] text-[11px] bg-white/5 px-6 py-2.5 rounded-2xl border border-white/5">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratory Protocol Form */}
          {settings.selectionStatus === 'open' ? (
            <div className="bg-white p-14 rounded-[4rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden">
               {/* Authentic Stamp Effect */}
               <div className="absolute top-0 right-0 p-12 pointer-events-none">
                  <div className="w-32 h-32 border-[6px] border-emerald-50/70 rounded-full flex flex-col items-center justify-center -rotate-12 opacity-50 relative scale-125">
                    <span className="text-[9px] font-black text-[#055c47] uppercase tracking-[0.4em] mb-1">Inscrição</span>
                    <span className="text-2xl font-black text-[#055c47] uppercase leading-none tracking-tighter">VALIDADA</span>
                    <div className="absolute -bottom-2 bg-white px-3 py-1 border border-emerald-100 rounded-full text-[7px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">Protocolo Master</div>
                  </div>
               </div>

               <header className="mb-14 text-left">
                 <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Ficha de Protocolo Acadêmico</h3>
                 <div className="flex items-center gap-3 mt-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em]">Sessão Aberta • Ref: LAPIB-{new Date().getFullYear()}</p>
                 </div>
               </header>

               <form onSubmit={handleApply} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 01. Nome Civil Completo
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Conforme Registro Institucional"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-7 py-5 text-sm focus:border-[#055c47] focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 02. Correio Eletrônico
                    </label>
                    <input 
                      required 
                      type="email" 
                      placeholder="academico@exemplo.com"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-7 py-5 text-sm focus:border-[#055c47] focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 03. Registro de Matrícula
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="202X.XXXXXX"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-7 py-5 text-sm focus:border-[#055c47] focus:bg-white outline-none transition-all font-bold text-slate-700 font-mono shadow-sm" 
                      value={formData.registrationId} 
                      onChange={e => setFormData({...formData, registrationId: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 04. Semestre em Curso
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ex: 5º Período"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-7 py-5 text-sm focus:border-[#055c47] focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm" 
                      value={formData.semester} 
                      onChange={e => setFormData({...formData, semester: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-[#055c47] text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-5"
                  >
                    {submitting ? (
                      <>
                        <i className="fa-solid fa-dna animate-spin text-xl"></i>
                        Processando Arquivo...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-stamp text-lg"></i>
                        Efetivar Submissão de Protocolo
                      </>
                    )}
                  </button>
                  <p className="text-[7px] text-center text-slate-300 mt-8 font-black uppercase tracking-[0.4em]">
                    Dados protegidos por criptografia acadêmica • Estácio Goiás • Núcleo Master
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-20 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-4xl mb-8 border border-slate-100">
                <i className="fa-solid fa-lock"></i>
              </div>
              <p className="text-slate-800 font-black uppercase tracking-[0.4em] text-sm">Candidaturas Suspensas</p>
              <p className="text-[11px] text-slate-400 mt-4 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                O portal de admissão está fechado para o ciclo atual. Aguarde o próximo edital oficial da diretoria para ingressar na liga.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info Section */}
        <div className="space-y-10">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm text-center flex flex-col items-center relative group overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#055c47]"></div>
             <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 text-4xl mb-8 shadow-inner border border-emerald-100 transition-transform group-hover:scale-110">
                <i className="fa-solid fa-file-invoice"></i>
             </div>
             <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Edital de Admissão</h4>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed px-4 mb-10">
               Consulte os pré-requisitos técnicos e a carga horária mandatória para membros efetivos.
             </p>
             <a 
                href={isSafeUrl(settings.editalUrl) ? settings.editalUrl : '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-4 ${isSafeUrl(settings.editalUrl) ? 'bg-[#055c47] text-white hover:bg-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                onClick={(e) => {
                  if (!isSafeUrl(settings.editalUrl)) {
                    e.preventDefault();
                    alert("Aguarde a disponibilização do documento oficial do próximo ciclo.");
                  }
                }}
             >
                <i className="fa-solid fa-cloud-arrow-down"></i>
                Download PDF
             </a>
          </div>

          <div className="bg-gradient-to-br from-[#055c47] to-[#044a3a] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <i className="fa-solid fa-robot text-7xl"></i>
             </div>
             <h5 className="font-black text-[12px] uppercase tracking-widest mb-6 flex items-center gap-3">
               <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
               Suporte Iris
             </h5>
             <p className="text-xs text-emerald-100/70 leading-relaxed font-medium mb-10">
               Tem dúvidas sobre as provas teóricas ou critérios de desempate? Nossa IA está pronta para responder.
             </p>
             <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                Dúvidas sobre o Edital
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
