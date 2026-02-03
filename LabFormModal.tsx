
import React, { useState } from 'react';
import { Lab } from './types';

interface LabFormModalProps {
  onClose: () => void;
  onSave: (lab: Lab) => void;
}

const LabFormModal: React.FC<LabFormModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Lab>>({
    title: '',
    coordinator: '',
    type: 'Pesquisa',
    desc: '',
    img: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.coordinator) return;
    
    const newLab: Lab = {
      id: Date.now().toString(),
      title: formData.title.toUpperCase(),
      coordinator: formData.coordinator.toUpperCase(),
      type: (formData.type as any) || 'Pesquisa',
      desc: formData.desc || '',
      img: formData.img || ''
    };
    
    onSave(newLab);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, img: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        <header className="p-10 bg-slate-50 border-b flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black text-[#055c47] uppercase tracking-tighter">Novo Núcleo</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Expansão da Infraestrutura Acadêmica</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <form onSubmit={handleSave} className="p-10 space-y-8 bg-white text-left overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome do Laboratório</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Laboratório de Bioquímica"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Coordenador</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Dr. Fulano"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.coordinator}
                onChange={e => setFormData({ ...formData, coordinator: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Eixo de Atuação</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Pesquisa">Pesquisa</option>
                <option value="Ensino">Ensino</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Descrição Técnica</label>
            <textarea 
              required
              placeholder="Descreva o foco do núcleo..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-medium leading-relaxed h-24 resize-none outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Capa do Núcleo (Local)</label>
            <label className="flex items-center justify-center w-full h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all border-dashed">
              Selecionar Arquivo de Foto
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="pt-6 border-t flex gap-4">
            <button type="submit" className="w-full py-5 rounded-2xl bg-[#055c47] text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
              Protocolar Novo Núcleo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabFormModal;
