import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  ShieldAlert,
  UserPlus,
  Trash2,
  Share2,
  Clock,
  PhoneIncoming,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { CallRecord } from '../../types';
import { useAssistant } from '../../context/AssistantContext';

interface CallDetailModalProps {
  call: CallRecord;
  onClose: () => void;
  onOpenSpamReport: (call: CallRecord) => void;
  onAddContact: (phone: string, name?: string) => void;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({
  call,
  onClose,
  onOpenSpamReport,
  onAddContact,
}) => {
  const { deleteCall } = useAssistant();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(25);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCheckedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDelete = () => {
    deleteCall(call.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1424] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              <PhoneIncoming className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {call.contactName || call.phoneNumber}
              </h2>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>{call.phoneNumber}</span>
                <span>·</span>
                <span className="text-blue-400 font-sans">{call.carrier} PK</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Metadata pill-less strip */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 py-1 border-b border-slate-800/60">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {call.timestamp}
            </span>
            <span>Duration: {call.durationSeconds}s</span>
            <span>Urgency: <strong className="capitalize text-slate-200">{call.urgency}</strong></span>
            <span>Sentiment: <strong className="capitalize text-slate-200">{call.sentiment}</strong></span>
          </div>

          {/* Audio Recording Player Simulator (if consent granted) */}
          {call.hasRecording ? (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Consensual Call Recording (PECA Compliant)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">00:18 / 00:{call.durationSeconds}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shrink-0"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                {/* Simulated Audio Waveform Bar */}
                <div className="flex-1 flex items-center gap-1 h-6 px-1">
                  {[40, 65, 85, 30, 95, 70, 50, 90, 60, 45, 80, 55, 35, 75, 95, 45, 60, 80, 50, 30, 70].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        i < playbackProgress / 4.7
                          ? 'bg-blue-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Audio recording was disabled per caller privacy preference. Full transcript preserved below.</span>
            </div>
          )}

          {/* AI Executive Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>PakCall AI Summary</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {call.summary}
            </p>

            {call.spamReason && (
              <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                Spam Detection Note: {call.spamReason}
              </div>
            )}
          </div>

          {/* Action Items List */}
          {call.actionItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Action Items ({call.actionItems.length})
              </h3>
              <div className="space-y-1.5">
                {call.actionItems.map((action, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleAction(idx)}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-850"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedActions[idx]}
                      onChange={() => toggleAction(idx)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-0"
                    />
                    <span
                      className={`text-xs ${
                        checkedActions[idx]
                          ? 'line-through text-slate-500'
                          : 'text-slate-200'
                      }`}
                    >
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Conversation Transcript */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Screened Call Transcript
            </h3>
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              {call.transcript.map((turn, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    {turn.speaker === 'assistant' ? (
                      <span className="text-blue-400 font-semibold flex items-center gap-1">
                        <Bot className="w-3 h-3" /> PakCall AI
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <User className="w-3 h-3" /> Caller ({call.phoneNumber})
                      </span>
                    )}
                    <span>· {turn.timestamp}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 space-y-1">
                    {turn.urduText && (
                      <div className="font-urdu text-sm text-slate-200 leading-relaxed">
                        {turn.urduText}
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">{turn.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-[#090e1a] border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSpamReport(call)}
              className="min-h-[44px] px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/70 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Report PTA Spam</span>
            </button>

            {!call.contactName && (
              <button
                onClick={() => onAddContact(call.phoneNumber)}
                className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Save Contact</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDelete}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors border border-slate-800"
              title="Delete Call Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
