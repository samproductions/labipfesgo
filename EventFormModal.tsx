
import React, { useState } from 'react';
import { CalendarEvent } from './types';

interface EventFormModalProps {
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    location: 'Auditório Master - Estácio',
    desc: '',
    category: 'meeting',
    ativo: true,
    projetoExplica: '',
    imageUrl: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: formData.title.toUpperCase(),
      date: formData.date || '',
      time: formData.time || '19:00',
      location: formData.location || 'Auditório Master - Estácio',
      desc: formData.desc || '',
      category: formData.category || 'meeting',
      ativo: true,
      projetoExplica: formData.projetoExplica || '',
      type: formData.category,
      imageUrl: formData.imageUrl
    };
    
    onSave(newEvent);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        <header className="p-10 bg-slate-50 border-b flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black text-[#055c47] uppercase tracking-tighter">Agendar Evento</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Gestão de Cronograma Acadêmico</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <form onSubmit={handleSave} className="overflow-y-auto no-scrollbar p-10 space-y-8 bg-white text-left">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Título do Evento</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Reunião Geral Ordinária..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Data Oficial</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Horário</label>
              <input 
                required
                type="time" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Local / Link</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Auditório Master"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Tipo de Evento</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="meeting">Reunião (Membros)</option>
                <option value="symposium">Simpósio / Palestra</option>
                <option value="workshop">Workshop / Prática</option>
                <option value="outreach">Ação de Extensão</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Descrição Curta (Cards)</label>
            <textarea 
              required
              placeholder="Breve resumo exibido na lista pública..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-xs font-medium leading-relaxed h-20 resize-none outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Detalhamento Científico (Modal)</label>
            <textarea 
              placeholder="Texto completo com pautas, convidados ou requisitos técnicos..."
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-5 text-xs font-medium leading-relaxed h-32 resize-none outline-none focus:border-[#055c47] focus:bg-white transition-all shadow-sm"
              value={formData.projetoExplica}
              onChange={e => setFormData({ ...formData, projetoExplica: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Capa do Evento (Local)</label>
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 overflow-hidden shrink-0 bg-slate-50">
                {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-image text-3xl"></i></div>}
              </div>
              <label className="flex-1 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all border-dashed">
                Upload Foto do Evento
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
              <i className="fa-solid fa-calendar-plus"></i>
              Publicar no Cronograma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
