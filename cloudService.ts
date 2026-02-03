
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
  onSnapshot
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from "firebase/storage";
import { UserProfile, Member, Project, CalendarEvent, Lab } from './types';

class CloudService {
  /**
   * CHAT HISTORY PERSISTENCE
   */
  static async saveChatHistory(email: string, messages: any[]): Promise<void> {
    if (!isFirebaseConfigured || !email) return;
    try {
      const chatRef = doc(db, "chats", email.toLowerCase().trim());
      await setDoc(chatRef, { messages, lastUpdate: new Date().toISOString() });
    } catch (e) {
      console.error("Erro ao salvar chat na nuvem:", e);
    }
  }

  static async getChatHistory(email: string): Promise<any[]> {
    if (!isFirebaseConfigured || !email) return [];
    try {
      const chatRef = doc(db, "chats", email.toLowerCase().trim());
      const snap = await getDoc(chatRef);
      return snap.exists() ? snap.data().messages : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * LISTENERS EM TEMPO REAL
   */
  static subscribeToMembers(callback: (members: Member[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    return onSnapshot(collection(db, "members"), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      callback(members);
    });
  }

  static subscribeToProjects(callback: (projects: Project[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    const q = query(collection(db, "projects"), orderBy("startDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      callback(projects);
    });
  }

  static subscribeToEvents(callback: (events: CalendarEvent[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    return onSnapshot(collection(db, "events"), (snapshot) => {
      const events = snapshot.docs.map(doc => doc.data() as CalendarEvent);
      callback(events);
    });
  }

  static subscribeToLabs(callback: (labs: Lab[]) => void) {
    if (!isFirebaseConfigured) return () => {};
    return onSnapshot(collection(db, "labs"), (snapshot) => {
      const labs = snapshot.docs.map(doc => doc.data() as Lab);
      callback(labs);
    });
  }

  /**
   * PERSISTÊNCIA E UPLOAD
   */
  static async uploadImage(base64Data: string, path: string): Promise<string> {
    if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;
    if (!isFirebaseConfigured) return base64Data;
    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (e) {
      return base64Data;
    }
  }

  static async getCloudUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return [];
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  }

  static async saveUser(user: UserProfile): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      let finalPhoto = user.photoUrl;
      if (user.photoUrl?.startsWith('data:')) {
        finalPhoto = await this.uploadImage(user.photoUrl, `profiles/${user.email}`);
      }
      await setDoc(doc(db, "users", user.email.toLowerCase().trim()), { ...user, photoUrl: finalPhoto });
    } catch (e) {
      console.error("Erro cloud:", e);
    }
  }

  static async saveMember(member: Member): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      let finalPhoto = member.photoUrl;
      if (member.photoUrl?.startsWith('data:')) {
        finalPhoto = await this.uploadImage(member.photoUrl, `members/${member.id}`);
      }
      await setDoc(doc(db, "members", member.id), { ...member, photoUrl: finalPhoto });
    } catch (e) {
      console.error("Erro cloud:", e);
    }
  }

  static async updateMemberAccess(memberId: string, status: boolean): Promise<void> {
    if (!isFirebaseConfigured) return;
    const memberRef = doc(db, "members", memberId);
    await updateDoc(memberRef, { acessoLiberado: status });
  }

  static async saveProject(project: Project): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      let finalImg = project.imageUrl;
      if (project.imageUrl?.startsWith('data:')) {
        finalImg = await this.uploadImage(project.imageUrl, `projects/${project.id}`);
      }
      await setDoc(doc(db, "projects", project.id), { ...project, imageUrl: finalImg });
    } catch (e) {
      console.error("Erro cloud:", e);
    }
  }

  static async saveEvent(event: CalendarEvent): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      let finalImg = event.imageUrl;
      if (event.imageUrl?.startsWith('data:')) {
        finalImg = await this.uploadImage(event.imageUrl, `events/${event.id}`);
      }
      await setDoc(doc(db, "events", event.id), { ...event, imageUrl: finalImg });
    } catch (e) {
      console.error("Erro cloud:", e);
    }
  }

  static async saveLab(lab: Lab): Promise<void> {
    if (!isFirebaseConfigured) return;
    await setDoc(doc(db, "labs", lab.id), lab);
  }
}

export default CloudService;
