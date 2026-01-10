
import React from 'react';
import { LayoutDashboard, Briefcase, Users, Settings, MessageSquare, Calendar, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'chat', label: 'HR Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-72 bg-slate-950 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-20 border-r border-slate-800">
      
      {/* Brand Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
                T
            </div>
            <h1 className="text-2xl font-bold tracking-tight">TalentAI</h1>
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase ml-10">Recruitment OS v2.0</p>
      </div>

      <div className="h-px bg-slate-800 mx-6 mb-6"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                  <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className={`text-sm font-medium ${isActive ? 'text-indigo-100' : ''}`}>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-indigo-400" />}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
        <button 
            onClick={() => setView('settings')}
            className={`flex items-center space-x-3 transition-colors px-4 py-3 w-full rounded-xl hover:bg-slate-800 ${
                currentView === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
        >
            <Settings size={20} />
            <span className="text-sm font-medium">System Settings</span>
        </button>
        <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border-2 border-slate-800">
                A
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-200">Admin User</p>
                <p className="text-[10px] text-slate-500">acme.corp@talentai.com</p>
            </div>
        </div>
      </div>
    </div>
  );
};
