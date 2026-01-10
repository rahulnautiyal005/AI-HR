
import React, { useState, useRef, useEffect } from 'react';
import { Candidate, CandidateStatus, Job, Interviewer, Interview } from '../types';
import { Upload, Search, Mail, Calendar, FileText, X, Loader2, Briefcase, Users, Filter, Hash, Send, ExternalLink, UserCheck, AlertTriangle, CheckCircle, XCircle, LayoutGrid, List as ListIcon } from 'lucide-react';
import { parseResumeAI, rankCandidateAI, generateOfferLetterAI } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for pdfjs-dist ESM import structure
const pdfjs: any = (pdfjsLib as any).default || pdfjsLib;

if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface CandidatesProps {
  candidates: Candidate[];
  jobs: Job[];
  updateCandidate: (c: Candidate) => void;
  addCandidate: (c: Candidate) => void;
  initialJobId?: string | null;
  emailIntegration: { connected: boolean; email: string };
  interviewers: Interviewer[];
  onScheduleInterview: (cid: string, date: string, time: string, jid: string) => { interview: Interview, interviewer: Interviewer } | null;
  interviews?: Interview[];
  onSubmitFeedback?: (interviewId: string, feedback: string, result: 'Pass' | 'Fail') => void;
}

export const Candidates: React.FC<CandidatesProps> = ({ candidates, jobs, updateCandidate, addCandidate, initialJobId, emailIntegration, interviewers, onScheduleInterview, interviews = [], onSubmitFeedback }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0, success: 0, rejected: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // View Mode: Kanban vs List
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ type: '', to: '', subject: '', body: '' });

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedulingError, setSchedulingError] = useState('');

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const [currentJobFilter, setCurrentJobFilter] = useState<string>(initialJobId || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialJobId) {
      setCurrentJobFilter(initialJobId);
      setSelectedCandidate(null);
    }
  }, [initialJobId]);

  const filteredCandidates = candidates.filter(c => {
    const matchesJob = currentJobFilter === 'all' || c.jobId === currentJobFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesSearch;
  });

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case CandidateStatus.Hired: return 'bg-emerald-100 text-emerald-700';
      case CandidateStatus.Rejected: return 'bg-red-100 text-red-700';
      case CandidateStatus.Interview: return 'bg-purple-100 text-purple-700';
      case CandidateStatus.Offer: return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-50 text-blue-700';
    }
  };

  const processFile = async (file: File, job: Job): Promise<Candidate | null> => {
      try {
        let text = '';
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
                const pdf = await loadingTask.promise;
                let fullText = '';
                for (let j = 1; j <= pdf.numPages; j++) {
                    const page = await pdf.getPage(j);
                    const content = await page.getTextContent();
                    const pageText = content.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                text = fullText;
            } catch (pdfError) {
                console.error("PDF Parse Error", pdfError);
                text = `(PDF Parsing Failed: ${file.name}).`;
            }
        } else {
            text = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve((e.target?.result as string) || '');
                reader.readAsText(file); 
            });
        }

        const contextText = text.trim().length > 20 ? text : `Resume Filename: ${file.name}.`;
        const parsedData = await parseResumeAI(contextText);
        const ranking = await rankCandidateAI(parsedData, job);

        // Auto-Screening Logic
        // >= 80% -> Interview (Passed Screening)
        // < 80% -> Rejected
        let status = CandidateStatus.Screening;
        if (ranking.score >= 80) {
            status = CandidateStatus.Interview;
        } else {
            status = CandidateStatus.Rejected;
        }

        return {
          id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: parsedData.name || 'Unknown',
          email: parsedData.email || 'unknown@example.com',
          skills: parsedData.skills || [],
          experienceYears: parsedData.experienceYears || 0,
          summary: parsedData.summary || 'Parsed from resume.',
          matchScore: ranking.score,
          aiReasoning: ranking.reasoning,
          status: status,
          jobId: job.id,
          appliedDate: new Date().toISOString().split('T')[0],
          resumeText: text.substring(0, 1000) + "...",
          currentRound: 1
        };

      } catch (err) {
        console.error("Error processing file", file.name, err);
        return null;
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    if (currentJobFilter === 'all') {
        alert("Please select a specific job from the dropdown to upload candidates to.");
        return;
    }

    const files = Array.from(e.target.files);
    const job = jobs.find(j => j.id === currentJobFilter);
    if (!job) return;

    setIsUploading(true);
    setUploadStats({ current: 0, total: files.length, success: 0, rejected: 0 });

    // Process in chunks of 3 to avoid rate limits but speed up 50-100 files
    const CONCURRENCY_LIMIT = 3;
    let processedCount = 0;
    let autoSelectedCount = 0;
    let autoRejectedCount = 0;

    for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
        const chunk = files.slice(i, i + CONCURRENCY_LIMIT);
        const promises = chunk.map(file => processFile(file, job));
        
        const results = await Promise.all(promises);
        
        results.forEach(candidate => {
            if (candidate) {
                addCandidate(candidate);
                if (candidate.status === CandidateStatus.Interview) autoSelectedCount++;
                if (candidate.status === CandidateStatus.Rejected) autoRejectedCount++;
            }
        });

        processedCount += chunk.length;
        setUploadStats({ 
            current: Math.min(processedCount, files.length), 
            total: files.length,
            success: autoSelectedCount,
            rejected: autoRejectedCount
        });
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Summary Alert
    alert(`Upload Complete!\n\nProcessed: ${files.length} resumes\n✅ Auto-Selected for Interview (Score 80%+): ${autoSelectedCount}\n❌ Auto-Rejected (Score < 80%): ${autoRejectedCount}`);
  };

  const openEmailModal = (type: 'Reject' | 'Interview', data?: {date: string, time: string, link: string}) => {
      if(!selectedCandidate) return;

      const job = jobs.find(j => j.id === selectedCandidate.jobId);
      const jobTitle = job?.title || 'Job Application';
      
      let subject = '';
      let body = '';

      if (type === 'Reject') {
          subject = `Update regarding your application for ${jobTitle}`;
          body = `Dear ${selectedCandidate.name},\n\nThank you for giving us the opportunity to consider your application for the ${jobTitle} position at TalentAI.\n\nWe have reviewed your qualifications and experience. While we were impressed with your background, we have decided to move forward with other candidates who more closely match our current requirements.\n\nFeedback from our hiring team:\n"${selectedCandidate.aiReasoning}"\n\nWe wish you the best in your job search.\n\nSincerely,\nTalentAI Recruiting Team`;
      } else {
          // Get round info
          const roundInfo = job?.rounds.find(r => r.roundNumber === selectedCandidate.currentRound);
          const roundTopic = roundInfo ? roundInfo.topic : 'Assessment';

          subject = `Invitation: ${roundTopic} Interview - ${jobTitle}`;
          body = `Dear ${selectedCandidate.name},\n\nWe are pleased to invite you to the next round of interviews for the ${jobTitle} position.\n\nThis round will focus on: ${roundTopic}.\n\nYour interview has been scheduled for:\nDate: ${data?.date}\nTime: ${data?.time}\nMeeting Link: ${data?.link}\n\nWe look forward to speaking with you.\n\nBest regards,\nTalentAI Recruiting Team`;
      }

      setEmailDraft({ type, to: selectedCandidate.email, subject, body });
      setShowEmailModal(true);
  };

  const handleScheduleConfirm = () => {
    if (!selectedCandidate || !scheduleDate || !scheduleTime) {
        setSchedulingError("Please select both date and time.");
        return;
    }

    const result = onScheduleInterview(selectedCandidate.id, scheduleDate, scheduleTime, selectedCandidate.jobId);
    
    if (!result) {
        setSchedulingError("No interviewers are free at this time. Please select another slot.");
        return;
    }

    setShowScheduleModal(false);
    setSchedulingError('');
    // Open email modal with details
    openEmailModal('Interview', { date: scheduleDate, time: scheduleTime, link: result.interview.meetLink });
  };

  const handleSendEmail = () => {
      if(!selectedCandidate) return;

      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDraft.to)}&su=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
      window.open(gmailLink, '_blank');
      
      if (emailDraft.type === 'Reject') {
        updateCandidate({ ...selectedCandidate, status: CandidateStatus.Rejected });
        setSelectedCandidate({ ...selectedCandidate, status: CandidateStatus.Rejected });
      }
      
      setShowEmailModal(false);
  };

  const handleGenerateOffer = async () => {
      if(!selectedCandidate) return;
      const job = jobs.find(j => j.id === selectedCandidate.jobId);
      if(!job) return;

      const letter = await generateOfferLetterAI(selectedCandidate.name, job.title, new Date().toDateString());
      
      const element = document.createElement("a");
      const file = new Blob([letter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Offer_Letter_${selectedCandidate.name.replace(' ', '_')}.txt`;
      document.body.appendChild(element); 
      element.click();
      
      updateCandidate({ ...selectedCandidate, status: CandidateStatus.Offer });
      setSelectedCandidate({ ...selectedCandidate, status: CandidateStatus.Offer });
  };

  const handleSubmitFeedback = (result: 'Pass' | 'Fail') => {
      if (!selectedCandidate || !selectedCandidate.interviewId || !onSubmitFeedback) return;
      
      onSubmitFeedback(selectedCandidate.interviewId, feedbackText, result);
      
      // Close modal and refresh selected candidate state locally or deselect
      setShowFeedbackModal(false);
      setFeedbackText('');
      // In a real app we'd wait for prop update, here we just close details for simplicity or update optimistic
      setSelectedCandidate(null); 
  };

  // Derived state for current selection
  const currentJob = selectedCandidate ? jobs.find(j => j.id === selectedCandidate.jobId) : null;
  const currentInterview = (selectedCandidate && selectedCandidate.interviewId) ? interviews.find(i => i.id === selectedCandidate.interviewId) : null;
  const roundDetails = (selectedCandidate && currentJob) ? currentJob.rounds.find(r => r.roundNumber === selectedCandidate.currentRound) : null;

  // Radar Chart Data Prep
  const radarData = selectedCandidate ? [
      { subject: 'Skills', A: selectedCandidate.matchScore, fullMark: 100 },
      { subject: 'Experience', A: Math.min(selectedCandidate.experienceYears * 20, 100), fullMark: 100 },
      { subject: 'Culture', A: selectedCandidate.voiceConfidenceScore || 70, fullMark: 100 },
      { subject: 'Assessment', A: selectedCandidate.matchScore > 80 ? 90 : 60, fullMark: 100 },
      { subject: 'Comms', A: selectedCandidate.voiceConfidenceScore || 75, fullMark: 100 },
  ] : [];

  return (
    <div className="flex h-screen bg-slate-50 relative">
      
      {/* Schedule Modal */}
      {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Calendar size={20} className="text-indigo-600"/> Schedule Round {selectedCandidate?.currentRound}
                      </h3>
                      <button onClick={() => setShowScheduleModal(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      {schedulingError && (
                          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                              <AlertTriangle size={16} /> {schedulingError}
                          </div>
                      )}
                      
                      <div className="bg-indigo-50 border border-indigo-100 rounded p-3 text-sm text-indigo-800">
                          <strong>Topic:</strong> {roundDetails?.topic || 'General'}<br/>
                          <span className="text-xs">{roundDetails?.description}</span>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                          <input 
                              type="date" 
                              className="w-full border rounded-lg p-2"
                              min={new Date().toISOString().split('T')[0]}
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                          <select 
                             className="w-full border rounded-lg p-2"
                             value={scheduleTime}
                             onChange={(e) => setScheduleTime(e.target.value)}
                          >
                              <option value="">Select Time</option>
                              {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                                  <option key={t} value={t}>{t}</option>
                              ))}
                          </select>
                      </div>
                      <div className="bg-slate-50 p-3 rounded text-xs text-slate-500">
                          <p>System will automatically assign an available interviewer.</p>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                      <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
                      <button onClick={handleScheduleConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Confirm & Invite</button>
                  </div>
               </div>
          </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle size={20} className="text-emerald-600"/> Interview Feedback
                      </h3>
                      <button onClick={() => setShowFeedbackModal(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                          <span><strong>Candidate:</strong> {selectedCandidate?.name}</span>
                          <span><strong>Round:</strong> {selectedCandidate?.currentRound}</span>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Interviewer Comments</label>
                          <textarea 
                              className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                              placeholder="Describe strengths, weaknesses, and overall performance..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-b-xl flex justify-between items-center gap-3">
                      <button onClick={() => setShowFeedbackModal(false)} className="text-slate-500 text-sm hover:underline">Cancel</button>
                      <div className="flex gap-3">
                        <button 
                            onClick={() => handleSubmitFeedback('Fail')} 
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                        >
                            <XCircle size={16}/> Fail & Reject
                        </button>
                        <button 
                            onClick={() => handleSubmitFeedback('Pass')} 
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg flex items-center gap-2"
                        >
                            <CheckCircle size={16}/> Pass & Next Round
                        </button>
                      </div>
                  </div>
               </div>
          </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                  <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Mail size={18} className="text-slate-500"/> 
                          Compose Email
                      </h3>
                      <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="text-sm text-slate-500 mb-2">
                          From: <span className="font-semibold text-slate-800">
                              {emailIntegration.connected ? emailIntegration.email : 'You (via Gmail)'}
                          </span>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                          <input disabled value={emailDraft.to} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                          <input 
                            value={emailDraft.subject} 
                            onChange={(e) => setEmailDraft({...emailDraft, subject: e.target.value})}
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                          <textarea 
                            value={emailDraft.body} 
                            onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})}
                            className="w-full h-48 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono" 
                          />
                      </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                      <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
                      <button onClick={handleSendEmail} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                          <ExternalLink size={16} /> Open in Gmail
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content Area - Split View */}
      <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'} border-r border-slate-200 bg-white flex flex-col transition-all duration-300`}>
        
        <div className="p-4 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Candidates</h2>
              
              {/* View Toggle */}
              <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                    title="List View"
                  >
                      <ListIcon size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('kanban')} 
                    className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                    title="Kanban Board View"
                  >
                      <LayoutGrid size={16} />
                  </button>
              </div>
          </div>
          
          {/* Controls */}
          {viewMode === 'list' && (
             <div className="mb-4 space-y-3">
                 <select 
                   className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                   value={currentJobFilter}
                   onChange={(e) => {
                     setCurrentJobFilter(e.target.value);
                     setSelectedCandidate(null);
                   }}
                 >
                     <option value="all">All Jobs (View Only)</option>
                     {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                 </select>
    
                 <div className="relative group">
                    <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".txt,.md,.json,.pdf" 
                    />
                    <button 
                        onClick={() => {
                            if(currentJobFilter === 'all') {
                                 alert("Please select a specific job from the dropdown above to upload candidates.");
                            } else {
                                fileInputRef.current?.click();
                            }
                        }}
                        disabled={isUploading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-colors ${
                            currentJobFilter === 'all' 
                            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                        }`}
                    >
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        <span className="font-medium text-sm">
                            {isUploading 
                              ? `Processing...` 
                              : 'Bulk Upload Resumes'}
                        </span>
                    </button>
                 </div>
                 
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        placeholder="Search candidates..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
             </div>
          )}
        </div>

        {/* List View Render */}
        {viewMode === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {filteredCandidates.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                      No candidates found.
                  </div>
              ) : (
                filteredCandidates.map(c => (
                    <div 
                    key={c.id} 
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedCandidate?.id === c.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                    >
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-800">{c.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.matchScore > 75 ? 'bg-green-100 text-green-700' : c.matchScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {c.matchScore}% Match
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2 truncate">{jobs.find(j=>j.id===c.jobId)?.title}</p>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(c.status)}`}>{c.status}</span>
                            {c.status !== 'Hired' && c.status !== 'Rejected' && <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded">R{c.currentRound}</span>}
                        </div>
                        <span className="text-xs text-slate-400">{c.appliedDate}</span>
                    </div>
                    </div>
                ))
              )}
            </div>
        )}

        {/* Kanban View Render */}
        {viewMode === 'kanban' && (
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-100">
                <div className="flex gap-6 h-full">
                    {[CandidateStatus.Screening, CandidateStatus.Interview, CandidateStatus.Offer, CandidateStatus.Hired, CandidateStatus.Rejected].map(status => (
                        <div key={status} className="w-80 flex-shrink-0 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-slate-700">{status}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                                    {filteredCandidates.filter(c => c.status === status).length}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {filteredCandidates.filter(c => c.status === status).map(c => (
                                    <div 
                                        key={c.id}
                                        onClick={() => { setSelectedCandidate(c); setViewMode('list'); }}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md cursor-pointer transition-all active:scale-95"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                                            <span className={`text-[10px] font-bold ${c.matchScore > 80 ? 'text-green-600' : 'text-slate-400'}`}>{c.matchScore}%</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">{jobs.find(j=>j.id===c.jobId)?.title}</p>
                                        {c.voiceScreeningCompleted && (
                                            <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded w-fit">
                                                <CheckCircle size={10} /> Voice Screened
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Right Details Panel - Only visible in List Mode */}
      {viewMode === 'list' && (
          <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            {selectedCandidate ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-fade-in">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">{selectedCandidate.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-slate-500">
                      <span className="flex items-center gap-1"><Mail size={16} /> {selectedCandidate.email}</span>
                      <span className="flex items-center gap-1"><Briefcase size={16} /> {selectedCandidate.experienceYears} Years Exp.</span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 rounded-full"><Hash size={14} /> Round {selectedCandidate.currentRound}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-indigo-600">{selectedCandidate.matchScore}</div>
                    <div className="text-sm text-slate-400">AI Match Score</div>
                  </div>
                </div>

                {/* Skill Radar Chart */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2">
                         {/* AI Insight */}
                        <div className={`border rounded-lg p-4 mb-4 ${selectedCandidate.status === 'Rejected' ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                        <h3 className={`flex items-center gap-2 font-semibold mb-2 ${selectedCandidate.status === 'Rejected' ? 'text-red-800' : 'text-indigo-800'}`}>
                            <Loader2 size={16} className={selectedCandidate.status === 'Screening' ? "animate-spin-slow" : ""} /> 
                            {selectedCandidate.status === 'Rejected' ? 'Rejection Analysis' : 'AI Analysis'}
                        </h3>
                        <p className={`text-sm ${selectedCandidate.status === 'Rejected' ? 'text-red-900' : 'text-indigo-900'}`}>{selectedCandidate.aiReasoning}</p>
                        </div>
                        
                        <h4 className="font-semibold text-slate-700 mb-2 uppercase text-xs tracking-wider">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map(s => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm">{s}</span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Radar Chart */}
                    <div className="col-span-1 h-48 relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                            </RadarChart>
                         </ResponsiveContainer>
                         <p className="text-[10px] text-center text-slate-400 mt-1">Skill & Fit Analysis</p>
                    </div>
                </div>

                {/* Auto-Selected Notice */}
                {!currentInterview && selectedCandidate.status === 'Interview' && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-8 flex items-start gap-3">
                        <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-green-900">Auto-Selected for Interview</h4>
                            <p className="text-sm text-green-700 mt-1">This candidate scored above 80% and has been fast-tracked. Please schedule the first round interview below.</p>
                        </div>
                    </div>
                )}
                
                 {/* Voice Bot Result Display */}
                 {selectedCandidate.voiceScreeningCompleted && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 mb-8 shadow-md">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold flex items-center gap-2"><CheckCircle className="text-emerald-400" size={18}/> Voice Screening Completed</h4>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">Confidence: {selectedCandidate.voiceConfidenceScore}%</span>
                        </div>
                        <p className="text-slate-300 text-sm italic">"Candidate demonstrated strong communication skills and answered situational questions with high confidence."</p>
                    </div>
                )}

                {/* Active Interview Panel */}
                {currentInterview && selectedCandidate.status === 'Interview' && (
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-8 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-purple-900 flex items-center gap-2"><Calendar size={18}/> Interview Scheduled</h4>
                            <p className="text-sm text-purple-700 mt-1">
                                {currentInterview.date} at {currentInterview.time} • Round {currentInterview.roundNumber} ({roundDetails?.topic})
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowFeedbackModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium"
                        >
                            Complete & Feedback
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="border-t border-slate-100 pt-6 flex gap-3">
                  {/* Only show Schedule if not currently in an interview or if passed prev round */}
                  {(!currentInterview && selectedCandidate.status !== 'Rejected' && selectedCandidate.status !== 'Hired' && selectedCandidate.status !== 'Offer') && (
                      <button 
                        onClick={() => {
                            setSchedulingError('');
                            setShowScheduleModal(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Calendar size={18} /> Schedule Round {selectedCandidate.currentRound}
                      </button>
                  )}
                  
                  {/* Only show Generate Offer if status is Offer (implying passed last round) */}
                  {selectedCandidate.status === CandidateStatus.Offer && (
                      <button 
                         onClick={handleGenerateOffer}
                         className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <FileText size={18} /> Generate Offer
                      </button>
                  )}

                  <div className="flex-1"></div>

                  {selectedCandidate.status !== CandidateStatus.Rejected && selectedCandidate.status !== CandidateStatus.Hired && selectedCandidate.status !== CandidateStatus.Offer && (
                      <button 
                        onClick={() => openEmailModal('Reject')}
                        className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={18} /> Reject
                      </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Users size={64} className="mb-4 text-slate-300"/>
                 <p>Select a candidate to view details and AI insights</p>
              </div>
            )}
          </div>
      )}
    </div>
  );
};
