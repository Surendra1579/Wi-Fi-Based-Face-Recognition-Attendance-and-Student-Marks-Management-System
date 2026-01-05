import React, { useState, useEffect } from 'react';
import { User, AttendanceSession, AttendanceRecord } from '../types';
import * as Store from '../services/mockStore';
import FaceScanner from '../components/FaceScanner';
import WifiGuard from '../components/WifiGuard';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [attendanceStep, setAttendanceStep] = useState<'IDLE' | 'WIFI_CHECK' | 'FACE_SCAN' | 'SUCCESS'>('IDLE');
  const [wifiValid, setWifiValid] = useState(false);
  const [currentSSID, setCurrentSSID] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const refreshData = () => {
    setActiveSession(Store.getActiveSession());
    setHistory(Store.getAttendanceHistory(user.id));
    setMarks(Store.getMarks(user.id));
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const initiateAttendance = () => {
    if (!activeSession) return;
    setAttendanceStep('WIFI_CHECK');
  };

  const handleWifiValidation = (isValid: boolean, ssid: string) => {
    setWifiValid(isValid);
    setCurrentSSID(ssid);
  };

  const confirmWifi = () => {
    if (wifiValid) {
      setAttendanceStep('FACE_SCAN');
    }
  };

  const handleFaceSuccess = (imgUrl: string) => {
    if (!activeSession) return;
    
    // Create record
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      sessionId: activeSession.id,
      timestamp: new Date().toISOString(),
      status: 'PRESENT',
      verificationMethod: 'FACE',
      networkSSID: currentSSID
    };

    Store.markAttendance(record);
    setAttendanceStep('SUCCESS');
    refreshData();

    // Reset after 3s
    setTimeout(() => {
      setAttendanceStep('IDLE');
    }, 3000);
  };

  const handleFaceFailure = (reason: string) => {
    setErrorMsg(reason);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // Check if already attended current session
  const alreadyAttended = activeSession && history.some(h => h.sessionId === activeSession.id);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-brand-100" />
         <div>
           <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
           <p className="text-gray-500 font-mono text-sm">{user.rollNumber}</p>
         </div>
      </header>

      {/* Action Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-500">
        <h2 className="text-lg font-bold mb-4">Mark Attendance</h2>
        
        {attendanceStep === 'SUCCESS' && (
          <div className="text-center py-8 text-green-600 animate-bounce">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold">Attendance Marked!</h3>
          </div>
        )}

        {attendanceStep === 'IDLE' && (
          <>
            {activeSession ? (
              alreadyAttended ? (
                <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center">
                  You have already marked attendance for <strong>{activeSession.subject}</strong>.
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-gray-600">
                    Session Active: <span className="font-bold text-gray-900">{activeSession.subject}</span>
                  </p>
                  <button 
                    onClick={initiateAttendance}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-md transition"
                  >
                    Mark Attendance Now
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400">
                No active attendance session found.
              </div>
            )}
          </>
        )}

        {attendanceStep === 'WIFI_CHECK' && activeSession && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WifiGuard 
              requiredSSID={activeSession.allowedNetworkSSID} 
              onValidationChange={handleWifiValidation}
            />
            <div className="flex gap-2">
              <button onClick={() => setAttendanceStep('IDLE')} className="flex-1 py-2 text-gray-500">Cancel</button>
              <button 
                onClick={confirmWifi} 
                disabled={!wifiValid}
                className={`flex-1 py-2 rounded-lg font-bold text-white transition
                  ${wifiValid ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {attendanceStep === 'FACE_SCAN' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-center font-medium text-gray-600">Verify Identity</h3>
            {errorMsg && <div className="p-2 bg-red-100 text-red-600 text-sm text-center rounded">{errorMsg}</div>}
            <FaceScanner 
              onScanSuccess={handleFaceSuccess} 
              onScanFailure={handleFaceFailure} 
              buttonText="Verify & Mark Attendance"
            />
            <button onClick={() => setAttendanceStep('IDLE')} className="w-full text-center text-sm text-gray-400 mt-2">Cancel</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance History */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4">Recent Attendance</h3>
           <div className="space-y-3">
             {history.slice(0,5).map(r => (
               <div key={r.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                 <div>
                   <p className="font-medium text-gray-900">{new Date(r.timestamp).toLocaleDateString()}</p>
                   <p className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleTimeString()}</p>
                 </div>
                 <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">Present</span>
               </div>
             ))}
             {history.length === 0 && <p className="text-sm text-gray-400">No records found.</p>}
           </div>
        </div>

        {/* Marks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Subject Marks</h3>
          <div className="space-y-3">
             {marks.map(m => (
               <div key={m.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                 <span className="font-medium text-gray-700">{m.subject}</span>
                 <div className="text-right">
                   <p className="font-bold text-brand-700">{m.grade}</p>
                   <p className="text-xs text-gray-500">{m.total}/100</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;