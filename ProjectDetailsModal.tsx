
import React from 'react';
import { Project } from './types';

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        
        {/* Close Button (X) */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-black/10 hover:bg-black/20 text-white transition-all backdrop-blur-md border border-white/10"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Project Image Header */}
        <div className="relative h-64 shrink-0 overflow-hidden">
          <img 
            src={project.imageUrl} 
            className="w-full h-full object-cover" 
            alt={project.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-10 lg:p-14 overflow-y-auto no-scrollbar space-y-8 bg-white text-left">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight">
              {project.title}
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm">
                <i className="fa-solid fa-user-tie text-emerald-600 text-xs"></i>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-emerald-600/50 uppercase tracking-widest leading-none mb-1">Orientador</span>
                  <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">{project.advisor}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                <i className="fa-solid fa-calendar-day text-slate-400 text-xs"></i>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Início</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{project.startDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#055c47] uppercase tracking-[0.3em] flex items-center gap-3">
                <i className="fa-solid fa-users"></i> Equipe Científica
              </h4>
              <p className="text-slate-600 text-xs font-bold leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-50">
                {project.studentTeam || "Membros vinculados em processo de designação acadêmica."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#055c47] uppercase tracking-[0.3em] flex items-center gap-3">
                <i className="fa-solid fa-microscope"></i> Resumo Científico
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={onClose}
              className="w-full bg-[#055c47] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Voltar aos Projetos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
