
import React, { useState } from 'react';
import { Candidate, Job, CandidateStatus, Interview } from '../types';
import { CheckCircle, Clock, Calendar, XCircle, FileText, ArrowLeft, Briefcase, Hash, RefreshCcw, Mic, Sparkles } from 'lucide-react';
import { VoiceScreening } from '../components/VoiceScreening';

interface StudentPortalProps {
    candidate: Candidate;
    job?: Job;
    interview?: Interview;
    onLogout: () => void;
    onReschedule: (date: string, time: string) => boolean;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ candidate, job, interview, onLogout, onReschedule }) => {
    
    const steps = [CandidateStatus.Applied, CandidateStatus.Screening, CandidateStatus.Interview, CandidateStatus.Offer];
    const currentStepIndex = steps.indexOf(candidate.status as CandidateStatus);
    const isRejected = candidate.status === CandidateStatus.Rejected;
    const isHired = candidate.status === CandidateStatus.Hired;
    
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [rescheduleMsg, setRescheduleMsg] = useState('');
    
    // Voice State
    const [showVoiceBot, setShowVoiceBot] = useState(false);
    const [voiceCompleted, setVoiceCompleted] = useState(candidate.voiceScreeningCompleted || false);

    const handleRescheduleSubmit = () => {
        if (!newDate || !newTime) return;
        
        const success = onReschedule(newDate, newTime);
        if (success) {
            setRescheduleMsg('Interview rescheduled successfully. An updated interviewer has been assigned.');
            setIsRescheduling(false);
        } else {
            setRescheduleMsg('Sorry, no interviewers are available at that time.');
        }
    };

    const handleVoiceComplete = (transcript: string, confidence: number) => {
        setVoiceCompleted(true);
        setShowVoiceBot(false);
        // In a real app, you would save this state up to the parent
        console.log("Voice Result:", transcript, confidence);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                    <span className="font-bold text-slate-800">TalentAI</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-2">Candidate Portal</span>
                </div>
                <button onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                    <ArrowLeft size={16} /> Logout
                </button>
            </nav>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Briefcase size={120} className="transform rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Welcome, {candidate.name}</h1>
                            <div className="mt-2 space-y-1">
                                <p className="text-slate-500 flex items-center gap-2">
                                    <Briefcase size={16}/> Application for <span className="font-semibold text-indigo-600">{job?.title || 'Unknown Position'}</span>
                                </p>
                                <p className="text-slate-400 text-xs flex items-center gap-2">
                                    <Hash size={14}/> Candidate ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded select-all text-slate-600 font-medium">{candidate.id}</span>
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-medium text-sm inline-flex items-center gap-2 
                            ${isRejected ? 'bg-red-100 text-red-700' : isHired ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isRejected ? <XCircle size={18}/> : <Clock size={18}/>}
                            Status: {candidate.status}
                        </div>
                    </div>
                </div>

                {/* Status Tracker */}
                {!isRejected && !isHired && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-8">Application Timeline</h3>
                        <div className="relative flex justify-between">
                            {/* Connector Line */}
                            <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 -z-0"></div>
                            
                            {steps.map((step, index) => {
                                const isCompleted = currentStepIndex >= index;
                                const isCurrent = currentStepIndex === index;
                                
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors 
                                            ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                                            {isCompleted ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                                        </div>
                                        <span className={`text-xs font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>{step}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Voice Bot Screening Section */}
                {!isRejected && candidate.status === CandidateStatus.Screening && !voiceCompleted && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                        
                        {!showVoiceBot ? (
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Mic size={24} className="text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold">Action Required: AI Screening Call</h2>
                                </div>
                                <p className="text-indigo-100 mb-6 max-w-xl">
                                    To fast-track your application, please complete a short 3-question voice interview with our AI Agent. 
                                    This helps us understand your soft skills beyond the resume.
                                </p>
                                <button 
                                    onClick={() => setShowVoiceBot(true)}
                                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-md flex items-center gap-2"
                                >
                                    Start Voice Interview <Sparkles size={18} />
                                </button>
                            </div>
                        ) : (
                            <VoiceScreening onComplete={handleVoiceComplete} />
                        )}
                    </div>
                )}

                {voiceCompleted && candidate.status === CandidateStatus.Screening && (
                     <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-900">Voice Screening Completed</h3>
                            <p className="text-emerald-700 text-sm">Our AI has analyzed your responses. The hiring team is currently reviewing your profile.</p>
                        </div>
                     </div>
                )}

                {rescheduleMsg && (
                    <div className={`p-4 rounded-lg text-sm ${rescheduleMsg.includes('Sorry') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {rescheduleMsg}
                    </div>
                )}

                {/* Actionable Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Rejection Notice */}
                    {isRejected && (
                        <div className="col-span-full bg-red-50 border border-red-100 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Application Update</h3>
                            <p className="text-red-700 text-sm leading-relaxed mb-4">
                                Thank you for your interest in TalentAI. After careful review, we have decided to move forward with other candidates who more closely match our current requirements.
                            </p>
                            <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">Feedback</span>
                                <p className="text-sm text-red-900 italic">"{candidate.aiReasoning}"</p>
                            </div>
                        </div>
                    )}

                    {/* Interview Details */}
                    {candidate.status === CandidateStatus.Interview && interview && (
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 col-span-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-900">Upcoming Interview</h3>
                                    <p className="text-xs text-purple-600">Technical Round</p>
                                </div>
                            </div>
                            
                            <div className="bg-white bg-opacity-60 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-purple-500 font-bold uppercase">Date</span>
                                    <p className="text-purple-900 font-medium">{interview.date}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-purple-500 font-bold uppercase">Time</span>
                                    <p className="text-purple-900 font-medium">{interview.time}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs text-purple-500 font-bold uppercase">Meeting Link</span>
                                    <a href={interview.meetLink} target="_blank" rel="noreferrer" className="block text-indigo-600 underline text-sm truncate">{interview.meetLink}</a>
                                </div>
                            </div>

                            {isRescheduling ? (
                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                    <p className="text-sm font-semibold mb-2">Select New Time</p>
                                    <input 
                                        type="date" 
                                        className="w-full border p-2 rounded mb-2 text-sm" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                    />
                                    <select 
                                        className="w-full border p-2 rounded mb-2 text-sm"
                                        value={newTime}
                                        onChange={e => setNewTime(e.target.value)}
                                    >
                                        <option value="">Select Time</option>
                                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleRescheduleSubmit} className="flex-1 bg-purple-600 text-white py-1 rounded text-sm">Confirm</button>
                                        <button onClick={() => setIsRescheduling(false)} className="flex-1 bg-slate-200 text-slate-700 py-1 rounded text-sm">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsRescheduling(true)}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={16} /> Reschedule Interview
                                </button>
                            )}
                        </div>
                    )}

                     {/* Offer Details */}
                     {candidate.status === CandidateStatus.Offer && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 col-span-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-900">Offer Letter Available!</h3>
                                    <p className="text-xs text-amber-600">Action Required</p>
                                </div>
                            </div>
                            <p className="text-sm text-amber-800 mb-4">
                                Congratulations! We are excited to offer you a position at TalentAI. Please review the attached offer letter.
                            </p>
                            <div className="flex gap-3">
                                <button className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                                    View Offer
                                </button>
                                <button className="flex-1 py-2 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors">
                                    Accept Offer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Assistant Promo */}
                <div className="bg-indigo-600 rounded-xl p-6 text-white flex justify-between items-center shadow-lg shadow-indigo-200">
                    <div>
                        <h3 className="font-bold text-lg">Have questions?</h3>
                        <p className="text-indigo-100 text-sm mt-1">Our AI Assistant is here to help 24/7.</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                </div>

            </div>
        </div>
    );
};
