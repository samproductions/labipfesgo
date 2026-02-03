
import { db, storage, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  getDoc,
  updateDoc, 
  query, 
  orderBy,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";
import { UserProfile, Member, Project, CalendarEvent, Lab, AttendanceRecord, DirectMessage, MembershipSettings, FeedPost } from './types';

class CloudService {
  /** 
   * LISTENERS EM TEMPO REAL
   */
  static subscribeToMembers(callback: (members: Member[]) => void) {
    if (!isFirebaseConfigured) {
      console.warn("Firebase não configurado. Verifique as chaves de API.");
      return () => {};
    }
    console.log("Iniciando listener de Membros...");
    return onSnapshot(collection(db, "members"), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      console.log(`Sincronizados ${members.length} membros.`);
      callback(members);
    });
  }

  static subscribeToProjects(callback: (projects: Project[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Iniciando listener de Projetos...");
    const q = query(collection(db, "projects"), orderBy("startDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      console.log(`Sincronizados ${projects.length} projetos.`);
      callback(projects);
    });
  }

  static subscribeToEvents(callback: (events: CalendarEvent[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Iniciando listener de Eventos...");
    return onSnapshot(collection(db, "events"), (snapshot) => {
      const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CalendarEvent));
      console.log(`Sincronizados ${events.length} eventos.`);
      callback(events);
    });
  }

  static subscribeToLabs(callback: (labs: Lab[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Iniciando listener de Laboratórios...");
    return onSnapshot(collection(db, "labs"), (snapshot) => {
      const labs = snapshot.docs.map(doc => doc.data() as Lab);
      console.log(`Sincronizados ${labs.length} laboratórios.`);
      callback(labs);
    });
  }

  static subscribeToAttendance(callback: (data: AttendanceRecord[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
      callback(records);
    });
  }

  static subscribeToMessages(callback: (data: DirectMessage[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data() as DirectMessage);
      callback(msgs);
    });
  }

  static subscribeToSettings(callback: (data: MembershipSettings) => void) {
    if (!isFirebaseConfigured) return () => {};
    return onSnapshot(doc(db, "settings", "membership"), (snapshot) => {
      if (snapshot.exists()) callback(snapshot.data() as MembershipSettings);
    });
  }

  static subscribeToFeed(callback: (posts: FeedPost[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    const q = query(collection(db, "feed"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => doc.data() as FeedPost);
      callback(posts);
    });
  }

  /**
   * MÉTODOS DE SALVAMENTO
   */
  static async uploadFile(base64Data: string, path: string): Promise<string> {
    if (!base64Data || !base64Data.includes('base64,')) return base64Data;
    if (!isFirebaseConfigured) return base64Data;
    try {
      console.log(`Iniciando upload para: ${path}`);
      const storageRef = ref(storage, path);
      // Extrair apenas o dado base64 puro se necessário, mas uploadString data_url cuida disso
      await uploadString(storageRef, base64Data, 'data_url');
      const url = await getDownloadURL(storageRef);
      console.log(`Upload concluído: ${url}`);
      return url;
    } catch (e) { 
      console.error("Erro no Upload:", e);
      return base64Data; 
    }
  }

  static async saveUser(user: UserProfile): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Salvando Usuário:", user.email);
      let finalPhoto = user.photoUrl;
      if (user.photoUrl?.startsWith('data:')) {
        finalPhoto = await this.uploadFile(user.photoUrl, `profiles/${user.email}`);
      }
      await setDoc(doc(db, "users", user.email.toLowerCase().trim()), { ...user, photoUrl: finalPhoto });
      console.log("Usuário salvo com sucesso.");
    } catch (e) { console.error("Erro ao salvar usuário:", e); }
  }

  static async saveMember(member: Member): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Lançando Membro:", member.fullName);
      let finalPhoto = member.photoUrl;
      if (member.photoUrl?.startsWith('data:')) {
        finalPhoto = await this.uploadFile(member.photoUrl, `members/${member.id}`);
      }
      await setDoc(doc(db, "members", member.id), { ...member, photoUrl: finalPhoto });
      console.log("Membro protocolado no sistema.");
    } catch (e) { console.error("Erro ao salvar membro:", e); }
  }

  static async updateMemberAccess(memberId: string, status: boolean): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log(`Atualizando acesso do membro ${memberId} para: ${status}`);
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, { acessoLiberado: status });
    } catch (e) { console.error("Erro ao atualizar acesso:", e); }
  }

  static async saveProject(project: Project): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Lançando Projeto:", project.title);
      let finalImg = project.imageUrl;
      if (project.imageUrl?.startsWith('data:')) {
        finalImg = await this.uploadFile(project.imageUrl, `projects/${project.id}`);
      }
      await setDoc(doc(db, "projects", project.id), { ...project, imageUrl: finalImg });
      console.log("Projeto publicado com sucesso.");
    } catch (e) { console.error("Erro ao publicar projeto:", e); }
  }

  static async deleteProject(id: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Excluindo Projeto:", id);
      await deleteDoc(doc(db, "projects", id));
    } catch (e) { console.error("Erro ao deletar projeto:", e); }
  }

  static async saveEvent(event: CalendarEvent): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Lançando Evento:", event.title);
      let finalImg = event.imageUrl;
      if (event.imageUrl?.startsWith('data:')) {
        finalImg = await this.uploadFile(event.imageUrl, `events/${event.id}`);
      }
      await setDoc(doc(db, "events", event.id), { ...event, imageUrl: finalImg });
      console.log("Evento publicado no cronograma.");
    } catch (e) { console.error("Erro ao publicar evento:", e); }
  }

  static async deleteEvent(id: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Removendo Evento:", id);
      await deleteDoc(doc(db, "events", id));
    } catch (e) { console.error("Erro ao deletar evento:", e); }
  }

  static async saveLab(lab: Lab): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Lançando Laboratório:", lab.title);
      let finalImg = lab.img;
      if (lab.img?.startsWith('data:')) {
        finalImg = await this.uploadFile(lab.img, `labs/${lab.id}`);
      }
      await setDoc(doc(db, "labs", lab.id), { ...lab, img: finalImg });
      console.log("Laboratório protocolado.");
    } catch (e) { console.error("Erro ao publicar laboratório:", e); }
  }

  static async deleteLab(id: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Excluindo Laboratório:", id);
      await deleteDoc(doc(db, "labs", id));
    } catch (e) { console.error("Erro ao deletar laboratório:", e); }
  }

  static async saveAttendance(record: AttendanceRecord): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Lançando Presença:", record.memberName, "em", record.eventTitle);
      await setDoc(doc(db, "attendance", record.id), record);
    } catch (e) { console.error("Erro ao salvar presença:", e); }
  }

  static async deleteAttendance(id: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, "attendance", id));
    } catch (e) { console.error("Erro ao deletar presença:", e); }
  }

  static async saveMessage(msg: DirectMessage): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Enviando Mensagem...");
      let finalFileUrl = msg.fileUrl;
      if (msg.fileUrl?.startsWith('data:')) {
        finalFileUrl = await this.uploadFile(msg.fileUrl, `messages/${msg.id}_${msg.fileName}`);
      }
      await setDoc(doc(db, "messages", msg.id), { ...msg, fileUrl: finalFileUrl });
      console.log("Mensagem protocolada na nuvem.");
    } catch (e) { console.error("Erro ao enviar mensagem:", e); }
  }

  static async saveSettings(settings: MembershipSettings): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Atualizando Ajustes Master...");
      await setDoc(doc(db, "settings", "membership"), settings);
      console.log("Ajustes sincronizados.");
    } catch (e) { console.error("Erro ao salvar ajustes:", e); }
  }

  static async savePost(post: FeedPost): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Publicando no Feed...");
      await setDoc(doc(db, "feed", post.id), post);
      console.log("Postagem ativa.");
    } catch (e) { console.error("Erro ao publicar post:", e); }
  }

  static async getCloudUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) { 
      console.error("Erro ao buscar usuários:", e);
      return []; 
    }
  }

  static async saveChatHistory(email: string, messages: any[]): Promise<void> {
    if (!isFirebaseConfigured || !email) return;
    const chatRef = doc(db, "chats", email.toLowerCase().trim());
    await setDoc(chatRef, { messages, lastUpdate: new Date().toISOString() });
  }

  static async getChatHistory(email: string): Promise<any[]> {
    if (!isFirebaseConfigured || !email) return [];
    const chatRef = doc(db, "chats", email.toLowerCase().trim());
    const snap = await getDoc(chatRef);
    return snap.exists() ? snap.data().messages : [];
  }
}

export default CloudService;
