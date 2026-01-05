import React, { useState, useEffect } from 'react';
import { User, AttendanceSession, AttendanceRecord, SubjectMark } from '../types';
import * as Store from '../services/mockStore';
import { analyzeClassPerformance } from '../services/geminiService';

interface Props {
  user: User;
}

const TeacherDashboard: React.FC<Props> = ({ user }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [sessionSSID, setSessionSSID] = useState('Classroom-WiFi-A1');
  const [sessionSubject, setSessionSubject] = useState('Computer Networks');
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [marksList, setMarksList] = useState<SubjectMark[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks'>('attendance');

  // Load initial data
  useEffect(() => {
    setActiveSession(Store.getActiveSession());
    setStudents(Store.getAllStudents());
    setMarksList(Store.getMarks());
    
    const interval = setInterval(() => {
      // Poll for attendance updates during active session
      const current = Store.getActiveSession();
      setActiveSession(current);
      if (current) {
        setAttendanceList(Store.getSessionAttendance(current.id));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartSession = () => {
    const session = Store.startSession(user.id, sessionSubject, sessionSSID);
    setActiveSession(session);
    setAttendanceList([]);
  };

  const handleStopSession = () => {
    if (activeSession) {
      Store.stopSession(activeSession.id);
      setActiveSession(null);
    }
  };

  const generateReport = async () => {
    setAiInsight("Generating insights with Gemini...");
    const insight = await analyzeClassPerformance(marksList, attendanceList);
    setAiInsight(insight);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-2">
           <button 
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'attendance' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
             onClick={() => setActiveTab('attendance')}
           >
             Attendance
           </button>
           <button 
             className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'marks' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
             onClick={() => setActiveTab('marks')}
           >
             Marks Management
           </button>
        </div>
      </header>

      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold mb-4">Classroom Control</h2>
            
            {!activeSession ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={sessionSubject}
                    onChange={(e) => setSessionSubject(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Required Wi-Fi SSID</label>
                  <input 
                    type="text" 
                    value={sessionSSID}
                    onChange={(e) => setSessionSSID(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono text-sm"
                  />
                </div>
                <button 
                  onClick={handleStartSession}
                  className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition"
                >
                  Start Attendance Session
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-green-700">Session Active</h3>
                  <p className="text-sm text-gray-500">Accepting students on: <br/><span className="font-mono font-bold">{activeSession.allowedNetworkSSID}</span></p>
                </div>
                <button 
                  onClick={handleStopSession}
                  className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition"
                >
                  Stop Session
                </button>
              </div>
            )}
          </div>

          {/* Live List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Real-time Attendance</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                Count: {attendanceList.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-xs text-gray-400 uppercase tracking-wider">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Network</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">Waiting for students to join...</td>
                    </tr>
                  ) : (
                    attendanceList.map(record => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-mono text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 font-medium text-gray-800">{record.studentName}</td>
                        <td className="py-3 text-sm text-gray-500">
                          {record.verificationMethod === 'FACE' ? '📸 Face ID' : '📝 Manual'}
                        </td>
                        <td className="py-3 text-sm text-gray-500 font-mono text-xs">{record.networkSSID}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">
                            PRESENT
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Student Marks</h2>
            <button 
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Analysis
            </button>
          </div>

          {aiInsight && (
            <div className="mb-6 bg-indigo-900 text-indigo-50 p-4 rounded-lg text-sm border-l-4 border-indigo-400">
              <span className="font-bold uppercase text-xs opacity-70 mb-1 block">Gemini Insights</span>
              {aiInsight}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Subject</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Internal (30)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">External (70)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Total</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marksList.map((mark) => {
                   const student = students.find(s => s.id === mark.studentId);
                   return (
                    <tr key={mark.id}>
                      <td className="p-4 font-medium">{student?.name || mark.studentId}</td>
                      <td className="p-4 text-gray-600">{mark.subject}</td>
                      <td className="p-4 text-center">{mark.internal}</td>
                      <td className="p-4 text-center">{mark.external}</td>
                      <td className="p-4 text-center font-bold">{mark.total}</td>
                      <td className="p-4 text-right font-bold text-brand-600">{mark.grade}</td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;