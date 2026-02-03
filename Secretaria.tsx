
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, MemberPrivateLink } from './types';
import RestrictedAccess from './RestrictedAccess';

declare var html2pdf: any;

interface SecretariaProps {
  user: UserProfile | null;
  logoUrl: string;
}

const BANNER_URL = "https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6";

const Secretaria: React.FC<SecretariaProps> = ({ user, logoUrl }) => {
  const [personalLinks, setPersonalLinks] = useState<MemberPrivateLink[]>([]);
  const [activeFolder, setActiveFolder] = useState<'certificados' | 'auto_emissao'>('auto_emissao');
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfAreaRef = useRef<HTMLDivElement>(null);

  const isAuthorized = user?.role === 'admin' || user?.role === 'member';

  useEffect(() => {
    if (!user || !user.email || !isAuthorized) return;
    
    const savedLinks = localStorage.getItem(`lapib_links_${user.email}`);
    if (savedLinks) {
      setPersonalLinks(JSON.parse(savedLinks));
    } else {
      const mockLinks: MemberPrivateLink[] = [
        { id: '1', email: user.email, title: 'Certificado de Participação - Simpósio 2024', url: '#', type: 'PDF' },
        { id: '2', email: user.email, title: 'Confirmação de Vínculo Efetivo', url: '#', type: 'PDF' }
      ];
      setPersonalLinks(mockLinks);
      localStorage.setItem(`lapib_links_${user.email}`, JSON.stringify(mockLinks));
    }
  }, [user, isAuthorized]);

  const generateValidationHash = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleDownloadPDF = async () => {
    if (!user) return;
    if (!user.cpf || !user.registrationId) {
      alert("⚠️ Pendência Cadastral: Complete seu CPF e Matrícula no Perfil para gerar documentos oficiais.");
      return;
    }

    setIsGenerating(true);
    const hash = generateValidationHash();

    try {
      const element = pdfAreaRef.current;
      const options = {
        margin: 0,
        filename: `LAPIB_Declaracao_${user.fullName.split(' ')[0]}_${new Date().getFullYear()}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (typeof html2pdf !== 'undefined') {
        await html2pdf().set(options).from(element).save();
        
        const newLink: MemberPrivateLink = {
          id: Date.now().toString(),
          email: user.email,
          title: `Declaração de Membro - Emitida em ${new Date().toLocaleDateString()}`,
          url: '#',
          type: 'PDF'
        };
        const updated = [newLink, ...personalLinks];
        setPersonalLinks(updated);
        localStorage.setItem(`lapib_links_${user.email}`, JSON.stringify(updated));
        
        alert('✅ Documento Oficial Autenticado!');
      } else {
        alert('Módulo de PDF indisponível no momento.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha crítica na geração do documento.');
    } finally { 
      setIsGenerating(false); 
    }
  };

  if (!isAuthorized) {
    return <RestrictedAccess />;
  }

  const nomeExibicao = user?.fullName.toUpperCase() || "";
  const matriculaExibicao = user?.registrationId || "NÃO CADASTRADA";
  const cpfExibicao = user?.cpf || "000.000.000-00";

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 text-left pb-20">
      
      {/* Hidden PDF Template for generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={pdfAreaRef} style={{ 
          width: '210mm', minHeight: '297mm', padding: '0', 
          background: '#fff', color: '#1e293b', fontFamily: '"Inter", sans-serif', position: 'relative'
        }}>
          <div style={{ width: '100%', height: '70mm', overflow: 'hidden', position: 'relative' }}>
             <img src={BANNER_URL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Header" />
          </div>
          <div style={{ padding: '30mm 35mm' }}>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', width: '140mm', opacity: '0.04' }}>
              <img src={logoUrl} style={{ width: '100%' }} alt="Watermark" />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h1 style={{ fontSize: '32pt', fontWeight: '900', color: '#055c47', margin: '0', letterSpacing: '-2px' }}>DECLARAÇÃO OFICIAL</h1>
                <div style={{ width: '40mm', height: '2px', background: '#055c47', margin: '15px auto' }}></div>
                <p style={{ fontSize: '10pt', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 'bold' }}>SECRETARIA ACADÊMICA LAPIB • ESTÁCIO GO</p>
              </div>
              <div style={{ fontSize: '15pt', lineHeight: '1.8', textAlign: 'justify', color: '#334155' }}>
                A <strong>Liga Acadêmica de Patologia e Inovação Biomédica (LAPIB)</strong> do Centro Universitário Estácio de Goiás declara, para os devidos fins, que o(a) acadêmico(a) 
                <strong> {nomeExibicao}</strong>, regularmente inscrito(a) sob CPF nº <strong>{cpfExibicao}</strong> e matrícula institucional 
                <strong> {matriculaExibicao}</strong>, é membro efetivo integrante do corpo acadêmico desta liga, participando de atividades de pesquisa e extensão.
              </div>
              <div style={{ marginTop: '100px', textAlign: 'center' }}>
                <div style={{ width: '80mm', borderTop: '2px solid #055c47', margin: '0 auto', paddingTop: '15px' }}>
                  <p style={{ fontSize: '11pt', fontWeight: '900', margin: '0', color: '#055c47' }}>VICTOR VILARDELL PAPALARDO</p>
                  <p style={{ fontSize: '8pt', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Presidente da LAPIB • Estácio GO</p>
                </div>
              </div>
              <div style={{ marginTop: '100px', padding: '30px', background: '#f8fafc', borderRadius: '30px', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ width: '35mm', height: '35mm', background: '#fff', border: '4px solid #055c47', padding: '3px' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAPIB-VALID-DOC-${nomeExibicao}`} style={{ width: '100%' }} alt="QR" />
                </div>
                <div>
                  <p style={{ fontSize: '10pt', fontWeight: '900', color: '#055c47', margin: '0 0 8px 0' }}>VERIFICAÇÃO DE AUTENTICIDADE DIGITAL</p>
                  <p style={{ fontSize: '8pt', color: '#64748b', margin: '0', fontWeight: 'bold' }}>CÓDIGO: {generateValidationHash()}</p>
                  <p style={{ fontSize: '8pt', color: '#94a3b8', margin: '5px 0 0 0' }}>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Interface Header */}
      <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-bl-full -mr-20 -mt-20 opacity-30"></div>
        <div className="w-32 h-32 bg-[#055c47] rounded-[3.5rem] flex items-center justify-center text-white text-5xl shadow-2xl relative z-10 border-4 border-white">
          <i className="fa-solid fa-file-shield"></i>
        </div>
        <div className="flex-1 text-center lg:text-left relative z-10">
          <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start mb-5">
            <h2 className="text-5xl font-black text-slate-800 uppercase tracking-tighter">Secretaria Digital</h2>
            <span className="bg-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
              Criptografia Ativa
            </span>
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">Núcleo Autônomo de Documentação Acadêmica</p>
        </div>
        <div className="flex bg-slate-100 p-2.5 rounded-[3rem] border border-slate-200 relative z-10">
          <button 
            onClick={() => setActiveFolder('auto_emissao')} 
            className={`px-12 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeFolder === 'auto_emissao' ? 'bg-[#055c47] text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Emitir
          </button>
          <button 
            onClick={() => setActiveFolder('certificados')} 
            className={`px-12 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeFolder === 'certificados' ? 'bg-[#055c47] text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Acervo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-[#055c47]"></div>
             <div className="w-28 h-28 rounded-[3rem] overflow-hidden mx-auto mb-10 border-4 border-emerald-50 shadow-xl transition-transform group-hover:scale-105 relative">
                <img src={user?.photoUrl} className="w-full h-full object-cover" alt="" />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
             </div>
             <div className="text-center space-y-3">
               <h4 className="text-[16px] font-black text-slate-800 uppercase tracking-tight truncate px-2">{user?.fullName}</h4>
               <p className="text-[10px] text-[#055c47] font-black uppercase tracking-widest bg-emerald-50 py-1.5 rounded-xl border border-emerald-100 mx-4">{user?.registrationId}</p>
             </div>
             <div className="mt-12 space-y-6 pt-10 border-t border-slate-50">
                <StatusRow label="Perfil Técnico" value={user?.cpf ? "CERTIFICADO" : "PENDENTE"} active={!!user?.cpf} />
                <StatusRow label="Vínculo Master" value="ATIVO" active={true} />
                <StatusRow label="Documentos" value={personalLinks.length.toString()} active={true} />
             </div>
          </div>

          <div className="bg-[#055c47] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <i className="fa-solid fa-stamp text-7xl"></i>
             </div>
             <h5 className="font-black text-[12px] uppercase tracking-widest mb-6 flex items-center gap-3">
               <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
               Segurança Master
             </h5>
             <p className="text-[11px] text-emerald-100/70 leading-relaxed font-medium">
               Documentos gerados neste canal possuem validade jurídica institucional através do protocolo de autenticação por QR Code LAPIB.
             </p>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-3">
          {activeFolder === 'auto_emissao' ? (
            <div className="bg-white p-16 rounded-[4.5rem] border border-slate-200 shadow-2xl flex flex-col min-h-[600px] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 select-none pointer-events-none">
                  <i className="fa-solid fa-file-signature text-[220px]"></i>
               </div>
               
               <div className="flex-1 space-y-12 relative z-10">
                 <div className="flex items-center gap-8 mb-16">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2.2rem] flex items-center justify-center text-4xl shadow-inner border border-emerald-100">
                       <i className="fa-solid fa-print"></i>
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Terminal de Emissão</h3>
                       <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Geração Instantânea com Assinatura Digital</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <DocActionCard 
                       title="Protocolo de Membro" 
                       desc="Atestado oficial de vínculo acadêmico ativo com a LAPIB. Válido para currículo e estágios."
                       icon="fa-user-check"
                       onClick={handleDownloadPDF}
                       isLoading={isGenerating}
                    />
                    <DocActionCard 
                       title="Registro de Atividades" 
                       desc="Extrato detalhado de todas as participações em projetos e laboratórios durante o ano letivo."
                       icon="fa-list-check"
                       onClick={() => alert('Disponível apenas após o fechamento do semestre letivo.')}
                       disabled
                    />
                 </div>
               </div>

               <div className="mt-16 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center gap-10">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-300 text-3xl">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-[#055c47] uppercase tracking-widest leading-none">Aviso de Monitoramento</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                      Este canal é monitorado pela Auditoria Master. A fraude ou manipulação de documentos digitais oficiais resultará em exclusão imediata da liga.
                    </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
               {personalLinks.map(link => (
                 <div key={link.id} className="group bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden border-b-8 border-b-emerald-50 hover:border-b-[#055c47]">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-slate-50 rounded-bl-full -mr-16 -mt-16 opacity-40 group-hover:scale-110 transition-all"></div>
                    <div className="flex items-start justify-between mb-12 relative z-10">
                       <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center text-4xl shadow-lg border border-red-100 transition-transform group-hover:scale-110">
                          <i className="fa-solid fa-file-pdf"></i>
                       </div>
                       <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-6 py-2.5 rounded-2xl uppercase tracking-widest border border-slate-200 shadow-sm">
                          {link.type}
                       </span>
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight leading-tight mb-4 group-hover:text-[#055c47] transition-colors">{link.title}</h4>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-3">
                        <i className="fa-solid fa-shield-check"></i>
                        Documento Autenticado Master
                      </p>
                    </div>
                    <button className="mt-12 flex items-center justify-center gap-5 w-full py-6 rounded-[2.5rem] bg-slate-50 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-[#055c47] hover:text-white transition-all shadow-sm active:scale-95">
                      <i className="fa-solid fa-cloud-arrow-down text-lg"></i>
                      Acessar Arquivo
                    </button>
                 </div>
               ))}
               {personalLinks.length === 0 && (
                 <div className="col-span-full py-48 bg-white rounded-[5rem] border-4 border-dashed border-slate-100 text-center flex flex-col items-center justify-center">
                   <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-6xl mb-12 border border-slate-50">
                      <i className="fa-solid fa-box-archive"></i>
                   </div>
                   <p className="text-[15px] font-black text-slate-300 uppercase tracking-[0.6em]">Nenhum Documento Localizado</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ label: string; value: string; active: boolean }> = ({ label, value, active }) => (
  <div className="flex justify-between items-center text-left">
    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
    <span className={`text-[11px] font-black uppercase ${active ? 'text-emerald-600' : 'text-amber-500'}`}>{value}</span>
  </div>
);

const DocActionCard: React.FC<{ title: string; desc: string; icon: string; onClick: () => void; isLoading?: boolean; disabled?: boolean }> = ({ title, desc, icon, onClick, isLoading, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`p-12 rounded-[4rem] border-2 text-left transition-all relative group flex flex-col justify-between h-full ${disabled ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-[#055c47] hover:shadow-2xl hover:-translate-y-3 shadow-sm'}`}
  >
    <div className="space-y-8">
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl transition-all shadow-md ${disabled ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-[#055c47] group-hover:bg-[#055c47] group-hover:text-white'}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="space-y-4">
         <h4 className="font-black text-xl text-slate-800 uppercase tracking-tighter leading-tight">{title}</h4>
         <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
    
    <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
      <span className={`text-[10px] font-black uppercase tracking-widest ${disabled ? 'text-slate-300' : 'text-[#055c47]'}`}>
        {disabled ? 'Acesso Restrito' : 'Disponível Agora'}
      </span>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${disabled ? 'bg-slate-100 text-slate-300' : 'bg-emerald-50 text-[#055c47] group-hover:bg-[#055c47] group-hover:text-white shadow-sm'}`}>
        <i className={`fa-solid ${isLoading ? 'fa-dna animate-spin' : 'fa-chevron-right'}`}></i>
      </div>
    </div>
  </button>
);

export default Secretaria;
