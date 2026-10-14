import React from 'react';
import { LayoutDashboard, PhoneCall, Mic, Users, Settings } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export type NavTab = 'dashboard' | 'calls' | 'voice' | 'contacts' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { calls } = useAssistant();
  const unreadCount = calls.filter((c) => c.status === 'screened_blocked' && !c.isSpamReported).length;

  const tabs: Array<{ id: NavTab; label: string; icon: React.ElementType; isPrimary?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calls', label: 'Call Log', icon: PhoneCall },
    { id: 'voice', label: 'AI Voice', icon: Mic, isPrimary: true },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090e1a]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 max-w-xl mx-auto shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-4 group relative min-h-[48px] focus:outline-none"
                aria-label={tab.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-blue-600/40 ring-4 ring-blue-950 scale-105'
                      : 'bg-slate-800 text-blue-400 group-hover:bg-slate-700 shadow-slate-900/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                    isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 min-h-[44px] group relative focus:outline-none"
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {tab.id === 'calls' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
