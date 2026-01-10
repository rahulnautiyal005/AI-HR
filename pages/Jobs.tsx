import React, { useState } from 'react';
import { Job } from '../types';
import { Plus, MapPin, Calendar, Trash2 } from 'lucide-react';

interface JobsProps {
  jobs: Job[];
  addJob: (job: Job) => void;
  onViewCandidates: (jobId: string) => void;
}

export const Jobs: React.FC<JobsProps> = ({ jobs, addJob, onViewCandidates }) => {
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: []
  });
  const [reqInput, setReqInput] = useState('');

  const handleAddJob = () => {
    if (!newJob.title || !newJob.description) return;

    const job: Job = {
      id: `job-${Date.now()}`,
      title: newJob.title || 'Untitled',
      department: newJob.department || 'General',
      location: newJob.location || 'Remote',
      description: newJob.description || '',
      requirements: newJob.requirements || [],
      postedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    addJob(job);
    setShowForm(false);
    setNewJob({ title: '', department: '', location: '', description: '', requirements: [] });
  };

  const addRequirement = () => {
    if (reqInput.trim()) {
      setNewJob({ ...newJob, requirements: [...(newJob.requirements || []), reqInput] });
      setReqInput('');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Job Postings</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md shadow-indigo-200"
        >
          <Plus size={18} />
          Create New Job
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 mb-8 animate-fade-in-down">
          <h3 className="text-xl font-semibold mb-4 text-indigo-900">New Job Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              placeholder="Job Title (e.g. SDE 1)" 
              className="border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
            />
            <input 
              placeholder="Department" 
              className="border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newJob.department}
              onChange={(e) => setNewJob({...newJob, department: e.target.value})}
            />
             <input 
              placeholder="Location" 
              className="border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
            />
          </div>
          <textarea 
            placeholder="Description" 
            className="w-full border p-2 rounded mb-4 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={newJob.description}
            onChange={(e) => setNewJob({...newJob, description: e.target.value})}
          />
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-2 text-slate-600">Key Requirements (for AI Scoring)</p>
            <div className="flex gap-2">
              <input 
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                placeholder="Add skill (e.g. React, Python)"
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button onClick={addRequirement} className="bg-slate-200 px-4 rounded hover:bg-slate-300 font-medium text-slate-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newJob.requirements?.map((req, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-sm border border-indigo-100">{req}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
            <button onClick={handleAddJob} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Save Job</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{job.title}</h3>
                <p className="text-slate-500 text-sm">{job.department}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {job.status}
              </span>
            </div>
            
            <p className="text-slate-600 text-sm line-clamp-3 mb-4">{job.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
              <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {job.postedDate}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.requirements.slice(0, 3).map((r, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{r}</span>
              ))}
              {job.requirements.length > 3 && <span className="text-xs text-slate-400">+{job.requirements.length - 3}</span>}
            </div>

            <button 
              onClick={() => onViewCandidates(job.id)}
              className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              View Candidates
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};