
import React, { useState, useEffect } from 'react';
import { ViewState, AdminTab, Member, Project, Lab, CalendarEvent, Candidate, FeedPost, UserProfile, DirectMessage, MembershipSettings, AttendanceRecord } from './types';
import ChatAssistant from './ChatAssistant';
import EnrollmentModal from './EnrollmentModal';
import Feed from './Feed';
import Events from './Events';
import Home from './Home';
import Layout from './Layout';
import Membership from './Membership';
import Profile from './Profile';
import MessageCenter from './MessageCenter';
import Secretaria from './Secretaria';
import Members from './Members';
import Labs from './Labs';
import AttendanceView from './AttendanceView';
import AdminAttendance from './AdminAttendance';
import AdminMembers from './AdminMembers';
import AdminMembership from './AdminMembership';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectFormModal from './ProjectFormModal';
import EventFormModal from './EventFormModal';
import LabFormModal from './LabFormModal';
import Auth from './Auth';
import { LEAGUE_INFO, LAPIB_LOGO_BASE64 } from './constants';

const MASTER_ADMIN_EMAIL = 'lapibfesgo@gmail.com';

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lapib_auth_status') === 'true';
  });

  // --- STATE PERSISTENCE ---
  const [appLogo, setAppLogo] = useState<string>(() => localStorage.getItem('lapib_logo') || LAPIB_LOGO_BASE64);
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lapib_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('lapib_members');
    return saved ? JSON.parse(saved) : [
      { id: '1', fullName: 'Maria Silva', email: 'maria@lapib.com', role: 'DIRETORA MARKETING', photoUrl: 'https://ui-avatars.com/api/?name=Maria+S&background=055c47&color=fff', bio: 'Especialista em comunicação científica e branding laboratorial.' },
      { id: '2', fullName: 'Mateus Oliveira', email: 'mateus@lapib.com', role: 'MEMBRO MARKETING', photoUrl: 'https://ui-avatars.com/api/?name=Mateus+O&background=055c47&color=fff' },
      { id: '3', fullName: 'Roberio Santos', email: 'roberio@lapib.com', role: 'DIRETOR OPERAÇÕES', photoUrl: 'https://ui-avatars.com/api/?name=Roberio+S&background=055c47&color=fff' },
      { id: '4', fullName: 'Murilo Souza', email: 'murilo@lapib.com', role: 'MEMBRO OPERAÇÕES', photoUrl: 'https://ui-avatars.com/api/?name=Murilo+S&background=055c47&color=fff' },
      { id: '5', fullName: 'Christhally Lima', email: 'chris@lapib.com', role: 'DIRETORA CIENTÍFICA', photoUrl: 'https://ui-avatars.com/api/?name=Chris+L&background=055c47&color=fff', bio: 'Mestre em Patologia Experimental com foco em marcadores tumorais.' },
      { id: '6', fullName: 'Victor Vilardel', email: MASTER_ADMIN_EMAIL, role: 'PRESIDENTE', photoUrl: 'https://ui-avatars.com/api/?name=Victor+V&background=055c47&color=fff', bio: 'Fundador da LAPIB, focado em inovação diagnóstica e gestão acadêmica.' },
    ];
  });

  // --- LÓGICA DE IDENTIFICAÇÃO AUTOMÁTICA DE ACESSO ---
  // Esta função garante que, se um administrador adicionar um e-mail de membro, 
  // o usuário correspondente ganhará acesso automaticamente ao "Espaço Acadêmico" na próxima atualização.
  useEffect(() => {
    if (currentUser) {
      const emailLower = currentUser.email.toLowerCase();
      const isMember = members.some(m => m.email.toLowerCase() === emailLower);
      const isAdmin = emailLower === MASTER_ADMIN_EMAIL;
      
      let newRole: UserProfile['role'] = 'student';
      if (isAdmin) newRole = 'admin';
      else if (isMember) newRole = 'member';

      if (currentUser.role !== newRole) {
        const updatedUser = { 
          ...currentUser, 
          role: newRole, 
          status: isMember || isAdmin ? 'ativo' : 'inativo' 
        } as UserProfile;
        setCurrentUser(updatedUser);
        localStorage.setItem('lapib_user', JSON.stringify(updatedUser));
      }
    }
  }, [members, currentUser?.email]);

  const handleLogin = (user: UserProfile) => {
    const emailLower = user.email.toLowerCase();
    const isMember = members.some(m => m.email.toLowerCase() === emailLower);
    const isAdmin = emailLower === MASTER_ADMIN_EMAIL;
    
    const loggedUser: UserProfile = {
      ...user,
      role: isAdmin ? 'admin' : (isMember ? 'member' : 'student'),
      status: isMember || isAdmin ? 'ativo' : 'inativo'
    };

    setCurrentUser(loggedUser);
    setIsAuthenticated(true);
    localStorage.setItem('lapib_auth_status', 'true');
    localStorage.setItem('lapib_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('lapib_auth_status');
    localStorage.removeItem('lapib_user');
    setView('home');
  };

  // --- PERSISTENCE OF STATE DATA ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('lapib_projects');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        title: 'PROJETO ENSINO', 
        advisor: 'VICTOR VILARDEL', 
        startDate: '2025-02-23', 
        status: 'ATIVO', 
        imageUrl: 'https://images.unsplash.com/photo-1532187875605-186c6af16664?w=800', 
        description: 'O Projeto Ensino tem como objetivo divulgar e aproximar conteúdos científicos da comunidade escolar.',
        category: 'Extensão',
        studentTeam: 'Maria Silva, Mateus Oliveira, Murilo Souza'
      },
      { 
        id: '2', 
        title: 'PODCAST BIOMÉDICO', 
        advisor: 'VICTOR VILARDEL', 
        startDate: '2024-12-20', 
        status: 'ATIVO', 
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800', 
        description: 'O Podcast da LAPIB é um espaço de diálogo, aprendizado e troca de experiências no universo da Biomedicina.',
        category: 'Comunicação',
        studentTeam: 'Victor Vilardel, Christhally Lima, Maria Silva'
      },
    ];
  });

  const [labs, setLabs] = useState<Lab[]>(() => {
    const saved = localStorage.getItem('lapib_labs');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Laboratório de Hematologia Clínica', coordinator: 'Prof. Dr. Abel Bisneto', type: 'Ensino', desc: 'Práticas de contagem celular, identificação de anemias e leucemias.' },
      { id: '2', title: 'Núcleo de Patologia Experimental', coordinator: 'Prof. Dra. Christhally Lima', type: 'Pesquisa', desc: 'Estudo de marcadores tumorais e biópsias experimentais.' }
    ];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('lapib_events');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'I Simpósio de Inovação Biomédica', date: '2025-10-20', time: '19:00', location: 'Auditório Master - Estácio', desc: 'Evento oficial para discussão de novas tecnologias.', category: 'symposium', ativo: true, projetoExplica: 'Simpósio focado em tecnologias de diagnóstico.', type: 'symposium' }
    ];
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('lapib_attendance');
    return saved ? JSON.parse(saved) : [
      { id: 'a1', memberId: 'admin', memberName: 'Victor Vilardel', eventTitle: 'Reunião Geral Fevereiro', date: '2025-02-01', timestamp: new Date().toISOString() }
    ];
  });

  const [membershipSettings, setMembershipSettings] = useState<MembershipSettings>(() => {
    const saved = localStorage.getItem('lapib_membership_settings');
    return saved ? JSON.parse(saved) : {
      editalUrl: 'https://example.com/edital.pdf',
      selectionStatus: 'open',
      rules: LEAGUE_INFO.membershipRules,
      calendar: [
        { stage: 'Publicação do Edital', date: 'AGO/2025' },
        { stage: 'Período de Inscrições', date: 'SET/2025' },
        { stage: 'Prova Diagnóstica', date: 'OUT/2025' }
      ]
    };
  });

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('lapib_direct_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('lapib_candidates');
    return saved ? JSON.parse(saved) : [];
  });

  const [posts, setPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem('lapib_posts');
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI STATE ---
  const [view, setView] = useState<ViewState>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('labs');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const [enrollModal, setEnrollModal] = useState<{ 
    active: boolean; 
    event?: CalendarEvent; 
    lab?: Lab;
    activity?: { id: string; title: string; description: string };
  }>({ active: false });

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    localStorage.setItem('lapib_projects', JSON.stringify(projects));
    localStorage.setItem('lapib_members', JSON.stringify(members));
    localStorage.setItem('lapib_labs', JSON.stringify(labs));
    localStorage.setItem('lapib_events', JSON.stringify(events));
    localStorage.setItem('lapib_candidates', JSON.stringify(candidates));
    localStorage.setItem('lapib_posts', JSON.stringify(posts));
    localStorage.setItem('lapib_attendance', JSON.stringify(attendances));
    localStorage.setItem('lapib_logo', appLogo);
    localStorage.setItem('lapib_user', JSON.stringify(currentUser));
    localStorage.setItem('lapib_membership_settings', JSON.stringify(membershipSettings));
    localStorage.setItem('lapib_direct_messages', JSON.stringify(directMessages));
  }, [projects, members, labs, events, candidates, posts, attendances, appLogo, currentUser, membershipSettings, directMessages]);

  // --- HANDLERS ---
  const handleApply = (enrollment: any) => {
    const newC: Candidate = {
      id: Date.now().toString(),
      fullName: enrollment.fullName,
      email: enrollment.email,
      registrationId: enrollment.registrationId,
      interest: enrollment.activityTitle || 'Processo Seletivo',
      semester: enrollment.semester,
      status: 'pending',
      timestamp: new Date().toISOString(),
      source: 'seletivo'
    };
    setCandidates([newC, ...candidates]);
  };

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleSendMessage = (text: string, file?: File) => {
    if (!currentUser) return;
    const newMsg: DirectMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: 'admin', 
      message: text,
      timestamp: new Date().toISOString(),
      read: false,
      fileName: file?.name,
      fileUrl: file ? URL.createObjectURL(file) : undefined
    };
    setDirectMessages([...directMessages, newMsg]);
  };

  const handleAdminSendMessage = () => {
    if (!chatInput || !selectedMember || !currentUser) return;
    const msg: DirectMessage = { 
      id: Date.now().toString(), 
      senderId: currentUser.id, 
      senderName: 'LAPIB Master',
      receiverId: selectedMember.id, 
      message: chatInput, 
      timestamp: new Date().toISOString(),
      read: true
    };
    setDirectMessages([...directMessages, msg]);
    setChatInput('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppLogo(reader.result as string);
        alert("✅ Logotipo atualizado com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Se não estiver autenticado, exibe a tela de Auth (Login/Cadastro)
  if (!isAuthenticated || !currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const unreadCount = directMessages.filter(m => m.receiverId === currentUser.id && !m.read).length;

  const AdminTabBtn: React.FC<{ id: AdminTab; icon: string; label: string }> = ({ id, icon, label }) => (
    <button 
      onClick={() => setAdminTab(id)}
      className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${adminTab === id ? 'bg-[#055c47] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      <i className={`fa-solid ${icon}`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <Layout 
      activeView={view} 
      onNavigate={setView} 
      user={currentUser} 
      onLogout={handleLogout} 
      logoUrl={appLogo}
      unreadCount={unreadCount}
    >
      {/* VIEW: HOME */}
      {view === 'home' && (
        <Home 
          onNavigate={setView} 
          memberCount={members.length} 
          projectCount={projects.length} 
        />
      )}

      {/* VIEW: IRIS IA */}
      {view === 'iris' && (
        <ChatAssistant members={members} projects={projects} />
      )}

      {/* VIEW: FEED */}
      {view === 'feed' && (
        <Feed 
          posts={posts} 
          user={currentUser} 
          onNavigateToLogin={() => setView('home')} 
          onPostsUpdate={(newPosts) => setPosts(newPosts)}
        />
      )}

      {/* VIEW: EVENTS */}
      {view === 'events' && (
        <Events 
          events={events.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            location: e.location,
            description: e.desc,
            type: (e.type || e.category || 'meeting') as any,
            ativo: e.ativo,
            projetoExplica: e.projetoExplica,
            imageUrl: e.imageUrl
          }))} 
          logoUrl={appLogo}
          onNavigateToActivities={() => setView('labs')} 
          onAction={(ev) => setEnrollModal({ active: true, event: events.find(original => original.id === ev.id) })}
        />
      )}

      {/* VIEW: LABS */}
      {view === 'labs' && (
        <Labs 
          labs={labs} 
          onEnroll={(lab) => setEnrollModal({ active: true, lab })} 
        />
      )}

      {/* VIEW: ATTENDANCE */}
      {view === 'attendance' && (
        <AttendanceView 
          user={currentUser} 
          attendances={attendances} 
          events={events} 
        />
      )}

      {/* VIEW: MEMBERS */}
      {view === 'members' && (
        <Members members={members} />
      )}

      {/* VIEW: INGRESSO */}
      {view === 'ingresso' && (
        <Membership 
          settings={membershipSettings} 
          onApply={handleApply} 
        />
      )}

      {/* VIEW: PROFILE */}
      {view === 'profile' && (
        <Profile 
          user={currentUser} 
          onUpdateUser={setCurrentUser} 
        />
      )}

      {/* VIEW: SECRETARIA DIGITAL */}
      {view === 'secretaria' && (
        <Secretaria 
          user={currentUser} 
          logoUrl={appLogo}
        />
      )}

      {/* VIEW: MESSAGES (Member Support) */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* VIEW: PROJECTS */}
      {view === 'projects' && (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
          <header className="text-center mb-20">
            <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Projetos Científicos</h2>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Pesquisa e Extensão</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[4rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-50 flex flex-col">
                 <img src={p.imageUrl} className="w-full h-64 object-cover" alt={p.title} />
                 <div className="p-10 flex-1 flex flex-col">
                   <h3 className="text-xl font-black uppercase text-slate-800 mb-5 tracking-tighter leading-tight">{p.title}</h3>
                   <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 flex-1">{p.description}</p>
                   <div className="flex flex-col gap-4 border-t border-slate-50 pt-8">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{p.startDate}</span>
                       <span className="text-emerald-600 text-[11px] font-black uppercase tracking-widest">{p.status}</span>
                     </div>
                     <button 
                       onClick={() => setSelectedProject(p)}
                       className="text-[#055c47] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all self-end"
                     >
                       Saber Mais <i className="fa-solid fa-chevron-right text-[8px]"></i>
                     </button>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: ADMIN */}
      {view === 'admin' && (
        <div className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500 text-left">
           <div className="bg-white p-3.5 rounded-full shadow-sm border border-slate-100 flex justify-center gap-2 mb-16 inline-flex mx-auto overflow-x-auto no-scrollbar max-w-full">
              <AdminTabBtn id="labs" icon="fa-microscope" label="Laboratórios" />
              <AdminTabBtn id="events" icon="fa-calendar" label="Cronograma" />
              <AdminTabBtn id="projects" icon="fa-flask" label="Projetos" />
              <AdminTabBtn id="members" icon="fa-users" label="Membros" />
              <AdminTabBtn id="attendance" icon="fa-clipboard-check" label="Presenças" />
              <AdminTabBtn id="ingresso" icon="fa-id-card" label="Seletivo" />
              <AdminTabBtn id="messages" icon="fa-comments" label="Mensagens" />
              <AdminTabBtn id="settings" icon="fa-gears" label="Ajustes" />
           </div>

           <div className="bg-white rounded-[5rem] p-16 shadow-2xl border border-slate-50 min-h-[65vh] max-w-5xl mx-auto flex flex-col">
              
              {/* ADMIN: EVENTS (CRONOGRAMA) MANAGEMENT */}
              {adminTab === 'events' && (
                <div className="w-full space-y-10 animate-in fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Cronograma Acadêmico</h3>
                    <button 
                      onClick={() => setShowEventForm(true)}
                      className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                    >
                      Novo Evento
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(e => (
                      <div key={e.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-black text-xs ${e.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                               {e.date.split('-')[2]}
                            </div>
                            <div className="text-left">
                               <p className="text-xs font-black text-slate-800 uppercase truncate w-40">{e.title}</p>
                               <p className="text-[8px] text-slate-400 font-bold uppercase">{e.date} • {e.time}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEvents(events.map(ev => ev.id === e.id ? { ...ev, ativo: !ev.ativo } : ev));
                              }} 
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${e.ativo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}
                              title={e.ativo ? "Desativar" : "Ativar"}
                            >
                               <i className={`fa-solid ${e.ativo ? 'fa-eye' : 'fa-eye-slash'} text-xs`}></i>
                            </button>
                            <button onClick={() => setEvents(events.filter(ev => ev.id !== e.id))} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                               <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN: ATTENDANCE MANAGEMENT */}
              {adminTab === 'attendance' && (
                <AdminAttendance 
                  attendances={attendances} 
                  events={events} 
                  members={members} 
                  onAddAttendance={(record) => setAttendances([record, ...attendances])} 
                  onDeleteAttendance={(id) => setAttendances(attendances.filter(a => a.id !== id))} 
                />
              )}

              {/* ADMIN: PROJECTS MANAGEMENT */}
              {adminTab === 'projects' && (
                <div className="w-full space-y-10 animate-in fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Gestão de Projetos</h3>
                    <button 
                      onClick={() => setShowProjectForm(true)}
                      className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                    >
                      Novo Projeto
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(p => (
                      <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover border" alt="" />
                            <div className="text-left">
                               <p className="text-xs font-black text-slate-800 uppercase truncate w-40">{p.title}</p>
                               <p className="text-[8px] text-slate-400 font-bold uppercase">{p.status}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => setProjects(projects.filter(proj => proj.id !== p.id))} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                               <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN: MEMBERS MANAGEMENT */}
              {adminTab === 'members' && (
                <AdminMembers 
                  members={members} 
                  onAddMember={(m) => setMembers([m, ...members])} 
                  onDeleteMember={(id) => setMembers(members.filter(m => m.id !== id))} 
                />
              )}

              {/* ADMIN: SELETIVO CANDIDATES */}
              {adminTab === 'ingresso' && (
                <div className="w-full space-y-8 animate-in fade-in">
                  <h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter mb-8">Gestão de Candidatos</h3>
                  <div className="space-y-4">
                    {candidates.map(c => (
                      <div key={c.id} className={`bg-white p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between shadow-sm transition-all ${c.status === 'waiting_list' ? 'border-amber-200 bg-amber-50/20' : 'hover:border-emerald-200'}`}>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-xs uppercase text-slate-800">{c.fullName}</p>
                              {c.status === 'waiting_list' && <span className="text-[7px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase">Lista de Espera</span>}
                              {c.status === 'approved' && <span className="text-[7px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Aprovado</span>}
                            </div>
                            <p className="text-[8px] text-slate-400 uppercase font-bold">{c.email} • {c.registrationId} • {c.semester}</p>
                         </div>
                         <div className="flex gap-2 mt-4 md:mt-0">
                            <button onClick={() => updateCandidateStatus(c.id, 'approved')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-emerald-900/10 hover:scale-105 transition-all">Aprovar</button>
                            <button onClick={() => updateCandidateStatus(c.id, 'waiting_list')} className="bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-amber-200 transition-all">Em Espera</button>
                            <button onClick={() => updateCandidateStatus(c.id, 'rejected')} className="bg-red-50 text-red-400 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Reprovar</button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN: MESSAGES SUPPORT */}
              {adminTab === 'messages' && (
                <div className="flex flex-col lg:flex-row gap-6 h-[500px] animate-in fade-in">
                  <div className={`w-full lg:w-80 bg-slate-50 rounded-3xl border p-4 overflow-y-auto no-scrollbar ${selectedMember ? 'hidden lg:block' : 'block'}`}>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Acadêmicos Vinculados</h3>
                     <div className="space-y-2">
                       {members.map(m => (
                         <button 
                          key={m.id} 
                          onClick={() => {
                            setSelectedMember(m);
                          }}
                          className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 ${selectedMember?.id === m.id ? 'bg-white border-emerald-300 shadow-md ring-2 ring-emerald-50' : 'bg-transparent border-transparent hover:bg-white'}`}
                         >
                            <img src={m.photoUrl} className="w-10 h-10 rounded-full border shadow-sm" alt={m.fullName} />
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-800 uppercase leading-none truncate w-40">{m.fullName}</p>
                            </div>
                         </button>
                       ))}
                     </div>
                  </div>
                  <div className={`flex-1 bg-white rounded-3xl border flex flex-col overflow-hidden relative shadow-inner ${selectedMember ? 'block' : 'hidden lg:flex'}`}>
                     {selectedMember ? (
                       <>
                          <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedMember(null)} className="lg:hidden w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-400"><i className="fa-solid fa-arrow-left"></i></button>
                                <h4 className="text-sm font-black text-slate-800 uppercase">{selectedMember.fullName}</h4>
                             </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 no-scrollbar">
                             {directMessages.filter(m => m.receiverId === selectedMember.id || m.senderId === selectedMember.id).map(msg => (
                               <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.senderId === currentUser.id ? 'bg-[#055c47] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                     <p className="text-xs font-medium">{msg.message}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                          <div className="p-4 border-t flex gap-3 bg-white">
                             <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdminSendMessage()} placeholder="Escrever resposta..." className="flex-1 px-5 rounded-xl border text-sm outline-none" />
                             <button onClick={handleAdminSendMessage} className="w-12 h-12 rounded-xl bg-[#055c47] text-white flex items-center justify-center hover:bg-emerald-800 transition-all shadow-xl active:scale-95"><i className="fa-solid fa-paper-plane"></i></button>
                          </div>
                       </>
                     ) : (
                       <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-30">
                          <i className="fa-solid fa-comments text-5xl mb-4"></i>
                          <p className="text-xs font-black uppercase">Selecione para suporte</p>
                       </div>
                     )}
                  </div>
                </div>
              )}

              {/* ADMIN: LABS MANAGEMENT */}
              {adminTab === 'labs' && (
                <div className="w-full space-y-10 animate-in fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Laboratórios & Núcleos</h3>
                    <button 
                      onClick={() => setShowLabForm(true)}
                      className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                    >
                      Novo Núcleo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {labs.map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group">
                         <div className="text-left">
                            <p className="text-xs font-black text-slate-800 uppercase">{l.title}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">{l.coordinator}</p>
                         </div>
                         <button onClick={() => setLabs(labs.filter(lab => lab.id !== l.id))} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN: SETTINGS */}
              {adminTab === 'settings' && (
                <AdminMembership 
                  settings={membershipSettings} 
                  onUpdateSettings={setMembershipSettings} 
                  onLogoUpload={handleLogoUpload}
                />
              )}
           </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {showProjectForm && (
        <ProjectFormModal 
          onClose={() => setShowProjectForm(false)}
          onSave={(newP) => {
            setProjects([newP, ...projects]);
            setShowProjectForm(false);
          }}
        />
      )}

      {showEventForm && (
        <EventFormModal 
          onClose={() => setShowEventForm(false)}
          onSave={(newE) => {
            setEvents([newE, ...events]);
            setShowEventForm(false);
          }}
        />
      )}

      {showLabForm && (
        <LabFormModal 
          onClose={() => setShowLabForm(false)}
          onSave={(newLab) => {
            setLabs([newLab, ...labs]);
            setShowLabForm(false);
          }}
        />
      )}

      {enrollModal.active && (
        <EnrollmentModal 
          activity={{ 
            id: enrollModal.event?.id || enrollModal.lab?.id || enrollModal.activity?.id || '', 
            title: enrollModal.event?.title || enrollModal.lab?.title || enrollModal.activity?.title || '',
            description: enrollModal.event?.desc || enrollModal.lab?.desc || enrollModal.activity?.description || ''
          }} 
          event={enrollModal.event ? { 
            id: enrollModal.event.id, 
            title: enrollModal.event.title, 
            date: enrollModal.event.date, 
            time: enrollModal.event.time, 
            location: enrollModal.event.location, 
            description: enrollModal.event.desc,
            type: enrollModal.event.category as any,
            ativo: enrollModal.event.ativo,
            projetoExplica: enrollModal.event.projetoExplica
          } : undefined}
          onClose={() => setEnrollModal({ active: false })}
          onSubmit={handleApply}
        />
      )}
    </Layout>
  );
};

export default App;
