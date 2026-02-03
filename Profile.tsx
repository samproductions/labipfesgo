
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
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${user.role === 'admin' ? 'bg-emerald-600 text-white border-emerald-400' : (user.role === 'member' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200')}`}>
                  {user.role === 'admin' ? 'DIRETORIA MASTER' : (user.role === 'member' ? 'MEMBRO EFETIVO' : 'VISITANTE / ESTUDANTE')}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${user.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
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
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Acadêmico</label>
              <input 
                disabled
                type="text"
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm opacity-50 font-bold cursor-not-allowed"
                value={user.email}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">CPF (Registro Oficial)</label>
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
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Matrícula Estácio GO</label>
              <input 
                disabled={!isEditing}
                type="text"
                placeholder="202X.XXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-50 font-bold"
                value={registrationId}
                onChange={e => setRegistrationId(e.target.value)}
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
        <h3 className="font-black text-[#055c47] uppercase text-[10px] tracking-[0.3em] mb-8">Selo de Identidade Acadêmica</h3>
        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
             <i className="fa-solid fa-stamp text-7xl"></i>
           </div>
           <div className="w-20 h-20 bg-white border-2 border-emerald-500 rounded-full flex flex-col items-center justify-center -rotate-12 shadow-lg shrink-0">
             <span className="text-[6px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Membro</span>
             <span className="text-sm font-black text-emerald-700 leading-none">LAPIB</span>
             <span className="text-[5px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-0.5">EFETIVO</span>
           </div>
           <div className="space-y-2 text-left">
              <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-none">Vínculo Sincronizado em Tempo Real</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                {user.acessoLiberado 
                  ? 'Sua chave de acesso está validada. Você possui permissão total para laboratórios, projetos e secretaria digital.'
                  : 'Seu perfil está aguardando vinculação oficial pelo Administrador Master para liberação do Espaço Acadêmico.'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
