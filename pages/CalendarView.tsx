
import React, { useState, useEffect } from 'react';
import { Interviewer, Interview } from '../types';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, Search, Plus, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

interface CalendarViewProps {
  interviewers: Interviewer[];
  interviews: Interview[];
  onAddInterviewer: (interviewer: Interviewer) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ interviewers, interviews, onAddInterviewer }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Interviewer Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newAvailDate, setNewAvailDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Initialize modal date with selected view date when modal opens
  useEffect(() => {
    if (showAddModal) {
        setNewAvailDate(selectedDate);
    }
  }, [showAddModal, selectedDate]);

  // Helper to get day name
  const getDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const toggleSlot = (time: string) => {
      if (selectedSlots.includes(time)) {
          setSelectedSlots(selectedSlots.filter(t => t !== time));
      } else {
          setSelectedSlots([...selectedSlots, time]);
      }
  };

  const changeDate = (days: number) => {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + days);
      setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleSubmit = () => {
      if (!newName || !newRole) return;

      const newInterviewer: Interviewer = {
          id: `intv-${Date.now()}`,
          name: newName,
          role: newRole,
          availability: {
              [newAvailDate]: selectedSlots
          }
      };

      onAddInterviewer(newInterviewer);
      
      // Reset
      setShowAddModal(false);
      setNewName('');
      setNewRole('');
      setSelectedSlots([]);
  };

  return (
    <div className="p-8 animate-fade-in h-full overflow-y-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">Team Availability</h2>
           <p className="text-slate-500">Monitor interviewer schedules and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
            >
                <Plus size={16} /> Add Interviewer
            </button>
            
            <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm p-1">
                <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={18}/></button>
                <div className="flex items-center gap-2 px-2 border-l border-r border-slate-100 mx-1">
                    <CalendarIcon className="text-slate-400" size={16} />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="outline-none text-slate-700 font-medium bg-transparent text-sm w-32"
                    />
                </div>
                <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={18}/></button>
            </div>
        </div>
      </div>

      {/* Add Interviewer Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg">Add New Interviewer</h3>
                      <button onClick={() => setShowAddModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Aarav Patel"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
                            <input 
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                placeholder="e.g. Senior Engineer"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-4">
                          <div className="flex justify-between items-center mb-4">
                             <div>
                                <p className="text-sm font-bold text-slate-800">Availability Setup</p>
                                <p className="text-xs text-slate-500">Set the initial schedule for this interviewer.</p>
                             </div>
                             <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                 Capacity: {selectedSlots.length} Slots
                             </div>
                          </div>
                          
                          <div className="mb-4">
                              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</label>
                              <input 
                                  type="date"
                                  value={newAvailDate}
                                  onChange={(e) => setNewAvailDate(e.target.value)}
                                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Time Slots</label>
                              <div className="space-y-3">
                                  {/* Morning */}
                                  <div>
                                      <span className="text-xs text-slate-400 mb-1 block">Morning Session</span>
                                      <div className="flex flex-wrap gap-2">
                                          {timeSlots.filter(t => parseInt(t) < 12).map(time => (
                                              <button
                                                  key={time}
                                                  onClick={() => toggleSlot(time)}
                                                  className={`text-sm px-3 py-1.5 rounded-md border transition-all ${
                                                      selectedSlots.includes(time) 
                                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                  }`}
                                              >
                                                  {time}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  {/* Afternoon */}
                                  <div>
                                      <span className="text-xs text-slate-400 mb-1 block">Afternoon Session</span>
                                      <div className="flex flex-wrap gap-2">
                                          {timeSlots.filter(t => parseInt(t) >= 12).map(time => (
                                              <button
                                                  key={time}
                                                  onClick={() => toggleSlot(time)}
                                                  className={`text-sm px-3 py-1.5 rounded-md border transition-all ${
                                                      selectedSlots.includes(time) 
                                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                  }`}
                                              >
                                                  {time}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end gap-3 border-t border-slate-100">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium">Cancel</button>
                      <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">Save Interviewer</button>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Interviewers List */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider mb-2">Interviewers ({interviewers.length})</h3>
            {interviewers.map(intv => {
                const availableToday = intv.availability[selectedDate] || [];
                const assignedToday = interviews.filter(i => i.interviewerId === intv.id && i.date === selectedDate);

                return (
                    <div key={intv.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-50 group-hover:scale-110 transition-transform">
                                {intv.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">{intv.name}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[140px]">{intv.role}</p>
                            </div>
                        </div>
                        <div className="mt-3 text-xs border-t border-slate-50 pt-2">
                            <div className="flex justify-between text-slate-500 mb-1">
                                <span>Availability</span>
                                <span className={`font-medium ${availableToday.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {availableToday.length} slots
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Assigned</span>
                                <span className={`font-medium ${assignedToday.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {assignedToday.length} interviews
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Right: Timeline Grid */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-indigo-600"/> {getDayName(selectedDate)}
                </h3>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm"></span> Free</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 border border-indigo-300 rounded-sm"></span> Booked</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-sm"></span> Unavailable</span>
                </div>
            </div>
            
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="sticky top-0 z-20 shadow-sm">
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-600 w-48 sticky left-0 bg-slate-50 z-30 border-r border-slate-200">Interviewer</th>
                            {timeSlots.map(time => (
                                <th key={time} className="p-4 font-semibold text-slate-600 text-center min-w-[100px]">{time}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {interviewers.map(intv => (
                            <tr key={intv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-medium text-slate-800 border-r border-slate-100 sticky left-0 bg-white z-10 group-hover:bg-slate-50">
                                    <div className="flex flex-col">
                                        <span>{intv.name}</span>
                                        <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wide">{intv.role}</span>
                                    </div>
                                </td>
                                {timeSlots.map(time => {
                                    const isAvailable = intv.availability[selectedDate]?.includes(time);
                                    const booking = interviews.find(i => 
                                        i.interviewerId === intv.id && 
                                        i.date === selectedDate && 
                                        i.time === time
                                    );
                                    
                                    if (booking) {
                                        return (
                                            <td key={time} className="p-2 border-r border-slate-100 bg-indigo-50/30">
                                                <div className="bg-indigo-100 text-indigo-700 text-xs p-2 rounded border border-indigo-200 text-center font-medium shadow-sm">
                                                    Booked
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (isAvailable) {
                                        return (
                                            <td key={time} className="p-2 border-r border-slate-100">
                                                <div className="bg-emerald-50 text-emerald-700 text-xs p-2 rounded border border-emerald-200 text-center flex items-center justify-center gap-1 cursor-default hover:bg-emerald-100 transition-colors">
                                                    <CheckCircle size={10} /> Free
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={time} className="p-2 border-r border-slate-100 bg-slate-50/20">
                                            <div className="text-slate-300 text-center text-xs opacity-0 hover:opacity-100 transition-opacity">-</div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};
