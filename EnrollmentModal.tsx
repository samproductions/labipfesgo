import React, { useState } from 'react';

export interface Activity {
  id: string;
  title: string;
  description: string;
}

export interface LeagueEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  type?: string;
  ativo?: boolean;
  projetoExplica?: string;
}

export interface Enrollment {
  activityId: string;
  activityTitle: string;
  fullName: string;
  registrationId: string;
  semester: string;
  email: string;
}

interface EnrollmentModalProps {
  activity: Activity;
  event?: LeagueEvent;
  onClose: () => void;
  onSubmit: (enrollment: Enrollment) => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ activity, event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    registrationId: '',
    semester: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = event ? `${activity.title} - ${event.title}` : activity.title;
    onSubmit({
      activityId: activity.id,
      activityTitle: title,
      ...formData
    });
    alert(`✅ Inscrição solicitada! Candidato: ${formData.fullName} para ${title}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-emerald-600 p-8 text-white flex justify-between items-center shrink-0 shadow-lg">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Candidatura Acadêmica</h3>
            <p className="text-emerald-100 text-[10px] mt-1 uppercase font-black tracking-widest">
              {event ? event.title : activity.title}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="overflow-y-auto p-8 no-scrollbar space-y-6 bg-[#f8fafc]">
          {/* Informações da Atividade */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-3 shadow-sm">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-circle-info"></i> Detalhes da Atividade
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {event?.projetoExplica || activity.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Nome Completo do Discente</label>
              <input 
                required
                type="text"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold shadow-sm"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Matrícula</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold shadow-sm"
                  value={formData.registrationId}
                  onChange={e => setFormData({...formData, registrationId: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Período Atual</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: 5º Período"
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold shadow-sm"
                  value={formData.semester}
                  onChange={e => setFormData({...formData, semester: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">E-mail para Contato</label>
              <input 
                required
                type="email"
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold shadow-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="pt-6">
              <button 
                type="submit"
                className="w-full bg-[#055c47] text-white font-black py-5 rounded-[2rem] hover:bg-black transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3 active:scale-95 uppercase text-xs tracking-[0.2em]"
              >
                Confirmar Participação
                <i className="fa-solid fa-paper-plane"></i>
              </button>
              <p className="text-[8px] text-center text-slate-300 mt-6 leading-tight font-black uppercase tracking-[0.3em]">
                Seus dados serão processados pela Secretaria Digital LAPIB.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentModal;