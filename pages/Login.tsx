import React, { useState } from 'react';
import { User } from '../types';
import * as Store from '../services/mockStore';
import FaceScanner from '../components/FaceScanner';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<'PASSWORD' | 'FACE'>('PASSWORD');
  const [email, setEmail] = useState('harry@edu.com');
  const [password, setPassword] = useState('pass');
  const [error, setError] = useState('');

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = Store.loginUser(email, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleFaceLogin = (img: string) => {
    // In a real app, send img to backend for embedding comparison.
    // Here, mock finding a user who has faceRegistered = true and email matches context (simulated).
    // For demo simplicity: We log in as Harry if face is valid.
    const user = Store.loginUser(email, undefined, true);
    if (user) {
       onLogin(user);
    } else {
       setError('Face not recognized or user not found.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">EduFace Connect</h1>
          <p className="text-brand-100 text-sm">Secure Attendance System</p>
        </div>

        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 text-sm font-bold transition ${method === 'PASSWORD' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setMethod('PASSWORD')}
          >
            Password Login
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-bold transition ${method === 'FACE' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setMethod('FACE')}
          >
            Face ID
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          {method === 'PASSWORD' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                  placeholder="student@edu.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                  placeholder="••••••"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition">
                Sign In
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 text-center">
                 <label className="text-xs text-gray-500 mb-2 block">Enter email to identify user for Face ID match</label>
                 <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-2 text-center mb-4 text-sm"
                  placeholder="Identify yourself (email)"
                />
              </div>
              <FaceScanner 
                onScanSuccess={handleFaceLogin} 
                onScanFailure={(msg) => setError(msg)} 
                buttonText="Login with Face"
              />
            </div>
          )}

          <div className="mt-6 text-center border-t pt-4">
             <p className="text-xs text-gray-400">Demo Credentials:</p>
             <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
               <span className="cursor-pointer hover:text-brand-600" onClick={() => {setEmail('teacher@edu.com'); setMethod('PASSWORD');}}>Teacher: teacher@edu.com</span>
               <span className="cursor-pointer hover:text-brand-600" onClick={() => {setEmail('harry@edu.com'); setMethod('PASSWORD');}}>Student: harry@edu.com</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;