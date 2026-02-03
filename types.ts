
export type ViewState = 'home' | 'feed' | 'projects' | 'members' | 'ingresso' | 'events' | 'labs' | 'attendance' | 'messages' | 'admin' | 'iris' | 'profile' | 'secretaria';
export type AdminTab = 'labs' | 'events' | 'projects' | 'attendance' | 'ingresso' | 'messages' | 'settings' | 'members';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  photoUrl: string;
  role: 'admin' | 'member' | 'student';
  cpf?: string;
  registrationId?: string;
  status?: 'ativo' | 'inativo';
  acessoLiberado?: boolean; // Novo campo de permissão manual
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  role: string;
  photoUrl: string;
  bio?: string;
  lattesUrl?: string;
  cpf?: string;
  registrationId?: string;
  acessoLiberado?: boolean; // Novo campo de permissão manual
}

export interface Project {
  id: string;
  title: string;
  advisor: string;
  startDate: string;
  status: 'ATIVO' | 'CONCLUÍDO';
  imageUrl: string;
  description: string;
  category: string;
  studentTeam?: string;
}

export interface Lab {
  id: string;
  title: string;
  coordinator: string;
  type: 'Pesquisa' | 'Ensino';
  desc: string;
  img?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  category: string;
  ativo: boolean;
  projetoExplica?: string;
  imageUrl?: string;
  type?: string; 
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  eventTitle: string;
  date: string;
  timestamp: string;
  isAvulsa?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
  read: boolean;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  registrationId: string;
  interest: string;
  semester?: string;
  status: 'pending' | 'approved' | 'waiting_list' | 'rejected';
  timestamp: string;
  source?: string;
}

export interface MembershipSettings {
  editalUrl: string;
  selectionStatus: 'open' | 'closed';
  rules: string[];
  calendar: { stage: string; date: string }[];
}

export interface FeedPost {
  id: string;
  media: MediaItem[];
  caption: string;
  author: string;
  authorId: string;
  timestamp: string;
  likes: string[];
  comments: FeedComment[];
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface FeedComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  timestamp: string;
}

export interface MemberPrivateLink {
  id: string;
  email: string;
  title: string;
  url: string;
  type: string;
}
