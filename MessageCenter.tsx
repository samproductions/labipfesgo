
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DirectMessage, Member } from './types';
import RestrictedAccess from './RestrictedAccess';
import CloudService from './cloudService';

interface MessageCenterProps {
  currentUser: UserProfile;
  messages: DirectMessage[];
  members: Member[];
  onSendMessage: (text: string, fileData?: { data: string, name: string }) => void;
}

const MASTER_ADMIN_ID = 'admin';
const MASTER_ADMIN_EMAIL = 'lapibfesgo@gmail.com';

const MessageCenter: React.FC<MessageCenterProps> = ({ currentUser, messages, members, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [attachment, setAttachment] = useState<{ data: string, name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL;
  const isAuthorized = isAdmin || (currentUser.acessoLiberado === true);

  // Filtra as mensagens apenas da conversa ativa entre o usuário logado e o destinatário selecionado
  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedRecipientId) ||
    (m.senderId === selectedRecipientId && m.receiverId === currentUser.id)
  );

  useEffect(() => {
    // Scroll para o fim ao receber nova mensagem ou trocar conversa
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages, selectedRecipientId]);

  // Se for membro, o destinatário padrão é o Admin.
  useEffect(() => {
    if (!isAdmin && !selectedRecipientId) {
      setSelectedRecipientId(MASTER_ADMIN_ID);
    }
  }, [isAdmin, selectedRecipientId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({ data: reader.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageText.trim() && !attachment) || !selectedRecipientId || isProcessing) return;

    setIsProcessing(true);
    try {
      await onSendMessage(messageText.trim(), attachment || undefined);
      setMessageText('');
      setAttachment(null);
    } catch (err) {
      alert("Falha ao enviar mensagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthorized) {
    return <RestrictedAccess />;
  }

  const selectedRecipientName = isAdmin 
    ? (members.find(m => m.id === selectedRecipientId)?.fullName || "Selecione um Membro")
    : "Diretoria Master LAPIB";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#055c47] rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl">
            <i className="fa-solid fa-comments"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Comunicação Acadêmica</h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Sincronização Master em Tempo Real</p>
          </div>
        </div>

        {isAdmin && (
          <div className="w-full md:w-auto">
            <select 
              className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-[#055c47]/10"
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
            >
              <option value="">Selecione o Destinatário</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Conversas (Desktop) */}
        {isAdmin && (
          <div className="hidden lg:block bg-white rounded-[3.5rem] border border-slate-100 p-8 shadow-sm h-[600px] overflow-y-auto no-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 px-2">Conversas Ativas</h3>
            <div className="space-y-4">
              {members.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedRecipientId(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedRecipientId === m.id ? 'bg-[#055c47] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <img src={m.photoUrl} className="w-10 h-10 rounded-xl object-cover border border-white/20" alt="" />
                  <div className="text-left overflow-hidden">
                    <p className={`text-[10px] font-black uppercase truncate ${selectedRecipientId === m.id ? 'text-white' : 'text-slate-800'}`}>{m.fullName}</p>
                    <p className={`text-[8px] uppercase tracking-widest opacity-60 truncate ${selectedRecipientId === m.id ? 'text-emerald-100' : 'text-slate-400'}`}>{m.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View de Chat */}
        <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-[3.5rem] border border-slate-100 flex flex-col h-[600px] overflow-hidden shadow-2xl relative`}>
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-[#055c47] flex items-center justify-center text-white text-xs">
                 <i className="fa-solid fa-user-graduate"></i>
               </div>
               <div className="text-left">
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{selectedRecipientName}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Sessão Criptografada</span>
                  </div>
               </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-slate-50/20">
            {activeChatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[75%] p-6 rounded-3xl shadow-sm ${msg.senderId === currentUser.id ? 'bg-[#055c47] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-3 gap-8">
                    <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">{msg.senderName}</span>
                    <span className="text-[7px] opacity-40 uppercase font-black tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>

                  {msg.message && <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                  
                  {msg.fileUrl && (
                    <div className={`mt-4 p-5 rounded-2xl flex items-center justify-between gap-4 group border ${msg.senderId === currentUser.id ? 'bg-black/10 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                       <div className="flex items-center gap-4 overflow-hidden">
                          <i className={`fa-solid ${msg.fileName?.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-red-400' : 'fa-file-image text-blue-400'} text-2xl`}></i>
                          <div className="truncate">
                             <p className={`text-[10px] font-black uppercase truncate ${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-800'}`}>{msg.fileName}</p>
                             <p className="text-[8px] opacity-60 uppercase font-black tracking-widest">Mídia Acadêmica</p>
                          </div>
                       </div>
                       <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${msg.senderId === currentUser.id ? 'bg-white/10 hover:bg-white/20 text-white shadow-inner' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shadow-sm'}`}>
                          <i className="fa-solid fa-cloud-arrow-down"></i>
                       </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {activeChatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-12">
                 <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-comments text-4xl text-slate-400"></i>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                   {selectedRecipientId ? "Nenhuma mensagem nesta conversa acadêmica." : "Selecione um contato para iniciar o diálogo."}
                 </p>
              </div>
            )}
          </div>

          {/* Área de Input */}
          <div className="p-8 bg-white border-t flex flex-col gap-4">
            {attachment && (
              <div className="flex items-center justify-between bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 animate-in slide-in-from-bottom-1">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-paperclip text-emerald-600"></i>
                  <span className="text-[9px] font-black uppercase text-emerald-700">{attachment.name}</span>
                </div>
                <button onClick={() => setAttachment(null)} className="text-red-400 hover:text-red-600 transition-colors">
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
              <label className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-inner shrink-0 relative">
                 <i className="fa-solid fa-paperclip text-xl"></i>
                 <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,image/*" />
              </label>
              <input 
                type="text" 
                placeholder={selectedRecipientId ? "Digite sua mensagem acadêmica..." : "Selecione um destinatário primeiro..."}
                disabled={!selectedRecipientId || isProcessing}
                className="flex-1 px-8 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-4 focus:ring-[#055c47]/10 transition-all font-medium h-14"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={(!messageText.trim() && !attachment) || !selectedRecipientId || isProcessing}
                className="w-14 h-14 rounded-2xl bg-[#055c47] text-white flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50 shrink-0"
              >
                {isProcessing ? <i className="fa-solid fa-dna animate-spin text-lg"></i> : <i className="fa-solid fa-paper-plane text-lg"></i>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
