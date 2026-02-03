
import { db, storage, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  setDoc, 
  doc, 
  getDoc,
  updateDoc, 
  query, 
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";
import { UserProfile, Member, Project, CalendarEvent, Lab, AttendanceRecord, DirectMessage, MembershipSettings, FeedPost } from './types';

class CloudService {
  /** 
   * LISTENERS EM TEMPO REAL (Garantem que a tela atualize para todos)
   */
  static subscribeToMembers(callback: (members: Member[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Cloud: Sincronizando Membros...");
    return onSnapshot(collection(db, "members"), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      callback(members);
    });
  }

  static subscribeToProjects(callback: (projects: Project[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Cloud: Sincronizando Projetos...");
    // Removido orderBy temporariamente para evitar erros de índice ausente no primeiro uso
    return onSnapshot(collection(db, "projects"), (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      callback(projects);
    });
  }

  static subscribeToEvents(callback: (events: CalendarEvent[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Cloud: Sincronizando Cronograma...");
    return onSnapshot(collection(db, "events"), (snapshot) => {
      const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CalendarEvent));
      callback(events);
    });
  }

  static subscribeToLabs(callback: (labs: Lab[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    console.log("Cloud: Sincronizando Laboratórios...");
    return onSnapshot(collection(db, "labs"), (snapshot) => {
      const labs = snapshot.docs.map(doc => doc.data() as Lab);
      callback(labs);
    });
  }

  static subscribeToAttendance(callback: (data: AttendanceRecord[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    return onSnapshot(collection(db, "attendance"), (snapshot) => {
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
    return onSnapshot(collection(db, "feed"), (snapshot) => {
      const posts = snapshot.docs.map(doc => doc.data() as FeedPost);
      callback(posts);
    });
  }

  /**
   * MÉTODOS DE SALVAMENTO (Convertem foto local em URL de Nuvem)
   */
  static async uploadFile(base64Data: string, path: string): Promise<string> {
    if (!base64Data || !base64Data.startsWith('data:')) return base64Data;
    if (!isFirebaseConfigured) return base64Data;
    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (e) { 
      console.error("Cloud Error: Falha no upload de mídia", e);
      return base64Data; 
    }
  }

  static async saveProject(project: Project): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Cloud: Publicando Projeto...", project.title);
      const finalImg = await this.uploadFile(project.imageUrl, `projects/${project.id}`);
      await setDoc(doc(db, "projects", project.id), { ...project, imageUrl: finalImg });
    } catch (e) { console.error(e); }
  }

  static async saveMember(member: Member): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      console.log("Cloud: Protocolando Membro...", member.fullName);
      const finalPhoto = await this.uploadFile(member.photoUrl, `members/${member.id}`);
      await setDoc(doc(db, "members", member.id), { ...member, photoUrl: finalPhoto });
    } catch (e) { console.error(e); }
  }

  static async saveLab(lab: Lab): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      const finalImg = await this.uploadFile(lab.img || '', `labs/${lab.id}`);
      await setDoc(doc(db, "labs", lab.id), { ...lab, img: finalImg });
    } catch (e) { console.error(e); }
  }

  static async saveEvent(event: CalendarEvent): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      const finalImg = await this.uploadFile(event.imageUrl || '', `events/${event.id}`);
      await setDoc(doc(db, "events", event.id), { ...event, imageUrl: finalImg });
    } catch (e) { console.error(e); }
  }

  static async saveUser(user: UserProfile): Promise<void> {
    if (!isFirebaseConfigured) return;
    const finalPhoto = await this.uploadFile(user.photoUrl, `profiles/${user.id}`);
    await setDoc(doc(db, "users", user.email.toLowerCase().trim()), { ...user, photoUrl: finalPhoto });
  }

  static async updateMemberAccess(memberId: string, status: boolean): Promise<void> {
    if (!isFirebaseConfigured) return;
    await updateDoc(doc(db, "members", memberId), { acessoLiberado: status });
  }

  static async saveAttendance(record: AttendanceRecord): Promise<void> {
    if (!isFirebaseConfigured) return;
    await setDoc(doc(db, "attendance", record.id), record);
  }

  static async saveMessage(msg: DirectMessage): Promise<void> {
    if (!isFirebaseConfigured) return;
    let finalFileUrl = msg.fileUrl;
    if (msg.fileUrl?.startsWith('data:')) {
      finalFileUrl = await this.uploadFile(msg.fileUrl, `messages/${msg.id}_${msg.fileName}`);
    }
    await setDoc(doc(db, "messages", msg.id), { ...msg, fileUrl: finalFileUrl });
  }

  static async getCloudUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return [];
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  }

  static async savePost(post: FeedPost): Promise<void> {
    if (!isFirebaseConfigured) return;
    await setDoc(doc(db, "feed", post.id), post);
  }

  // Added saveSettings method to fix the missing property error in App.tsx
  static async saveSettings(settings: MembershipSettings): Promise<void> {
    if (!isFirebaseConfigured) return;
    await setDoc(doc(db, "settings", "membership"), settings);
  }

  static async deleteProject(id: string) { await deleteDoc(doc(db, "projects", id)); }
  static async deleteEvent(id: string) { await deleteDoc(doc(db, "events", id)); }
  static async deleteLab(id: string) { await deleteDoc(doc(db, "labs", id)); }
  static async deleteAttendance(id: string) { await deleteDoc(doc(db, "attendance", id)); }

  static async saveChatHistory(email: string, messages: any[]): Promise<void> {
    if (!isFirebaseConfigured || !email) return;
    await setDoc(doc(db, "chats", email.toLowerCase().trim()), { messages, lastUpdate: new Date().toISOString() });
  }

  static async getChatHistory(email: string): Promise<any[]> {
    if (!isFirebaseConfigured || !email) return [];
    const snap = await getDoc(doc(db, "chats", email.toLowerCase().trim()));
    return snap.exists() ? snap.data().messages : [];
  }
}

export default CloudService;
