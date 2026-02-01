
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- INTERFACES E TIPAGEM ---

type ViewState = 'home' | 'feed' | 'projects' | 'members' | 'ingresso' | 'events' | 'labs' | 'attendance' | 'messages' | 'admin';
type AdminSubView = 'labs' | 'cronograma' | 'projetos' | 'presenca' | 'inscricoes_lab' | 'ingresso' | 'mensagens' | 'ajustes';

interface UserProfile {
  id: string;
  fullName: string;
  role: 'admin' | 'membro';
  photoUrl: string;
  email: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  img: string;
  email: string;
  presentEvents: string[]; // IDs dos eventos presentes
}

interface Post {
  id: string;
  author: string;
  time: string;
  content: string;
  media?: string; 
  mediaType?: 'image' | 'video';
  likes: number;
  comments: { id: string; user: string; text: string }[];
}

interface Project {
  id: string;
  title: string;
  orientador: string;
  date: string;
  status: 'ATIVO' | 'CONCLUÍDO';
  tag?: string;
  img: string;
  desc: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  category: string;
  status: 'ATIVO' | 'PASSADO';
}

interface Lab {
  id: string;
  title: string;
  tag: 'TEACHING' | 'RESEARCH';
  coordinator: string;
  initial: string;
  desc: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  time: string;
}

// --- COMPONENTE PRINCIPAL ---

