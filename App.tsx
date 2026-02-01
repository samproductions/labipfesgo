import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
type ViewState = 'home' | 'feed' | 'projects' | 'members' | 'ingresso' | 'events' | 'labs' | 'attendance' | 'messages' | 'admin';
type AdminTab = 'labs' | 'events' | 'projects' | 'attendance' | 'ingresso' | 'members' | 'messages' | 'settings';

interface Member {
  id: string;
  name: string;
  role: string;
  img: string;
}

interface Project {
  id: string;
  title: string;
  orientador: string;
  date: string;
  status: 'ATIVO' | 'CONCLUÍDO';
  img: string;
  desc: string;
}

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('labs');
  const [user] = useState({ name: 'lapib', role: 'ADMIN', img: 'https://ui-avatars.com/api/?name=LAPIB&background=055c47&color=fff' });

  // Mock data reflecting images
  const members: Member[] = [
    { id: '1', name: 'Maria', role: 'DIRETORA MARKETING', img: 'https://ui-avatars.com/api/?name=Maria&background=f1f5f9&color=055c47' },
    { id: '2', name: 'Mateus', role: 'MARKETING', img: 'https://ui-avatars.com/api/?name=Mateus&background=f1f5f9&color=055c47' },
    { id: '3', name: 'Roberio', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Roberio&background=f1f5f9&color=055c47' },
    { id: '4', name: 'Murilo', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Murilo&background=f1f5f9&color=055c47' },
    { id: '5', name: 'Christhally', role: 'DIRETORA', img: 'https://ui-avatars.com/api/?name=Christhally&background=f1f5f9&color=055c47' },
    { id: '6', name: 'victor vilardel', role: 'PRESIDENTE', img: 'https://ui-avatars.com/api/?name=Victor+V&background=f1f5f9&color=055c47' },
    { id: '7', name: 'victor', role: 'PRESIDENTE', img: 'https://ui-avatars.com/api/?name=Victor&background=f1f5f9&color=055c47' },
  ];

  const projects: Project[] = [
    { id: '1', title: 'PROJETO ENSINO', orientador: 'VICTOR', date: '2025-12-23', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1532187875605-186c6af16664?w=400', desc: 'O Projeto Ensino tem como objetivo divulgar e aproximar conteúdos científicos da comunidade escolar, por meio d...' },
    { id: '2', title: 'PODCAST', orientador: 'VICTOR', date: '20/12/2025', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400', desc: 'O Podcast da LAPIB é um espaço de diálogo, aprendizado e troca de experiências no universo da Biomedicina, da pesquisa...' },
    { id: '3', title: 'UNICHAGAS', orientador: 'DRA. LILIANE DA ROCHA SIRIANO', date: '21/12/2025', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1579154235884-332cfa990ff7?w=400', desc: 'O UniChagas é um projeto de extensão do IPTSP que atua no enfrentamento da doença de Chagas por meio de ações de...' },
    { id: '4', title: 'BANCADA CIENTÍFICA', orientador: 'VICTOR', date: '21/12/2025', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400', desc: 'A Bancada Científica é um projeto voltado à captação, orientação e desenvolvimento de artigos científicos, oferecendo mentoria...' },
  ];

  // --- UI COMPONENTS ---
  const SidebarItem = ({ id, icon, label, group }: { id: ViewState, icon: string, label: string, group?: string }) => (
    <div className="w-full">
      {group && <div className="px-6 py-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-4">{group}</div>}
      <button 
        onClick={() => setView(id)}
        className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all text-[11px] font-bold uppercase tracking-widest ${view === id ? 'bg-white text-[#055c47] rounded-lg' : 'text-white/70 hover:text-white'}`}
      >
        <i className={`fa-solid ${icon} w-5 text-center`}></i>
        {label}
      </button>
    </div>
  );

  const AdminTabBtn = ({ id, icon, label }: { id: AdminTab, icon: string, label: string }) => (
    <button 
      onClick={() => setAdminTab(id)}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${adminTab === id ? 'bg-[#006b4d] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <i className={`fa-solid ${icon}`}></i>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden selection:bg-[#055c47] selection:text-white">
      
      {/* SIDEBAR - Exact match to Image 1-4 */}
      <aside className="w-72 bg-[#055c47] flex flex-col shrink-0">
        <div className="p-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-3 mb-4 shadow-2xl">
            <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=055c47&bold=true" className="w-full object-contain" alt="Logo" />
          </div>
          <h2 className="text-white font-black text-sm tracking-[0.2em] uppercase">LAPIB CONNECT</h2>
        </div>

        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto no-scrollbar">
          <SidebarItem id="home" icon="fa-house" label="Início" />
          <SidebarItem id="feed" icon="fa-rss" label="Feed Pesquisa" />
          <SidebarItem id="projects" icon="fa-flask" label="Projetos" />
          <SidebarItem id="members" icon="fa-users" label="Membros" />
          <SidebarItem id="ingresso" icon="fa-id-card" label="Ingresso" />

          <SidebarItem id="events" icon="fa-calendar" label="Cronograma" group="Espaço Aluno" />
          <SidebarItem id="labs" icon="fa-microscope" label="Laboratórios" />
          <SidebarItem id="attendance" icon="fa-clipboard-user" label="Minha Frequência" />
          <SidebarItem id="messages" icon="fa-comment" label="Mensagens" />

          <SidebarItem id="admin" icon="fa-shield-halved" label="Painel Master" group="Diretoria" />
        </nav>

        <div className="p-6 mt-auto bg-[#044a3a]/40">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#055c47] font-black text-xs border border-white/20">LA</div>
            <div>
              <p className="text-white font-black text-[11px] uppercase tracking-wider">{user.name}</p>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-tighter">ADMIN</p>
            </div>
          </div>
          <button className="text-red-400 text-[9px] font-black uppercase tracking-[0.2em] hover:text-red-300 transition-colors w-full text-left pl-1">Sair da Conta</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-14 relative">
        
        {/* VIEW: HOME (Image 1) */}
        {view === 'home' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 text-left">
            {/* Hero Section */}
            <section className="bg-[#055c47] rounded-[4rem] p-24 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <i className="fa-solid fa-dna text-[300px] rotate-12"></i>
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-10">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Biomedicina • Estácio GO</span>
                </div>
                <h1 className="text-7xl font-black leading-[1] mb-10 tracking-tighter">Inovação que pulsa<br/>ciência.</h1>
                <p className="text-emerald-50/70 text-base font-medium leading-relaxed mb-14">Fomentar a pesquisa científica de ponta e a divulgação técnica no campo da Biomedicina, unindo teoria, prática laboratorial e comunicação com a comunidade acadêmica.</p>
                <div className="flex gap-4">
                  <button onClick={() => setView('projects')} className="bg-white text-[#055c47] px-12 py-4.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all">Explorar Projetos</button>
                  <button className="bg-[#044a3a] text-white px-12 py-4.5 rounded-full font-black uppercase text-[10px] tracking-widest border border-white/10 flex items-center gap-3 hover:bg-[#033a2d] transition-all"><i className="fa-brands fa-instagram text-base"></i> Instagram</button>
                </div>
              </div>
            </section>

            {/* Stats Row */}
            <section className="grid grid-cols-3 gap-8">
              <div className="bg-white p-12 rounded-[2.5rem] flex items-center gap-8 shadow-sm border border-slate-50">
                <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/20"><i className="fa-solid fa-hourglass-half"></i></div>
                <div><h4 className="text-4xl font-black text-slate-800">04</h4><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Linhas de Pesquisa</p></div>
              </div>
              <div className="bg-white p-12 rounded-[2.5rem] flex items-center gap-8 shadow-sm border border-slate-50">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/20"><i className="fa-solid fa-microscope"></i></div>
                <div><h4 className="text-4xl font-black text-slate-800">07</h4><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Membros Ativos</p></div>
              </div>
              <div className="bg-white p-12 rounded-[2.5rem] flex items-center gap-8 shadow-sm border border-slate-50">
                <div className="w-20 h-20 bg-purple-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shadow-purple-500/20"><i className="fa-solid fa-vial"></i></div>
                <div><h4 className="text-4xl font-black text-slate-800">+1.2k</h4><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Horas Práticas</p></div>
              </div>
            </section>

            {/* Info Cards Row */}
            <section className="grid grid-cols-2 gap-8">
              <div className="bg-white p-16 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-10">
                    <i className="fa-solid fa-flask text-emerald-600 text-2xl"></i>
                    <h3 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter">Excelência Laboratorial</h3>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-12">A LAPIB atua no coração da inovação tecnológica aplicada à saúde. Nosso objetivo é transformar o conhecimento acadêmico em soluções diagnósticas reais através de metodologias rigorosas.</p>
                </div>
                <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100/50 flex gap-5">
                  <i className="fa-solid fa-quote-left text-emerald-200 text-2xl"></i>
                  <p className="text-emerald-700 italic text-xs font-bold leading-relaxed">"Ciência é o processo de transformar curiosidade em progresso coletivo."</p>
                </div>
              </div>

              <div className="bg-white p-16 rounded-[4rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-14">
                  <i className="fa-solid fa-fingerprint text-emerald-600 text-2xl"></i>
                  <h3 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter">Identidade LAPIB</h3>
                </div>
                <div className="space-y-10">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-emerald-900 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20"><i className="fa-solid fa-bullhorn text-xl"></i></div>
                    <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Divulgação Científica</p><p className="text-xs font-bold text-slate-600 leading-snug">Levar o conhecimento biomédico para além dos laboratórios, comunicando a ciência de forma clara e acessível.</p></div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white border-2 border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fa-solid fa-book-open text-xl"></i></div>
                    <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Conhecimento Científico</p><p className="text-xs font-bold text-slate-600 leading-snug">Produção e estudo de dados rigorosos para fundamentar a excelência acadêmica na Biomedicina.</p></div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-14 h-14 bg-white border-2 border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fa-solid fa-share-nodes text-xl"></i></div>
                    <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Acesso Científico</p><p className="text-xs font-bold text-slate-600 leading-snug">Democratizar a informação e os recursos de pesquisa para todos os membros e alunos da Estácio GO.</p></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: FEED (Image 2) */}
        {view === 'feed' && (
          <div className="max-w-xl mx-auto py-12 animate-in slide-in-from-bottom-10">
            <article className="bg-white rounded-[4rem] shadow-2xl overflow-hidden text-left border border-slate-50">
              <div className="p-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center text-white ring-4 ring-emerald-50"><i className="fa-solid fa-pause"></i></div>
                  <div>
                    <h4 className="font-black text-xs uppercase text-slate-800 tracking-tight">lapib</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">20/12/2025</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors"><i className="fa-solid fa-ellipsis text-lg"></i></button>
              </div>
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" className="w-full h-[500px] object-cover" alt="Post" />
              <div className="p-12">
                <div className="flex gap-8 mb-10">
                  <button className="text-red-500 text-3xl hover:scale-110 transition-transform"><i className="fa-solid fa-heart"></i></button>
                  <button className="text-slate-300 text-3xl hover:text-slate-400"><i className="fa-regular fa-comment"></i></button>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">2 Reações Científicas</span>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-10">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Nota da Pesquisa:</p>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">wddqfwfqfwasfsdvsfegdvs\ggv</p>
                </div>
                <div className="space-y-4 mb-12">
                  <div className="text-[12px] font-medium text-slate-700"><span className="font-black uppercase mr-3 text-slate-900">LAPIB</span> muito bom</div>
                  <div className="text-[12px] font-medium text-slate-700"><span className="font-black uppercase mr-3 text-slate-900">SAMUEL</span> Muito legal</div>
                  <div className="text-[12px] font-medium text-slate-700"><span className="font-black uppercase mr-3 text-slate-900">SAMUEL</span> Bom</div>
                  <button className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4 hover:text-slate-400 transition-colors">Ver todos os 4 comentários</button>
                </div>
                <div className="bg-slate-50 p-5 rounded-full border border-slate-100 flex items-center px-8 shadow-inner focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <input placeholder="Participar da discussão..." className="flex-1 bg-transparent outline-none text-[12px] font-medium placeholder:text-slate-300" />
                </div>
              </div>
            </article>
            <button className="fixed bottom-14 right-14 w-20 h-20 bg-[#006b4d] text-white rounded-[2rem] shadow-2xl text-3xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"><i className="fa-solid fa-camera-retro"></i></button>
          </div>
        )}

        {/* VIEW: PROJECTS (Image 3) */}
        {view === 'projects' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="text-center mb-20">
              <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Projetos Científicos</h2>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Produção Acadêmica e Inovação</p>
              <div className="flex justify-center gap-3 mt-12">
                <button className="bg-[#006b4d] text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Todos</button>
                <button className="bg-white text-slate-400 px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all">Ativos</button>
                <button className="bg-white text-slate-400 px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all">Concluídos</button>
              </div>
            </header>
            <div className="grid grid-cols-3 gap-10 text-left">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-[4rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-slate-50">
                   <div className="h-64 relative overflow-hidden">
                     <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                     <div className="absolute top-8 left-8 flex items-center gap-2 bg-[#006b4d] px-5 py-2 rounded-2xl shadow-lg">
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Ativo</span>
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                     </div>
                   </div>
                   <div className="p-12">
                     <h3 className="text-xl font-black uppercase text-slate-800 mb-5 leading-tight">{p.title}</h3>
                     <div className="flex items-center gap-3 mb-6">
                       <i className="fa-solid fa-user-tie text-emerald-600"></i>
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Orientador: {p.orientador}</span>
                     </div>
                     <p className="text-slate-400 text-xs font-medium leading-relaxed mb-12 line-clamp-3">{p.desc}</p>
                     <div className="flex items-center justify-between border-t border-slate-50 pt-8">
                       <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{p.date}</span>
                       <button className="text-[#055c47] text-[11px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Saber Mais <i className="fa-solid fa-chevron-right text-[9px]"></i></button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MEMBERS (Image 4) */}
        {view === 'members' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
             <header className="flex items-center justify-between mb-24">
               <div>
                 <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Nossa Equipe</h2>
                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mt-3">Diretoria e Membros Efetivos</p>
               </div>
               <button className="bg-[#006b4d] text-white px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all">
                 <i className="fa-solid fa-user-plus text-base"></i> Cadastrar Membro
               </button>
             </header>
             <div className="grid grid-cols-5 gap-10">
               {members.map(m => (
                 <div key={m.id} className="bg-white p-12 rounded-[3.5rem] flex flex-col items-center shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50 text-center">
                    <div className="relative mb-8">
                      <img src={m.img} className="w-28 h-28 rounded-full border-4 border-slate-50 shadow-xl" alt={m.name} />
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
                    </div>
                    <h4 className="font-black text-slate-800 uppercase text-[13px] mb-2 leading-tight">{m.name}</h4>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{m.role}</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* VIEW: INGRESSO (Image 5) */}
        {view === 'ingresso' && (
          <div className="max-w-6xl mx-auto py-12 animate-in slide-in-from-bottom-10 text-left">
            <div className="grid grid-cols-3 gap-10 items-start">
              
              <div className="col-span-2 space-y-10">
                {/* Intro Card */}
                <div className="bg-white p-20 rounded-[4rem] shadow-sm border border-slate-50">
                   <h3 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter mb-10">Ingresso na LAPIB</h3>
                   <p className="text-slate-500 text-base font-medium leading-relaxed mb-12">Nossa liga seleciona alunos de Biomedicina que buscam excelência acadêmica. O processo avalia conhecimentos técnicos e o interesse real em pesquisa científica.</p>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8">Critérios atuais de avaliação:</p>
                   <div className="space-y-5">
                     <div className="bg-emerald-50/40 p-8 rounded-[2.5rem] border border-emerald-100/50 flex items-center gap-8">
                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-600/20">1</div>
                        <p className="text-sm font-bold text-slate-600">\egv\dvdvd\vafef</p>
                     </div>
                   </div>
                </div>

                {/* Selection Calendar */}
                <div className="bg-[#052d22] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5"><i className="fa-solid fa-calendar-check text-[150px]"></i></div>
                   <div className="flex items-center gap-5 mb-14">
                     <div className="w-12 h-12 bg-emerald-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-calendar-days"></i></div>
                     <h3 className="text-xl font-black uppercase tracking-[0.2em]">Calendário de Seleção</h3>
                   </div>
                   <div className="space-y-8 relative z-10">
                      <div className="flex justify-between items-center border-b border-white/10 pb-6">
                        <span className="text-sm font-black uppercase tracking-[0.3em]">faf</span>
                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">01/01</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-[0.3em]">faf</span>
                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">20/01</span>
                      </div>
                   </div>
                </div>

                {/* Inscrição Form */}
                <div className="bg-white p-20 rounded-[4rem] shadow-sm border border-slate-50">
                   <div className="flex items-center gap-5 mb-16">
                     <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner"><i className="fa-solid fa-file-pen"></i></div>
                     <div><h3 className="text-xl font-black text-[#055c47] uppercase tracking-tighter leading-none">Inscreva-se Aqui</h3><p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-3">Processo Seletivo Ativo</p></div>
                   </div>
                   <div className="grid grid-cols-2 gap-8 mb-12">
                     <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Nome Completo</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-emerald-100 transition-all" /></div>
                     <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">E-mail Acadêmico</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-emerald-100 transition-all" /></div>
                     <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Matrícula</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-emerald-100 transition-all" /></div>
                     <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Período Atual</p><input placeholder="Ex: 4º Período" className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-emerald-100 transition-all" /></div>
                   </div>
                   <button className="w-full py-8 bg-[#006b4d] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Finalizar Inscrição</button>
                </div>
              </div>

              <aside className="space-y-10 sticky top-0">
                {/* Edital Card */}
                <div className="bg-white p-14 rounded-[4rem] shadow-sm border border-slate-50 text-center">
                   <div className="w-28 h-28 bg-emerald-50 rounded-[3rem] mx-auto mb-12 flex items-center justify-center text-emerald-600 text-6xl shadow-inner"><i className="fa-solid fa-file-pdf"></i></div>
                   <h4 className="text-base font-black text-[#055c47] uppercase tracking-tighter mb-5 leading-tight">Edital de Ingresso</h4>
                   <p className="text-[10px] font-black text-slate-300 uppercase mb-12 leading-relaxed tracking-widest">Documento obrigatório para consulta.</p>
                   <button className="w-full bg-slate-50 py-6 rounded-2xl text-[10px] font-black uppercase text-slate-400 border border-slate-100 flex items-center justify-center gap-3 hover:bg-emerald-50 hover:text-emerald-700 transition-all"><i className="fa-solid fa-eye text-base"></i> Abrir PDF Oficial</button>
                </div>

                {/* Support/IA Card */}
                <div className="bg-[#006b4d] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute -bottom-14 -right-14 opacity-10 group-hover:scale-125 transition-transform duration-1000 pointer-events-none"><i className="fa-solid fa-robot text-[200px]"></i></div>
                   <h4 className="text-base font-black uppercase tracking-widest mb-6">Suporte à Pesquisa</h4>
                   <p className="text-sm font-medium text-emerald-50/70 leading-relaxed relative z-10">Fale com nossa IA Iris para tirar dúvidas rápidas sobre o funcionamento da liga e do processo seletivo.</p>
                </div>
              </aside>

            </div>
          </div>
        )}

        {/* VIEW: EVENTS (Image 6) */}
        {view === 'events' && (
           <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
              <header className="text-center mb-24">
                <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Cronograma Oficial</h2>
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Calendário Acadêmico Sincronizado</p>
                <div className="flex justify-center gap-3 mt-12">
                  <button className="bg-[#006b4d] text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Ativos</button>
                  <button className="bg-white text-slate-400 px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50">Passados</button>
                </div>
              </header>
              <div className="bg-white rounded-[5rem] p-20 shadow-sm border border-slate-50 flex gap-20 items-center max-w-5xl mx-auto">
                 <div className="w-80 h-80 bg-slate-50 rounded-[4rem] p-12 shrink-0 flex items-center justify-center border border-slate-100 shadow-inner">
                   <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=055c47&bold=true" className="w-full object-contain" alt="Event Logo" />
                 </div>
                 <div className="flex-1">
                   <span className="bg-purple-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] mb-12 inline-block shadow-lg shadow-purple-600/20">Symposium</span>
                   <div className="flex items-start gap-16">
                     <div className="text-center min-w-[100px]">
                        <p className="text-[11px] font-black text-emerald-600 uppercase mb-4 tracking-widest">Out.</p>
                        <h4 className="text-7xl font-black text-slate-800 leading-none tracking-tighter">20</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-6 tracking-widest">19:00</p>
                     </div>
                     <div>
                       <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-6 leading-[1.1]">I Simpósio de Inovação<br/>Biomédica</h3>
                       <p className="text-slate-400 text-base font-medium leading-relaxed mb-12">Evento oficial para discussão de novas tecnologias.</p>
                       <div className="flex items-center gap-4 text-emerald-600 text-[11px] font-black uppercase mb-14 tracking-widest"><i className="fa-solid fa-location-dot text-lg"></i> Auditório Master - Estácio</div>
                       <button className="w-full bg-[#006b4d] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all">Saber Mais</button>
                     </div>
                   </div>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: LABS (Image 7) */}
        {view === 'labs' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
             <header className="text-center mb-24">
                <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Espaço do Aluno</h2>
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Inscreva-se em práticas e laboratórios</p>
             </header>
             
             <div className="space-y-20">
               {/* Inscrições Abertas Section */}
               <div className="space-y-10">
                 <div className="flex items-center gap-4"><i className="fa-solid fa-bolt text-emerald-500 text-xl"></i><h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Inscrições Abertas Via Cronograma</h4></div>
                 <div className="bg-white p-14 rounded-[4rem] shadow-sm border border-slate-50 flex items-center gap-10 max-w-2xl">
                   <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 flex items-center justify-center shrink-0">
                    <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=055c47&bold=true" className="w-full object-contain" alt="Event" />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-lg font-black text-slate-800 uppercase mb-3 leading-tight tracking-tight">I Simpósio de Inovação Biomédica</h4>
                     <div className="flex gap-6 text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">
                       <span className="flex items-center gap-2"><i className="fa-regular fa-calendar text-emerald-600"></i> 19/10/2024</span> 
                       <span className="flex items-center gap-2"><i className="fa-regular fa-clock text-emerald-600"></i> 19:00</span>
                     </div>
                     <button className="w-full py-5 bg-[#006b4d] text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#005a41] transition-all">Realizar Inscrição</button>
                   </div>
                 </div>
               </div>

               {/* Labs List Section */}
               <div className="space-y-10">
                 <div className="flex items-center gap-4"><i className="fa-solid fa-flask-vial text-emerald-500 text-xl"></i><h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.3em]">Laboratórios e Grupos de Pesquisa</h4></div>
                 <div className="grid grid-cols-2 gap-10">
                    {/* Lab Card 1 */}
                    <div className="bg-white p-20 rounded-[4.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                       <div className="flex justify-between items-start mb-14">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                           <img src="https://ui-avatars.com/api/?name=L&background=fff&color=055c47" className="w-14 h-14 rounded-full" />
                         </div>
                         <span className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20"><i className="fa-solid fa-user-graduate"></i> Teaching</span>
                       </div>
                       <div className="mb-14">
                         <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-5 leading-tight">Laboratório de Hematologia Clínica</h3>
                         <p className="text-slate-400 text-sm font-medium leading-relaxed">Práticas de contagem celular, identificação de anemias e leucemias.</p>
                       </div>
                       <div className="flex items-center justify-between pt-12 border-t border-slate-50">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-[#055c47] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg">P</div>
                           <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Coordenação</p><p className="text-[11px] font-bold text-slate-600 uppercase">Prof. Dr. Abel Bisneto</p></div>
                         </div>
                         <button className="bg-white border-2 border-emerald-600 text-emerald-600 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Ficha Cadastral</button>
                       </div>
                    </div>

                    {/* Lab Card 2 */}
                    <div className="bg-white p-20 rounded-[4.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                       <div className="flex justify-between items-start mb-14">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                           <img src="https://ui-avatars.com/api/?name=G&background=fff&color=055c47" className="w-14 h-14 rounded-full" />
                         </div>
                         <span className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20"><i className="fa-solid fa-microscope"></i> Research</span>
                       </div>
                       <div className="mb-14">
                         <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-5 leading-tight">Grupo de Estudo: Biologia Molecular</h3>
                         <p className="text-slate-400 text-sm font-medium leading-relaxed">Análise de extração de DNA e técnicas de PCR em tempo real.</p>
                       </div>
                       <div className="flex items-center justify-between pt-12 border-t border-slate-50">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-[#055c47] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg">V</div>
                           <div><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Coordenação</p><p className="text-[11px] font-bold text-slate-600 uppercase">Victor Papalardo</p></div>
                         </div>
                         <button className="bg-white border-2 border-emerald-600 text-emerald-600 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Ficha Cadastral</button>
                       </div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* VIEW: ATTENDANCE (Image 8) */}
        {view === 'attendance' && (
           <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
              <header className="text-center mb-16">
                 <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Minha Frequência</h2>
                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Monitoramento de Participações</p>
              </header>

              <div className="grid grid-cols-3 gap-10 mb-14">
                 <div className="bg-white p-14 rounded-[3rem] text-center shadow-sm border border-slate-50 flex flex-col justify-center">
                    <h4 className="text-6xl font-black text-[#055c47] mb-3 leading-none">1</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Eventos Oficiais</p>
                 </div>
                 <div className="bg-white p-14 rounded-[3rem] text-center shadow-sm border border-slate-50 flex flex-col justify-center">
                    <h4 className="text-6xl font-black text-[#055c47] mb-3 leading-none">0</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Atividades Totais</p>
                 </div>
                 <div className="bg-emerald-50/50 p-14 rounded-[3rem] text-center shadow-sm border border-emerald-100 flex flex-col justify-center">
                    <h4 className="text-6xl font-black text-emerald-600 mb-3 leading-none">0%</h4>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Frequência Unificada</p>
                 </div>
              </div>

              <div className="bg-white p-20 rounded-[4.5rem] shadow-sm border border-slate-100">
                 <div className="flex items-center gap-5 mb-20">
                    <i className="fa-solid fa-rotate-left text-emerald-600 text-xl"></i>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Registro Cronológico de Participações</h3>
                 </div>
                 <div className="py-40 flex flex-col items-center justify-center opacity-30">
                    <i className="fa-solid fa-clipboard-question text-7xl mb-10 text-slate-200"></i>
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">Nenhum registro localizado no perfil.</p>
                 </div>
              </div>

              {/* Bottom Alert Box */}
              <div className="mt-12 bg-[#052d22] p-12 rounded-[3.5rem] shadow-2xl flex items-center gap-10 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 transition-transform duration-1000"><i className="fa-solid fa-clock text-[100px]"></i></div>
                 <div className="w-16 h-16 bg-emerald-900 rounded-[1.5rem] flex items-center justify-center text-emerald-400 text-3xl shrink-0 shadow-inner"><i className="fa-solid fa-circle-info"></i></div>
                 <div>
                   <h4 className="text-white font-black uppercase text-sm mb-3 tracking-widest">Cômputo de Horas Acadêmicas</h4>
                   <p className="text-emerald-100/40 text-[11px] font-medium leading-relaxed max-w-3xl">Suas presenças em eventos oficiais e atividades externas validadas compõem sua pontuação para certificação e progressão na liga.</p>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: MESSAGES (Image 9) */}
        {view === 'messages' && (
           <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500 text-left">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex items-center gap-8 mb-14">
                 <div className="w-20 h-20 bg-[#006b4d] rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-xl shadow-[#006b4d]/20 transition-transform hover:rotate-6"><i className="fa-solid fa-comment-dots"></i></div>
                 <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Suporte e Orientações</h3>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-3">Canal direto com a diretoria master</p>
                 </div>
              </div>
              <div className="bg-white h-[65vh] rounded-[5rem] shadow-2xl border border-slate-50 flex flex-col overflow-hidden relative">
                 <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                    <i className="fa-solid fa-comments text-[100px] mb-12 text-slate-300"></i>
                    <p className="text-base font-black uppercase tracking-[0.5em] text-slate-400">Inicie sua conversa com a diretoria</p>
                 </div>
                 <div className="p-12 bg-slate-50/50 border-t border-slate-50 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                      <button className="text-slate-300 hover:text-[#006b4d] transition-all hover:scale-110 active:scale-90"><i className="fa-solid fa-paperclip text-2xl"></i></button>
                      <input placeholder="Digite sua mensagem ou anexe um arquivo..." className="flex-1 bg-white p-7 rounded-[2.5rem] border border-slate-200 outline-none text-[13px] font-medium shadow-inner focus:ring-2 focus:ring-emerald-100 transition-all" />
                      <button className="w-18 h-18 bg-[#006b4d] text-white rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all w-[70px] h-[70px] shrink-0"><i className="fa-solid fa-paper-plane"></i></button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: ADMIN (MASTER PANEL - Images 10-16) */}
        {view === 'admin' && (
          <div className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500 text-left">
             {/* Master Nav Bar (Top Menu) */}
             <div className="bg-white p-3.5 rounded-full shadow-sm border border-slate-100 flex justify-center gap-2 mb-16 inline-flex mx-auto overflow-x-auto no-scrollbar max-w-full">
                <AdminTabBtn id="labs" icon="fa-microscope" label="Laboratórios" />
                <AdminTabBtn id="events" icon="fa-calendar" label="Cronograma" />
                <AdminTabBtn id="projects" icon="fa-flask" label="Projetos" />
                <AdminTabBtn id="attendance" icon="fa-clipboard-check" label="Lançar Presença" />
                <AdminTabBtn id="ingresso" icon="fa-id-card" label="Inscrições Lab" />
                <AdminTabBtn id="members" icon="fa-users-gear" label="Gestão Ingresso" />
                <AdminTabBtn id="messages" icon="fa-comments" label="Mensagens" />
                <AdminTabBtn id="settings" icon="fa-gears" label="Ajustes" />
             </div>

             {/* Dynamic Central Container */}
             <div className="bg-white rounded-[5rem] p-20 shadow-2xl border border-slate-50 min-h-[65vh] max-w-5xl mx-auto flex flex-col items-center">
                
                {/* Admin: Laboratórios (Image 10) */}
                {adminTab === 'labs' && (
                  <div className="w-full space-y-14 animate-in fade-in">
                    <h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter">Gestão de Laboratórios</h3>
                    <div className="max-w-2xl mx-auto space-y-8">
                      <div className="space-y-3"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Nome do Laboratório</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-xs shadow-inner" /></div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Tipo</p>
                          <select className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-xs uppercase text-slate-800 shadow-inner">
                            <option>Pesquisa</option>
                            <option>Ensino</option>
                          </select>
                        </div>
                        <div className="space-y-3"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Coordenador</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] border-none outline-none font-bold text-xs shadow-inner" /></div>
                      </div>
                      <div className="space-y-3"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Descrição científica...</p><textarea className="w-full bg-slate-50 p-8 rounded-[3rem] border-none outline-none font-bold text-xs min-h-[160px] shadow-inner" /></div>
                      <button className="w-full py-7 bg-[#006b4d] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:scale-[1.01] transition-all">Cadastrar Laboratório</button>
                    </div>
                    
                    {/* Lab Listing */}
                    <div className="max-w-2xl mx-auto space-y-4 pt-16 border-t border-slate-50">
                      <div className="p-8 bg-white border border-slate-50 rounded-[2.5rem] flex justify-between items-center group hover:bg-slate-50 transition-all shadow-sm">
                        <div className="text-left flex items-center gap-6">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><i className="fa-solid fa-flask"></i></div>
                          <div>
                            <p className="font-black text-[12px] uppercase text-slate-800 tracking-tight">Laboratório de Hematologia Clínica</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-widest">Prof. Dr. Abel Bisneto • Teaching</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-trash-can text-sm"></i></button>
                      </div>
                      <div className="p-8 bg-white border border-slate-50 rounded-[2.5rem] flex justify-between items-center group hover:bg-slate-50 transition-all shadow-sm">
                        <div className="text-left flex items-center gap-6">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><i className="fa-solid fa-microscope"></i></div>
                          <div>
                            <p className="font-black text-[12px] uppercase text-slate-800 tracking-tight">Grupo de Estudo: Biologia Molecular</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-widest">Victor Papalardo • Research</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-trash-can text-sm"></i></button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin: Cronograma (Image 11) */}
                {adminTab === 'events' && (
                  <div className="w-full max-w-2xl mx-auto space-y-12 animate-in fade-in">
                    <h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter">Novo Agendamento</h3>
                    <div className="bg-white p-14 rounded-[4.5rem] border border-slate-50 space-y-8 text-left shadow-sm">
                       <div className="flex justify-between items-center bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-50">
                          <span className="text-[11px] font-black uppercase text-slate-300 tracking-[0.2em]">Status no Feed</span>
                          <span className="bg-[#00a37e] text-white px-7 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00a37e]/20">Ativo</span>
                       </div>
                       <div className="space-y-2"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Nome do Evento</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Data</p><input type="date" className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                         <div className="space-y-2"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Horário</p><input type="time" className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                       </div>
                       <div className="space-y-2"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Localização</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                       <div className="space-y-2"><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-6">Resumo científico...</p><textarea className="w-full bg-slate-50 p-8 rounded-[3rem] outline-none font-bold text-xs min-h-[160px] shadow-inner" /></div>
                       <div className="flex items-center gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                          <span className="text-[10px] font-black uppercase text-slate-300 shrink-0 tracking-widest">Banner / Folder</span>
                          <input type="file" className="text-[10px] font-black uppercase text-slate-400 file:bg-white file:border-none file:px-4 file:py-2 file:rounded-xl file:text-[#006b4d] file:font-black file:text-[9px] file:mr-4 file:shadow-sm" />
                       </div>
                       <button className="w-full py-8 bg-[#052d22] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:scale-[1.01] transition-all">Agendar no Calendário</button>
                    </div>
                    {/* Listing Summary */}
                    <div className="bg-slate-50/50 p-8 rounded-[3rem] flex items-center justify-between border border-slate-100 shadow-sm">
                       <div className="flex items-center gap-6 text-left">
                         <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-3 shadow-md"><img src="https://ui-avatars.com/api/?name=L" className="w-full" /></div>
                         <div>
                           <p className="font-black text-[12px] uppercase text-slate-800 tracking-tight">I Simpósio de Inovação Biomédica</p>
                           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1">19/10/2024</p>
                         </div>
                       </div>
                       <div className="flex gap-3">
                         <button className="w-11 h-11 bg-white text-emerald-600 rounded-2xl shadow-sm border border-slate-100 hover:bg-emerald-50 transition-all"><i className="fa-solid fa-pen text-sm"></i></button>
                         <button className="w-11 h-11 bg-red-50 text-red-400 rounded-2xl shadow-sm border border-slate-100 hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can text-sm"></i></button>
                       </div>
                    </div>
                  </div>
                )}

                {/* Admin: Projetos (Image 12) */}
                {adminTab === 'projects' && (
                  <div className="w-full max-w-2xl mx-auto space-y-12 animate-in fade-in">
                    <h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter">Novo Projeto Científico</h3>
                    <div className="bg-white p-16 rounded-[4.5rem] border border-slate-50 space-y-8 text-left shadow-sm">
                       <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Título da Pesquisa</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Orientador</p><input className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                         <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Data de Início</p><input type="date" className="w-full bg-slate-50 p-6 rounded-[2rem] outline-none font-bold text-xs shadow-inner" /></div>
                       </div>
                       <div className="space-y-3"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6">Resumo Acadêmico...</p><textarea className="w-full bg-slate-50 p-8 rounded-[3.5rem] outline-none font-bold text-xs min-h-[180px] shadow-inner" /></div>
                       <div className="flex items-center gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                          <span className="text-[10px] font-black uppercase text-slate-300 shrink-0 tracking-widest">Capa do Projeto</span>
                          <input type="file" className="text-[10px] font-black uppercase text-slate-400 file:bg-white file:border-none file:px-4 file:py-2 file:rounded-xl file:text-[#006b4d] file:font-black file:text-[9px] file:mr-4 file:shadow-sm" />
                       </div>
                       <button className="w-full py-8 bg-[#006b4d] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-[#005a41] hover:scale-[1.01] transition-all">Publicar Projeto</button>
                    </div>
                  </div>
                )}

                {/* Admin: Lançar Presença (Image 13) */}
                {adminTab === 'attendance' && (
                  <div className="w-full max-w-2xl mx-auto space-y-12 animate-in fade-in">
                    <div className="flex justify-center gap-4">
                       <button className="bg-[#00a37e] text-white px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-emerald-500/20">Chamada Calendário</button>
                       <button className="bg-slate-50 text-slate-300 px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-100 hover:text-slate-400 transition-all">Abono Externo</button>
                    </div>
                    <div className="relative">
                      <select className="w-full p-7 bg-slate-50/80 rounded-[2.5rem] border-none outline-none font-black text-[13px] uppercase shadow-inner text-slate-800 appearance-none px-12">
                        <option>Selecione o Evento do Dia...</option>
                        <option>I Simpósio de Inovação Biomédica</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                    </div>
                    <div className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-sm space-y-4">
                       {members.slice(0, 6).map(m => (
                         <div key={m.id} className="p-5 bg-white border border-slate-50 rounded-[2.5rem] flex items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-5 text-left">
                              <img src={m.img} className="w-10 h-10 rounded-full ring-2 ring-slate-50" alt={m.name} />
                              <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{m.name}</span>
                            </div>
                            <button className="bg-emerald-50 text-emerald-600 px-8 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Presente</button>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Admin: Inscrições Lab (Image 14) */}
                {adminTab === 'ingresso' && (
                  <div className="w-full max-w-4xl space-y-14 animate-in fade-in">
                     <h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter">Interessados em Laboratórios</h3>
                     <div className="py-56 flex flex-col items-center justify-center opacity-10">
                        <i className="fa-solid fa-folder-open text-[120px] mb-12 text-slate-200"></i>
                        <p className="text-base font-black uppercase tracking-[0.5em] text-slate-400">Sem inscrições pendentes para este filtro.</p>
                     </div>
                  </div>
                )}

                {/* Admin: Gestão Ingresso (Image 15) */}
                {adminTab === 'members' && (
                  <div className="w-full max-w-4xl space-y-14 animate-in fade-in">
                     <div className="bg-white p-12 rounded-[4rem] border border-slate-50 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-[#006b4d] text-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl shadow-emerald-900/30 transition-transform hover:rotate-3"><i className="fa-solid fa-user-plus"></i></div>
                           <div className="text-left">
                             <h4 className="text-xl font-black text-slate-800 uppercase leading-none tracking-tighter">Processo Seletivo Geral</h4>
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-3">Controle de Membros Efetivos</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="bg-[#00a37e] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10">Inscritos</button>
                          <button className="bg-white text-slate-300 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all">Configuração do Edital</button>
                        </div>
                     </div>
                     <div className="py-40 flex flex-col items-center justify-center opacity-10">
                        <i className="fa-solid fa-users-viewfinder text-[100px] mb-12 text-slate-200"></i>
                        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">SEM NOVAS CANDIDATURAS NO PORTAL.</p>
                     </div>
                  </div>
                )}

                {/* Admin: Mensagens (Image 16 Left) */}
                {adminTab === 'messages' && (
                  <div className="w-full flex gap-10 h-[65vh] text-left animate-in fade-in">
                     <div className="w-80 bg-slate-50/50 rounded-[4rem] p-10 flex flex-col border border-slate-50 shadow-inner">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-10">Acadêmicos Vinculados</p>
                        <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-2">
                           {members.map(m => (
                             <div key={m.id} className="flex items-center gap-5 p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                                <img src={m.img} className="w-10 h-10 rounded-full ring-2 ring-slate-50 group-hover:ring-emerald-200" alt={m.name} />
                                <span className="text-[10px] font-black uppercase text-slate-800 tracking-tight">{m.name}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex-1 bg-white border border-slate-50 rounded-[4rem] flex flex-col items-center justify-center opacity-10 shadow-sm">
                        <i className="fa-solid fa-comments text-[120px] mb-10 text-slate-200"></i>
                        <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">SELECIONE PARA SUPORTE</p>
                     </div>
                  </div>
                )}

                {/* Admin: Ajustes (Image 16 Right/Bottom) */}
                {adminTab === 'settings' && (
                  <div className="w-full max-w-md mx-auto space-y-16 animate-in fade-in flex flex-col items-center justify-center">
                     <div className="flex flex-col items-center">
                        <div className="w-40 h-40 bg-white rounded-full border-8 border-slate-50 shadow-2xl flex items-center justify-center p-8 mb-16 relative group cursor-pointer">
                           <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=055c47&bold=true" className="w-full" alt="Logo" />
                           <div className="absolute inset-0 bg-[#055c47]/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                             <i className="fa-solid fa-camera text-white text-3xl"></i>
                           </div>
                        </div>
                        <button className="w-full py-7 bg-[#052d22] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                           <i className="fa-solid fa-cloud-arrow-up text-lg"></i> ATUALIZAR LOGO OFICIAL
                        </button>
                        <button className="mt-16 text-red-500 font-black uppercase text-[11px] tracking-[0.4em] hover:text-red-400 transition-all border-b border-transparent hover:border-red-400 pb-1">SAIR DA SESSÃO ADMINISTRATIVA</button>
                     </div>
                  </div>
                )}

             </div>
          </div>
        )}

        {/* UNIVERSAL FOOTER (Visible on all views) */}
        <footer className="mt-36 pt-16 border-t border-slate-200 opacity-20 text-center pb-24">
           <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">&copy; 2025 LAPIB CONNECT • PORTAL MASTER DE BIOMEDICINA</p>
        </footer>
      </main>

    </div>
  );
};

export default App;