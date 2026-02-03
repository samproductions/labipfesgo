import React, { useState } from 'react';
import { UserProfile, DirectMessage } from './types';
import RestrictedAccess from './RestrictedAccess';

interface MessageCenterProps {
  currentUser: UserProfile;
  messages: DirectMessage[];
  onSendMessage: (text: string, file?: File) => void;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ currentUser, messages, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAuthorized = currentUser.role === 'admin' || currentUser.role === 'member';

  const handleSendMessage = (fileToUpload?: File) => {
    if (!messageText.trim() && !fileToUpload) return;
    setIsProcessing(true);
    onSendMessage(messageText.trim(), fileToUpload);
    setMessageText('');
    setIsProcessing(false);
  };

  if (!isAuthorized) {
    return <RestrictedAccess />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-left">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 bg-[#055c47] rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl">
          <i className="fa-solid fa-message"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Secretaria Digital</h2>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Canal Direto com a Diretoria Master LAPIB</p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 flex flex-col h-[550px] overflow-hidden shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar bg-slate-50/20">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm ${msg.senderId === currentUser.id ? 'bg-[#055c47] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                <div className="flex justify-between items-center mb-2 gap-6">
                  <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">{msg.senderName}</span>
                  <span className="text-[7px] opacity-40 uppercase font-black tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                {msg.message && <p className="text-sm font-medium leading-relaxed">{msg.message}</p>}
                
                {msg.fileUrl && (
                  <div className={`mt-4 p-4 rounded-2xl flex items-center justify-between gap-4 group border ${msg.senderId === currentUser.id ? 'bg-black/10 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                     <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${msg.fileName?.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf text-red-400' : 'fa-file-image text-blue-400'} text-xl`}></i>
                        <div className="truncate">
                           <p className={`text-[10px] font-black uppercase truncate ${msg.senderId === currentUser.id ? 'text-white' : 'text-slate-800'}`}>{msg.fileName}</p>
                           <p className="text-[8px] opacity-60 uppercase font-black tracking-widest">Documento Anexo</p>
                        </div>
                     </div>
                     <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${msg.senderId === currentUser.id ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}>
                        <i className="fa-solid fa-download"></i>
                     </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-12">
               <i className="fa-solid fa-comments text-6xl mb-4 text-slate-200 block"></i>
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Inicie sua conversa acadêmica com a diretoria</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t flex gap-4 items-center">
          <label className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-inner shrink-0">
             <i className="fa-solid fa-paperclip text-xl"></i>
             <input type="file" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleSendMessage(file);
             }} />
          </label>
          <input 
            type="text" 
            placeholder="Digite sua dúvida acadêmica ou anexe um relatório..." 
            className="flex-1 px-8 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-4 focus:ring-[#055c47]/10 transition-all font-medium h-14"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={isProcessing}
            className="w-14 h-14 rounded-2xl bg-[#055c47] text-white flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;