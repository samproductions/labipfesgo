
import React, { useState } from 'react';
import { UserProfile } from './types';
import { LAPIB_LOGO_BASE64 } from './constants';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    registrationId: '',
    cpf: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalização imediata dos dados de entrada
    const normalizedEmail = formData.email.toLowerCase().trim();

    // Regra Administrativa Master - Vitalícia
    if (normalizedEmail === 'lapibfesgo@gmail.com' && formData.password === '21140712') {
      const adminUser: UserProfile = {
        id: 'admin-master',
        fullName: 'Administrador Master',
        email: normalizedEmail,
        photoUrl: 'https://ui-avatars.com/api/?name=Admin+Master&background=055c47&color=fff',
        role: 'admin',
        status: 'ativo'
      };
      onLogin(adminUser);
      return;
    }

    if (isLogin) {
      // Autenticação de Usuário Comum com Normalização de E-mail
      const users = JSON.parse(localStorage.getItem('lapib_registered_users') || '[]');
      const user = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail && u.password === formData.password);
      
      if (user) {
        onLogin(user);
      } else {
        alert("Credenciais inválidas. Verifique seu e-mail e senha. Certifique-se de não haver espaços extras.");
      }
    } else {
      // Cadastro de Novo Perfil Acadêmico
      if (!formData.fullName || !normalizedEmail || !formData.password || !formData.registrationId || !formData.cpf) {
        alert("Todos os campos de registro são obrigatórios.");
        return;
      }

      const newUser: UserProfile = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: normalizedEmail, // Armazena já normalizado
        password: formData.password,
        photoUrl: `https://ui-avatars.com/api/?name=${formData.fullName.replace(' ', '+')}&background=f1f5f9&color=055c47`,
        role: 'student',
        cpf: formData.cpf,
        registrationId: formData.registrationId,
        status: 'inativo'
      };

      const users = JSON.parse(localStorage.getItem('lapib_registered_users') || '[]');
      if (users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail)) {
        alert("Este e-mail já está vinculado a um perfil acadêmico.");
        return;
      }

      localStorage.setItem('lapib_registered_users', JSON.stringify([...users, newUser]));
      alert("Perfil acadêmico criado com sucesso! Realize o acesso agora.");
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-teal-50 rounded-full blur-3xl opacity-40"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-4 mx-auto mb-6 shadow-2xl border-2 border-slate-50">
            <img src={LAPIB_LOGO_BASE64} className="w-full object-contain" alt="LAPIB" />
          </div>
          <h2 className="text-3xl font-black text-[#055c47] uppercase tracking-tighter">LAPIB Connect</h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">Plataforma Digital de Pesquisa</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
          <header className="flex mb-10 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-[#055c47] text-white shadow-lg' : 'text-slate-400'}`}
            >
              Acessar
            </button>
            <button 
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
                  type="text"
                  placeholder="Seu nome acadêmico"
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
              className="w-full bg-[#055c47] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {isLogin ? 'Iniciar Sessão' : 'Efetivar Cadastro'}
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
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
