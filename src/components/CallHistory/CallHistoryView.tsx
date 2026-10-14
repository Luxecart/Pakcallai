import React, { useState } from 'react';
import {
  Search,
  Filter,
  PhoneIncoming,
  PhoneMissed,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Voicemail,
  Volume2,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { CallRecord } from '../../types';

interface CallHistoryViewProps {
  onSelectCall: (call: CallRecord) => void;
  onOpenSpamReport: (call: CallRecord) => void;
}

export const CallHistoryView: React.FC<CallHistoryViewProps> = ({
  onSelectCall,
  onOpenSpamReport,
}) => {
  const { calls, clearAllCalls } = useAssistant();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'screened' | 'spam' | 'voicemail'>('all');

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.contactName && call.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'screened') return call.status === 'screened_allowed' || call.status === 'transferred';
    if (activeFilter === 'spam') return call.status === 'screened_blocked';
    if (activeFilter === 'voicemail') return call.status === 'voicemail';
    return true;
  });

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-xl mx-auto">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Call History</h1>
          <p className="text-xs text-slate-400">
            {calls.length} total screened calls · Pakistan Telecom Archive
          </p>
        </div>

        {calls.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your call history?')) {
                clearAllCalls();
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by number (+92), contact or keywords..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
        {[
          { id: 'all', label: `All (${calls.length})` },
          { id: 'screened', label: `Screened (${calls.filter((c) => c.status === 'screened_allowed' || c.status === 'transferred').length})` },
          { id: 'spam', label: `Spam (${calls.filter((c) => c.status === 'screened_blocked').length})` },
          { id: 'voicemail', label: `Voicemail (${calls.filter((c) => c.status === 'voicemail').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calls List */}
      <div className="space-y-2">
        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <PhoneIncoming className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">No calls found</div>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try adjusting your search terms' : 'Incoming calls will be screened and logged here.'}
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              onClick={() => onSelectCall(call)}
              className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 transition-colors cursor-pointer group space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      call.status === 'screened_blocked'
                        ? 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
                        : call.status === 'transferred'
                        ? 'bg-blue-950/70 text-blue-400 border border-blue-800/60'
                        : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                    }`}
                  >
                    {call.status === 'screened_blocked' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : call.status === 'voicemail' ? (
                      <Voicemail className="w-4 h-4" />
                    ) : (
                      <PhoneIncoming className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {call.contactName || call.phoneNumber}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {call.phoneNumber} · <span className="font-sans text-slate-300">{call.carrier}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-400">{call.timestamp}</span>
                  <span
                    className={`text-[10px] font-semibold mt-1 ${
                      call.status === 'screened_blocked'
                        ? 'text-rose-400'
                        : call.status === 'transferred'
                        ? 'text-blue-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {call.status === 'screened_blocked'
                      ? 'Spam Blocked'
                      : call.status === 'transferred'
                      ? 'VIP Bypass'
                      : 'Screened Safe'}
                  </span>
                </div>
              </div>

              {/* Summary note */}
              <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                {call.summary}
              </p>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{call.durationSeconds}s</span>
                  <span>·</span>
                  <span>{call.transcript.length} turns</span>
                </span>
                <span className="text-blue-400 font-medium group-hover:underline">
                  View Full Details →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
