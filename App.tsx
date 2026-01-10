import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Candidates } from './pages/Candidates';
import { Settings } from './pages/Settings';
import { AIChat } from './components/AIChat';
import { Login } from './pages/Login';
import { StudentPortal } from './pages/StudentPortal';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from './components/MockData';
import { Job, Candidate } from './types';

type UserRole = 'guest' | 'admin' | 'student';

function App() {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Candidate | null>(null);
  
  // App State
  const [view, setView] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
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
      return (
        <>
            <StudentPortal 
                candidate={currentStudent} 
                job={studentJob} 
                onLogout={handleLogout} 
            />
            <AIChat />
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
        />;
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
      
      <main className="ml-64 flex-1 h-screen overflow-hidden relative">
         <button 
            onClick={handleLogout}
            className="absolute top-4 right-8 z-10 text-xs font-semibold text-slate-500 hover:text-indigo-600"
         >
            Logout Admin
         </button>
        {renderAdminView()}
      </main>

      <AIChat />
    </div>
  );
}

export default App;