const App: React.FC = () => {
  // --- ESTADOS GLOBAIS ---
  const [view, setView] = useState<ViewState>('home');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('labs');
  const [user, setUser] = useState<UserProfile | null>({ 
    id: 'admin_1', fullName: 'lapib', role: 'admin', email: 'admin@lapib.com',
    photoUrl: 'https://ui-avatars.com/api/?name=LAPIB&background=059669&color=fff' 
  });

  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'CHRISTHALLY', role: 'DIRETORA', img: 'https://ui-avatars.com/api/?name=Christhally&background=05764d&color=fff', email: 'chris@lapib.com', presentEvents: ['e1'] },
    { id: '2', name: 'MARIA', role: 'DIRETORA MARKETING', img: 'https://ui-avatars.com/api/?name=Maria&background=05764d&color=fff', email: 'maria@lapib.com', presentEvents: ['e1'] },
    { id: '3', name: 'MATEUS', role: 'MARKETING', img: 'https://ui-avatars.com/api/?name=Mateus&background=05764d&color=fff', email: 'mateus@lapib.com', presentEvents: [] },
    { id: '4', name: 'MURILO', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Murilo&background=05764d&color=fff', email: 'murilo@lapib.com', presentEvents: ['e1'] },
    { id: '5', name: 'ROBERIO', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Roberio&background=05764d&color=fff', email: 'roberio@lapib.com', presentEvents: [] },
    { id: '6', name: 'VICTOR', role: 'PRESIDENTE', img: 'https://ui-avatars.com/api/?name=Victor&background=05764d&color=fff', email: 'victor@lapib.com', presentEvents: ['e1'] },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    { 
      id: 'p1', author: 'lapib', time: '20/12/2025', content: 'Início das atividades acadêmicas de 2025!', 
      likes: 2, comments: [{ id: 'c1', user: 'LAPIB', text: 'muito bom' }, { id: 'c2', user: 'SAMUEL', text: 'Muito legal' }] 
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: 'pr1', title: 'PROJETO ENSINO', orientador: 'VICTOR', date: '2025-12-23', status: 'ATIVO', tag: 'BANCADA', img: 'https://images.unsplash.com/photo-1532187875605-186c6af16664?auto=format&fit=crop&q=80&w=800', desc: 'O Projeto Ensino tem como objetivo divulgar e aproximar conteúdos científicos da comunidade escolar.' },
    { id: 'pr2', title: 'PODCAST', orientador: 'VICTOR', date: '20/12/2025', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800', desc: 'Espaço de diálogo sobre Biomedicina e pesquisa clínica.' }
  ]);

  const [events, setEvents] = useState<EventItem[]>([
    { id: 'e1', title: 'I Simpósio de Inovação Biomédica', date: '2024-10-20', time: '19:00', location: 'AUDITÓRIO MASTER - ESTÁCIO', desc: 'Evento oficial para discussão de novas tecnologias laboratoriais.', category: 'SYMPOSIUM', status: 'ATIVO' }
  ]);

  const [labs, setLabs] = useState<Lab[]>([
    { id: 'l1', title: 'Laboratório de Hematologia Clínica', tag: 'TEACHING', coordinator: 'Prof. Dr. Abel Bisneto', initial: 'P', desc: 'Práticas de contagem celular e diagnóstico de anemias.' },
    { id: 'l2', title: 'Grupo de Estudo: Biologia Molecular', tag: 'RESEARCH', coordinator: 'Victor Papalardo', initial: 'V', desc: 'Análise de extração de DNA e técnicas de PCR.' }
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [officialLogo, setOfficialLogo] = useState('https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=256');

  // --- MODAIS E SELEÇÕES ---
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<{postId: string, commentId: string} | null>(null);

  // --- FUNÇÕES DE NEGÓCIO ---

  const handlePostMedia = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const content = form.content.value;
    const file = form.media.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        const newPost: Post = {
          id: 'p' + Date.now(),
          author: user?.fullName || 'membro',
          time: 'Agora',
          content,
          media: reader.result as string,
          mediaType: type as any,
          likes: 0,
          comments: []
        };
        setPosts([newPost, ...posts]);
        setShowPostModal(false);
      };
      reader.readAsDataURL(file);
    } else {
      setPosts([{ id: 'p' + Date.now(), author: user?.fullName || 'membro', time: 'Agora', content, likes: 0, comments: [] }, ...posts]);
      setShowPostModal(false);
    }
  };

  const deletePost = (id: string) => {
    if(confirm("Deseja excluir esta publicação?")) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const togglePresence = (memberId: string, eventId: string) => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        const exists = m.presentEvents.includes(eventId);
        return {
          ...m,
          presentEvents: exists 
            ? m.presentEvents.filter(e => e !== eventId) 
            : [...m.presentEvents, eventId]
        };
      }
      return m;
    }));
  };

  const calculateAttendance = (member: Member) => {
    if (events.length === 0) return 0;
    return Math.round((member.presentEvents.length / events.length) * 100);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-['Inter'] overflow-hidden text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#05764d] text-white flex flex-col shrink-0 border-r border-emerald-900/10">
        <div className="p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 mb-4 shadow-2xl overflow-hidden">
             <img src={officialLogo} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase">LAPIB CONNECT</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          <NavItem icon="fa-house" label="INÍCIO" active={view === 'home'} onClick={() => setView('home')} />
          <NavItem icon="fa-flask-vial" label="FEED PESQUISA" active={view === 'feed'} onClick={() => setView('feed')} />
          <NavItem icon="fa-vials" label="PROJETOS" active={view === 'projects'} onClick={() => setView('projects')} />
          <NavItem icon="fa-users" label="MEMBROS" active={view === 'members'} onClick={() => setView('members')} />
          <NavItem icon="fa-id-card" label="INGRESSO" active={view === 'ingresso'} onClick={() => setView('ingresso')} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">Espaço Aluno</div>
          <NavItem icon="fa-calendar-days" label="CRONOGRAMA" active={view === 'events'} onClick={() => setView('events')} />
          <NavItem icon="fa-microscope" label="LABORATÓRIOS" active={view === 'labs'} onClick={() => setView('labs')} />
          <NavItem icon="fa-clipboard-user" label="MINHA FREQUÊNCIA" active={view === 'attendance'} onClick={() => setView('attendance')} />
          <NavItem icon="fa-comments" label="MENSAGENS" active={view === 'messages'} onClick={() => setView('messages')} />

          {user?.role === 'admin' && (
            <>
              <div className="pt-6 pb-2 px-4 text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">Diretoria</div>
              <NavItem icon="fa-gauge-high" label="PAINEL MASTER" active={view === 'admin'} onClick={() => setView('admin')} />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-emerald-800/50">
          <div className="flex items-center gap-3 mb-2">
            <img src={user?.photoUrl} className="w-10 h-10 rounded-full border-2 border-emerald-400" alt="Avatar" />
            <div>
              <p className="text-[11px] font-black uppercase leading-tight">{user?.fullName}</p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{user?.role.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Sair da Conta</button>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-y-auto p-8 lg:p-12 relative scroll-smooth">
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#05764d 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {!user ? (
            <LoginSimulated onLogin={(u) => setUser(u)} members={members} />
          ) : (
            <>
              {view === 'home' && <HomeView setView={setView} />}
              {view === 'feed' && <FeedView posts={posts} user={user} onDelete={deletePost} />}
              {view === 'projects' && <ProjectsView projects={projects} onDetail={setShowDetailModal} />}
              {view === 'members' && <MembersView members={members} onRegister={() => setShowMemberModal(true)} user={user} />}
              {view === 'ingresso' && <IngressoView />}
              {view === 'events' && <EventsView events={events} onDetail={setShowDetailModal} />}
              {view === 'labs' && <LabsView labs={labs} activeEvent={events.find(e => e.status === 'ATIVO')} onInscricao={() => alert("Inscrição Confirmada!")} />}
              {view === 'attendance' && <AttendanceView member={members.find(m => m.email === user.email) || members[0]} totalEvents={events.length} />}
              {view === 'messages' && <MessagesView user={user} messages={messages} />}
              {view === 'admin' && (
                <AdminPanelView 
                  sub={adminSubView} setSub={setAdminSubView} 
                  members={members} setMembers={setMembers}
                  events={events} setEvents={setEvents}
                  projects={projects} setProjects={setProjects}
                  labs={labs} setLabs={setLabs}
                  messages={messages} setMessages={setMessages}
                  officialLogo={officialLogo} setOfficialLogo={setOfficialLogo}
                  onTogglePresence={togglePresence}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL NOVO MEMBRO */}
      {showMemberModal && (
        <Modal onClose={() => setShowMemberModal(false)}>
          <h3 className="text-xl font-black text-[#05764d] uppercase mb-8">Novo Membro Efetivo</h3>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = e.target as any;
            const newMem: Member = {
              id: 'm' + Date.now(),
              name: f.name.value.toUpperCase(),
              role: f.role.value.toUpperCase(),
              email: f.email.value,
              img: `https://ui-avatars.com/api/?name=${f.name.value}&background=05764d&color=fff`,
              presentEvents: []
            };
            setMembers([...members, newMem]);
            setShowMemberModal(false);
          }}>
            <InputGroup name="name" label="Nome Completo" placeholder="" />
            <InputGroup name="email" label="Email Institucional" placeholder="" />
            <InputGroup name="role" label="Cargo / Diretoria" placeholder="Ex: MARKETING" />
            <button type="submit" className="w-full bg-[#05764d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4">Confirmar Cadastro</button>
          </form>
        </Modal>
      )}

      {/* MODAL NOVO POST */}
      {showPostModal && (
        <Modal onClose={() => setShowPostModal(false)}>
          <h3 className="text-xl font-black text-[#05764d] uppercase mb-8">Postar no Feed</h3>
          <form className="space-y-6" onSubmit={handlePostMedia}>
            <textarea name="content" required placeholder="Escreva sobre sua pesquisa..." className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none" />
            <div className="relative border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center group hover:border-emerald-300">
               <i className="fa-solid fa-file-video text-3xl text-slate-300 mb-2"></i>
               <p className="text-[10px] font-black text-slate-400 uppercase">Upload Imagem ou Vídeo</p>
               <input type="file" name="media" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" />
            </div>
            <button type="submit" className="w-full bg-[#05764d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Publicar Agora</button>
          </form>
        </Modal>
      )}

      {/* MODAL DETALHES GERAL */}
      {showDetailModal && (
        <Modal onClose={() => setShowDetailModal(null)} maxWidth="max-w-2xl">
          <div className="space-y-6">
            <span className="inline-block bg-emerald-50 text-emerald-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{showDetailModal.category || 'PROJETO'}</span>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{showDetailModal.title}</h3>
            {showDetailModal.img && <img src={showDetailModal.img} className="w-full h-80 object-cover rounded-[2.5rem] shadow-xl" alt="M" />}
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <p className="text-slate-600 font-medium leading-relaxed text-lg">{showDetailModal.desc}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* FLOATING ACTION FEED */}
      {view === 'feed' && user?.role === 'admin' && (
        <button onClick={() => setShowPostModal(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-[#05764d] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-50 ring-4 ring-white/20">
          <i className="fa-solid fa-camera"></i>
        </button>
      )}
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all group ${active ? 'bg-white text-[#05764d] font-black shadow-lg' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white font-bold'}`}>
    <i className={`fa-solid ${icon} text-sm`}></i>
    <span className="text-[11px] uppercase tracking-wider">{label}</span>
  </button>
);

const InputGroup = ({ label, placeholder, name, type = "text", defaultValue = "" }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:border-emerald-200 transition-all shadow-sm" />
  </div>
);

const Modal = ({ children, onClose, maxWidth = 'max-w-md' }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
    <div className={`bg-white w-full ${maxWidth} rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
      <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
      {children}
    </div>
  </div>
);

const LoginSimulated = ({ onLogin, members }: any) => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 w-full max-w-md text-center">
       <div className="w-20 h-20 bg-[#05764d] rounded-3xl flex items-center justify-center text-emerald-300 text-4xl mx-auto mb-8 shadow-xl rotate-12"><i className="fa-solid fa-dna animate-dna"></i></div>
       <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Portal LAPIB</h2>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">Login administrativo ou acadêmico</p>
       <form className="space-y-4" onSubmit={(e: any) => {
         e.preventDefault();
         const email = e.target.email.value;
         if (email === 'admin@lapib.com') {
           onLogin({ id: 'admin', fullName: 'lapib', role: 'admin', email: 'admin@lapib.com', photoUrl: 'https://ui-avatars.com/api/?name=LAPIB&background=059669&color=fff' });
         } else {
           const mem = members.find((m:any) => m.email === email);
           if (mem) onLogin({ id: mem.id, fullName: mem.name, role: 'membro', email: mem.email, photoUrl: mem.img });
           else alert("Email não cadastrado.");
         }
       }}>
          <InputGroup name="email" label="E-mail" placeholder="admin@lapib.com" />
          <button type="submit" className="w-full bg-[#05764d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl mt-4">Entrar no Sistema</button>
       </form>
    </div>
  </div>
);

// --- VISTAS ESPECIFICAS ---

const HomeView = ({ setView }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <section className="bg-[#05764d] rounded-[3.5rem] p-16 lg:p-24 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fa-solid fa-dna text-[35rem] rotate-45"></i></div>
      <div className="relative z-10 max-w-2xl text-left">
        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full mb-10 border border-white/20">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Biomedicina • Estácio GO</span>
        </div>
        <h2 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter">Inovação que pulsa ciência.</h2>
        <p className="text-emerald-100/70 text-lg mb-12 font-medium leading-relaxed max-w-lg">Fomentar a pesquisa científica de ponta e a divulgação técnica no campo da Biomedicina, unindo teoria e prática.</p>
        <div className="flex gap-6">
          <button onClick={() => setView('projects')} className="bg-white text-[#05764d] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">Explorar Projetos</button>
          <button className="bg-emerald-950/40 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3"><i className="fa-brands fa-instagram text-lg"></i> Instagram</button>
        </div>
      </div>
    </section>

    <div className="grid md:grid-cols-3 gap-8">
      <StatCard icon="fa-dna" color="bg-blue-500" value="04" label="LINHAS DE PESQUISA" />
      <StatCard icon="fa-microscope" color="bg-emerald-500" value="07" label="MEMBROS ATIVOS" />
      <StatCard icon="fa-flask-vial" color="bg-purple-500" value="+1.2k" label="HORAS PRÁTICAS" />
    </div>
  </div>
);

const StatCard = ({ icon, color, value, label }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-slate-100 hover:shadow-xl transition-all">
    <div className={`w-16 h-16 ${color} text-white rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg`}><i className={`fa-solid ${icon}`}></i></div>
    <div className="text-left">
      <h4 className="text-4xl font-black text-slate-800 leading-none mb-2">{value}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    </div>
  </div>
);

const FeedView = ({ posts, user, onDelete }: { posts: Post[], user: UserProfile, onDelete: (id: string) => void }) => (
  <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-20 text-left">
    {posts.map(post => (
      <div key={post.id} className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-white text-[10px] font-black">{post.author.slice(0, 2).toUpperCase()}</div>
            <div>
              <h4 className="text-[12px] font-black text-slate-800 uppercase">{post.author}</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{post.time}</p>
            </div>
          </div>
          {user.role === 'admin' && (
            <div className="relative group">
              <button className="text-slate-300 hover:text-slate-600 p-2"><i className="fa-solid fa-ellipsis-vertical"></i></button>
              <div className="absolute right-0 top-full bg-white shadow-xl rounded-xl p-2 hidden group-hover:block z-20 border min-w-[120px]">
                <button onClick={() => onDelete(post.id)} className="w-full text-left px-4 py-2 text-[10px] font-black text-red-500 uppercase hover:bg-red-50 rounded-lg">Excluir Post</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
          {post.media ? (
            post.mediaType === 'video' ? (
              <video src={post.media} controls className="w-full h-full object-cover" />
            ) : (
              <img src={post.media} className="w-full h-full object-cover" alt="Post" />
            )
          ) : (
            <div className="text-white text-center p-12">
               <h2 className="text-6xl font-black tracking-tighter opacity-20">LAPIB</h2>
               <p className="text-xs font-bold uppercase tracking-widest opacity-30 mt-4">Pesquisa Científica em Goiânia</p>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-6 text-2xl">
            <button className="text-red-500 hover:scale-110 transition-transform"><i className="fa-solid fa-heart"></i></button>
            <button className="text-slate-300 hover:text-slate-600"><i className="fa-regular fa-comment"></i></button>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">• {post.likes} REAÇÕES CIENTÍFICAS</p>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
             <p className="text-slate-600 font-medium text-sm leading-relaxed italic">{post.content}</p>
          </div>

          <div className="space-y-2 mb-8">
            {post.comments.map((c, i) => (
              <p key={i} className="text-xs font-bold text-slate-700">
                <span className="font-black uppercase mr-2">{c.user}</span> {c.text}
              </p>
            ))}
          </div>

          <div className="relative">
            <input placeholder="Participar da discussão..." className="w-full bg-slate-50 p-5 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:border-emerald-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProjectsView = ({ projects, onDetail }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 text-center pb-20">
    <header>
      <h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">PROJETOS CIENTÍFICOS</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PRODUÇÃO ACADÊMICA E INOVAÇÃO</p>
    </header>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
      {projects.map((p: any) => (
        <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="h-48 overflow-hidden"><img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="P" /></div>
          <div className="p-8 space-y-4">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{p.title}</h3>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">ORIENTADOR: {p.orientador}</p>
            <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-2">{p.desc}</p>
            <button onClick={() => onDetail(p)} className="text-[10px] font-black text-[#05764d] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">SABER MAIS <i className="fa-solid fa-chevron-right text-[8px]"></i></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MembersView = ({ members, onRegister, user }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-left">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter">NOSSA EQUIPE</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">DIRETORIA E MEMBROS EFETIVOS</p>
      </div>
      {user.role === 'admin' && (
        <button onClick={onRegister} className="bg-[#05764d] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-3"><i className="fa-solid fa-user-plus text-sm"></i> CADASTRAR MEMBRO</button>
      )}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pt-8">
      {members.map((m: any, i: number) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 group">
          <img src={m.img} className="w-24 h-24 rounded-full shadow-2xl mb-6 ring-8 ring-slate-50 group-hover:scale-105 transition-transform" alt={m.name} />
          <h4 className="text-sm font-black text-slate-800 uppercase mb-1">{m.name}</h4>
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{m.role}</p>
        </div>
      ))}
    </div>
  </div>
);

const IngressoView = () => (
  <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 text-left pb-20">
    <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-[#05764d] uppercase tracking-tight mb-4">INGRESSO NA LAPIB</h2>
      <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-10">Processo seletivo aberto para acadêmicos de Biomedicina.</p>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CRITÉRIOS ATUAIS DE AVALIAÇÃO:</p>
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <span className="w-10 h-10 bg-[#05764d] text-white rounded-full flex items-center justify-center font-black">1</span>
          <p className="text-slate-700 font-black text-xs leading-relaxed italic">Disponibilidade de Horário e Engajamento em Pesquisa</p>
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-[#051f18] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <h3 className="text-xl font-black uppercase mb-8">CALENDÁRIO DE SELEÇÃO</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4"><p className="font-black uppercase text-xs">Abertura Inscrições</p><p className="font-black text-emerald-400 text-xs tracking-widest">01/01</p></div>
              <div className="flex justify-between items-center"><p className="font-black uppercase text-xs">Resultado Final</p><p className="font-black text-emerald-400 text-xs tracking-widest">20/01</p></div>
           </div>
        </div>
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Candidatura Registrada!"); }}>
            <div className="grid sm:grid-cols-2 gap-6">
              <InputGroup label="NOME COMPLETO" placeholder="" />
              <InputGroup label="E-MAIL ACADÊMICO" placeholder="" />
              <InputGroup label="MATRÍCULA" placeholder="" />
              <InputGroup label="PERÍODO ATUAL" placeholder="Ex: 4º Período" />
            </div>
            <button type="submit" className="w-full bg-[#05764d] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">FINALIZAR INSCRIÇÃO</button>
          </form>
        </div>
      </div>
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mb-8"><i className="fa-solid fa-file-pdf"></i></div>
          <h4 className="text-lg font-black text-slate-800 uppercase mb-2 tracking-tight">EDITAL DE INGRESSO</h4>
          <button className="w-full bg-slate-50 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-100">ABRIR PDF OFICIAL</button>
      </div>
    </div>
  </div>
);

const EventsView = ({ events, onDetail }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
    <header>
      <h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">CRONOGRAMA OFICIAL</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CALENDÁRIO ACADÊMICO SINCRONIZADO</p>
    </header>
    {events.map((e: any) => (
      <div key={e.id} className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row items-center p-8 lg:p-12 gap-12 max-w-5xl mx-auto group">
        <div className="w-full md:w-[450px] aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center p-12 shrink-0 overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=512" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="L" />
        </div>
        <div className="flex-1 space-y-10 text-left">
          <span className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">{e.category}</span>
          <div className="flex gap-10">
            <div className="text-center pr-10 border-r border-slate-100">
               <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">OUT.</p>
               <p className="text-7xl font-black text-slate-800 my-2">{e.date.split('-')[2]}</p>
               <p className="text-slate-300 font-black text-[11px] tracking-widest">{e.time}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tighter leading-tight">{e.title}</h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">{e.desc}</p>
              <div className="flex items-center gap-3 text-[#10b981] font-black text-[10px] uppercase tracking-widest"><i className="fa-solid fa-location-dot"></i> {e.location}</div>
            </div>
          </div>
          <button onClick={() => onDetail(e)} className="w-full bg-[#05764d] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#004d33] transition-all">SABER MAIS</button>
        </div>
      </div>
    ))}
  </div>
);

const LabsView = ({ labs, activeEvent, onInscricao }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
    <header>
      <h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">ESPAÇO DO ALUNO</h2>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">INSCREVA-SE EM PRÁTICAS E LABORATÓRIOS</p>
    </header>
    {activeEvent && (
      <section className="space-y-8 text-left">
         <h3 className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest leading-none"><i className="fa-solid fa-bolt text-lg"></i> INSCRIÇÕES ABERTAS VIA CRONOGRAMA</h3>
         <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-10 max-w-2xl overflow-hidden group">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center p-6 shrink-0 group-hover:scale-105 transition-transform"><img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=200" className="w-full h-full object-contain mix-blend-multiply opacity-80" alt="L" /></div>
            <div className="flex-1 space-y-4">
               <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{activeEvent.title.toUpperCase()}</h4>
               <div className="flex gap-4 text-slate-400 font-bold text-[9px] uppercase tracking-widest"><span><i className="fa-solid fa-calendar mr-2"></i> {activeEvent.date}</span><span><i className="fa-solid fa-clock mr-2"></i> {activeEvent.time}</span></div>
               <button onClick={onInscricao} className="w-full bg-[#05764d] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg">REALIZAR INSCRIÇÃO</button>
            </div>
         </div>
      </section>
    )}
    <section className="space-y-10 text-left pt-12">
       <h3 className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest leading-none"><i className="fa-solid fa-microscope text-lg"></i> LABORATÓRIOS E GRUPOS DE PESQUISA</h3>
       <div className="grid md:grid-cols-2 gap-10">
          {labs.map((lab: any) => (
            <div key={lab.id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-50 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className="bg-slate-50 h-56 flex items-center justify-center relative p-12">
                 <div className={`absolute top-6 left-6 px-4 py-2 ${lab.tag === 'TEACHING' ? 'bg-emerald-700' : 'bg-emerald-400'} text-white text-[8px] font-black rounded-xl shadow-lg flex items-center gap-2`}><i className="fa-solid fa-bookmark"></i> {lab.tag}</div>
                 <div className="w-24 h-24 bg-white rounded-[2rem] p-6 shadow-xl"><img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=200" className="w-full h-full object-contain opacity-70" alt="L" /></div>
              </div>
              <div className="p-10 space-y-6 flex-1 flex flex-col justify-between">
                 <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">{lab.title}</h4>
                 <p className="text-slate-400 font-medium text-sm leading-relaxed">{lab.desc}</p>
                 <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#05764d] text-white rounded-xl flex items-center justify-center font-black shadow-md">{lab.initial}</div>
                       <div><p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">COORDENAÇÃO</p><p className="text-slate-700 font-black text-[11px] leading-none">{lab.coordinator}</p></div>
                    </div>
                    <button onClick={() => alert("Ficha submetida para avaliação.")} className="border-2 border-[#05764d] text-[#05764d] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[#05764d] hover:text-white transition-all">FICHA CADASTRAL</button>
                 </div>
              </div>
            </div>
          ))}
       </div>
    </section>
  </div>
);

const AttendanceView = ({ member, totalEvents }: { member: Member, totalEvents: number }) => {
  const percentage = totalEvents > 0 ? Math.round((member.presentEvents.length / totalEvents) * 100) : 0;
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-left">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h4 className="text-4xl font-black text-[#05764d] leading-none mb-3">{totalEvents}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EVENTOS TOTAIS</p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h4 className="text-4xl font-black text-emerald-500 leading-none mb-3">{member.presentEvents.length}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRESENÇAS COMPUTADAS</p>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100 flex flex-col items-center ring-4 ring-emerald-50/50">
          <h4 className={`text-4xl font-black ${percentage < 75 ? 'text-red-500' : 'text-emerald-600'} leading-none mb-3`}>{percentage}%</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FREQUÊNCIA UNIFICADA</p>
        </div>
      </div>
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-12">
         <div className="flex items-center gap-4 mb-12"><i className="fa-solid fa-history text-emerald-500 text-xl"></i><h3 className="text-xl font-black text-[#05764d] uppercase tracking-tight">REGISTRO CRONOLÓGICO</h3></div>
         {member.presentEvents.length > 0 ? (
           <div className="space-y-4">
              {member.presentEvents.map((evId, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center border-l-8 border-emerald-500 shadow-sm">
                   <p className="font-black text-[11px] uppercase text-slate-800">Evento ID: {evId}</p>
                   <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">COMPUTADO</span>
                </div>
              ))}
           </div>
         ) : (
           <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner"><i className="fa-solid fa-id-badge"></i></div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">NENHUM REGISTRO LOCALIZADO NO PERFIL.</p>
           </div>
         )}
      </div>
    </div>
  );
};

const MessagesView = ({ user, messages }: { user: UserProfile, messages: Message[] }) => {
  const userMessages = messages.filter(m => m.to === user.fullName || m.to === user.email);
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 h-[calc(100vh-160px)] flex flex-col pb-10 text-left">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6">
         <div className="w-14 h-14 bg-emerald-800 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg"><i className="fa-solid fa-comment-dots"></i></div>
         <div><h3 className="text-xl font-black text-slate-800 uppercase leading-none">MENSAGENS DO SISTEMA</h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">CANAL DIRETO COM A DIRETORIA</p></div>
      </div>
      <div className="flex-1 bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 p-12 flex flex-col items-center overflow-y-auto space-y-6 relative">
         {userMessages.length > 0 ? (
           userMessages.map(m => (
             <div key={m.id} className="w-full bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left shadow-sm">
                <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">DIRETORIA MASTER</span><span className="text-[9px] text-slate-400 font-bold">{m.time}</span></div>
                <p className="text-slate-700 font-medium leading-relaxed">{m.text}</p>
             </div>
           ))
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-30">
              <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner mb-4 animate-pulse"><i className="fa-solid fa-comments"></i></div>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest max-w-xs text-center">SEM MENSAGENS NO MOMENTO</p>
           </div>
         )}
      </div>
    </div>
  );
};

const AdminPanelView = ({ 
  sub, setSub, members, setMembers, events, setEvents, projects, setProjects, labs, setLabs, 
  messages, setMessages, officialLogo, setOfficialLogo, onTogglePresence 
}: any) => {
  const [selectedMemberMsg, setSelectedMemberMsg] = useState('');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
      <div className="flex justify-center">
        <div className="bg-white p-1 rounded-2xl shadow-xl flex border border-slate-100 overflow-x-auto scrollbar-hide max-w-full">
          <AdminTab label="LABORATÓRIOS" icon="fa-microscope" active={sub === 'labs'} onClick={() => setSub('labs')} />
          <AdminTab label="CRONOGRAMA" icon="fa-calendar" active={sub === 'cronograma'} onClick={() => setSub('cronograma')} />
          <AdminTab label="PROJETOS" icon="fa-vial" active={sub === 'projetos'} onClick={() => setSub('projetos')} />
          <AdminTab label="PRESENÇA" icon="fa-user-check" active={sub === 'presenca'} onClick={() => setSub('presenca')} />
          <AdminTab label="INSCRIÇÕES LAB" icon="fa-id-card" active={sub === 'inscricoes_lab'} onClick={() => setSub('inscricoes_lab')} />
          <AdminTab label="GESTÃO INGRESSO" icon="fa-users-gear" active={sub === 'ingresso'} onClick={() => setSub('ingresso')} />
          <AdminTab label="MENSAGENS" icon="fa-comment-dots" active={sub === 'mensagens'} onClick={() => setSub('mensagens')} />
          <AdminTab label="AJUSTES" icon="fa-gears" active={sub === 'ajustes'} onClick={() => setSub('ajustes')} />
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-16 min-h-[500px] text-left">
        {sub === 'labs' && (
          <div className="space-y-10">
            <h3 className="text-2xl font-black text-[#05764d] uppercase text-center mb-10 tracking-tighter">GESTÃO DE LABORATÓRIOS</h3>
            <form className="max-w-xl mx-auto space-y-6" onSubmit={(e: any) => {
              e.preventDefault();
              const newLab: Lab = {
                id: 'l' + Date.now(),
                title: e.target.title.value.toUpperCase(),
                coordinator: e.target.coordinator.value,
                tag: e.target.tag.value as any,
                initial: e.target.coordinator.value.charAt(0).toUpperCase(),
                desc: e.target.desc.value
              };
              setLabs([...labs, newLab]);
              e.target.reset();
            }}>
              <InputGroup name="title" label="Nome do Laboratório" placeholder="" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select name="tag" className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-xs font-bold outline-none border border-slate-100">
                    <option value="TEACHING">Ensino (Teaching)</option>
                    <option value="RESEARCH">Pesquisa (Research)</option>
                  </select>
                </div>
                <InputGroup name="coordinator" label="Coordenador" placeholder="" />
              </div>
              <textarea name="desc" placeholder="Descrição científica..." className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none border border-slate-100" />
              <button type="submit" className="w-full bg-[#05764d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Cadastrar Laboratório</button>
            </form>
            <div className="grid md:grid-cols-2 gap-6 mt-12">
               {labs.map((l: any) => (
                 <div key={l.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group">
                    <div><h4 className="font-black text-slate-800 uppercase text-xs">{l.title}</h4><p className="text-[9px] text-slate-400 font-bold uppercase">{l.coordinator} • {l.tag}</p></div>
                    <button onClick={() => setLabs(labs.filter((lb: any) => lb.id !== l.id))} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash"></i></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {sub === 'cronograma' && (
          <div className="space-y-10">
            <h3 className="text-2xl font-black text-[#05764d] uppercase text-center mb-10 tracking-tighter">NOVO AGENDAMENTO</h3>
            <form className="max-w-xl mx-auto space-y-6" onSubmit={(e: any) => {
              e.preventDefault();
              const newEvt: EventItem = {
                id: 'e' + Date.now(),
                title: e.target.title.value,
                date: e.target.date.value,
                time: e.target.time.value,
                location: e.target.location.value,
                desc: e.target.desc.value,
                category: 'EVENTO',
                status: 'ATIVO'
              };
              setEvents([newEvt, ...events]);
              e.target.reset();
            }}>
              <InputGroup name="title" label="Nome do Evento" placeholder="" />
              <div className="grid grid-cols-2 gap-6">
                <InputGroup name="date" label="Data" type="date" placeholder="" />
                <InputGroup name="time" label="Hora" type="time" placeholder="" />
              </div>
              <InputGroup name="location" label="Localização" placeholder="" />
              <textarea name="desc" placeholder="Resumo científico..." className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none border border-slate-100" />
              <button type="submit" className="w-full bg-[#051f18] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Agendar no Calendário</button>
            </form>
          </div>
        )}

        {sub === 'presenca' && (
          <div className="space-y-10">
            <h3 className="text-2xl font-black text-[#05764d] uppercase text-center mb-10 tracking-tighter">CONTROLE DE PRESENÇA</h3>
            <div className="max-w-2xl mx-auto border border-slate-100 rounded-[3rem] overflow-hidden bg-white shadow-xl">
               <div className="p-8 border-b border-slate-100 bg-slate-50">
                  <select id="eventSelect" className="w-full bg-transparent font-black uppercase text-xs outline-none">
                    <option value="">Selecione o Evento...</option>
                    {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
               </div>
               <div className="p-4 space-y-2">
                  {members.map((m: any) => (
                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors">
                       <div className="flex items-center gap-4">
                          <img src={m.img} className="w-10 h-10 rounded-full border shadow-sm" alt="M" />
                          <span className="font-black uppercase text-[11px] text-slate-800">{m.name}</span>
                       </div>
                       <button 
                         onClick={() => {
                           const evId = (document.getElementById('eventSelect') as HTMLSelectElement).value;
                           if (!evId) return alert("Selecione um evento!");
                           onTogglePresence(m.id, evId);
                         }} 
                         className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm ${m.presentEvents.includes((document.getElementById('eventSelect') as HTMLSelectElement)?.value) ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}
                       >
                         {m.presentEvents.includes((document.getElementById('eventSelect') as HTMLSelectElement)?.value) ? 'PRESENTE' : 'LANÇAR'}
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {sub === 'mensagens' && (
          <div className="space-y-10 h-[600px] flex gap-8">
             <div className="w-1/3 bg-slate-50/50 rounded-[3rem] p-8 space-y-8 border border-slate-100 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Membros Ativos</h4>
                <div className="space-y-4">
                   {members.map((m: any) => (
                     <div key={m.id} 
                       onClick={() => setSelectedMemberMsg(m.email)}
                       className={`p-4 flex items-center gap-4 rounded-2xl shadow-sm border cursor-pointer transition-all ${selectedMemberMsg === m.email ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100' : 'bg-white border-slate-50 hover:border-emerald-200'}`}
                      >
                        <img src={m.img} className="w-10 h-10 rounded-full" alt="M" />
                        <span className="font-black uppercase text-[10px] text-slate-700">{m.name}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 flex flex-col p-12">
                {selectedMemberMsg ? (
                  <div className="h-full flex flex-col justify-between text-left">
                     <h3 className="text-xl font-black text-[#05764d] uppercase mb-10">Enviar para: {selectedMemberMsg}</h3>
                     <textarea id="adminMsgTxt" className="flex-1 w-full bg-slate-50 p-10 rounded-[3rem] font-bold outline-none border border-slate-100 shadow-inner mb-8" placeholder="Digite a orientação científica ou recado..." />
                     <button 
                       onClick={() => {
                         const txt = (document.getElementById('adminMsgTxt') as HTMLTextAreaElement).value;
                         if (!txt) return;
                         setMessages([{ id: 'm'+Date.now(), from: 'Diretoria', to: selectedMemberMsg, text: txt, time: new Date().toLocaleString() }, ...messages]);
                         (document.getElementById('adminMsgTxt') as HTMLTextAreaElement).value = '';
                         alert("Mensagem enviada com sucesso!");
                       }}
                       className="bg-[#05764d] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                     >Enviar Mensagem</button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-6">
                    <i className="fa-solid fa-comments text-6xl"></i>
                    <p className="text-[11px] font-black uppercase tracking-widest">Selecione um membro ao lado</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {sub === 'ajustes' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-12">
             <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center p-4 shadow-2xl ring-8 ring-slate-50 overflow-hidden relative group">
                <img src={officialLogo} className="w-full h-full object-contain" alt="Logo" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                   <i className="fa-solid fa-camera text-white text-3xl"></i>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setOfficialLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                   }} />
                </div>
             </div>
             <button className="bg-[#051f18] text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center gap-4"><i className="fa-solid fa-cloud-arrow-up"></i> Atualizar Logo Oficial</button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminTab = ({ label, icon, active, onClick }: any) => (
  <button onClick={onClick} className={`px-6 py-3.5 flex items-center gap-3 font-black text-[9px] uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${active ? 'bg-[#05764d] text-white rounded-xl shadow-lg border-emerald-400' : 'text-slate-400 border-transparent hover:text-emerald-500'}`}>
    <i className={`fa-solid ${icon} text-xs`}></i> {label}
  </button>
);

export default App;
