
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- TIPAGEM E INTERFACES ---

type ViewState = 'home' | 'feed' | 'projects' | 'members' | 'ingresso' | 'events' | 'labs' | 'attendance' | 'messages' | 'admin';
type AdminSubView = 'labs' | 'cronograma' | 'projetos' | 'presenca' | 'inscricoes_lab' | 'ingresso' | 'mensagens' | 'ajustes';

interface UserProfile {
  fullName: string;
  role: 'admin' | 'membro';
  photoUrl: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  img: string;
  email: string;
  attendance: number; // 0-100
  totalEvents: number;
  presentEvents: number;
}

interface Post {
  id: string;
  author: string;
  time: string;
  content: string;
  media?: string; // base64
  mediaType?: 'image' | 'video';
  likes: number;
  comments: { user: string; text: string }[];
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

interface Event {
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

interface LabApplication {
  id: string;
  studentName: string;
  labTitle: string;
  date: string;
}

// --- APP PRINCIPAL ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('labs');
  const [user, setUser] = useState<UserProfile>({ 
    fullName: 'lapib', 
    role: 'admin', 
    photoUrl: 'https://ui-avatars.com/api/?name=LAPIB&background=059669&color=fff' 
  });

  // ESTADOS GLOBAIS (Persistência em sessão simulada)
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'CHRISTHALLY', role: 'DIRETORA', img: 'https://ui-avatars.com/api/?name=Christhally&background=05764d&color=fff', email: 'chris@lapib.com', attendance: 85, totalEvents: 10, presentEvents: 8 },
    { id: '2', name: 'MARIA', role: 'DIRETORA MARKETING', img: 'https://ui-avatars.com/api/?name=Maria&background=05764d&color=fff', email: 'maria@lapib.com', attendance: 90, totalEvents: 10, presentEvents: 9 },
    { id: '3', name: 'MATEUS', role: 'MARKETING', img: 'https://ui-avatars.com/api/?name=Mateus&background=05764d&color=fff', email: 'mateus@lapib.com', attendance: 70, totalEvents: 10, presentEvents: 7 },
    { id: '4', name: 'MURILO', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Murilo&background=05764d&color=fff', email: 'murilo@lapib.com', attendance: 100, totalEvents: 10, presentEvents: 10 },
    { id: '5', name: 'ROBERIO', role: 'OPERAÇÕES', img: 'https://ui-avatars.com/api/?name=Roberio&background=05764d&color=fff', email: 'roberio@lapib.com', attendance: 60, totalEvents: 10, presentEvents: 6 },
    { id: '6', name: 'VICTOR', role: 'PRESIDENTE', img: 'https://ui-avatars.com/api/?name=Victor&background=05764d&color=fff', email: 'victor@lapib.com', attendance: 100, totalEvents: 10, presentEvents: 10 },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    { 
      id: '1', author: 'lapib', time: '20/12/2025', content: 'Início das atividades acadêmicas de 2025!', 
      likes: 2, comments: [{ user: 'LAPIB', text: 'muito bom' }, { user: 'SAMUEL', text: 'Muito legal' }] 
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: 'PROJETO ENSINO', orientador: 'VICTOR', date: '2025-12-23', status: 'ATIVO', tag: 'BANCADA', img: 'https://images.unsplash.com/photo-1532187875605-186c6af16664?auto=format&fit=crop&q=80&w=800', desc: 'Divulgação científica escolar.' },
    { id: '2', title: 'PODCAST', orientador: 'VICTOR', date: '20/12/2025', status: 'ATIVO', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800', desc: 'Diálogo e aprendizado biomédico.' }
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'I Simpósio de Inovação Biomédica', date: '2024-10-20', time: '19:00', location: 'AUDITÓRIO MASTER - ESTÁCIO', desc: 'Evento oficial para discussão de novas tecnologias.', category: 'SYMPOSIUM', status: 'ATIVO' }
  ]);

  const [labs, setLabs] = useState<Lab[]>([
    { id: '1', title: 'Laboratório de Hematologia Clínica', tag: 'TEACHING', coordinator: 'Prof. Dr. Abel Bisneto', initial: 'P', desc: 'Práticas de contagem celular.' },
    { id: '2', title: 'Grupo de Estudo: Biologia Molecular', tag: 'RESEARCH', coordinator: 'Victor Papalardo', initial: 'V', desc: 'Análise de extração de DNA.' }
  ]);

  const [labApps, setLabApps] = useState<LabApplication[]>([]);
  const [officialLogo, setOfficialLogo] = useState('https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=256');

  // MODAIS
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-['Inter'] overflow-hidden text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#05764d] text-white flex flex-col shrink-0 border-r border-emerald-900/10">
        <div className="p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 mb-4 shadow-2xl">
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

          {user.role === 'admin' && (
            <>
              <div className="pt-6 pb-2 px-4 text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">Diretoria</div>
              <NavItem icon="fa-gauge-high" label="PAINEL MASTER" active={view === 'admin'} onClick={() => setView('admin')} />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-emerald-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-xs font-black text-emerald-300">LA</div>
            <div>
              <p className="text-[11px] font-black uppercase leading-tight">{user.fullName}</p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{user.role.toUpperCase()}</p>
            </div>
          </div>
          <button className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors ml-1">Sair da Conta</button>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-y-auto p-8 lg:p-12 relative scroll-smooth">
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#05764d 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10">
          {view === 'home' && <HomeView setView={setView} />}
          {view === 'feed' && <FeedView posts={posts} />}
          {view === 'projects' && <ProjectsView projects={projects} onDetail={setShowDetails} />}
          {view === 'members' && <MembersView members={members} onRegister={() => setShowMemberModal(true)} />}
          {view === 'ingresso' && <IngressoView />}
          {view === 'events' && <EventsView events={events} onDetail={setShowDetails} />}
          {view === 'labs' && <LabsView labs={labs} activeEvent={events.find(e => e.status === 'ATIVO')} onInscricao={(lab) => { setLabApps([...labApps, { id: Math.random().toString(), studentName: 'Usuário Logado', labTitle: lab.title, date: new Date().toLocaleDateString() }]); alert("Inscrição realizada!"); }} />}
          {view === 'attendance' && <AttendanceView member={members[5]} />}
          {view === 'messages' && <MessagesView />}
          {view === 'admin' && (
            <AdminPanelView 
              sub={adminSubView} 
              setSub={setAdminSubView} 
              members={members} 
              setMembers={setMembers} 
              events={events} 
              setEvents={setEvents}
              projects={projects}
              setProjects={setProjects}
              labs={labs}
              setLabs={setLabs}
              labApps={labApps}
              setOfficialLogo={setOfficialLogo}
              officialLogo={officialLogo}
            />
          )}
        </div>
      </main>

      {/* MODAL GERAL DETALHES */}
      {showDetails && (
        <Modal onClose={() => setShowDetails(null)}>
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-[#05764d] uppercase">{showDetails.title}</h3>
            {showDetails.img && <img src={showDetails.img} className="w-full h-64 object-cover rounded-3xl" alt="M" />}
            <p className="text-slate-600 font-medium leading-relaxed">{showDetails.desc || 'Detalhes acadêmicos completos em desenvolvimento...'}</p>
          </div>
        </Modal>
      )}

      {/* MODAL NOVO POST FEED */}
      {showPostModal && (
        <Modal onClose={() => setShowPostModal(false)} maxWidth="max-w-lg">
          <h3 className="text-xl font-black text-[#05764d] uppercase mb-8">Novo Post Científico</h3>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as any;
            const file = form.media.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
              const newPost: Post = {
                id: Math.random().toString(),
                author: 'lapib',
                time: 'Agora',
                content: form.content.value,
                media: reader.result as string,
                likes: 0,
                comments: []
              };
              setPosts([newPost, ...posts]);
              setShowPostModal(false);
            };
            if (file) reader.readAsDataURL(file);
            else {
               setPosts([{ id: Math.random().toString(), author: 'lapib', time: 'Agora', content: form.content.value, likes: 0, comments: [] }, ...posts]);
               setShowPostModal(false);
            }
          }}>
            <textarea name="content" required placeholder="O que há de novo na pesquisa?" className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none" />
            <div className="border-2 border-dashed border-slate-200 p-8 rounded-3xl text-center">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 mb-2"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase">Selecione Mídia (Foto/Vídeo)</p>
              <input type="file" name="media" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button type="submit" className="w-full bg-[#05764d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Publicar</button>
          </form>
        </Modal>
      )}

      {/* MODAL CADASTRAR MEMBRO */}
      {showMemberModal && (
        <Modal onClose={() => setShowMemberModal(false)}>
          <h3 className="text-xl font-black text-[#05764d] uppercase mb-8">Novo Membro Efetivo</h3>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as any;
            const newMember: Member = {
              id: Math.random().toString(),
              name: form.name.value.toUpperCase(),
              role: form.role.value.toUpperCase(),
              img: `https://ui-avatars.com/api/?name=${form.name.value}&background=05764d&color=fff`,
              email: form.email.value,
              attendance: 0,
              totalEvents: 0,
              presentEvents: 0
            };
            setMembers([...members, newMember]);
            setShowMemberModal(false);
          }}>
            <InputGroup name="name" label="Nome Completo" placeholder="" />
            <InputGroup name="email" label="Email" placeholder="" />
            <InputGroup name="role" label="Cargo/Diretoria" placeholder="Ex: OPERAÇÕES" />
            <button type="submit" className="w-full bg-[#05764d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs mt-4">Registrar</button>
          </form>
        </Modal>
      )}

      {/* FLOATING CAMERA */}
      {view === 'feed' && user.role === 'admin' && (
        <button onClick={() => setShowPostModal(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-[#05764d] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-50">
          <i className="fa-solid fa-camera"></i>
        </button>
      )}
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all group ${active ? 'bg-white text-[#05764d] font-black shadow-lg shadow-emerald-950/20' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white font-bold'}`}>
    <i className={`fa-solid ${icon} text-sm`}></i>
    <span className="text-[11px] uppercase tracking-wider">{label}</span>
  </button>
);

const InputGroup = ({ label, placeholder, name, type = "text" }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input name={name} type={type} placeholder={placeholder} className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:border-emerald-200 transition-all shadow-sm" />
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

// --- VIEWS ---

const HomeView = ({ setView }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <section className="bg-[#05764d] rounded-[3.5rem] p-16 lg:p-24 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fa-solid fa-dna text-[35rem] rotate-45"></i></div>
      <div className="relative z-10 max-w-2xl text-left">
        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full mb-10 border border-white/20">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Biomedicina • Estácio GO</span>
        </div>
        <h2 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter">Inovação que pulsa ciência.</h2>
        <p className="text-emerald-100/70 text-lg mb-12 font-medium leading-relaxed max-w-lg">Fomentar a pesquisa científica de ponta e a divulgação técnica no campo da Biomedicina, unindo teoria, prática laboratorial e comunicação com a comunidade acadêmica.</p>
        <div className="flex gap-6">
          <button onClick={() => setView('projects')} className="bg-white text-[#05764d] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">Explorar Projetos</button>
          <button className="bg-emerald-950/40 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-emerald-900 transition-all"><i className="fa-brands fa-instagram text-lg"></i> Instagram</button>
        </div>
      </div>
    </section>

    <div className="grid md:grid-cols-3 gap-8">
      <StatCard icon="fa-dna" color="bg-blue-500" value="04" label="LINHAS DE PESQUISA" />
      <StatCard icon="fa-microscope" color="bg-emerald-500" value="07" label="MEMBROS ATIVOS" />
      <StatCard icon="fa-flask-vial" color="bg-purple-500" value="+1.2k" label="HORAS PRÁTICAS" />
    </div>

    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 text-left">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-vials"></i></div>
           <h3 className="text-2xl font-black text-[#05764d] uppercase tracking-tight">Excelência Laboratorial</h3>
        </div>
        <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">A LAPIB atua no coração da inovação tecnológica aplicada à saúde. Nosso objetivo é transformar o conhecimento acadêmico em soluções diagnósticas reais através de metodologias rigorosas.</p>
        <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 flex items-start gap-4">
          <i className="fa-solid fa-quote-left text-emerald-300 text-3xl"></i>
          <p className="text-emerald-800 font-bold italic text-sm">"Ciência é o processo de transformar curiosidade em progresso coletivo."</p>
        </div>
      </div>
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 text-left">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-fingerprint"></i></div>
           <h3 className="text-2xl font-black text-[#05764d] uppercase tracking-tight">Identidade LAPIB</h3>
        </div>
        <div className="space-y-8">
          <IdentityItem icon="fa-bullhorn" title="DIVULGAÇÃO CIENTÍFICA" desc="Levar o conhecimento biomédico para além dos laboratórios, comunicando a ciência de forma clara e acessível." />
          <IdentityItem icon="fa-book-open" title="CONHECIMENTO CIENTÍFICO" desc="Produção e estudo de dados rigorosos para fundamentar a excelência acadêmica na Biomedicina." />
          <IdentityItem icon="fa-share-nodes" title="ACESSO CIENTÍFICO" desc="Democratizar a informação e os recursos de pesquisa para todos os membros e alunos da Estácio GO." />
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, color, value, label }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-slate-100 hover:shadow-xl transition-all">
    <div className={`w-16 h-16 ${color} text-white rounded-[1.2rem] flex items-center justify-center text-2xl shadow-lg`}><i className={`fa-solid ${icon}`}></i></div>
    <div><h4 className="text-4xl font-black text-slate-800 leading-none mb-2">{value}</h4><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p></div>
  </div>
);

const IdentityItem = ({ icon, title, desc }: any) => (
  <div className="flex gap-6 group">
    <div className="w-12 h-12 bg-emerald-800 text-white rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform"><i className={`fa-solid ${icon}`}></i></div>
    <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4><p className="text-slate-700 font-black text-xs leading-relaxed">{desc}</p></div>
  </div>
);

const FeedView = ({ posts }: { posts: Post[] }) => (
  <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700 pb-20 text-left">
    {posts.map(post => (
      <div key={post.id} className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center text-white text-[10px] font-black">{post.author.slice(0, 2).toUpperCase()}</div>
            <div><h4 className="text-[12px] font-black text-slate-800 uppercase">{post.author}</h4><p className="text-[9px] text-slate-400 font-bold uppercase">{post.time}</p></div>
          </div>
          <button className="text-slate-300 hover:text-slate-600"><i className="fa-solid fa-ellipsis"></i></button>
        </div>
        <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
          {post.media ? (
            <img src={post.media} className="w-full h-full object-cover" alt="Post" />
          ) : (
            <div className="text-slate-300 text-center p-12">
               <h2 className="text-7xl font-black tracking-tighter opacity-10">LAPIB</h2>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-20 mt-4">{post.content.slice(0, 30)}...</p>
            </div>
          )}
        </div>
        <div className="p-8">
          <div className="flex gap-4 mb-6 text-2xl">
            <button className="text-red-500 hover:scale-110 transition-transform"><i className="fa-solid fa-heart"></i></button>
            <button className="text-slate-300 hover:text-slate-600"><i className="fa-regular fa-comment"></i></button>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">• {post.likes} REAÇÕES CIENTÍFICAS</p>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6"><p className="text-slate-600 font-medium text-sm leading-relaxed italic">{post.content}</p></div>
          <div className="space-y-2">
            {post.comments.map((c, i) => (
              <p key={i} className="text-xs font-bold text-slate-700"><span className="font-black uppercase mr-2">{c.user}</span> {c.text}</p>
            ))}
          </div>
          <input placeholder="Participar da discussão..." className="w-full bg-slate-50 p-5 rounded-2xl text-xs font-bold outline-none border border-slate-100 mt-6" />
        </div>
      </div>
    ))}
  </div>
);

const ProjectsView = ({ projects, onDetail }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 text-center pb-20">
    <header><h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">PROJETOS CIENTÍFICOS</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PRODUÇÃO ACADÊMICA E INOVAÇÃO</p></header>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
      {projects.map((p: any) => (
        <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <img src={p.img} className="h-48 w-full object-cover group-hover:scale-105 transition-transform" alt="P" />
          <div className="p-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">{p.title}</h3>
            <p className="text-[9px] font-black text-emerald-500 uppercase mb-4">ORIENTADOR: {p.orientador}</p>
            <p className="text-slate-500 font-medium text-xs line-clamp-2 mb-6">{p.desc}</p>
            <button onClick={() => onDetail(p)} className="text-[10px] font-black text-[#05764d] uppercase tracking-widest flex items-center gap-2">SABER MAIS <i className="fa-solid fa-chevron-right text-[8px]"></i></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MembersView = ({ members, onRegister }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-left">
    <div className="flex justify-between items-end">
      <div><h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter">NOSSA EQUIPE</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">DIRETORIA E MEMBROS EFETIVOS</p></div>
      <button onClick={onRegister} className="bg-[#05764d] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-3"><i className="fa-solid fa-user-plus"></i> CADASTRAR MEMBRO</button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pt-8">
      {members.map((m: any, i: number) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 group">
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
      <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-10">Nossa liga seleciona alunos de Biomedicina que buscam excelência acadêmica. O processo avalia conhecimentos técnicos e o interesse real em pesquisa científica.</p>
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CRITÉRIOS ATUAIS DE AVALIAÇÃO:</p>
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <span className="w-10 h-10 bg-[#05764d] text-white rounded-full flex items-center justify-center font-black">1</span>
          <p className="text-slate-700 font-black text-xs leading-relaxed italic">Disponibilidade de Horário e CR Superior a 8.0</p>
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-[#051f18] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <h3 className="text-xl font-black uppercase mb-8">CALENDÁRIO DE SELEÇÃO</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4"><p className="font-black uppercase text-xs">ABERTURA</p><p className="font-black text-emerald-400 text-xs tracking-widest">01/01</p></div>
              <div className="flex justify-between items-center"><p className="font-black uppercase text-xs">RESULTADO</p><p className="font-black text-emerald-400 text-xs tracking-widest">20/01</p></div>
           </div>
        </div>
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fa-solid fa-file-signature"></i></div>
            <div><h3 className="text-xl font-black text-slate-800 uppercase leading-none">INSCREVA-SE AQUI</h3><p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2">PROCESSO SELETIVO ATIVO</p></div>
          </div>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Inscrição submetida!"); }}>
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
      <div className="space-y-8">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mb-8"><i className="fa-solid fa-file-pdf"></i></div>
          <h4 className="text-lg font-black text-slate-800 uppercase mb-2 tracking-tight">EDITAL DE INGRESSO</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">DOCUMENTO OBRIGATÓRIO PARA CONSULTA.</p>
          <button className="w-full bg-slate-50 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 border border-slate-100 shadow-sm"><i className="fa-solid fa-eye text-xs"></i> ABRIR PDF OFICIAL</button>
        </div>
      </div>
    </div>
  </div>
);

const EventsView = ({ events, onDetail }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
    <header><h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">CRONOGRAMA OFICIAL</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CALENDÁRIO ACADÊMICO SINCRONIZADO</p></header>
    {events.map((e: any) => (
      <div key={e.id} className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row items-center p-8 lg:p-12 gap-12 max-w-5xl mx-auto">
        <div className="w-full md:w-[450px] aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center p-12 shrink-0">
          <img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=512" className="w-full h-full object-contain mix-blend-multiply opacity-80" alt="L" />
        </div>
        <div className="flex-1 space-y-10 text-left">
          <span className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">{e.category}</span>
          <div className="flex gap-10">
            <div className="text-center pr-10 border-r border-slate-100">
               <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">{e.date.split('-')[1]}</p>
               <p className="text-7xl font-black text-slate-800 my-2">{e.date.split('-')[2]}</p>
               <p className="text-slate-300 font-black text-[11px] tracking-widest">{e.time}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-4xl font-black text-slate-800 mb-4 uppercase tracking-tighter leading-tight">{e.title}</h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">{e.desc}</p>
              <div className="flex items-center gap-3 text-[#10b981] font-black text-[10px] uppercase tracking-widest"><i className="fa-solid fa-location-dot"></i> {e.location}</div>
            </div>
          </div>
          <button onClick={() => onDetail(e)} className="w-full bg-[#05764d] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl">SABER MAIS</button>
        </div>
      </div>
    ))}
  </div>
);

const LabsView = ({ labs, activeEvent, onInscricao }: any) => (
  <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
    <header><h2 className="text-3xl font-black text-[#05764d] uppercase tracking-tighter mb-2">ESPAÇO DO ALUNO</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">INSCREVA-SE EM PRÁTICAS E LABORATÓRIOS</p></header>
    {activeEvent && (
      <section className="space-y-8 text-left">
         <h3 className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-widest leading-none"><i className="fa-solid fa-bolt text-lg"></i> INSCRIÇÕES ABERTAS VIA CRONOGRAMA</h3>
         <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center gap-10 max-w-2xl overflow-hidden relative group">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center p-6 shrink-0 group-hover:scale-105 transition-transform"><img src="https://ui-avatars.com/api/?name=LAPIB&background=fff&color=05764d&size=200" className="w-full h-full object-contain mix-blend-multiply opacity-80" alt="L" /></div>
            <div className="flex-1 space-y-4">
               <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{activeEvent.title.toUpperCase()}</h4>
               <div className="flex gap-4 text-slate-400 font-bold text-[9px] uppercase tracking-widest"><span><i className="fa-solid fa-calendar mr-2"></i> {activeEvent.date}</span><span><i className="fa-solid fa-clock mr-2"></i> {activeEvent.time}</span></div>
               <button onClick={() => onInscricao(activeEvent)} className="w-full bg-[#05764d] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg">REALIZAR INSCRIÇÃO</button>
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
              <div className="p-10 space-y-6">
                 <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">{lab.title}</h4>
                 <p className="text-slate-400 font-medium text-sm leading-relaxed">{lab.desc}</p>
                 <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#05764d] text-white rounded-xl flex items-center justify-center font-black shadow-md">{lab.initial}</div>
                       <div><p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">COORDENAÇÃO</p><p className="text-slate-700 font-black text-[11px] leading-none">{lab.coordinator}</p></div>
                    </div>
                    <button onClick={() => alert("Ficha submetida para " + lab.title)} className="border-2 border-[#05764d] text-[#05764d] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[#05764d] hover:text-white transition-all">FICHA CADASTRAL</button>
                 </div>
              </div>
            </div>
          ))}
       </div>
    </section>
  </div>
);

const AttendanceView = ({ member }: { member: Member }) => (
  <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-left">
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
        <h4 className="text-4xl font-black text-[#05764d] leading-none mb-3">{member.totalEvents}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EVENTOS OFICIAIS</p>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center">
        <h4 className="text-4xl font-black text-emerald-500 leading-none mb-3">{member.presentEvents}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRESENÇAS COMPUTADAS</p>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100 flex flex-col items-center ring-4 ring-emerald-50/50">
        <h4 className="text-4xl font-black text-emerald-600 leading-none mb-3">{((member.presentEvents / member.totalEvents) * 100).toFixed(0)}%</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FREQUÊNCIA UNIFICADA</p>
      </div>
    </div>
    <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 p-12">
       <div className="flex items-center gap-4 mb-12"><i className="fa-solid fa-history text-emerald-500 text-xl"></i><h3 className="text-xl font-black text-[#05764d] uppercase tracking-tight">REGISTRO CRONOLÓGICO DE PARTICIPAÇÕES</h3></div>
       {member.presentEvents > 0 ? (
         <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center"><p className="font-black text-xs uppercase">I Simpósio de Inovação Biomédica</p><span className="text-emerald-500 font-black text-xs">PRESENTE</span></div>
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

const MessagesView = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 h-[calc(100vh-160px)] flex flex-col pb-10 text-left">
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6">
       <div className="w-14 h-14 bg-emerald-800 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg"><i className="fa-solid fa-comment-dots"></i></div>
       <div><h3 className="text-xl font-black text-slate-800 uppercase leading-none">SUPORTE E ORIENTAÇÕES</h3><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">CANAL DIRETO COM A DIRETORIA MASTER</p></div>
    </div>
    <div className="flex-1 bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 p-12 flex flex-col items-center justify-center text-center space-y-8 relative">
       <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner mb-4"><i className="fa-solid fa-comments"></i></div>
       <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest max-w-xs">INICIE SUA CONVERSA COM A DIRETORIA</p>
       <div className="absolute bottom-8 left-8 right-8 flex gap-4">
          <button className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-paperclip"></i></button>
          <input placeholder="Digite sua mensagem ou anexe um arquivo..." className="flex-1 bg-slate-50 px-8 rounded-2xl text-xs font-bold outline-none border border-slate-100" />
          <button onClick={() => alert("Mensagem enviada!")} className="w-14 h-14 bg-[#05764d] text-white rounded-2xl flex items-center justify-center text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"><i className="fa-solid fa-paper-plane"></i></button>
       </div>
    </div>
  </div>
);

const AdminPanelView = ({ sub, setSub, members, setMembers, events, setEvents, projects, setProjects, labs, setLabs, labApps, setOfficialLogo, officialLogo }: any) => {
  const handlePresence = (memberId: string) => {
    setMembers(members.map((m: any) => m.id === memberId ? { ...m, presentEvents: m.presentEvents + 1, totalEvents: m.totalEvents + 1 } : m));
    alert("Presença lançada!");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 text-center">
      <div className="flex justify-center">
        <div className="bg-white p-1 rounded-2xl shadow-xl flex border border-slate-100 overflow-x-auto scrollbar-hide max-w-full">
          <AdminTab label="LABORATÓRIOS" icon="fa-microscope" active={sub === 'labs'} onClick={() => setSub('labs')} />
          <AdminTab label="CRONOGRAMA" icon="fa-calendar" active={sub === 'cronograma'} onClick={() => setSub('cronograma')} />
          <AdminTab label="PROJETOS" icon="fa-vial" active={sub === 'projetos'} onClick={() => setSub('projetos')} />
          <AdminTab label="LANÇAR PRESENÇA" icon="fa-user-check" active={sub === 'presenca'} onClick={() => setSub('presenca')} />
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
                id: Math.random().toString(),
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
                  <select name="tag" className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 focus:border-emerald-200">
                    <option value="TEACHING">Ensino (Teaching)</option>
                    <option value="RESEARCH">Pesquisa (Research)</option>
                  </select>
                </div>
                <InputGroup name="coordinator" label="Coordenador" placeholder="" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição científica...</label>
                 <textarea name="desc" className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none" />
              </div>
              <button type="submit" className="w-full bg-[#05764d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">CADASTRAR LABORATÓRIO</button>
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
              const newEvt: Event = {
                id: Math.random().toString(),
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
              <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Resumo científico...</label><textarea name="desc" className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none" /></div>
              <button type="submit" className="w-full bg-[#051f18] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">AGENDAR NO CALENDÁRIO</button>
            </form>
          </div>
        )}

        {sub === 'projetos' && (
          <div className="space-y-10">
             <h3 className="text-2xl font-black text-[#05764d] uppercase text-center mb-10 tracking-tighter">NOVO PROJETO CIENTÍFICO</h3>
             <form className="max-w-xl mx-auto space-y-6" onSubmit={(e: any) => {
               e.preventDefault();
               const newProj: Project = {
                 id: Math.random().toString(),
                 title: e.target.title.value.toUpperCase(),
                 orientador: e.target.orientador.value.toUpperCase(),
                 date: e.target.date.value,
                 status: 'ATIVO',
                 img: 'https://images.unsplash.com/photo-1579154235602-3c20054811e6?auto=format&fit=crop&q=80&w=800',
                 desc: e.target.desc.value
               };
               setProjects([newProj, ...projects]);
               e.target.reset();
             }}>
                <InputGroup name="title" label="Título da Pesquisa" placeholder="" />
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup name="orientador" label="Orientador" placeholder="" />
                  <InputGroup name="date" label="Data de Início" type="date" placeholder="" />
                </div>
                <div className="space-y-2"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Resumo Acadêmico...</label><textarea name="desc" className="w-full bg-slate-50 p-6 rounded-3xl font-bold min-h-[120px] outline-none" /></div>
                <button type="submit" className="w-full bg-[#05764d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">PUBLICAR PROJETO</button>
             </form>
          </div>
        )}

        {sub === 'presenca' && (
          <div className="space-y-10">
            <div className="flex justify-center gap-4 mb-12">
               <button className="px-10 py-3 bg-[#10b981] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">CHAMADA CALENDÁRIO</button>
               <button className="px-10 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">ABONO EXTERNO</button>
            </div>
            <div className="max-w-2xl mx-auto border border-slate-100 rounded-[3rem] overflow-hidden">
               <div className="p-8 border-b border-slate-100"><select className="w-full bg-white font-black uppercase text-xs outline-none"><option>Selecione o Evento do Dia...</option>{events.map((e: any) => <option key={e.id}>{e.title}</option>)}</select></div>
               <div className="p-4 space-y-2">
                  {members.map((m: any) => (
                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors">
                       <div className="flex items-center gap-4"><img src={m.img} className="w-10 h-10 rounded-full" alt="M" /><span className="font-black uppercase text-[11px]">{m.name}</span></div>
                       <button onClick={() => handlePresence(m.id)} className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">PRESENTE</button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {sub === 'inscricoes_lab' && (
          <div className="space-y-10">
             <h3 className="text-2xl font-black text-[#05764d] uppercase text-center mb-10 tracking-tighter">INTERESSADOS EM LABORATÓRIOS</h3>
             {labApps.length > 0 ? (
               <div className="max-w-4xl mx-auto grid gap-4">
                  {labApps.map((app: any) => (
                    <div key={app.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex justify-between items-center group">
                       <div><h4 className="font-black text-slate-800 uppercase text-xs">{app.studentName}</h4><p className="text-[9px] text-slate-400 font-bold uppercase">{app.labTitle} • SOLICITADO EM {app.date}</p></div>
                       <div className="flex gap-2">
                          <button className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase">APROVAR</button>
                          <button onClick={() => {}} className="bg-red-100 text-red-500 px-6 py-2 rounded-xl text-[9px] font-black uppercase">RECUSAR</button>
                       </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center space-y-6 opacity-30 text-center">
                  <i className="fa-solid fa-inbox text-5xl"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma nova candidatura pendente.</p>
               </div>
             )}
          </div>
        )}

        {sub === 'ingresso' && (
          <div className="space-y-10">
             <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6"><div className="w-14 h-14 bg-[#05764d] text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg"><i className="fa-solid fa-user-plus"></i></div><div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PROCESSO SELETIVO GERAL</h3><p className="text-[9px] font-black text-emerald-500 uppercase">CONTROLE DE MEMBROS EFETIVOS</p></div></div>
                <div className="bg-slate-50 p-1 rounded-2xl flex border border-slate-100"><button className="px-6 py-2 text-[10px] font-black uppercase text-slate-400">INSCRITOS</button><button className="px-6 py-2 bg-[#009669] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">CONFIGURAÇÃO DO EDITAL</button></div>
             </div>
             <div className="grid lg:grid-cols-2 gap-10 mt-12">
                <div className="bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100 space-y-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. UPLOAD DE NOVO EDITAL (PDF)</h4>
                   <div className="border-4 border-dashed border-slate-100 h-64 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 group cursor-pointer hover:border-emerald-100 transition-all">
                      <i className="fa-solid fa-file-pdf text-6xl text-red-400 mb-4 opacity-50 group-hover:scale-110 transition-transform"></i>
                      <p className="text-[10px] font-black text-slate-400 uppercase">CLIQUE PARA SUBSTITUIR O EDITAL VIGENTE</p>
                   </div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. CRITÉRIOS DE SELEÇÃO (TEXTO RICO)</h4>
                   <textarea className="w-full bg-white p-8 rounded-[2rem] font-bold min-h-[150px] outline-none border border-slate-100" defaultValue="\egv\dvdvd\vafef" />
                   <button onClick={() => alert("Alterações salvas!")} className="w-full bg-[#05764d] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">SALVAR ALTERAÇÕES</button>
                </div>
                <div className="bg-emerald-50/20 p-10 rounded-[3.5rem] border border-emerald-100/50 space-y-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3. CRONOGRAMA DE ETAPAS</h4>
                   <div className="space-y-6">
                      <InputGroup label="ABERTURA DAS INSCRIÇÕES" placeholder="\v\sf" />
                      <InputGroup label="ENCERRAMENTO" placeholder="v\sv\sv" />
                      <InputGroup label="APLICAÇÃO DE PROVAS" placeholder="v\sfvs\" />
                      <InputGroup label="RESULTADO FINAL" placeholder="v\ev" />
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col gap-4">
                         <h5 className="text-[10px] font-black text-emerald-800 flex items-center gap-2 uppercase tracking-widest"><i className="fa-solid fa-circle-info"></i> STATUS DO PROCESSO</h5>
                         <select className="bg-white p-4 rounded-xl font-black text-xs uppercase outline-none"><option>Inscrições Abertas</option><option>Processo Encerrado</option></select>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {sub === 'mensagens' && (
          <div className="space-y-10 h-[600px] flex gap-8">
             <div className="w-1/3 bg-slate-50/50 rounded-[3rem] p-8 space-y-8 border border-slate-100 overflow-y-auto">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ACADÊMICOS VINCULADOS</h4>
                <div className="space-y-4">
                   {members.map((m: any) => (
                     <div key={m.id} className="p-4 flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-slate-50 cursor-pointer hover:border-emerald-200 transition-all">
                        <img src={m.img} className="w-10 h-10 rounded-full" alt="M" />
                        <span className="font-black uppercase text-[10px] text-slate-700">{m.name}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                <i className="fa-solid fa-comments text-6xl"></i>
                <p className="text-[11px] font-black uppercase tracking-widest">SELECIONE PARA SUPORTE</p>
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
             <button className="bg-[#051f18] text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center gap-4"><i className="fa-solid fa-cloud-arrow-up"></i> ATUALIZAR LOGO OFICIAL</button>
             <button onClick={() => window.location.reload()} className="text-red-500 font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-8">SAIR DA SESSÃO ADMINISTRATIVA</button>
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
