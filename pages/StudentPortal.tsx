import React from 'react';
import { Candidate, Job, CandidateStatus } from '../types';
import { CheckCircle, Clock, Calendar, XCircle, FileText, ArrowLeft, Briefcase, Hash } from 'lucide-react';

interface StudentPortalProps {
    candidate: Candidate;
    job?: Job;
    onLogout: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ candidate, job, onLogout }) => {
    
    const steps = [CandidateStatus.Applied, CandidateStatus.Screening, CandidateStatus.Interview, CandidateStatus.Offer];
    const currentStepIndex = steps.indexOf(candidate.status as CandidateStatus);
    const isRejected = candidate.status === CandidateStatus.Rejected;
    const isHired = candidate.status === CandidateStatus.Hired;

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
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
                    {candidate.status === CandidateStatus.Interview && (
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-900">Upcoming Interview</h3>
                                    <p className="text-xs text-purple-600">Technical Round</p>
                                </div>
                            </div>
                            <p className="text-sm text-purple-800 mb-4">
                                Your interview has been tentatively scheduled. Please check your email for the Google Calendar invitation.
                            </p>
                            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Reschedule Request
                            </button>
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