
import React, { useState, useRef, useEffect } from 'react';
import { getAssistantResponseStream } from './geminiService';
import { Member, Project, UserProfile } from './types';
import CloudService from './cloudService';

interface Message {
  role: 'user' | 'model';
  text: string;
  links?: { title: string; uri: string }[];
}

interface ChatAssistantProps {
  members: Member[];
  projects: Project[];
  user: UserProfile;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ members, projects, user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Saudações acadêmicas! Sou a Iris, sua tutora de alta performance. Como posso elevar seu conhecimento científico hoje?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sincronização inicial com o histórico na nuvem
  useEffect(() => {
    const loadCloudHistory = async () => {
      if (user.email) {
        const history = await CloudService.getChatHistory(user.email);
        if (history && history.length > 0) {
          setMessages(history);
        }
      }
      setIsSyncing(false);
    };
    loadCloudHistory();
  }, [user.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const currentHistory = messages.map(m => ({ role: m.role, text: m.text }));
    
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await getAssistantResponseStream(userMsg, currentHistory, members, projects);
      
      let fullText = '';
      let groundingLinks: { title: string; uri: string }[] = [];
      
      setMessages(prev => [...prev, { role: 'model', text: '', links: [] }]);

      for await (const chunk of stream) {
        const textChunk = chunk.text;
        const candidates = (chunk as any).candidates;
        const metadata = candidates?.[0]?.groundingMetadata;
        const chunks = metadata?.groundingChunks;
        
        if (chunks) {
          chunks.forEach((c: any) => {
            if (c.web && c.web.uri && !groundingLinks.find(l => l.uri === c.web.uri)) {
              groundingLinks.push({ title: c.web.title || 'Fonte Científica', uri: c.web.uri });
            }
          });
        }

        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            const others = prev.slice(0, -1);
            const updatedModelMsg: Message = { ...last, text: fullText, links: [...groundingLinks] };
            return [...others, updatedModelMsg];
          });
        }
      }
      
      // Salva o histórico final na nuvem para persistência multi-dispositivo
      setMessages(prev => {
        CloudService.saveChatHistory(user.email, prev);
        return prev;
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um erro ao processar sua dúvida. Verifique sua conexão acadêmica.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-500 relative">
      <div className="bg-[#055c47] p-6 flex items-center justify-between text-white border-b border-emerald-500/20 z-10 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 transition-all ${isLoading ? 'bg-emerald-400' : 'bg-emerald-600'}`}>
            <i className={`fa-solid ${isLoading ? 'fa-dna animate-spin' : 'fa-robot'} text-xl`}></i>
          </div>
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-tight">Iris IA • Tutoria LAPIB</h3>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-300">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-900'}`}></span>
              {isSyncing ? 'Sincronizando Histórico...' : (isLoading ? 'Consultando...' : 'Nuvem Conectada')}
            </div>
          </div>
        </div>
        <button 
          onClick={() => { if(confirm("Limpar histórico da nuvem?")) { setMessages([{ role: 'model', text: 'Histórico limpo. Como posso ajudar de novo?' }]); CloudService.saveChatHistory(user.email, []); } }}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          title="Limpar Conversa"
        >
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8fafc] no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className="max-w-[85%] space-y-3">
              <div className={`p-6 rounded-[2rem] shadow-sm text-left ${
                msg.role === 'user' 
                  ? 'bg-[#055c47] text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
              </div>

              {msg.links && msg.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.links.map((link, lIdx) => (
                    <a 
                      key={lIdx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-[8px] font-black text-emerald-700 hover:bg-emerald-100 transition-colors uppercase tracking-tight"
                    >
                      <i className="fa-solid fa-link"></i>
                      {link.title.substring(0, 25)}...
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].text === '' && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-100 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Iris está processando...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-white shrink-0">
        <form onSubmit={handleSend} className="flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tire suas dúvidas acadêmicas com a IRIS..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-8 py-5 text-sm focus:ring-2 focus:ring-[#055c47] outline-none transition font-medium"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#055c47] text-white w-16 h-16 rounded-full flex items-center justify-center hover:bg-emerald-800 transition disabled:opacity-50 shadow-xl active:scale-95 shrink-0"
          >
            <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
