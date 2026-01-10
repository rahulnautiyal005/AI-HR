import React from 'react';
import { LayoutDashboard, Briefcase, Users, Settings, MessageSquare } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'chat', label: 'HR Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          TalentAI
        </h1>
        <p className="text-xs text-slate-400 mt-1">Recruitment OS</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
            onClick={() => setView('settings')}
            className={`flex items-center space-x-3 transition-colors px-4 py-2 w-full rounded-lg ${
                currentView === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
        >
            <Settings size={20} />
            <span>Settings</span>
        </button>
        <div className="mt-4 px-4 py-2 bg-slate-800 rounded text-xs text-slate-500">
            Build v1.0.4
        </div>
      </div>
    </div>
  );
};