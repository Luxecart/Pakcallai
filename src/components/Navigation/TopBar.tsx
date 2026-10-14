import React from 'react';
import { Shield, Sparkles, BookOpen, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';

interface TopBarProps {
  onOpenAuth: () => void;
  onOpenTelephonyGuide: () => void;
  onOpenSpamShield: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAuth,
  onOpenTelephonyGuide,
  onOpenSpamShield,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { config } = useAssistant();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-900/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
              PakCall AI
            </span>
            <span className="text-xs text-blue-400 font-medium font-urdu">اردو</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>{config.name} ({config.language.toUpperCase()})</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">
              {config.status === 'active' ? 'Screening' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTelephonyGuide}
          className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
          title="Telephony Architecture Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">GSM Bridge</span>
        </button>

        <button
          onClick={onOpenSpamShield}
          className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
          title="PTA Spam Shield"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">PTA Shield</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="min-h-[40px] px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-sm text-xs font-semibold"
          title={isAuthenticated ? user?.name : 'Account Profile'}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline max-w-[70px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
        </button>
      </div>
    </header>
  );
};
