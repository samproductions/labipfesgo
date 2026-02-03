
import React, { useState } from 'react';
import { UserProfile } from './types';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [cpf, setCpf] = useState(user.cpf || '');
  const [registrationId, setRegistrationId] = useState(user.registrationId || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    const updatedUser = { ...user, fullName, cpf, registrationId, photoUrl };
    onUpdateUser(updatedUser);
    setIsEditing(false);
    setLoading(false);
    alert('✅ Perfil atualizado! Seus dados acadêmicos foram sincronizados para emissão de documentos.');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#055c47] to-[#044a3a] relative">
          <div className="absolute -bottom-14 left-10">
            <div className="relative group">
              <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white overflow-hidden bg-white shadow-2xl">
                <img 
                  src={photoUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=055c47&color=fff`} 
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center cursor-pointer group-hover:bg-black/60 transition">
                  <i className="fa-solid fa-camera text-white text-2xl"></i>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">{user.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${user.role === 'student' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  {user.role === 'admin' ? 'DIRETORIA MASTER' : (user.role === 'member' ? 'MEMBRO EFETIVO' : 'VISITANTE / ESTUDANTE')}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${user.status === 'ativo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {user.status === 'ativo' ? 'Vínculo Ativo' : 'Aguardando Aprovação'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-sm ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-[#055c47] text-white hover:bg-black'}`}
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
              <input 
                disabled={!isEditing}
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-50 font-bold"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">CPF (Certificados)</label>
              <input 
                disabled={!isEditing}
                type="text"
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-50 font-bold"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Matrícula Acadêmica</label>
              <input 
                disabled={!isEditing}
                type="text"
                placeholder="202X.XXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-50 font-bold"
                value={registrationId}
                onChange={e => setRegistrationId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Acadêmico</label>
              <input 
                disabled
                type="text"
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm opacity-50 font-bold cursor-not-allowed"
                value={user.email}
              />
            </div>

            {isEditing && (
              <div className="col-span-full pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#055c47] text-white font-black py-5 rounded-2xl hover:bg-black transition shadow-xl flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                >
                  {loading ? <i className="fa-solid fa-dna animate-spin text-xl"></i> : 'Salvar e Sincronizar'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <h3 className="font-black text-[#055c47] uppercase text-[10px] tracking-[0.3em] mb-8">Informação do Vínculo Acadêmico</h3>
        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-6">
           <i className="fa-solid fa-circle-info text-emerald-600 text-2xl mt-1"></i>
           <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Sincronização de Documentos Digitais</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                Seu status de vínculo é gerenciado pela diretoria master. {user.role === 'student' ? 'Como visitante, você pode visualizar as frentes públicas da liga, mas precisa de aprovação em processo seletivo para acessar o Espaço Acadêmico restrito.' : 'Você possui acesso total às ferramentas de gestão, laboratórios e secretaria digital.'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
