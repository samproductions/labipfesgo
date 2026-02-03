
import { db, storage, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  ref, 
  uploadString, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { UserProfile, Member, Project, CalendarEvent, Lab } from './types';

class CloudService {
  /**
   * Fallback Master: Salva localmente se a nuvem falhar
   */
  private static saveLocalFallback(key: string, data: any) {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const index = existing.findIndex((item: any) => item.id === data.id || item.email === data.email);
    if (index >= 0) existing[index] = data;
    else existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  private static getLocalFallback(key: string): any[] {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  /**
   * Upload de Imagem com Fallback
   */
  static async uploadImage(base64Data: string, path: string): Promise<string> {
    if (!base64Data.startsWith('data:image')) return base64Data;
    if (!isFirebaseConfigured) return base64Data;

    try {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (e) {
      console.warn("Firebase Storage indisponível, mantendo base64 local.");
      return base64Data;
    }
  }

  /**
   * USUÁRIOS
   */
  static async getCloudUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return this.getLocalFallback('lapib_local_users');
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) {
      return this.getLocalFallback('lapib_local_users');
    }
  }

  static async saveUser(user: UserProfile): Promise<void> {
    this.saveLocalFallback('lapib_local_users', user);
    if (!isFirebaseConfigured) return;
    try {
      if (user.photoUrl?.startsWith('data:')) {
        user.photoUrl = await this.uploadImage(user.photoUrl, `profiles/${user.email}`);
      }
      await setDoc(doc(db, "users", user.email.toLowerCase().trim()), user);
    } catch (e) {
      console.error("Erro ao salvar usuário na nuvem:", e);
    }
  }

  /**
   * MEMBROS
   */
  static async getCloudMembers(): Promise<Member[]> {
    if (!isFirebaseConfigured) return this.getLocalFallback('lapib_local_members');
    try {
      const querySnapshot = await getDocs(collection(db, "members"));
      const members = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      localStorage.setItem('lapib_local_members', JSON.stringify(members));
      return members;
    } catch (e) {
      return this.getLocalFallback('lapib_local_members');
    }
  }

  static async saveMember(member: Member): Promise<void> {
    this.saveLocalFallback('lapib_local_members', member);
    if (!isFirebaseConfigured) return;
    try {
      if (member.photoUrl?.startsWith('data:')) {
        member.photoUrl = await this.uploadImage(member.photoUrl, `members/${member.id}`);
      }
      await setDoc(doc(db, "members", member.id), member);
    } catch (e) {
      console.error("Erro ao salvar membro na nuvem:", e);
    }
  }

  static async updateMemberAccess(memberId: string, status: boolean): Promise<void> {
    const local = this.getLocalFallback('lapib_local_members');
    const idx = local.findIndex((m: any) => m.id === memberId);
    if (idx >= 0) {
      local[idx].acessoLiberado = status;
      localStorage.setItem('lapib_local_members', JSON.stringify(local));
    }

    if (!isFirebaseConfigured) return;
    try {
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, { acessoLiberado: status });
    } catch (e) {
      console.error("Erro ao atualizar acesso na nuvem:", e);
    }
  }

  /**
   * PROJETOS
   */
  static async getCloudProjects(): Promise<Project[]> {
    if (!isFirebaseConfigured) return this.getLocalFallback('lapib_local_projects');
    try {
      const q = query(collection(db, "projects"), orderBy("startDate", "desc"));
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => doc.data() as Project);
      localStorage.setItem('lapib_local_projects', JSON.stringify(projects));
      return projects;
    } catch (e) {
      return this.getLocalFallback('lapib_local_projects');
    }
  }

  static async saveProject(project: Project): Promise<void> {
    this.saveLocalFallback('lapib_local_projects', project);
    if (!isFirebaseConfigured) return;
    try {
      if (project.imageUrl?.startsWith('data:')) {
        project.imageUrl = await this.uploadImage(project.imageUrl, `projects/${project.id}`);
      }
      await setDoc(doc(db, "projects", project.id), project);
    } catch (e) {
      console.error("Erro ao salvar projeto na nuvem:", e);
    }
  }

  /**
   * EVENTOS
   */
  static async getCloudEvents(): Promise<CalendarEvent[]> {
    if (!isFirebaseConfigured) return this.getLocalFallback('lapib_local_events');
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const events = querySnapshot.docs.map(doc => doc.data() as CalendarEvent);
      localStorage.setItem('lapib_local_events', JSON.stringify(events));
      return events;
    } catch (e) {
      return this.getLocalFallback('lapib_local_events');
    }
  }

  static async saveEvent(event: CalendarEvent): Promise<void> {
    this.saveLocalFallback('lapib_local_events', event);
    if (!isFirebaseConfigured) return;
    try {
      if (event.imageUrl?.startsWith('data:')) {
        event.imageUrl = await this.uploadImage(event.imageUrl, `events/${event.id}`);
      }
      await setDoc(doc(db, "events", event.id), event);
    } catch (e) {
      console.error("Erro ao salvar evento na nuvem:", e);
    }
  }

  /**
   * LABORATÓRIOS
   */
  static async getCloudLabs(): Promise<Lab[]> {
    if (!isFirebaseConfigured) return this.getLocalFallback('lapib_local_labs');
    try {
      const querySnapshot = await getDocs(collection(db, "labs"));
      const labs = querySnapshot.docs.map(doc => doc.data() as Lab);
      localStorage.setItem('lapib_local_labs', JSON.stringify(labs));
      return labs;
    } catch (e) {
      return this.getLocalFallback('lapib_local_labs');
    }
  }

  static async saveLab(lab: Lab): Promise<void> {
    this.saveLocalFallback('lapib_local_labs', lab);
    if (!isFirebaseConfigured) return;
    try {
      await setDoc(doc(db, "labs", lab.id), lab);
    } catch (e) {
      console.error("Erro ao salvar laboratório na nuvem:", e);
    }
  }
}

export default CloudService;
