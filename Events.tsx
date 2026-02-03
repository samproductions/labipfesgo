import React, { useState } from 'react';

export interface LeagueEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'meeting' | 'workshop' | 'symposium';
  ativo?: boolean;
  projetoExplica?: string;
  imageUrl?: string;
}

interface EventsProps {
  events: LeagueEvent[];
  onNavigateToActivities: () => void;
  logoUrl: string;
  onAction?: (event: LeagueEvent) => void;
}

const Events: React.FC<EventsProps> = ({ events, onNavigateToActivities, logoUrl, onAction }) => {
  const [selectedEvent, setSelectedEvent] = useState<LeagueEvent | null>(null);
  const activeEvents = events.filter(e => e.ativo === true);
  const sortedEvents = [...activeEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAction = (e: LeagueEvent) => {
    if (onAction) {
      onAction(e);
    } else {
      setSelectedEvent(e);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="text-left">
          <h2 className="text-4xl md:text-5xl font-black text-[#055c47] uppercase tracking-tighter">Cronograma Oficial</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] mt-2">Calendário acadêmico sincronizado em tempo real</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl w-full md:w-auto shadow-sm border border-slate-100">
          <button className="flex-1 md:px-8 py-3 bg-[#055c47] text-white rounded-xl text-[10px] font-black shadow-lg uppercase tracking-widest transition-all">Ativos</button>
          <button className="flex-1 md:px-8 py-3 text-slate-400 rounded-xl text-[10px] font-black hover:bg-slate-50 uppercase tracking-widest transition-all">Passados</button>
        </div>
      </div>

      <div className="grid gap-12">
        {sortedEvents.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onAction={() => handleAction(event)} 
            onViewDetails={() => setSelectedEvent(event)}
            logoUrl={logoUrl} 
          />
        ))}
        {sortedEvents.length === 0 && (
          <div className="bg-white p-24 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
            <i className="fa-solid fa-calendar-day text-7xl text-slate-100 mb-6 block"></i>
            <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Nenhum evento público agendado no momento</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onEnroll={() => { handleAction(selectedEvent); setSelectedEvent(null); }}
          logoUrl={logoUrl} 
        />
      )}
    </div>
  );
};

const EventCard: React.FC<{ event: LeagueEvent; onAction: () => void; onViewDetails: () => void; logoUrl: string }> = ({ event, onAction, onViewDetails, logoUrl }) => {
  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'meeting': return 'from-blue-500 to-indigo-600';
      case 'workshop': return 'from-emerald-500 to-teal-700';
      case 'symposium': return 'from-[#055c47] to-[#044a3a]';
      default: return 'from-slate-500 to-slate-700';
    }
  };

  const eventDate = new Date(event.date);
  eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset());

  return (
    <div className="bg-white rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:translate-y-[-4px] group flex flex-col lg:flex-row border border-slate-100 shadow-sm relative">
      {/* Mobile-only Top Bar */}
      <div className={`lg:hidden p-4 bg-gradient-to-r ${getTypeStyles(event.type)} text-white flex justify-between items-center`}>
        <span className="text-[9px] font-black uppercase tracking-widest">{event.type}</span>
        <span className="text-[9px] font-black">{eventDate.toLocaleDateString('pt-BR')}</span>
      </div>

      {/* Media Section - Clicking the overlay/Saber Mais now triggers the enrollment flow directly */}
      <div className="relative h-60 lg:h-auto lg:w-96 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer" onClick={onAction}>
        <img 
          src={event.imageUrl || logoUrl} 
          alt={event.title}
          className={`w-full h-full ${event.imageUrl ? 'object-cover' : 'object-contain p-12'} transition-all duration-700 group-hover:scale-105`}
          onError={(e) => { (e.target as HTMLImageElement).src = logoUrl; }}
        />
        <div className="absolute inset-0 bg-[#055c47]/5 group-hover:bg-transparent transition-all"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
           <div className="bg-white text-[#055c47] px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
             <i className="fa-solid fa-file-signature"></i>
             INSCREVER-SE
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 lg:p-12 flex-1 flex flex-col lg:flex-row gap-8 text-left">
        {/* Date Section (Desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center px-8 border-r border-slate-100 min-w-[150px]">
          <span className="text-[10px] font-black text-[#055c47] uppercase tracking-[0.3em] mb-1">
            {eventDate.toLocaleDateString('pt-BR', { month: 'short' })}
          </span>
          <span className="text-6xl font-black text-slate-800 tracking-tighter leading-none">
            {eventDate.getDate().toString().padStart(2, '0')}
          </span>
          <div className="mt-4 flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.time}</span>
            <div className="w-1 h-1 bg-emerald-500 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className={`hidden lg:inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-md bg-gradient-to-r ${getTypeStyles(event.type)}`}>
                {event.type}
              </span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{event.location}</span>
            </div>
            
            <h3 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase leading-tight tracking-tighter group-hover:text-[#055c47] transition-all cursor-pointer" onClick={onAction}>
              {event.title}
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onAction}
              className="flex-1 bg-[#055c47] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-file-signature text-sm"></i>
              FICHA CADASTRAL
            </button>
            <button 
              onClick={onViewDetails}
              className="px-8 py-5 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              Detalhes do Evento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDetailModal: React.FC<{ event: LeagueEvent; onClose: () => void; onEnroll: () => void; logoUrl: string }> = ({ event, onClose, onEnroll, logoUrl }) => {
  const eventDate = new Date(event.date);
  eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative animate-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        {/* Modal Close */}
        <div className="absolute top-6 right-6 z-20">
           <button onClick={onClose} className="w-10 h-10 bg-white/10 backdrop-blur-xl hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition shadow-lg border border-white/20">
             <i className="fa-solid fa-xmark"></i>
           </button>
        </div>

        {/* Modal Header Media */}
        <div className="relative h-64 shrink-0 overflow-hidden">
           <img 
             src={event.imageUrl || logoUrl} 
             className="w-full h-full object-cover" 
             alt={event.title} 
             onError={(e) => { (e.target as HTMLImageElement).src = logoUrl; }}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
           <div className="absolute bottom-6 left-10">
              <span className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-xl bg-emerald-600">
                Informação Acadêmica
              </span>
           </div>
        </div>

        {/* Modal Body */}
        <div className="p-10 lg:p-14 overflow-y-auto no-scrollbar space-y-8 bg-white text-left">
           <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight uppercase">{event.title}</h2>
              <div className="flex flex-wrap gap-4">
                 <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm">
                    <i className="fa-solid fa-calendar-day text-emerald-600 text-xs"></i>
                    <span className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">{eventDate.toLocaleDateString('pt-BR')} • {event.time}</span>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                    <i className="fa-solid fa-location-dot text-slate-400 text-xs"></i>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{event.location}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#055c47] uppercase tracking-[0.3em] flex items-center gap-3">
                 <i className="fa-solid fa-circle-nodes"></i> Resumo Científico
              </h4>
              <div className="text-slate-500 text-sm leading-relaxed font-medium whitespace-pre-wrap bg-slate-50/50 p-8 rounded-[2rem] border border-slate-50 italic">
                 {event.projetoExplica || event.description || "As informações detalhadas sobre este evento científico serão apresentadas nos canais oficiais da LAPIB em breve."}
              </div>
           </div>

           <div className="pt-6">
              <button 
                onClick={onEnroll}
                className="w-full bg-[#055c47] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-file-signature"></i>
                FICHA CADASTRAL
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Events;