import React, { useState } from 'react';
import { UserCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Candidate } from '../types';

interface LoginProps {
  onAdminLogin: () => void;
  onStudentLogin: (email: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onAdminLogin, onStudentLogin }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate network delay
    setTimeout(() => {
        const success = onStudentLogin(email);
        if (!success) {
            setError('No application found with this email.');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">TalentAI</h1>
            <p className="text-slate-500 text-sm">Intelligent Recruitment OS</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 mt-8">
            <button 
                onClick={() => { setActiveTab('student'); setError(''); }}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Candidate Portal
            </button>
            <button 
                onClick={() => { setActiveTab('admin'); setError(''); }}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Admin Access
            </button>
        </div>

        {/* Content */}
        <div className="p-8">
            {activeTab === 'student' ? (
                <form onSubmit={handleStudentSubmit} className="space-y-6 animate-fade-in">
                    <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-3">
                         <UserCircle className="text-indigo-600 shrink-0 mt-1" size={20} />
                         <p className="text-sm text-indigo-800">Check your application status, interview schedules, and chat with our AI assistant.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. sarah.j@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Check Status <ArrowRight size={18} /></>}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        Demo Account: sarah.j@example.com
                    </p>
                </form>
            ) : (
                <div className="space-y-6 animate-fade-in">
                     <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3">
                         <ShieldCheck className="text-slate-600 shrink-0 mt-1" size={20} />
                         <p className="text-sm text-slate-700">Restricted access for HR Administrators and Hiring Managers only.</p>
                    </div>

                    <button 
                        onClick={onAdminLogin}
                        className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Enter Dashboard <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};