import React from 'react';
import { Lab } from './types';

interface LabsProps {
  labs: Lab[];
  onEnroll: (lab: Lab) => void;
}

const Labs: React.FC<LabsProps> = ({ labs, onEnroll }) => {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
      <header className="text-center mb-16">
        <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Unidades de Pesquisa</h2>
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Infraestrutura Científica e Tecnológica</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {labs.map((lab) => (
          <div key={lab.id} className="group relative bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[400px] overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110 opacity-40"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${lab.type === 'Pesquisa' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  Eixo: {lab.type}
                </span>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                  <i className={`fa-solid ${lab.type === 'Pesquisa' ? 'fa-microscope' : 'fa-flask-vial'}`}></i>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight group-hover:text-[#055c47] transition-colors">
                {lab.title}
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Responsável Técnico</p>
                    <p className="text-[11px] font-bold text-slate-600 truncate uppercase">{lab.coordinator}</p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-4">
                  {lab.desc}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-10">
              <button 
                onClick={() => onEnroll(lab)}
                className="w-full bg-[#055c47] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-file-signature"></i>
                Vincular-se ao Núcleo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-12 bg-white rounded-[4rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-[#055c47] text-4xl shadow-inner">
          <i className="fa-solid fa-circle-nodes"></i>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Rede de Cooperação Científica</h4>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl mt-2">
            Nossos laboratórios operam em regime de intercooperação, permitindo que membros de diferentes núcleos compartilhem dados e infraestrutura para projetos multidisciplinares.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Labs;