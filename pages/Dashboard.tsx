
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Candidate, Job, CandidateStatus } from '../types';
import { Users, Briefcase, CheckCircle, XCircle, TrendingUp, ArrowRight, ArrowLeft, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';

interface DashboardProps {
  candidates: Candidate[];
  jobs: Job[];
}

export const Dashboard: React.FC<DashboardProps> = ({ candidates, jobs }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // -- Global Stats --
  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status === 'Active').length;
  const hiredCount = candidates.filter(c => c.status === CandidateStatus.Hired).length;
  
  // -- Helper: Get Stats for specific job or all --
  const getStats = (jobId?: string) => {
    const relevantCandidates = jobId ? candidates.filter(c => c.jobId === jobId) : candidates;
    return {
      total: relevantCandidates.length,
      screening: relevantCandidates.filter(c => c.status === CandidateStatus.Screening).length,
      interview: relevantCandidates.filter(c => c.status === CandidateStatus.Interview).length,
      offer: relevantCandidates.filter(c => c.status === CandidateStatus.Offer).length,
      rejected: relevantCandidates.filter(c => c.status === CandidateStatus.Rejected).length,
      hired: relevantCandidates.filter(c => c.status === CandidateStatus.Hired).length,
      candidates: relevantCandidates
    };
  };

  const currentStats = getStats(selectedJob?.id);

  // Charts Data
  const funnelData = [
    { name: 'Applied', value: currentStats.total },
    { name: 'Screening', value: currentStats.screening },
    { name: 'Interview', value: currentStats.interview },
    { name: 'Offer', value: currentStats.offer },
    { name: 'Hired', value: currentStats.hired },
  ];

  const statusData = [
    { name: 'Active Process', value: currentStats.screening + currentStats.interview },
    { name: 'Offers', value: currentStats.offer },
    { name: 'Hired', value: currentStats.hired },
    { name: 'Rejected', value: currentStats.rejected },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
  const FUNNEL_COLORS = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#312e81'];

  // --- VIEW: Company Overview ---
  if (!selectedJob) {
    return (
      <div className="min-h-full bg-slate-50 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 z-0">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="relative z-10 p-8 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-end text-white mb-8">
             <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                        <Sparkles className="text-yellow-300" size={24} />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Acme Corp.</h1>
                </div>
                <p className="text-indigo-200 text-lg font-light">Global Recruitment Command Center</p>
             </div>
             <div className="text-right">
                 <p className="text-indigo-200 text-sm">Today</p>
                 <p className="text-2xl font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</p>
             </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 flex items-center justify-between group hover:transform hover:scale-105 transition-all duration-300">
                <div>
                    <p className="text-slate-500 font-medium mb-1">Total Active Jobs</p>
                    <h3 className="text-4xl font-bold text-slate-800">{activeJobs}</h3>
                </div>
                <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Briefcase size={28} />
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 flex items-center justify-between group hover:transform hover:scale-105 transition-all duration-300">
                <div>
                    <p className="text-slate-500 font-medium mb-1">Total Candidates</p>
                    <h3 className="text-4xl font-bold text-slate-800">{totalCandidates}</h3>
                </div>
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users size={28} />
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 flex items-center justify-between group hover:transform hover:scale-105 transition-all duration-300">
                <div>
                    <p className="text-slate-500 font-medium mb-1">Total Hired</p>
                    <h3 className="text-4xl font-bold text-slate-800">{hiredCount}</h3>
                </div>
                <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle size={28} />
                </div>
            </div>
          </div>

          {/* Job Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-indigo-600"/> Active Recruitment Drives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => {
                    const stats = getStats(job.id);
                    return (
                        <div 
                            key={job.id} 
                            onClick={() => setSelectedJob(job)}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Briefcase size={100} className="text-indigo-900 transform rotate-12" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {job.status}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">{job.department}</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                    <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> Posted {job.postedDate}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Candidates</span>
                                        <span className="font-semibold text-slate-800">{stats.total}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min((stats.total / 50) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, stats.total))].map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] text-slate-500 font-bold">
                                                    {String.fromCharCode(65+i)}
                                                </div>
                                            ))}
                                            {stats.total > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] text-slate-500 font-bold">
                                                    +{stats.total - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
                                            View Dashboard <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: Job Specific Dashboard ---
  return (
    <div className="min-h-full bg-slate-50 p-8 space-y-8 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-800">{selectedJob.title}</h1>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                        Analytics
                    </span>
                </div>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <Briefcase size={14}/> {selectedJob.department} 
                    <span className="text-slate-300">•</span> 
                    <MapPin size={14}/> {selectedJob.location}
                </p>
            </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Pipeline" value={currentStats.total} icon={Users} color="bg-indigo-500" subtext="Total Applicants" />
            <StatCard title="Interviews" value={currentStats.interview} icon={Calendar} color="bg-purple-500" subtext="Scheduled/Ongoing" />
            <StatCard title="Hired" value={currentStats.hired} icon={CheckCircle} color="bg-emerald-500" subtext="Positions Filled" />
            <StatCard title="Rejection Rate" value={`${currentStats.total > 0 ? Math.round((currentStats.rejected / currentStats.total) * 100) : 0}%`} icon={XCircle} color="bg-rose-500" subtext="Of total applicants" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Funnel Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-400"/> Conversion Funnel
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} width={80} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Current Status</h3>
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800">{currentStats.total}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">Candidates</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                     {statusData.map((item, index) => (
                         <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                             <span>{item.name}</span>
                         </div>
                     ))}
                </div>
            </div>
        </div>

        {/* Top Candidates Table Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Top Performers</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Sorted by AI Score</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Candidate Name</th>
                            <th className="px-6 py-4 font-medium">Stage</th>
                            <th className="px-6 py-4 font-medium">Match Score</th>
                            <th className="px-6 py-4 font-medium">Round</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentStats.candidates
                            .sort((a, b) => b.matchScore - a.matchScore)
                            .slice(0, 5)
                            .map(c => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${c.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' : 
                                          c.status === 'Offer' ? 'bg-amber-100 text-amber-700' : 
                                          'bg-blue-50 text-blue-700'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${c.matchScore}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{c.matchScore}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    Round {c.currentRound}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);
