import React from 'react';
import {
  ShieldAlert,
  PhoneIncoming,
  Bot,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Radio,
  FileText,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import { CallRecord } from '../../types';

interface DashboardViewProps {
  onSelectCall: (call: CallRecord) => void;
  onOpenVoice: () => void;
  onOpenSimulator: () => void;
  onOpenSpamShield: () => void;
  onOpenTelephonyGuide: () => void;
  onNavigateToCalls: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectCall,
  onOpenVoice,
  onOpenSimulator,
  onOpenSpamShield,
  onOpenTelephonyGuide,
  onNavigateToCalls,
}) => {
  const { user } = useAuth();
  const { config, updateConfig, calls } = useAssistant();

  const recentCalls = calls.slice(0, 3);
  const totalCalls = calls.length;
  const blockedSpam = calls.filter((c) => c.status === 'screened_blocked').length;
  const screenedCount = calls.filter((c) => c.status === 'screened_allowed').length;

  return (
    <div className="space-y-5 pb-24 px-4 pt-3 max-w-xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-400">Salam & Welcome</span>
              <span className="text-[10px] text-slate-400 font-urdu">اسلام علیکم</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {user?.name || 'Tariq Ahmed Khan'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.city || 'Lahore'} · {user?.carrier || 'Jazz'} Telecom · PakCall Active
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] text-slate-400 font-mono">PTA Verified</span>
            <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 rounded text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Shield
            </div>
          </div>
        </div>

        {/* AI Assistant Status Row */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Assistant: {config.name}</span>
                <span className="text-slate-500">({config.language === 'urdu' ? 'Urdu' : config.language === 'punjabi' ? 'Punjabi' : 'English'})</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Mode: {config.status === 'active' ? 'Screening Unknown Callers' : 'Standby'}
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              updateConfig({
                status: config.status === 'active' ? 'standby' : 'active',
              })
            }
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              config.status === 'active'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {config.status === 'active' ? 'Active' : 'Turn On'}
          </button>
        </div>
      </div>

      {/* Quick Stats Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Total Calls</span>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">{totalCalls}</div>
          <span className="text-[10px] text-slate-500 mt-1">Logged</span>
        </div>
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-emerald-400">Allowed</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{screenedCount}</div>
          <span className="text-[10px] text-slate-500 mt-1">Verified safe</span>
        </div>
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-3 flex flex-col justify-between">
          <span className="text-[11px] text-rose-400">Spam Blocked</span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">{blockedSpam}</div>
          <span className="text-[10px] text-slate-500 mt-1">Fraud prevented</span>
        </div>
      </div>

      {/* Primary Action Hub */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Assistant Actions
          </h2>
          <span className="text-[11px] text-blue-400 font-medium">Real-time AI Engine</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenSimulator}
            className="group flex flex-col justify-between p-3 rounded-xl bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-800/40 hover:border-blue-700/70 text-left transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-blue-300">
                Call Simulator
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Test Pakistani caller scenarios
              </p>
            </div>
          </button>

          <button
            onClick={onOpenVoice}
            className="group flex flex-col justify-between p-3 rounded-xl bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-800/40 hover:border-indigo-700/70 text-left transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                AI Voice Test
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Urdu & Punjabi speech conversation
              </p>
            </div>
          </button>

          <button
            onClick={onOpenSpamShield}
            className="group flex flex-col justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center justify-center mb-2">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Report PTA Spam
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Submit fraud to Shortcode 4009
              </p>
            </div>
          </button>

          <button
            onClick={onOpenTelephonyGuide}
            className="group flex flex-col justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Telephony Bridge
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Android SIM calling architecture
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Call Assistant Quick Settings */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Assistant Controls
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Config v1.2</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <div className="text-xs font-medium text-slate-200">Screen Unknown Callers</div>
              <div className="text-[10px] text-slate-400">
                Ask who is calling before ringing your phone
              </div>
            </div>
            <button
              onClick={() => updateConfig({ screenUnknownCallers: !config.screenUnknownCallers })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                config.screenUnknownCallers ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.screenUnknownCallers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <div className="text-xs font-medium text-slate-200">Mandatory AI Disclosure</div>
              <div className="text-[10px] text-slate-400">
                Disclose: "Assalam-o-Alaikum, this is PakCall AI"
              </div>
            </div>
            <button
              onClick={() => updateConfig({ mandatoryAiDisclosure: !config.mandatoryAiDisclosure })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                config.mandatoryAiDisclosure ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.mandatoryAiDisclosure ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-medium text-slate-200">Call Recording Consent</div>
              <div className="text-[10px] text-slate-400">
                Audible beep and consent prompt per Pakistan PECA guidelines
              </div>
            </div>
            <button
              onClick={() => updateConfig({ recordWithConsent: !config.recordWithConsent })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                config.recordWithConsent ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.recordWithConsent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Recent Call Screenings
            </h2>
          </div>
          <button
            onClick={onNavigateToCalls}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <span>View All ({calls.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {call.contactName || call.phoneNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      · {call.carrier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {call.phoneNumber}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500">{call.timestamp}</span>
                  <div className="mt-1 flex items-center gap-1">
                    {call.status === 'screened_blocked' ? (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Spam Blocked
                      </span>
                    ) : call.status === 'transferred' ? (
                      <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" />
                        VIP Direct
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Allowed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Call Summary Snippet */}
              <div className="mt-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60 line-clamp-2">
                {call.summary}
              </div>

              {/* Quick Transcript Teaser */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-slate-400" />
                  {call.durationSeconds}s duration · {call.transcript.length} turns
                </span>
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  Read Transcript →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
