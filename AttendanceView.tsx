import React from 'react';
import { UserProfile, AttendanceRecord, CalendarEvent } from './types';

interface AttendanceViewProps {
  user: UserProfile;
  attendances: AttendanceRecord[];
  events: CalendarEvent[];
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ user, attendances, events }) => {
  const isAdmin = user.role === 'admin';
  
  // Se for admin, mostra todas. Se for membro, mostra as dele.
  const displayRecords = isAdmin 
    ? attendances 
    : attendances.filter(a => a.memberId === user.id || a.memberName === user.fullName);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 text-left">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-[#055c47] rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl relative overflow-hidden group">
          <i className="fa-solid fa-clipboard-check relative z-10 transition-transform group-hover:scale-110"></i>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Registro de Presença</h2>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mt-3">Histórico Acadêmico de Atividades</p>
        </div>
        <div className="bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-100 text-center">
          <div className="text-2xl font-black text-[#055c47] tracking-tighter">{displayRecords.length}</div>
          <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Registros</div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Evento/Atividade</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Data do Registro</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{isAdmin ? 'Acadêmico' : 'Status'}</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-8">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{record.eventTitle}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sessão Científica</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-medium text-slate-600">{new Date(record.timestamp).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-10 py-8">
                    {isAdmin ? (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-[10px] font-black">
                            {record.memberName.charAt(0)}
                         </div>
                         <span className="text-[11px] font-bold text-slate-700 uppercase">{record.memberName}</span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest">
                        Confirmado
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="text-slate-300 hover:text-[#055c47] transition-all">
                      <i className="fa-solid fa-circle-info text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {displayRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center opacity-30">
                    <i className="fa-solid fa-calendar-xmark text-6xl mb-6 block"></i>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">Nenhum registro de presença encontrado</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-10 bg-emerald-600 rounded-[3rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <i className="fa-solid fa-qrcode text-[120px]"></i>
        </div>
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Check-in por QR Code</h4>
          <p className="text-emerald-100/80 font-medium text-sm leading-relaxed">
            Durante os eventos presenciais, utilize o leitor de QR Code integrado para confirmar sua participação instantaneamente.
          </p>
        </div>
        <button className="relative z-10 bg-white text-[#055c47] px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
          Abrir Scanner
        </button>
      </div>
    </div>
  );
};

export default AttendanceView;