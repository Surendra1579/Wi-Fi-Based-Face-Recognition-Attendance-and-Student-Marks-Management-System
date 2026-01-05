export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  rollNumber?: string; // Only for students
  email: string;
  password?: string; // In real app, this is hashed
  faceRegistered: boolean;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  verificationMethod: 'FACE' | 'MANUAL';
  networkSSID?: string; // Simulated captured SSID
}

export interface AttendanceSession {
  id: string;
  teacherId: string;
  subject: string;
  startTime: string;
  endTime: string | null;
  allowedNetworkSSID: string; // The "Wi-Fi" name required
  isActive: boolean;
}

export interface SubjectMark {
  id: string;
  studentId: string;
  subject: string;
  internal: number;
  external: number;
  total: number;
  grade: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}