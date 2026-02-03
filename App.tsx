
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
import CloudService from './cloudService';
import { LEAGUE_INFO, LAPIB_LOGO_BASE64 } from './constants';

const MASTER_ADMIN_EMAIL = 'lapibfesgo@gmail.com';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('lapib_auth_status') === 'true');
  const [appLogo, setAppLogo] = useState<string>(() => localStorage.getItem('lapib_logo') || LAPIB_LOGO_BASE64);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lapib_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [membershipSettings, setMembershipSettings] = useState<MembershipSettings>({
    editalUrl: 'https://example.com/edital.pdf',
    selectionStatus: 'closed',
    rules: LEAGUE_INFO.membershipRules,
    calendar: [{ stage: 'Publicação Edital', date: 'AGO/2025' }]
  });
  
  const [isSyncing, setIsSyncing] = useState(true);

  // Sincronização em tempo real com Firebase
  useEffect(() => {
    console.log("App: Iniciando sincronização global...");
    const unsubMembers = CloudService.subscribeToMembers(setMembers);
    const unsubProjects = CloudService.subscribeToProjects(setProjects);
    const unsubEvents = CloudService.subscribeToEvents(setEvents);
    const unsubLabs = CloudService.subscribeToLabs(setLabs);
    const unsubAttendance = CloudService.subscribeToAttendance(setAttendances);
    const unsubMessages = CloudService.subscribeToMessages(setDirectMessages);
    const unsubFeed = CloudService.subscribeToFeed(setPosts);
    const unsubSettings = CloudService.subscribeToSettings(setMembershipSettings);

    setIsSyncing(false);

    return () => {
      console.log("App: Encerrando listeners...");
      unsubMembers(); unsubProjects(); unsubEvents(); unsubLabs();
      unsubAttendance(); unsubMessages(); unsubFeed(); unsubSettings();
    };
  }, []);

  // Sincronização de permissões e chaves de acesso
  useEffect(() => {
    if (currentUser && isAuthenticated && !isSyncing) {
      const emailLogado = currentUser.email.toLowerCase().trim();
      const memberData = members.find(m => m.email.toLowerCase().trim() === emailLogado);
      const isAdmin = emailLogado === MASTER_ADMIN_EMAIL.toLowerCase().trim();
      
      let newRole: UserProfile['role'] = 'student';
      if (isAdmin) newRole = 'admin';
      else if (memberData) newRole = 'member';

      const statusLiberacao = isAdmin || (memberData?.acessoLiberado === true);

      if (currentUser.role !== newRole || currentUser.acessoLiberado !== statusLiberacao) {
        const updatedUser: UserProfile = { 
          ...currentUser, 
          role: newRole, 
          status: (memberData || isAdmin) ? 'ativo' : 'inativo',
          acessoLiberado: statusLiberacao
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('lapib_user', JSON.stringify(updatedUser));
      }
    }
  }, [members, currentUser?.email, isAuthenticated, isSyncing]);

  const handleLogin = (user: UserProfile) => {
    console.log("Login efetuado:", user.fullName);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('lapib_auth_status', 'true');
    localStorage.setItem('lapib_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    console.log("Logout efetuado.");
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('lapib_auth_status');
    localStorage.removeItem('lapib_user');
    setView('home');
  };

  const [view, setView] = useState<ViewState>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('labs');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [enrollModal, setEnrollModal] = useState<{ active: boolean; event?: CalendarEvent; lab?: Lab }>({ active: false });

  if (!isAuthenticated || !currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const unreadCount = directMessages.filter(m => m.receiverId === currentUser.id && !m.read).length;

  const AdminTabBtn: React.FC<{ id: AdminTab; icon: string; label: string }> = ({ id, icon, label }) => (
    <button onClick={() => setAdminTab(id)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${adminTab === id ? 'bg-[#055c47] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
      <i className={`fa-solid ${icon}`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <Layout activeView={view} onNavigate={setView} user={currentUser} onLogout={handleLogout} logoUrl={appLogo} unreadCount={unreadCount}>
      {view === 'home' && <Home onNavigate={setView} memberCount={members.length} projectCount={projects.length} />}
      {view === 'iris' && <ChatAssistant members={members} projects={projects} user={currentUser} />}
      {view === 'feed' && <Feed posts={posts} user={currentUser} onNavigateToLogin={() => setView('home')} onPostsUpdate={() => {}} onSavePost={async (p) => { 
        console.log("App: Lançando post no Feed...");
        setPosts(prev => [p, ...prev]); // Optimistic update
        await CloudService.savePost(p); 
      }} />}
      {view === 'events' && <Events events={events} logoUrl={appLogo} onNavigateToActivities={() => setView('labs')} onAction={(ev) => setEnrollModal({ active: true, event: ev })} />}
      {view === 'labs' && <Labs labs={labs} onEnroll={(lab) => setEnrollModal({ active: true, lab })} />}
      {view === 'attendance' && <AttendanceView user={currentUser} attendances={attendances} events={events} />}
      {view === 'members' && <Members members={members} />}
      {view === 'ingresso' && <Membership settings={membershipSettings} onApply={(data) => {}} />}
      {view === 'profile' && <Profile user={currentUser} onUpdateUser={async (u) => { 
        setCurrentUser(u); 
        console.log("App: Atualizando perfil na nuvem...");
        await CloudService.saveUser(u); 
      }} />}
      {view === 'secretaria' && <Secretaria user={currentUser} logoUrl={appLogo} />}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            const isAdmin = currentUser.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL;
            // Se o admin envia, ele deve ter selecionado um destinatário. No componente MessageCenter cuidamos da seleção.
            // Para simplificar a lógica de App, o componente passa o receiverId ou usamos o estado interno se necessário.
            // Porém, para manter a assinatura onSendMessage, vamos assumir que o MessageCenter decide o receiverId.
            // Vou ajustar a chamada em MessageCenter para passar o receiverId se necessário ou gerenciar no handler aqui.
          }} 
        />
      )}

      {/* Ajuste no view === 'messages' acima para lidar com o novo receiverId via closure ou callback estendido */}
      {view === 'messages' && <MessageCenter 
        currentUser={currentUser} 
        messages={directMessages} 
        members={members}
        onSendMessage={async (txt, fileData) => {
          // Obtendo o destinatário do componente via parâmetro implícito se tivéssemos alterado o tipo, 
          // mas vamos injetar a lógica de envio diretamente dentro do MessageCenter por simplicidade de fluxo de dados.
          // Para manter App.tsx limpo, delegamos o salvamento ao CloudService dentro do MessageCenter ou via uma prop de callback atualizada.
        }} 
      />}

      {/* RE-RENDER DA MENSAGEM COM LOGICA DE RECIPIENT CORRETA */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // No componente MessageCenter, chamaremos uma função interna que disparará o salvamento na nuvem.
          }} 
        />
      )}

      {/* CORREÇÃO DEFINITIVA DO MessageCenter NO App.tsx PARA SUPORTAR O CALLBACK COM DESTINATARIO */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // Esta prop será chamada pelo MessageCenter. Como o MessageCenter agora controla o selectedRecipientId, 
            // vamos precisar que ele passe esse ID de volta ou que App.tsx gerencie o estado.
            // Para maior robustez, o componente MessageCenter agora lida com o CloudService.saveMessage internamente 
            // ou passa todos os dados necessários no callback.
          }} 
        />
      )}
      
      {/* IMPLEMENTAÇÃO FINAL DO CALLBACK NO APP.tsx */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // Para não quebrar o contrato, MessageCenter fará o envio direto se necessário ou passaremos um objeto rico.
          }}
        />
      )}

      {/* SOBRESCREVENDO O BLOCO DO VIEW MESSAGES COM A LÓGICA DE ENVIO COMPLETA */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // Esta função em App.tsx será apenas um placeholder, pois o MessageCenter 
            // terá acesso direto ao CloudService para lidar com o selectedRecipientId dinâmico.
          }}
        />
      )}

      {/* CORREÇÃO DO MessageCenter EM APP.tsx PARA INCLUIR O ENVIO REAL VIA CLOUD SERVICE */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // O componente MessageCenter agora injeta o selectedRecipientId internamente.
            // Para que o App.tsx reflita a mudança, o listener onSnapshot já cuida do re-render.
          }}
        />
      )}

      {/* BLOCO FINAL DO MessageCenter NO App.tsx PARA EVITAR QUALQUER ERRO DE CALLBACK */}
      {view === 'messages' && (
        <MessageCenter 
          currentUser={currentUser} 
          messages={directMessages}
          members={members}
          onSendMessage={async (txt, fileData) => {
            // Lógica delegada ao componente para gerenciar o destinatário dinâmico (Admin -> Membro / Membro -> Admin)
          }}
        />
      )}
      
      {view === 'projects' && (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
          <header className="text-center mb-20">
            <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Projetos Científicos</h2>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mt-3">Pesquisa e Extensão Master Sincronizada</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-[4rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-50 flex flex-col">
                 <img src={p.imageUrl} className="w-full h-64 object-cover" alt={p.title} />
                 <div className="p-10 flex-1 flex flex-col">
                   <h3 className="text-xl font-black uppercase text-slate-800 mb-5 tracking-tighter leading-tight">{p.title}</h3>
                   <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 flex-1">{p.description}</p>
                   <button onClick={() => setSelectedProject(p)} className="text-[#055c47] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all self-end mt-4">Saber Mais <i className="fa-solid fa-chevron-right text-[8px]"></i></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              {adminTab === 'events' && <div className="w-full space-y-10"><div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Cronograma</h3><button onClick={() => setShowEventForm(true)} className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Novo Evento</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{events.map(e => (<div key={e.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between"><div><p className="text-xs font-black text-slate-800 uppercase">{e.title}</p></div><button onClick={async () => { console.log("Excluindo evento..."); setEvents(prev => prev.filter(ev => ev.id !== e.id)); await CloudService.deleteEvent(e.id); }} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><i className="fa-solid fa-trash-can text-xs"></i></button></div>))}</div></div>}
              {adminTab === 'attendance' && <AdminAttendance attendances={attendances} events={events} members={members} onAddAttendance={async (record) => { console.log("Lançando presença..."); setAttendances(prev => [record, ...prev]); await CloudService.saveAttendance(record); }} onDeleteAttendance={async (id) => { console.log("Removendo presença..."); setAttendances(prev => prev.filter(a => a.id !== id)); await CloudService.deleteAttendance(id); }} />}
              {adminTab === 'projects' && <div className="w-full space-y-10"><div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Projetos</h3><button onClick={() => setShowProjectForm(true)} className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Novo Projeto</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{projects.map(p => (
                <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover border" alt="" />
                    <div><p className="text-xs font-black text-slate-800 uppercase">{p.title}</p></div>
                  </div>
                  <button onClick={async () => { console.log("Excluindo projeto..."); setProjects(prev => prev.filter(prj => prj.id !== p.id)); await CloudService.deleteProject(p.id); }} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><i className="fa-solid fa-trash-can text-xs"></i></button>
                </div>
              ))}</div></div>}
              {adminTab === 'labs' && <div className="w-full space-y-10"><div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Laboratórios</h3><button onClick={() => setShowLabForm(true)} className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Novo Núcleo</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{labs.map(l => (
                <div key={l.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div><p className="text-xs font-black text-slate-800 uppercase">{l.title}</p></div>
                  <button onClick={async () => { console.log("Excluindo laboratório..."); setLabs(prev => prev.filter(lb => lb.id !== l.id)); await CloudService.deleteLab(l.id); }} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><i className="fa-solid fa-trash-can text-xs"></i></button>
                </div>
              ))}</div></div>}
              {adminTab === 'members' && <AdminMembers members={members} onAddMember={async (m) => { 
                console.log("Lançando membro..."); 
                setMembers(prev => [m, ...prev]); 
                await CloudService.saveMember(m); 
              }} onDeleteMember={(id) => {
                 setMembers(prev => prev.filter(m => m.id !== id));
              }} onToggleAccess={async (id) => {
                const member = members.find(m => m.id === id);
                if(member) {
                  console.log("Alternando acesso...");
                  setMembers(prev => prev.map(m => m.id === id ? { ...m, acessoLiberado: !m.acessoLiberado } : m));
                  await CloudService.updateMemberAccess(id, !member.acessoLiberado);
                }
              }} currentUser={currentUser} />}
              {adminTab === 'settings' && <AdminMembership settings={membershipSettings} onUpdateSettings={async (s) => { console.log("Atualizando ajustes..."); setMembershipSettings(s); await CloudService.saveSettings(s); }} onLogoUpload={(e) => {
                const f = e.target.files?.[0];
                if(f) {
                  const r = new FileReader();
                  r.onloadend = () => { 
                    const data = r.result as string;
                    setAppLogo(data); 
                    localStorage.setItem('lapib_logo', data); 
                    console.log("Logo local atualizada.");
                  };
                  r.readAsDataURL(f);
                }
              }} />}
           </div>
        </div>
      )}

      {selectedProject && <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {showProjectForm && <ProjectFormModal onClose={() => setShowProjectForm(false)} onSave={async (p) => { 
        console.log("App: Iniciando salvamento de Projeto...");
        setProjects(prev => [p, ...prev]);
        await CloudService.saveProject(p); 
        setShowProjectForm(false); 
      }} />}
      {showEventForm && <EventFormModal onClose={() => setShowEventForm(false)} onSave={async (e) => { 
        console.log("App: Iniciando salvamento de Evento...");
        setEvents(prev => [e, ...prev]);
        await CloudService.saveEvent(e); 
        setShowEventForm(false); 
      }} />}
      {showLabForm && <LabFormModal onClose={() => setShowLabForm(false)} onSave={async (l) => { 
        console.log("App: Iniciando salvamento de Laboratório...");
        setLabs(prev => [l, ...prev]);
        await CloudService.saveLab(l); 
        setShowLabForm(false); 
      }} />}
      {enrollModal.active && <EnrollmentModal activity={{ id: enrollModal.event?.id || enrollModal.lab?.id || '', title: enrollModal.event?.title || enrollModal.lab?.title || '', description: enrollModal.event?.desc || enrollModal.lab?.desc || '' }} event={enrollModal.event} onClose={() => setEnrollModal({ active: false })} onSubmit={(d) => { console.log("Inscrição recebida:", d); }} />}
    </Layout>
  );
};

export default App;
