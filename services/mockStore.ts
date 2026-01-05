import { User, UserRole, AttendanceSession, AttendanceRecord, SubjectMark } from '../types';

// --- Mock Data ---

const MOCK_USERS: User[] = [
  {
    id: 't1',
    name: 'Prof. Albus D.',
    role: UserRole.TEACHER,
    email: 'teacher@edu.com',
    password: 'pass',
    faceRegistered: true,
    avatarUrl: 'https://picsum.photos/id/1/200/200'
  },
  {
    id: 's1',
    name: 'Harry P.',
    role: UserRole.STUDENT,
    rollNumber: 'CS-2024-001',
    email: 'harry@edu.com',
    password: 'pass',
    faceRegistered: true,
    avatarUrl: 'https://picsum.photos/id/64/200/200'
  },
  {
    id: 's2',
    name: 'Hermione G.',
    role: UserRole.STUDENT,
    rollNumber: 'CS-2024-002',
    email: 'hermione@edu.com',
    password: 'pass',
    faceRegistered: true,
    avatarUrl: 'https://picsum.photos/id/65/200/200'
  }
];

const MOCK_MARKS: SubjectMark[] = [
  { id: 'm1', studentId: 's1', subject: 'Potions', internal: 25, external: 60, total: 85, grade: 'A' },
  { id: 'm2', studentId: 's1', subject: 'Defense', internal: 28, external: 68, total: 96, grade: 'O' },
  { id: 'm3', studentId: 's2', subject: 'Potions', internal: 30, external: 70, total: 100, grade: 'O' },
  { id: 'm4', studentId: 's2', subject: 'Defense', internal: 29, external: 65, total: 94, grade: 'O' },
];

// --- Local Storage Helpers (Simulating Database) ---

const STORAGE_KEYS = {
  SESSIONS: 'edu_sessions',
  ATTENDANCE: 'edu_attendance',
  MARKS: 'edu_marks'
};

export const getActiveSession = (): AttendanceSession | null => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  return sessions.find((s: AttendanceSession) => s.isActive) || null;
};

export const startSession = (teacherId: string, subject: string, ssid: string): AttendanceSession => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  // Close any existing sessions for this teacher
  const updatedSessions = sessions.map((s: AttendanceSession) => 
    s.teacherId === teacherId ? { ...s, isActive: false, endTime: new Date().toISOString() } : s
  );

  const newSession: AttendanceSession = {
    id: Date.now().toString(),
    teacherId,
    subject,
    startTime: new Date().toISOString(),
    endTime: null,
    allowedNetworkSSID: ssid,
    isActive: true
  };

  updatedSessions.push(newSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  return newSession;
};

export const stopSession = (sessionId: string) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  const updatedSessions = sessions.map((s: AttendanceSession) => 
    s.id === sessionId ? { ...s, isActive: false, endTime: new Date().toISOString() } : s
  );
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
};

export const markAttendance = (record: AttendanceRecord) => {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
  // Prevent duplicate for same session
  const exists = records.find((r: AttendanceRecord) => r.studentId === record.studentId && r.sessionId === record.sessionId);
  if (!exists) {
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  }
};

export const getAttendanceHistory = (studentId?: string): AttendanceRecord[] => {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
  if (studentId) {
    return records.filter((r: AttendanceRecord) => r.studentId === studentId);
  }
  return records;
};

export const getSessionAttendance = (sessionId: string): AttendanceRecord[] => {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
  return records.filter((r: AttendanceRecord) => r.sessionId === sessionId);
};

export const getMarks = (studentId?: string): SubjectMark[] => {
  // In a real app we'd fetch from LS, but we'll use MOCK_MARKS mixed with potential new adds
  return studentId ? MOCK_MARKS.filter(m => m.studentId === studentId) : MOCK_MARKS;
};

export const loginUser = (email: string, password?: string, isFaceAuth: boolean = false): User | null => {
  const user = MOCK_USERS.find(u => u.email === email);
  if (!user) return null;
  
  if (isFaceAuth && user.faceRegistered) return user;
  if (password && user.password === password) return user;
  
  return null;
};

export const getAllStudents = () => MOCK_USERS.filter(u => u.role === UserRole.STUDENT);