
import { db, storage } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  addDoc,
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
   * Faz upload de uma imagem (Base64 ou URL de dados) para o Firebase Storage
   * Mantém a funcionalidade de upload de fotos locais viva.
   */
  static async uploadImage(base64Data: string, path: string): Promise<string> {
    if (!base64Data.startsWith('data:image')) return base64Data; // Já é um link
    
    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64Data, 'data_url');
    return await getDownloadURL(storageRef);
  }

  /**
   * GERENCIAMENTO DE USUÁRIOS (Sincronização de Perfil)
   */
  static async getCloudUsers(): Promise<UserProfile[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  }

  static async saveUser(user: UserProfile): Promise<void> {
    // Sincroniza foto local com storage se necessário
    if (user.photoUrl && user.photoUrl.startsWith('data:')) {
      user.photoUrl = await this.uploadImage(user.photoUrl, `profiles/${user.email}`);
    }
    await setDoc(doc(db, "users", user.email.toLowerCase().trim()), user);
  }

  /**
   * GERENCIAMENTO DE MEMBROS E PERMISSÕES (Cadeado do Admin)
   */
  static async getCloudMembers(): Promise<Member[]> {
    const querySnapshot = await getDocs(collection(db, "members"));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
  }

  static async updateMemberAccess(memberId: string, status: boolean): Promise<void> {
    const memberRef = doc(db, "members", memberId);
    await updateDoc(memberRef, { acessoLiberado: status });
  }

  static async saveMember(member: Member): Promise<void> {
    if (member.photoUrl && member.photoUrl.startsWith('data:')) {
      member.photoUrl = await this.uploadImage(member.photoUrl, `members/${member.email}`);
    }
    await setDoc(doc(db, "members", member.id), member);
  }

  /**
   * GERENCIAMENTO DE PROJETOS E CRONOGRAMA
   */
  static async getCloudProjects(): Promise<Project[]> {
    const q = query(collection(db, "projects"), orderBy("startDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Project);
  }

  static async saveProject(project: Project): Promise<void> {
    if (project.imageUrl && project.imageUrl.startsWith('data:')) {
      project.imageUrl = await this.uploadImage(project.imageUrl, `projects/${project.id}`);
    }
    await setDoc(doc(db, "projects", project.id), project);
  }

  static async getCloudEvents(): Promise<CalendarEvent[]> {
    const querySnapshot = await getDocs(collection(db, "events"));
    return querySnapshot.docs.map(doc => doc.data() as CalendarEvent);
  }

  static async saveEvent(event: CalendarEvent): Promise<void> {
    if (event.imageUrl && event.imageUrl.startsWith('data:')) {
      event.imageUrl = await this.uploadImage(event.imageUrl, `events/${event.id}`);
    }
    await setDoc(doc(db, "events", event.id), event);
  }

  static async getCloudLabs(): Promise<Lab[]> {
    const querySnapshot = await getDocs(collection(db, "labs"));
    return querySnapshot.docs.map(doc => doc.data() as Lab);
  }

  static async saveLab(lab: Lab): Promise<void> {
    await setDoc(doc(db, "labs", lab.id), lab);
  }
}

export default CloudService;
