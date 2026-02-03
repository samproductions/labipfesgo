
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
  const [isSyncing, setIsSyncing] = useState(true);

  /**
   * SINCRONIZAÇÃO RESILIENTE
   */
  useEffect(() => {
    const bootstrapAppData = async () => {
      try {
        const [cloudMembers, cloudProjects, cloudLabs, cloudEvents] = await Promise.all([
          CloudService.getCloudMembers(),
          CloudService.getCloudProjects(),
          CloudService.getCloudLabs(),
          CloudService.getCloudEvents()
        ]);
        
        if (cloudMembers.length === 0) {
          const initialMembers: Member[] = [
            { id: '1', fullName: 'Maria Silva', email: 'maria@lapib.com', role: 'DIRETORA MARKETING', photoUrl: 'https://ui-avatars.com/api/?name=Maria+S&background=055c47&color=fff', bio: 'Especialista em comunicação científica.', acessoLiberado: true },
            { id: '6', fullName: 'Victor Vilardel', email: MASTER_ADMIN_EMAIL, role: 'PRESIDENTE', photoUrl: 'https://ui-avatars.com/api/?name=Victor+V&background=055c47&color=fff', bio: 'Fundador da LAPIB.', acessoLiberado: true },
          ];
          for (const m of initialMembers) await CloudService.saveMember(m);
          setMembers(initialMembers);
        } else {
          setMembers(cloudMembers);
        }

        setProjects(cloudProjects);
        setLabs(cloudLabs);
        setEvents(cloudEvents);
      } catch (err) {
        console.warn("Firebase offline ou não configurado. Utilizando cache local.");
      } finally {
        setIsSyncing(false);
      }
    };
    bootstrapAppData();
  }, []);

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
        CloudService.saveUser(updatedUser);
      }
    }
  }, [members, currentUser?.email, isAuthenticated, isSyncing]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('lapib_auth_status', 'true');
    localStorage.setItem('lapib_user', JSON.stringify(user));
  };

  const handleToggleMemberAccess = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const newStatus = !member.acessoLiberado;
    await CloudService.updateMemberAccess(memberId, newStatus);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, acessoLiberado: newStatus } : m));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('lapib_auth_status');
    localStorage.removeItem('lapib_user');
    setView('home');
  };

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => JSON.parse(localStorage.getItem('lapib_attendance') || '[]'));
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => JSON.parse(localStorage.getItem('lapib_direct_messages') || '[]'));
  const [candidates, setCandidates] = useState<Candidate[]>(() => JSON.parse(localStorage.getItem('lapib_candidates') || '[]'));
  const [posts, setPosts] = useState<FeedPost[]>(() => JSON.parse(localStorage.getItem('lapib_posts') || '[]'));
  
  const [membershipSettings, setMembershipSettings] = useState<MembershipSettings>(() => {
    const saved = localStorage.getItem('lapib_membership_settings');
    return saved ? JSON.parse(saved) : {
      editalUrl: 'https://example.com/edital.pdf',
      selectionStatus: 'open',
      rules: LEAGUE_INFO.membershipRules,
      calendar: [{ stage: 'Publicação Edital', date: 'AGO/2025' }]
    };
  });

  const [view, setView] = useState<ViewState>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('labs');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showLabForm, setShowLabForm] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [enrollModal, setEnrollModal] = useState<{ active: boolean; event?: CalendarEvent; lab?: Lab; activity?: any }>({ active: false });

  useEffect(() => {
    localStorage.setItem('lapib_candidates', JSON.stringify(candidates));
    localStorage.setItem('lapib_posts', JSON.stringify(posts));
    localStorage.setItem('lapib_attendance', JSON.stringify(attendances));
    localStorage.setItem('lapib_direct_messages', JSON.stringify(directMessages));
  }, [candidates, posts, attendances, directMessages]);

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
      {view === 'iris' && <ChatAssistant members={members} projects={projects} />}
      {view === 'feed' && <Feed posts={posts} user={currentUser} onNavigateToLogin={() => setView('home')} onPostsUpdate={setPosts} />}
      {view === 'events' && <Events events={events} logoUrl={appLogo} onNavigateToActivities={() => setView('labs')} onAction={(ev) => setEnrollModal({ active: true, event: ev })} />}
      {view === 'labs' && <Labs labs={labs} onEnroll={(lab) => setEnrollModal({ active: true, lab })} />}
      {view === 'attendance' && <AttendanceView user={currentUser} attendances={attendances} events={events} />}
      {view === 'members' && <Members members={members} />}
      {view === 'ingresso' && <Membership settings={membershipSettings} onApply={(data) => setCandidates([{...data, id: Date.now().toString(), status: 'pending', timestamp: new Date().toISOString()}, ...candidates])} />}
      {view === 'profile' && <Profile user={currentUser} onUpdateUser={(u) => { setCurrentUser(u); CloudService.saveUser(u); }} />}
      {view === 'secretaria' && <Secretaria user={currentUser} logoUrl={appLogo} />}
      {view === 'messages' && <MessageCenter currentUser={currentUser} messages={directMessages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)} onSendMessage={(txt, file) => setDirectMessages([...directMessages, { id: Date.now().toString(), senderId: currentUser.id, senderName: currentUser.fullName, receiverId: 'admin', message: txt, timestamp: new Date().toISOString(), read: false, fileName: file?.name, fileUrl: file ? URL.createObjectURL(file) : undefined }])} />}
      
      {view === 'projects' && (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-left">
          <header className="text-center mb-20">
            <h2 className="text-5xl font-black text-[#055c47] uppercase tracking-tighter">Projetos Científicos</h2>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mt-3">Pesquisa e Extensão Master</p>
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
                     <button onClick={() => setSelectedProject(p)} className="text-[#055c47] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all self-end">Saber Mais <i className="fa-solid fa-chevron-right text-[8px]"></i></button>
                   </div>
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
              {adminTab === 'events' && <div className="w-full space-y-10"><div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Cronograma</h3><button onClick={() => setShowEventForm(true)} className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Novo Evento</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{events.map(e => (<div key={e.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between"><div><p className="text-xs font-black text-slate-800 uppercase">{e.title}</p><p className="text-[8px] text-slate-400 font-bold uppercase">{e.date}</p></div><button onClick={() => setEvents(events.filter(ev => ev.id !== e.id))} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-trash-can text-xs"></i></button></div>))}</div></div>}
              {adminTab === 'attendance' && <AdminAttendance attendances={attendances} events={events} members={members} onAddAttendance={(record) => setAttendances([record, ...attendances])} onDeleteAttendance={(id) => setAttendances(attendances.filter(a => a.id !== id))} />}
              {adminTab === 'projects' && <div className="w-full space-y-10"><div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Projetos</h3><button onClick={() => setShowProjectForm(true)} className="bg-[#055c47] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Novo Projeto</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{projects.map(p => (<div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group"><div className="flex items-center gap-4"><img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover border" alt="" /><div><p className="text-xs font-black text-slate-800 uppercase">{p.title}</p></div></div><button onClick={() => setProjects(projects.filter(proj => proj.id !== p.id))} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-trash-can text-xs"></i></button></div>))}</div></div>}
              {adminTab === 'members' && <AdminMembers members={members} onAddMember={async (m) => { await CloudService.saveMember(m); setMembers([...members, m]); }} onDeleteMember={(id) => { setMembers(members.filter(m => m.id !== id)); }} onToggleAccess={handleToggleMemberAccess} currentUser={currentUser} />}
              {adminTab === 'ingresso' && <div className="w-full space-y-8"><h3 className="text-3xl font-black text-slate-800 uppercase text-center tracking-tighter mb-8">Candidatos</h3>{candidates.map(c => (<div key={c.id} className="bg-white p-6 rounded-3xl border flex items-center justify-between mb-4"><div><p className="font-black text-xs uppercase">{c.fullName}</p><p className="text-[8px] text-slate-400 uppercase">{c.email}</p></div><div className="flex gap-2"><button onClick={() => setCandidates(candidates.map(x => x.id === c.id ? {...x, status: 'approved'} : x))} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Aprovar</button></div></div>))}</div>}
              {adminTab === 'settings' && <AdminMembership settings={membershipSettings} onUpdateSettings={setMembershipSettings} onLogoUpload={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => { setAppLogo(r.result as string); localStorage.setItem('lapib_logo', r.result as string); }; r.readAsDataURL(f); } }} />}
           </div>
        </div>
      )}

      {selectedProject && <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {showProjectForm && <ProjectFormModal onClose={() => setShowProjectForm(false)} onSave={async (newP) => { await CloudService.saveProject(newP); setProjects([newP, ...projects]); setShowProjectForm(false); }} />}
      {showEventForm && <EventFormModal onClose={() => setShowEventForm(false)} onSave={async (newE) => { await CloudService.saveEvent(newE); setEvents([newE, ...events]); setShowEventForm(false); }} />}
      {showLabForm && <LabFormModal onClose={() => setShowLabForm(false)} onSave={async (newLab) => { await CloudService.saveLab(newLab); setLabs([newLab, ...labs]); setShowLabForm(false); }} />}
      {enrollModal.active && <EnrollmentModal activity={{ id: enrollModal.event?.id || enrollModal.lab?.id || '', title: enrollModal.event?.title || enrollModal.lab?.title || '', description: enrollModal.event?.desc || enrollModal.lab?.desc || '' }} event={enrollModal.event} onClose={() => setEnrollModal({ active: false })} onSubmit={(d) => setCandidates([{...d, id: Date.now().toString(), status: 'pending', timestamp: new Date().toISOString()}, ...candidates])} />}
    </Layout>
  );
};

export default App;
