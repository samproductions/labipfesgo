
import React, { useState } from 'react';
import { AttendanceRecord, CalendarEvent, Member } from './types';

interface AdminAttendanceProps {
  attendances: AttendanceRecord[];
  events: CalendarEvent[];
  members: Member[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onDeleteAttendance: (id: string) => void;
}

const AdminAttendance: React.FC<AdminAttendanceProps> = ({ 
  attendances, 
  events, 
  members, 
  onAddAttendance, 
  onDeleteAttendance 
}) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualEventName, setManualEventName] = useState('');
  const [isAvulsa, setIsAvulsa] = useState(false);
  const [isEventAvulso, setIsEventAvulso] = useState(false);

  const handleManualAdd = () => {
    // Definir título do evento e data
    let eventTitle = '';
    let eventDate = new Date().toISOString().split('T')[0];

    if (isEventAvulso) {
      if (!manualEventName.trim()) {
        alert("Digite o nome do evento avulso.");
        return;
      }
      eventTitle = manualEventName.trim().toUpperCase();
    } else {
      const event = events.find(e => e.id === selectedEventId);
      if (!event) {
        alert("Selecione um evento primeiro.");
        return;
      }
      eventTitle = event.title;
      eventDate = event.date;
    }

    if (isAvulsa) {
      // Registro de pessoa avulsa (não membro)
      if (!manualName.trim()) {
        alert("Digite o nome do acadêmico avulso.");
        return;
      }
      const newAR: AttendanceRecord = {
        id: Date.now().toString(),
        memberId: 'avulso-' + Date.now(),
        memberName: manualName.trim().toUpperCase(),
        eventTitle: eventTitle,
        date: eventDate,
        timestamp: new Date().toISOString(),
        isAvulsa: true
      };
      onAddAttendance(newAR);
      setManualName('');
    } else {
      // Registro de membro da lista
      const member = members.find(m => m.id === selectedMemberId);
      if (!member) {
        alert("Selecione um acadêmico da lista.");
        return;
      }
      const newAR: AttendanceRecord = {
        id: Date.now().toString(),
        memberId: member.id,
        memberName: member.fullName,
        eventTitle: eventTitle,
        date: eventDate,
        timestamp: new Date().toISOString()
      };
      onAddAttendance(newAR);
      setSelectedMemberId('');
    }
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in">
      <div className="flex flex-col gap-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Registros Master</h3>
          
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
             <button 
              onClick={() => setIsEventAvulso(false)} 
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isEventAvulso ? 'bg-[#055c47] text-white shadow-md' : 'text-slate-400'}`}
             >Evento do Cronograma</button>
             <button 
              onClick={() => setIsEventAvulso(true)} 
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isEventAvulso ? 'bg-[#055c47] text-white shadow-md' : 'text-slate-400'}`}
             >Evento Avulso</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Identificação do Evento</p>
            {isEventAvulso ? (
              <input 
                type="text" 
                placeholder="Nome do Evento Manual (Ex: Gravação Externa)"
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#055c47] shadow-sm"
                value={manualEventName}
                onChange={e => setManualEventName(e.target.value)}
              />
            ) : (
              <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#055c47] shadow-sm"
              >
                <option value="">Selecionar Evento do Cronograma</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante</p>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setIsAvulsa(false)} 
                  className={`text-[8px] font-black uppercase tracking-tighter ${!isAvulsa ? 'text-[#055c47] underline' : 'text-slate-300'}`}
                 >Membro</button>
                 <span className="text-slate-200">|</span>
                 <button 
                  onClick={() => setIsAvulsa(true)} 
                  className={`text-[8px] font-black uppercase tracking-tighter ${isAvulsa ? 'text-[#055c47] underline' : 'text-slate-300'}`}
                 >Avulso</button>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isAvulsa ? (
                <input 
                  type="text" 
                  placeholder="Nome Completo do Acadêmico"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[#055c47] shadow-sm"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                />
              ) : (
                <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#055c47] shadow-sm"
                >
                  <option value="">Selecionar Acadêmico Efetivo</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              )}

              <button 
                onClick={handleManualAdd}
                className="bg-[#055c47] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all whitespace-nowrap active:scale-95"
              >
                Lançar Registro
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Acadêmico</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Evento / Atividade</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendances.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${a.isAvulsa ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {a.isAvulsa ? 'A' : a.memberName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-black text-slate-800 uppercase">{a.memberName}</span>
                        {a.isAvulsa && <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest">Inscrição Avulsa</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 uppercase">{a.eventTitle}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-slate-400 font-medium">{new Date(a.date).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onDeleteAttendance(a.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center ml-auto"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {attendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum registro de presença</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
