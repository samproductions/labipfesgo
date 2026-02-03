
import React from 'react';
import { Member } from './types';

interface MembersProps {
  members: Member[];
}

const Members: React.FC<MembersProps> = ({ members }) => {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
      <header className="text-center mb-16">
        <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Corpo Acadêmico</h2>
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Diretoria e Membros Efetivos</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map(member => (
          <div key={member.id} className="group relative bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-emerald-50 shadow-lg mb-6 group-hover:border-[#055c47] transition-colors duration-500">
                <img 
                  src={member.photoUrl} 
                  alt={member.fullName} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight mb-2">
                {member.fullName}
              </h3>
              
              <div className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                {member.role}
              </div>

              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 line-clamp-3">
                {member.bio || "Pesquisador dedicado ao avanço da biomedicina e patologia inovadora no Centro Universitário Estácio de Goiás."}
              </p>

              <div className="flex gap-4 w-full">
                <a 
                  href={member.lattesUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-50 text-slate-400 hover:bg-[#055c47] hover:text-white transition-all py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                  Lattes
                </a>
                <button className="w-12 h-12 rounded-2xl border border-slate-100 text-slate-300 hover:border-emerald-200 hover:text-emerald-600 transition-all flex items-center justify-center">
                  <i className="fa-solid fa-envelope"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-12 bg-[#055c47] rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <i className="fa-solid fa-dna text-[150px]"></i>
        </div>
        
        <div className="max-w-xl relative z-10">
          <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Deseja compor nossa equipe científica?</h4>
          <p className="text-emerald-100/80 font-medium leading-relaxed">
            Estamos sempre em busca de talentos acadêmicos comprometidos com a inovação. Participe do nosso próximo processo seletivo.
          </p>
        </div>
        
        <button className="relative z-10 bg-white text-[#055c47] px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
          Ver Editais Abertos
        </button>
      </div>
    </div>
  );
};

export default Members;
