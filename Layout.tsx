import React, { useState } from 'react';
import { ViewState, UserProfile } from './types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: UserProfile | null;
  onLogout: () => void;
  logoUrl: string;
  unreadCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user, onLogout, logoUrl, unreadCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateAndClose = (view: ViewState) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';
  const isAuthorized = isAdmin || isMember;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#055c47] text-white flex items-center justify-between px-6 z-[60] shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logoUrl} className="w-8 h-8 rounded-full bg-white p-0.5 object-contain" alt="LAPIB" />
          <span className="font-black text-sm tracking-widest uppercase">LAPIB</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 flex items-center justify-center relative">
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-dna animate-pulse'} text-xl`}></i>
          {unreadCount > 0 && !isMenuOpen && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#055c47]"></span>
          )}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-50 md:sticky md:top-0 md:left-0
        transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-500 ease-in-out
        w-full md:w-72 bg-[#055c47] flex flex-col shrink-0 h-full shadow-2xl
      `}>
        <div className="p-10 flex flex-col items-center shrink-0">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-3 mb-4 shadow-2xl overflow-hidden border-2 border-white/20 cursor-pointer" onClick={() => navigateAndClose('home')}>
            <img src={logoUrl} className="w-full object-contain" alt="Logo" />
          </div>
          <h2 className="text-white font-black text-xs tracking-[0.2em] uppercase">LAPIB CONNECT</h2>
        </div>

        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto no-scrollbar pb-10">
          <NavItem id="home" icon="fa-house" label="Início" active={activeView === 'home'} onClick={() => navigateAndClose('home')} />
          <NavItem id="iris" icon="fa-robot" label="Iris IA" active={activeView === 'iris'} onClick={() => navigateAndClose('iris')} />
          <NavItem id="feed" icon="fa-rss" label="Feed Pesquisa" active={activeView === 'feed'} onClick={() => navigateAndClose('feed')} />
          <NavItem id="projects" icon="fa-flask" label="Projetos" active={activeView === 'projects'} onClick={() => navigateAndClose('projects')} />
          <NavItem id="members" icon="fa-users" label="Membros" active={activeView === 'members'} onClick={() => navigateAndClose('members')} />
          
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-6 py-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Espaço Acadêmico</p>
            <NavItem id="events" icon="fa-calendar" label="Cronograma" active={activeView === 'events'} onClick={() => navigateAndClose('events')} />
            <NavItem id="labs" icon="fa-microscope" label="Laboratórios" active={activeView === 'labs'} onClick={() => navigateAndClose('labs')} />
            <NavItem id="ingresso" icon="fa-id-card" label="Ingresso na Liga" active={activeView === 'ingresso'} onClick={() => navigateAndClose('ingresso')} />
            
            {isAuthorized && (
              <>
                <NavItem id="secretaria" icon="fa-file-shield" label="Secretaria Digital" active={activeView === 'secretaria'} onClick={() => navigateAndClose('secretaria')} />
                <NavItem id="messages" icon="fa-comment" label="Mensagens" active={activeView === 'messages'} onClick={() => navigateAndClose('messages')} badge={unreadCount > 0} />
              </>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
             <p className="px-6 py-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Configurações</p>
             <NavItem id="profile" icon="fa-user-gear" label="Meu Perfil" active={activeView === 'profile'} onClick={() => navigateAndClose('profile')} />
          </div>

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-6 py-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Diretoria</p>
              <NavItem id="admin" icon="fa-shield-halved" label="Painel Master" active={activeView === 'admin'} onClick={() => navigateAndClose('admin')} />
            </div>
          )}
        </nav>

        <div className="p-6 mt-auto bg-[#044a3a]/40 shrink-0">
          {user ? (
            <div className="flex items-center gap-4">
              <img src={user.photoUrl} className="w-10 h-10 rounded-xl border border-white/20 object-cover shadow-lg" alt="Avatar" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[10px] uppercase tracking-wider truncate">{user.fullName}</p>
                <button onClick={onLogout} className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Sair da Conta</button>
              </div>
            </div>
          ) : (
            <button onClick={() => navigateAndClose('home')} className="w-full bg-white text-[#055c47] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Portal Aluno</button>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0 no-scrollbar">
        <div className="p-6 md:p-14 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ id: string; icon: string; label: string; active: boolean; onClick: () => void; badge?: boolean }> = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-3.5 transition-all group ${active ? 'bg-white text-[#055c47] rounded-xl shadow-lg' : 'text-white/60 hover:text-white'}`}>
    <div className="flex items-center gap-4">
      <i className={`fa-solid ${icon} w-5 text-center transition-transform group-hover:scale-110`}></i>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {badge && <span className="w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
  </button>
);

export default Layout;