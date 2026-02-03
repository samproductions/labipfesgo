
import React, { useState } from 'react';
import { Member, UserProfile } from './types';

interface AdminMembersProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onToggleAccess: (id: string) => void; // Nova prop de controle
  currentUser: UserProfile | null;
}

const AdminMembers: React.FC<AdminMembersProps> = ({ members, onAddMember, onDeleteMember, onToggleAccess, currentUser }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMember, setNewMember] = useState<Partial<Member>>({
    fullName: '',
    email: '',
    role: '',
    bio: '',
    lattesUrl: '',
    photoUrl: '',
    acessoLiberado: false
  });

  const isAdminMaster = currentUser?.email === 'lapibfesgo@gmail.com';

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newMember.fullName || !newMember.role || !newMember.email) {
      alert("Por favor, preencha nome, cargo e e-mail.");
      return;
    }
    const member: Member = {
      id: Date.now().toString(),
      fullName: newMember.fullName,
      email: newMember.email,
      role: newMember.role.toUpperCase(),
      photoUrl: newMember.photoUrl || `https://ui-avatars.com/api/?name=${newMember.fullName}&background=055c47&color=fff`,
      bio: newMember.bio,
      lattesUrl: newMember.lattesUrl,
      acessoLiberado: false // Por padrão, novos membros começam bloqueados
    };
    onAddMember(member);
    setNewMember({ fullName: '', email: '', role: '', bio: '', lattesUrl: '', photoUrl: '', acessoLiberado: false });
    setShowAddForm(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMember({ ...newMember, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in text-left">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div>
          <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Acervo do Corpo Acadêmico</h3>
          <p className="text-[10px] text-[#055c47] font-black uppercase tracking-[0.4em] mt-2">Controle Central de Membros e Diretoria</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <input 
              type="text" 
              placeholder="Buscar por nome, cargo ou e-mail..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pl-14 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#055c47] transition-colors"></i>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#055c47] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <i className="fa-solid fa-user-plus text-xs"></i>
            Efetivar Membro
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Identidade Institucional</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Hierarquia / Função</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-2 ring-slate-100 group-hover:ring-[#055c47]/20 transition-all">
                        <img src={member.photoUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-black text-slate-800 uppercase leading-none tracking-tight">{member.fullName}</p>
                        <p className="text-[9px] text-[#055c47] font-bold uppercase mt-1 tracking-widest">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-left">
                    <div className="flex items-center gap-3">
                       <span className="px-4 py-1.5 bg-emerald-50 text-[#055c47] rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                        {member.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      {/* BOTAO DE CONTROLE DE ACESSO - EXCLUSIVO MASTER */}
                      {isAdminMaster && (
                        <button 
                          onClick={() => onToggleAccess(member.id)}
                          className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center shadow-sm ${member.acessoLiberado ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}
                          title={member.acessoLiberado ? "Revogar Acesso Acadêmico" : "Liberar Espaço Acadêmico"}
                        >
                          <i className={`fa-solid ${member.acessoLiberado ? 'fa-lock-open' : 'fa-lock'} text-[11px]`}></i>
                        </button>
                      )}

                      <a 
                        href={member.lattesUrl || "#"} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#055c47] hover:text-white transition-all flex items-center justify-center shadow-sm"
                        title="Ver Lattes"
                      >
                        <i className="fa-solid fa-graduation-cap text-xs"></i>
                      </a>
                      <button 
                        onClick={() => onDeleteMember(member.id)}
                        className="w-11 h-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                        title="Desvincular Membro"
                      >
                        <i className="fa-solid fa-user-minus text-[11px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <div className="opacity-10 mb-6">
                      <i className="fa-solid fa-users-slash text-7xl"></i>
                    </div>
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Nenhum registro localizado no acervo</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 space-y-8 animate-in zoom-in-95 relative overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-bl-full -mr-20 -mt-20 opacity-50"></div>
            
            <header className="relative z-10 text-left border-b border-slate-50 pb-6">
              <h3 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter">Vincular Acadêmico</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Protocolo de Cadastro de Membro Efetivo</p>
            </header>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {newMember.photoUrl ? <img src={newMember.photoUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-slate-200 text-3xl"></i>}
                </div>
                <label className="flex-1 h-14 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-50 transition-all">
                  Upload Foto Local
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Nome Institucional</label>
                  <input 
                    type="text"
                    placeholder="Ex: Victor Vilardell" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[11px] font-bold uppercase outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={newMember.fullName}
                    onChange={e => setNewMember({...newMember, fullName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">E-mail Acadêmico</label>
                  <input 
                    type="email"
                    placeholder="exemplo@estacio.br" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={newMember.email}
                    onChange={e => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Cargo Designado</label>
                  <input 
                    type="text"
                    placeholder="Ex: Diretor Científico" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[11px] font-bold uppercase outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Currículo Lattes (URL)</label>
                  <input 
                    type="text"
                    placeholder="http://lattes.cnpq.br/..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={newMember.lattesUrl}
                    onChange={e => setNewMember({...newMember, lattesUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Breve Memorial Técnico</label>
                <textarea 
                  placeholder="Descreva a formação, áreas de interesse e foco de pesquisa..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[11px] font-bold h-24 resize-none outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                  value={newMember.bio}
                  onChange={e => setNewMember({...newMember, bio: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 relative z-10 pt-4">
              <button 
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
              >
                Descartar
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 bg-[#055c47] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-stamp"></i>
                Confirmar Vínculo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
