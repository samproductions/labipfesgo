
import React, { useState } from 'react';
import { UserProfile } from './types';
import { LAPIB_LOGO_BASE64 } from './constants';
import CloudService from './cloudService';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationId: '',
    cpf: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const normalizedEmail = formData.email.toLowerCase().trim();

    // Regra Administrativa Master - Vitalícia
    if (normalizedEmail === 'lapibfesgo@gmail.com' && formData.password === '21140712') {
      const adminUser: UserProfile = {
        id: 'admin-master',
        fullName: 'Administrador Master',
        email: normalizedEmail,
        photoUrl: 'https://ui-avatars.com/api/?name=Admin+Master&background=055c47&color=fff',
        role: 'admin',
        status: 'ativo',
        acessoLiberado: true
      };
      onLogin(adminUser);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Autenticação via Nuvem
        const users = await CloudService.getCloudUsers();
        const user = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail && u.password === formData.password);
        
        if (user) {
          onLogin(user);
        } else {
          alert("Credenciais não localizadas na nuvem. Verifique se o cadastro foi realizado com este e-mail.");
        }
      } else {
        // Registro na Nuvem
        if (!formData.fullName || !normalizedEmail || !formData.password || !formData.registrationId || !formData.cpf) {
          alert("Todos os campos são obrigatórios para sincronização.");
          setLoading(false);
          return;
        }

        const newUser: UserProfile = {
          id: Date.now().toString(),
          fullName: formData.fullName,
          email: normalizedEmail,
          password: formData.password,
          photoUrl: `https://ui-avatars.com/api/?name=${formData.fullName.replace(' ', '+')}&background=f1f5f9&color=055c47`,
          role: 'student',
          cpf: formData.cpf,
          registrationId: formData.registrationId,
          status: 'inativo',
          acessoLiberado: false
        };

        const users = await CloudService.getCloudUsers();
        if (users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail)) {
          alert("Este e-mail já possui um perfil sincronizado na nuvem.");
          setLoading(false);
          return;
        }

        await CloudService.saveUser(newUser);
        alert("Perfil criado e sincronizado! Você já pode acessar de qualquer dispositivo.");
        setIsLogin(true);
      }
    } catch (error) {
      alert("Erro ao conectar com a nuvem LAPIB. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-teal-50 rounded-full blur-3xl opacity-40"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-4 mx-auto mb-6 shadow-2xl border-2 border-slate-50">
            <img src={LAPIB_LOGO_BASE64} className="w-full object-contain" alt="LAPIB" />
          </div>
          <h2 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter">LAPIB Connect</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Sincronização em Nuvem Ativa</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
          <header className="flex mb-10 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button 
              disabled={loading}
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-[#055c47] text-white shadow-lg' : 'text-slate-400'}`}
            >
              Acessar
            </button>
            <button 
              disabled={loading}
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-[#055c47] text-white shadow-lg' : 'text-slate-400'}`}
            >
              Cadastrar
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome Completo</label>
                <input 
                  required
                  disabled={loading}
                  type="text"
                  placeholder="Nome acadêmico"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail Acadêmico</label>
              <input 
                required
                disabled={loading}
                type="email"
                placeholder="academico@exemplo.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
              <input 
                required
                disabled={loading}
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Matrícula</label>
                  <input 
                    required
                    disabled={loading}
                    type="text"
                    placeholder="202X.XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={formData.registrationId}
                    onChange={e => setFormData({...formData, registrationId: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">CPF</label>
                  <input 
                    required
                    disabled={loading}
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-4 focus:ring-[#055c47]/10 focus:border-[#055c47] transition-all"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#055c47] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-dna animate-spin"></i> : (isLogin ? 'Iniciar Sessão' : 'Efetivar Cadastro')}
              {!loading && <i className="fa-solid fa-chevron-right text-[10px]"></i>}
            </button>
          </form>
        </div>

        <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">
          Tecnologia a favor da Biomedicina • Estácio GO
        </p>
      </div>
    </div>
  );
};

export default Auth;
