import React, { useState, useRef, useEffect } from 'react';
import { Candidate, CandidateStatus, Job } from '../types';
import { Upload, Search, Mail, Calendar, FileText, X, Loader2, Briefcase, Users, Filter, Hash, Send, ExternalLink } from 'lucide-react';
import { parseResumeAI, rankCandidateAI, generateOfferLetterAI } from '../services/geminiService';
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
}

export const Candidates: React.FC<CandidatesProps> = ({ candidates, jobs, updateCandidate, addCandidate, initialJobId, emailIntegration }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ type: '', to: '', subject: '', body: '' });
  
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    if (currentJobFilter === 'all') {
        alert("Please select a specific job from the dropdown to upload candidates to.");
        return;
    }

    const files = Array.from(e.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    const job = jobs.find(j => j.id === currentJobFilter);
    if (!job) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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

        const newCandidate: Candidate = {
          id: `cand-${Date.now()}-${i}`,
          name: parsedData.name || 'Unknown',
          email: parsedData.email || 'unknown@example.com',
          skills: parsedData.skills || [],
          experienceYears: parsedData.experienceYears || 0,
          summary: parsedData.summary || 'Parsed from resume.',
          matchScore: ranking.score,
          aiReasoning: ranking.reasoning,
          status: CandidateStatus.Screening,
          jobId: job.id,
          appliedDate: new Date().toISOString().split('T')[0],
          resumeText: text.substring(0, 1000) + "..."
        };

        addCandidate(newCandidate);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

      } catch (err) {
        console.error("Error processing file", file.name, err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const prepareEmail = (type: 'Reject' | 'Interview') => {
      if(!selectedCandidate) return;

      if(!emailIntegration.connected) {
          alert("Please connect your Gmail account in Settings to send emails.");
          return;
      }

      const job = jobs.find(j => j.id === selectedCandidate.jobId);
      const jobTitle = job?.title || 'Job Application';
      
      let subject = '';
      let body = '';

      if (type === 'Reject') {
          subject = `Update regarding your application for ${jobTitle}`;
          body = `Dear ${selectedCandidate.name},\n\nThank you for giving us the opportunity to consider your application for the ${jobTitle} position at TalentAI.\n\nWe have reviewed your qualifications and experience. While we were impressed with your background, we have decided to move forward with other candidates who more closely match our current requirements.\n\nFeedback from our hiring team:\n"${selectedCandidate.aiReasoning}"\n\nWe wish you the best in your job search.\n\nSincerely,\nTalentAI Recruiting Team`;
      } else {
          subject = `Interview Invitation: ${jobTitle} at TalentAI`;
          body = `Dear ${selectedCandidate.name},\n\nWe are pleased to invite you to an interview for the ${jobTitle} position!\n\nWe were impressed by your experience and would love to discuss how you can contribute to our team.\n\nPlease use the following link to select a time that works for you:\n[ Insert Google Calendar Link Here ]\n\nIf you have any questions, feel free to reply to this email.\n\nBest regards,\nTalentAI Recruiting Team`;
      }

      setEmailDraft({ type, to: selectedCandidate.email, subject, body });
      setShowEmailModal(true);
  };

  const handleSendEmail = () => {
      if(!selectedCandidate) return;

      // Construct Gmail Link
      // Using encodeURIComponent to ensure special characters and newlines are handled correctly
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailDraft.to)}&su=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
      
      // Open Gmail in new tab
      window.open(gmailLink, '_blank');
      
      // Update local status optimistically
      if (emailDraft.type === 'Reject') {
        updateCandidate({ ...selectedCandidate, status: CandidateStatus.Rejected });
        setSelectedCandidate({ ...selectedCandidate, status: CandidateStatus.Rejected });
      } else {
        updateCandidate({ ...selectedCandidate, status: CandidateStatus.Interview });
        setSelectedCandidate({ ...selectedCandidate, status: CandidateStatus.Interview });
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

  return (
    <div className="flex h-screen bg-slate-50 relative">
      
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
                          From: <span className="font-semibold text-slate-800">{emailIntegration.email}</span> (via Gmail)
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

      {/* Left List */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Candidates</h2>
          
          <div className="mb-4">
             <label className="text-xs font-semibold text-slate-500 mb-1 block">Filter by Job / Upload Target</label>
             <select 
               className="w-full p-2 text-sm border rounded mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    <span className="font-medium">
                        {isUploading 
                          ? `Analyzing... ${uploadProgress}%` 
                          : currentJobFilter === 'all' ? 'Select Job to Upload' : 'Upload Resumes'}
                    </span>
                </button>
             </div>
             {currentJobFilter !== 'all' && (
                 <p className="text-xs text-slate-400 mt-2 text-center">Supports PDF, TXT, MD. Rank against: {jobs.find(j=>j.id===currentJobFilter)?.title}</p>
             )}
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

        <div className="flex-1 overflow-y-auto">
          {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                  No candidates found for this job or search.
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
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(c.status)}`}>{c.status}</span>
                    <span className="text-xs text-slate-400">{c.appliedDate}</span>
                </div>
                </div>
            ))
          )}
        </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
        {selectedCandidate ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{selectedCandidate.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-slate-500">
                  <span className="flex items-center gap-1"><Mail size={16} /> {selectedCandidate.email}</span>
                  <span className="flex items-center gap-1"><Briefcase size={16} /> {selectedCandidate.experienceYears} Years Exp.</span>
                  <span className="flex items-center gap-1"><Hash size={16} /> {selectedCandidate.id}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600">{selectedCandidate.matchScore}</div>
                <div className="text-sm text-slate-400">AI Match Score</div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
              <h3 className="flex items-center gap-2 font-semibold text-indigo-800 mb-2">
                 <Loader2 size={16} className="animate-spin-slow" /> AI Analysis
              </h3>
              <p className="text-indigo-900 text-sm">{selectedCandidate.aiReasoning}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
               <div>
                  <h4 className="font-semibold text-slate-700 mb-3 uppercase text-xs tracking-wider">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map(s => (
                          <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-sm">{s}</span>
                      ))}
                  </div>
               </div>
               <div>
                  <h4 className="font-semibold text-slate-700 mb-3 uppercase text-xs tracking-wider">Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCandidate.summary}</p>
               </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-6 flex gap-3">
              <button 
                onClick={() => prepareEmail('Interview')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Calendar size={18} /> Schedule Interview
              </button>
              
              <button 
                 onClick={handleGenerateOffer}
                 className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FileText size={18} /> Generate Offer
              </button>

              <div className="flex-1"></div>

              <button 
                onClick={() => prepareEmail('Reject')}
                className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={18} /> Reject
              </button>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <Users size={64} className="mb-4 text-slate-300"/>
             <p>Select a candidate to view details and AI insights</p>
          </div>
        )}
      </div>
    </div>
  );
};