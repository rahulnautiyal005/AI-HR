import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Candidate, Job, CandidateStatus } from '../types';
import { Users, Briefcase, CheckCircle, XCircle } from 'lucide-react';

interface DashboardProps {
  candidates: Candidate[];
  jobs: Job[];
}

export const Dashboard: React.FC<DashboardProps> = ({ candidates, jobs }) => {
  
  // Metrics
  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const hiredCount = candidates.filter(c => c.status === CandidateStatus.Hired).length;
  const rejectedCount = candidates.filter(c => c.status === CandidateStatus.Rejected).length;

  // Chart Data Preparation
  const statusData = [
    { name: 'Applied', value: candidates.filter(c => c.status === CandidateStatus.Applied).length },
    { name: 'Screening', value: candidates.filter(c => c.status === CandidateStatus.Screening).length },
    { name: 'Interview', value: candidates.filter(c => c.status === CandidateStatus.Interview).length },
    { name: 'Offer', value: candidates.filter(c => c.status === CandidateStatus.Offer).length },
  ];

  const scoreData = candidates.map(c => ({
    name: c.name.split(' ')[0],
    score: c.matchScore
  })).slice(0, 10);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Overview</h2>
        <p className="text-slate-500">Welcome back, Admin. Here is what's happening today.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Jobs" value={activeJobs} icon={Briefcase} color="bg-indigo-500" />
        <StatCard title="Hired" value={hiredCount} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Rejected" value={rejectedCount} icon={XCircle} color="bg-rose-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pipeline Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Recruitment Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm text-slate-600">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Top Candidates Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Candidates Match Score</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);
