import React, { useState } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  Mic,
  Send,
  Volume2,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { CallRecord } from '../../types';

interface LiveCallSimulatorModalProps {
  onClose: () => void;
}

export const LiveCallSimulatorModal: React.FC<LiveCallSimulatorModalProps> = ({ onClose }) => {
  const {
    activeCallSimulator,
    startCallSimulation,
    endCallSimulation,
    sendSimulatorMessage,
    config,
  } = useAssistant();

  const [customCallerNumber, setCustomCallerNumber] = useState('+92 321 4455667');
  const [customCallerName, setCustomCallerName] = useState('Hamid (Delivery Rider)');
  const [customCallerMessage, setCustomCallerMessage] = useState('Assalam-o-Alaikum! Main gate par khara hoon, parcel receive karein.');
  const [customCarrier, setCustomCarrier] = useState<CallRecord['carrier']>('Jazz');
  const [typedMessage, setTypedMessage] = useState('');

  const presetScenarios = [
    {
      title: 'Foodpanda Delivery',
      number: '+92 321 4455667',
      name: 'Hamid (Foodpanda Rider)',
      carrier: 'Jazz' as const,
      message: 'Assalam-o-Alaikum! Main bahir gate par khara hoon, parcel receive karein.',
      urdu: 'السلام علیکم! میں باہر گیٹ پر کھڑا ہوں، پارسل وصول کریں۔',
      category: 'Delivery / Safe',
    },
    {
      title: 'BISP 8171 Lottery Scam',
      number: '+92 345 8899123',
      name: 'Unknown (Fake Inam 8171)',
      carrier: 'Telenor' as const,
      message: 'Mubarak ho! 8171 Benazir Program se aapka 50,000 ka inam nikla hai, foran jazzcash registration fee bhejein.',
      urdu: 'مبارک ہو! 8171 بے نظیر انکم سپورٹ پروگرام سے 50,000 روپے کا انعام نکلا ہے۔',
      category: 'High Risk Fraud',
    },
    {
      title: 'Dr. Usman Clinic Reception',
      number: '+92 333 5566778',
      name: 'Dr. Usman Dental Clinic',
      carrier: 'Ufone' as const,
      message: 'Assalam-o-Alaikum, clinic se reception. Tariq sahab ki Thursday ki 6 PM wali appointment confirm karni thi.',
      urdu: 'السلام علیکم، کلینک سے ریسپشن۔ طارق صاحب کی جمعرات 6 بجے والی اپائنٹمنٹ کنفرم کرنی تھی۔',
      category: 'Appointment',
    },
    {
      title: 'Jazz Telemarketing Offer',
      number: '+92 300 0001122',
      name: 'Jazz Telecom Offer',
      carrier: 'Jazz' as const,
      message: 'Jazz laye aapke liye 50GB super monthly data package sirf 999 rupay mein.',
      urdu: 'جاز لائے آپ کے لیے 50 جی بی سپر منتھلی ڈیٹا پیکیج۔',
      category: 'Marketing Promo',
    },
  ];

  const handleLaunchPreset = (s: typeof presetScenarios[0]) => {
    startCallSimulation({
      callerNumber: s.number,
      callerName: s.name,
      carrier: s.carrier,
      scenarioName: s.title,
      initialCallerMessage: s.message,
      initialCallerUrdu: s.urdu,
    });
  };

  const handleLaunchCustom = () => {
    if (!customCallerMessage.trim()) return;
    startCallSimulation({
      callerNumber: customCallerNumber || '+92 300 0000000',
      callerName: customCallerName || 'Unknown Caller',
      carrier: customCarrier,
      scenarioName: 'Custom Voice Screening',
      initialCallerMessage: customCallerMessage,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    sendSimulatorMessage(typedMessage.trim());
    setTypedMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#0b1120] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              AI Call Screening Simulator
            </h2>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">
              Sandbox Test
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!activeCallSimulator ? (
            // Pick Scenario View
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-300">
                <span className="font-bold">How Testing Works: </span>
                Select a simulated incoming call scenario below to watch how PakCall AI screens the caller in Urdu/English, identifies scams, extracts summaries, and alerts you.
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Preset Pakistani Call Scenarios:
                </h3>
                <div className="space-y-2">
                  {presetScenarios.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleLaunchPreset(s)}
                      className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-blue-600/50 cursor-pointer transition-all group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white group-hover:text-blue-400">
                          {s.title}
                        </div>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            s.category.includes('Fraud')
                              ? 'text-rose-400 bg-rose-950/80 border border-rose-900'
                              : 'text-blue-400 bg-blue-950/80 border border-blue-900'
                          }`}
                        >
                          {s.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.name} · {s.number} ({s.carrier})
                      </div>
                      <p className="text-xs text-slate-300 italic font-urdu line-clamp-1">
                        "{s.urdu || s.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Caller Builder */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Or Test Custom Caller Dialogue
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customCallerName}
                    onChange={(e) => setCustomCallerName(e.target.value)}
                    placeholder="Caller Name"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={customCallerNumber}
                    onChange={(e) => setCustomCallerNumber(e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <textarea
                  rows={2}
                  value={customCallerMessage}
                  onChange={(e) => setCustomCallerMessage(e.target.value)}
                  placeholder="What does the caller say to the assistant?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
                <button
                  onClick={handleLaunchCustom}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Start Custom Call Screen Simulation
                </button>
              </div>
            </div>
          ) : (
            // Active Call in Progress View
            <div className="space-y-4">
              {/* In-Call Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center animate-pulse">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{activeCallSimulator.callerName}</span>
                      <span className="text-[10px] text-blue-400 font-mono">({activeCallSimulator.carrier})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {activeCallSimulator.callerNumber}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    PakCall AI Screening
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Scenario: {activeCallSimulator.scenario}</span>
                </div>
              </div>

              {/* Live Transcript View */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                {activeCallSimulator.transcript.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${
                      turn.speaker === 'assistant' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {turn.speaker === 'assistant' && (
                      <div className="w-6 h-6 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3 h-3" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                        turn.speaker === 'assistant'
                          ? 'bg-slate-900 border border-slate-800 text-slate-100'
                          : 'bg-blue-700 text-white'
                      }`}
                    >
                      {turn.urduText && (
                        <div className="font-urdu text-sm mb-1 leading-relaxed">
                          {turn.urduText}
                        </div>
                      )}
                      <div className={turn.urduText ? 'text-slate-400 text-[10px]' : ''}>
                        {turn.text}
                      </div>
                    </div>
                    {turn.speaker === 'caller' && (
                      <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Respond to Assistant input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Type next reply as caller (Urdu or English)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold"
                >
                  Reply
                </button>
              </form>

              {/* Screening Actions: Connect Call or Block */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => endCallSimulation('allow')}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Allow & Connect to Phone</span>
                </button>

                <button
                  onClick={() => endCallSimulation('block')}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Block as Fraud/Spam</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
