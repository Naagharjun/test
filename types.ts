
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee' | 'admin';
  avatar: string;
  skills?: { name: string, proficiency: 'Beginner' | 'Intermediate' | 'Advanced' }[];
  bio?: string;
  education?: string;
  experience?: string;
  interests?: string[];
  password?: string; // Added for mock login validation
  specialization?: string; // Move to User so Partial<User> works easily
  availability?: string[];
  sessionSlots?: { date: string, time: string, available: number }[];
  lastActive?: string;
  isBlocked?: boolean;
}

// Keeping Mentor distinct but extending is fine since standard User allows optionals now
export interface Mentor extends User {
  totalSessions?: number;
  sessionSlots?: { date: string, time: string, available: number }[];
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  topic: string;
}

export interface ConnectionRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: number;
  menteeName: string;
  mentorName: string;
  selectedSlot?: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  recipientId: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  mentorId: string;
  title: string;
  description?: string;
  url: string;
  type: 'link' | 'document' | 'video' | 'article' | 'github' | 'course' | 'other';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'request' | 'status_change' | 'message';
  relatedId?: string;
  isRead: boolean;
  timestamp: number;
}
