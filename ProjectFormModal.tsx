
import React, { useState } from 'react';
import { Project } from './types';

interface ProjectFormModalProps {
  onClose: () => void;
  onSave: (project: Project) => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    advisor: '',
    startDate: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Pesquisa',
    studentTeam: '',
    imageUrl: 'https://images.unsplash.com/photo-1532187875605-186c6af16664?w=800'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ProjectForm: Iniciando validação...");
    if (!formData.title || !formData.advisor) {
      alert("Preencha o título e o orientador.");
      return;
    }
    
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title.toUpperCase(),
      advisor: formData.advisor.toUpperCase(),
      startDate: formData.startDate || '',
      status: 'ATIVO',
      imageUrl: formData.imageUrl || '',
      description: formData.description || '',
      category: formData.category || 'Pesquisa',
      studentTeam: formData.studentTeam
    };
    
    console.log("ProjectForm: Protocolando dados...");
    onSave(newProject);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
        console.log("ProjectForm: Imagem carregada localmente.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        <header className="p-10 bg-slate-50 border-b flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black text-[#055c47] uppercase tracking-tighter">Protocolar Projeto</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Cadastro de Nova Linha de Pesquisa</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <form onSubmit={handleSave} className="overflow-y-auto no-scrollbar p-10 space-y-8 bg-white text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Título do Projeto</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Análise Genômica..."
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Orientador Responsável</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Dr. Victor Vilardell"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.advisor}
                onChange={e => setFormData({ ...formData, advisor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Data de Início</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria Científica</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Pesquisa">Pesquisa de Bancada</option>
                <option value="Ensino">Monitoria / Ensino</option>
                <option value="Extensão">Extensão Acadêmica</option>
                <option value="Inovação">Inovação Diagnóstica</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Equipe Acadêmica (Membros)</label>
            <input 
              type="text" 
              placeholder="Ex: Maria Silva, João Santos, Ana Oliveira..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.studentTeam}
              onChange={e => setFormData({ ...formData, studentTeam: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Resumo Científico (Descrição)</label>
            <textarea 
              required
              placeholder="Descreva os objetivos, metodologia e impacto esperado da pesquisa..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-5 text-xs font-medium leading-relaxed h-32 resize-none outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Imagem de Capa (Opcional)</label>
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <label className="flex-1 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all border-dashed">
                Upload Capa Científica
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              Descartar
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 rounded-2xl bg-[#055c47] text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-file-signature"></i>
              Confirmar Protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
