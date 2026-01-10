
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Candidates } from './pages/Candidates';
import { Settings } from './pages/Settings';
import { CalendarView } from './pages/CalendarView';
import { AIChat } from './components/AIChat';
import { Login } from './pages/Login';
import { StudentPortal } from './pages/StudentPortal';
import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_INTERVIEWERS, INITIAL_INTERVIEWS } from './components/MockData';
import { Job, Candidate, Interviewer, Interview, CandidateStatus } from './types';

type UserRole = 'guest' | 'admin' | 'student';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Candidate | null>(null);
  
  // App State
  const [view, setView] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [interviewers, setInterviewers] = useState<Interviewer[]>(INITIAL_INTERVIEWERS);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);
  const [filterJobId, setFilterJobId] = useState<string | null>(null);

  // Email Integration State
  const [emailIntegration, setEmailIntegration] = useState<{connected: boolean, email: string}>({
      connected: false,
      email: ''
  });

  // Auth Handlers
  const handleAdminLogin = () => {
    setUserRole('admin');
    setView('dashboard');
  };

  const handleStudentLogin = (email: string): boolean => {
    const student = candidates.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (student) {
        setCurrentStudent(student);
        setUserRole('student');
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentStudent(null);
  };

  // Admin Data Handlers
  const addJob = (job: Job) => {
    setJobs([job, ...jobs]);
  };

  const addCandidate = (candidate: Candidate) => {
    setCandidates(prev => [candidate, ...prev]);
  };

  const updateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (currentStudent && currentStudent.id === updated.id) {
        setCurrentStudent(updated);
    }
  };

  const addInterviewer = (newInterviewer: Interviewer) => {
      setInterviewers(prev => [...prev, newInterviewer]);
  };

  // Interview Management
  const scheduleInterview = (candidateId: string, date: string, time: string, jobId: string) => {
    // Find candidate to check current round
    const candidate = candidates.find(c => c.id === candidateId);
    const roundNumber = candidate?.currentRound || 1;

    // Logic: Find first available interviewer
    const availableInterviewer = interviewers.find(intv => 
        intv.availability[date]?.includes(time) && 
        !interviews.some(i => i.interviewerId === intv.id && i.date === date && i.time === time)
    );

    if (!availableInterviewer) return null;

    const newInterview: Interview = {
        id: `int-${Date.now()}`,
        candidateId,
        interviewerId: availableInterviewer.id,
        jobId,
        date,
        time,
        meetLink: `https://meet.google.com/${Math.random().toString(36).substr(2, 9)}`,
        status: 'Scheduled',
        roundNumber: roundNumber
    };

    setInterviews([...interviews, newInterview]);
    
    // Update candidate status
    if (candidate) {
        updateCandidate({ ...candidate, status: CandidateStatus.Interview, interviewId: newInterview.id });
    }

    return { interview: newInterview, interviewer: availableInterviewer };
  };

  const rescheduleInterview = (interviewId: string, newDate: string, newTime: string) => {
      const oldInterview = interviews.find(i => i.id === interviewId);
      if(!oldInterview) return null;

      // Find NEW available interviewer (could be same or different)
      const availableInterviewer = interviewers.find(intv => 
        intv.availability[newDate]?.includes(newTime) && 
        !interviews.some(i => i.interviewerId === intv.id && i.date === newDate && i.time === newTime && i.id !== interviewId)
      );

      if (!availableInterviewer) return null;

      const updatedInterview = { 
          ...oldInterview, 
          date: newDate, 
          time: newTime, 
          interviewerId: availableInterviewer.id 
      };

      setInterviews(prev => prev.map(i => i.id === interviewId ? updatedInterview : i));
      return updatedInterview;
  }

  const submitFeedback = (interviewId: string, feedback: string, result: 'Pass' | 'Fail') => {
      // 1. Update Interview Result
      setInterviews(prev => prev.map(i => i.id === interviewId ? { ...i, feedback, result, status: 'Completed' } : i));

      // 2. Find Interview & Candidate
      const interview = interviews.find(i => i.id === interviewId);
      if(!interview) return;
      const candidate = candidates.find(c => c.id === interview.candidateId);
      if(!candidate) return;

      const job = jobs.find(j => j.id === candidate.jobId);
      if(!job) return;

      // 3. Logic based on Pass/Fail
      if (result === 'Fail') {
          updateCandidate({ ...candidate, status: CandidateStatus.Rejected, interviewId: undefined });
      } else {
          // Check if this was the last round
          if (candidate.currentRound >= job.rounds.length) {
              updateCandidate({ ...candidate, status: CandidateStatus.Offer, interviewId: undefined });
          } else {
              // Advance to next round, status Screening (ready for next schedule)
              updateCandidate({ 
                  ...candidate, 
                  currentRound: candidate.currentRound + 1, 
                  status: CandidateStatus.Screening,
                  interviewId: undefined // Clear link to old interview
              });
          }
      }
  };

  const handleViewCandidates = (jobId: string) => {
    setFilterJobId(jobId);
    setView('candidates');
  };

  // Rendering Views
  if (userRole === 'guest') {
      return <Login onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} />;
  }

  if (userRole === 'student' && currentStudent) {
      const studentJob = jobs.find(j => j.id === currentStudent.jobId);
      const studentInterview = interviews.find(i => i.id === currentStudent.interviewId);
      
      return (
        <>
            <StudentPortal 
                candidate={currentStudent} 
                job={studentJob} 
                interview={studentInterview}
                onLogout={handleLogout} 
                onReschedule={(date, time) => {
                    if (studentInterview) {
                        return rescheduleInterview(studentInterview.id, date, time) !== null;
                    }
                    return false;
                }}
            />
            <AIChat jobContext={studentJob} />
        </>
      );
  }

  // Admin View
  const renderAdminView = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard candidates={candidates} jobs={jobs} />;
      case 'jobs':
        return <Jobs jobs={jobs} addJob={addJob} onViewCandidates={handleViewCandidates} />;
      case 'candidates':
        return <Candidates 
          candidates={candidates} 
          jobs={jobs} 
          addCandidate={addCandidate} 
          updateCandidate={updateCandidate} 
          initialJobId={filterJobId}
          emailIntegration={emailIntegration}
          interviewers={interviewers}
          onScheduleInterview={scheduleInterview}
          interviews={interviews}
          onSubmitFeedback={submitFeedback}
        />;
      case 'calendar':
          return <CalendarView interviewers={interviewers} interviews={interviews} onAddInterviewer={addInterviewer} />;
      case 'settings':
          return <Settings 
            emailIntegration={emailIntegration}
            onConnect={(email) => setEmailIntegration({ connected: true, email })}
            onDisconnect={() => setEmailIntegration({ connected: false, email: '' })}
          />;
      case 'chat':
          return <div className="p-8 text-center text-slate-500">Full page chat history coming soon. Use the floating widget.</div>;
      default:
        return <Dashboard candidates={candidates} jobs={jobs} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar currentView={view} setView={setView} />
      
      {/* Adjusted left margin to 72 (18rem) to match new sidebar width */}
      <main className="ml-72 flex-1 h-screen overflow-hidden relative">
         <button 
            onClick={handleLogout}
            className="absolute top-6 right-8 z-10 text-xs font-semibold text-slate-400 hover:text-indigo-600 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm"
         >
            Logout
         </button>
        {renderAdminView()}
      </main>

      <AIChat />
    </div>
  );
}

export default App;
