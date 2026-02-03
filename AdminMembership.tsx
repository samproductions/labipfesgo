
import React, { useState } from 'react';
import { MembershipSettings } from './types';

interface AdminMembershipProps {
  settings: MembershipSettings;
  onUpdateSettings: (settings: MembershipSettings) => void;
  onLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminMembership: React.FC<AdminMembershipProps> = ({ settings, onUpdateSettings, onLogoUpload }) => {
  const [stageInput, setStageInput] = useState({ stage: '', date: '' });

  const handleToggleStatus = () => {
    onUpdateSettings({
      ...settings,
      selectionStatus: settings.selectionStatus === 'open' ? 'closed' : 'open'
    });
  };

  const handleUpdateEdital = (url: string) => {
    onUpdateSettings({ ...settings, editalUrl: url });
  };

  const addStage = () => {
    if (!stageInput.stage || !stageInput.date) return;
    onUpdateSettings({
      ...settings,
      calendar: [...settings.calendar, { ...stageInput }]
    });
    setStageInput({ stage: '', date: '' });
  };

  const removeStage = (index: number) => {
    const updated = settings.calendar.filter((_, i) => i !== index);
    onUpdateSettings({ ...settings, calendar: updated });
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Ajustes & Sistema</h3>
          <p className="text-[10px] text-[#055c47] font-black uppercase tracking-[0.4em] mt-2">Configurações Globais da Liga</p>
        </div>
        <div className={`px-6 py-2 rounded-full border flex items-center gap-3 transition-all ${settings.selectionStatus === 'open' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <div className={`w-2 h-2 rounded-full ${settings.selectionStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Processo {settings.selectionStatus === 'open' ? 'Ativo' : 'Inativo'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          {/* LOGO UPLOAD SECTION */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <i className="fa-solid fa-palette text-[#055c47]"></i> Identidade Visual
            </h4>
            
            <div className="space-y-6">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Troque o logotipo oficial exibido em todo o sistema (sidebar, certificados e documentos).</p>
              
              <label className="flex items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-[#055c47] transition-all group/upload relative overflow-hidden">
                <div className="text-center relative z-10">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 group-hover/upload:text-[#055c47] transition-colors mb-2 block"></i>
                  <span className="text-[10px] font-black text-slate-400 group-hover/upload:text-[#055c47] uppercase tracking-widest">Trocar Logotipo</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
              </label>
            </div>
          </div>

          {/* SELECTION SETTINGS */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <i className="fa-solid fa-sliders text-[#055c47]"></i> Configurações de Acesso
            </h4>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800 uppercase">Portal de Inscrições</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Habilitar formulário para acadêmicos</p>
                </div>
                <button 
                  onClick={handleToggleStatus}
                  className={`w-16 h-9 rounded-full transition-all relative shadow-inner ${settings.selectionStatus === 'open' ? 'bg-[#055c47]' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all ${settings.selectionStatus === 'open' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">URL do Edital Oficial (Nuvem)</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={settings.editalUrl}
                    onChange={(e) => handleUpdateEdital(e.target.value)}
                    placeholder="https://cloud.lapib.com/edital-2025.pdf"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all pr-14"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#055c47] transition-colors">
                    <i className="fa-solid fa-link"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chronograma View */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
          <header className="mb-8 flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-timeline text-[#055c47]"></i> Linha do Tempo de Seleção
            </h4>
            <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase border border-emerald-100">
              {settings.calendar.length} Etapas
            </span>
          </header>
          
          <div className="flex-1 space-y-4 mb-10 overflow-y-auto no-scrollbar max-h-[350px]">
            {settings.calendar.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-[#055c47]/30 transition-all group">
                <div className="flex items-center gap-5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-[#055c47] shadow-sm group-hover:bg-[#055c47] group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase leading-none tracking-tight">{item.stage}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeStage(idx)} 
                  className="w-10 h-10 rounded-xl text-slate-200 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-trash-can text-[11px]"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Protocolar Nova Etapa</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                placeholder="Título (ex: Entrevistas)" 
                className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 text-[10px] font-bold uppercase outline-none focus:border-[#055c47] transition-all"
                value={stageInput.stage}
                onChange={e => setStageInput({...stageInput, stage: e.target.value})}
              />
              <input 
                placeholder="Data/Mês" 
                className="sm:w-32 bg-white border border-slate-200 rounded-xl px-5 py-4 text-[10px] font-bold uppercase outline-none focus:border-[#055c47] transition-all"
                value={stageInput.date}
                onChange={e => setStageInput({...stageInput, date: e.target.value})}
              />
              <button 
                onClick={addStage}
                className="bg-[#055c47] text-white w-full sm:w-14 h-14 rounded-xl flex items-center justify-center shadow-lg hover:bg-black transition-all active:scale-95"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMembership;
