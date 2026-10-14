import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Languages,
  Radio,
  Sliders,
  AlertCircle,
  HelpCircle,
  Play,
  CheckCircle2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { liveVoiceSession, AudioVisualizerLevels } from '../../services/liveAudioService';
import { speechAssistant, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../../services/speechService';
import { Language, TranscriptTurn } from '../../types';

export const VoiceAssistantView: React.FC = () => {
  const { config, updateConfig } = useAssistant();

  // Voice session states
  const [isActive, setIsActive] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'
  >('disconnected');
  const [micMuted, setMicMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<{ title: string; hint: string } | null>(null);
  const [visualizerLevels, setVisualizerLevels] = useState<AudioVisualizerLevels>({
    micLevel: 0,
    aiLevel: 0,
  });

  // Assistant configuration drawer state
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [voiceName, setVoiceName] = useState('Kore'); // 'Kore', 'Puck', 'Zephyr', 'Fenrir'

  // Transcripts list
  const [transcriptInput, setTranscriptInput] = useState('');
  const [liveInterimSpeech, setLiveInterimSpeech] = useState('');
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [isSpeakerTesting, setIsSpeakerTesting] = useState(false);
  const [conversation, setConversation] = useState<TranscriptTurn[]>([
    {
      speaker: 'assistant',
      text: `Assalam-o-Alaikum! I am ${config.name}, your Pakistani AI voice assistant. Tap 'Start Voice Conversation' below to speak naturally in Urdu, Punjabi, or English through your microphone.`,
      urduText: `السلام علیکم! میں آپ کی پاکستانی اے آئی اسسٹنٹ ${config.name} ہوں۔ مجھ سے بات کرنے کے لیے نیچے بٹن دبائیں۔`,
      timestamp: 'Ready',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, sessionStatus, liveInterimSpeech]);

  // Hook up liveVoiceSession callbacks
  useEffect(() => {
    liveVoiceSession.onStatusChange = (status) => {
      setSessionStatus(status);
      if (status === 'disconnected') {
        setIsActive(false);
      }
    };

    liveVoiceSession.onTranscriptChunk = (text) => {
      setConversation((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.speaker === 'assistant') {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              text: (last.text + ' ' + text).trim(),
              urduText: last.urduText,
            },
          ];
        }
        return [
          ...prev,
          {
            speaker: 'assistant',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
    };

    liveVoiceSession.onVisualizerUpdate = (levels) => {
      setVisualizerLevels(levels);
    };

    liveVoiceSession.onError = (err) => {
      setErrorMessage(err);
      if (err.toLowerCase().includes('permission') || err.toLowerCase().includes('denied')) {
        setErrorDetails({
          title: 'Microphone Permission Required',
          hint: 'In Android Chrome: Tap the tune/settings icon in the URL address bar > Site Settings > Microphone > Allow, then refresh.',
        });
      } else {
        setErrorDetails({
          title: 'Connection Notice',
          hint: 'The assistant will operate smoothly using local conversational intelligence and speech synthesis.',
        });
      }
    };

    return () => {
      liveVoiceSession.stop();
      speechAssistant.stopListening();
    };
  }, []);

  // Start real-time voice conversation
  const handleStartConversation = async () => {
    setErrorMessage('');
    setErrorDetails(null);
    setIsActive(true);

    const started = await liveVoiceSession.start({
      language: config.language,
      assistantName: config.name,
      persona: config.persona,
    });

    if (started) {
      // Announce greeting in selected language
      await triggerSpokenGreeting(config.language, config.name);

      // Start continuous speech recognition for automatic speech-to-text
      startListeningLoop();
    } else {
      setIsActive(false);
    }
  };

  const startListeningLoop = () => {
    if (!isSpeechRecognitionSupported()) return;

    speechAssistant.startListening(
      config.language,
      (result) => {
        if (result.isFinal && result.transcript.trim()) {
          setLiveInterimSpeech('');
          handleSendTurn(result.transcript);
        } else {
          setLiveInterimSpeech(result.transcript);
        }
      },
      (err) => {
        console.warn('Speech recognition notice:', err);
      },
      () => {
        // If still active and not processing, restart recognition loop
        if (isActive && !micMuted) {
          setTimeout(() => {
            if (isActive && !micMuted) {
              startListeningLoop();
            }
          }, 300);
        }
      }
    );
  };

  const triggerSpokenGreeting = async (lang: Language, name: string) => {
    let greetingUrdu = `السلام علیکم! میں ${name} ہوں۔ فرمائیے میں آپ کی کیا مدد کر سکتی ہوں؟`;
    let greetingEn = `Assalam-o-Alaikum! I am ${name}. How may I help you today?`;

    if (lang === 'punjabi') {
      greetingUrdu = `سلام جی! میں ${name} ہاں، دسو تسی کی گل بات کرنا چاہندے او؟`;
      greetingEn = `Salam! I am ${name}. How may I help you in Punjabi?`;
    } else if (lang === 'english') {
      greetingUrdu = `Welcome! I am ${name}, speaking with you live.`;
      greetingEn = `Hello! I am ${name}, your Pakistani personal assistant. How can I assist you?`;
    }

    const greetingTurn: TranscriptTurn = {
      speaker: 'assistant',
      text: greetingEn,
      urduText: greetingUrdu,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, greetingTurn]);

    // Request spoken TTS audio from backend
    try {
      const res = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: greetingUrdu || greetingEn,
          voiceName,
        }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        await liveVoiceSession.playAudioWav(data.audioBase64);
      } else {
        speechAssistant.speak(greetingUrdu || greetingEn, lang, config.voicePitch, config.voiceSpeed);
      }
    } catch {
      speechAssistant.speak(greetingUrdu || greetingEn, lang, config.voicePitch, config.voiceSpeed);
    }
  };

  // End voice conversation
  const handleEndConversation = () => {
    liveVoiceSession.stop();
    speechAssistant.stopListening();
    speechAssistant.stopSpeaking();
    setIsActive(false);
    setLiveInterimSpeech('');
    setSessionStatus('disconnected');
    setVisualizerLevels({ micLevel: 0, aiLevel: 0 });
  };

  // Quick Speaker & Voice Output Test
  const handleTestSpeaker = async () => {
    setIsSpeakerTesting(true);
    const testText =
      config.language === 'urdu'
        ? 'السلام علیکم! آپ کے فون کا اسپیکر درست کام کر رہا ہے۔ پاک کال اے آئی آواز تیار ہے۔'
        : config.language === 'punjabi'
        ? 'سلام جی! تہاڈے موبائل دا سپیکر بالکل ٹھیک چل ریا اے۔'
        : 'Hello! Your mobile speaker is working properly. PakCall AI voice is ready.';

    try {
      const res = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText, voiceName }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        await liveVoiceSession.playAudioWav(data.audioBase64);
      } else {
        speechAssistant.speak(testText, config.language, config.voicePitch, config.voiceSpeed, () => {
          setIsSpeakerTesting(false);
        });
      }
    } catch {
      speechAssistant.speak(testText, config.language, config.voicePitch, config.voiceSpeed, () => {
        setIsSpeakerTesting(false);
      });
    } finally {
      setTimeout(() => setIsSpeakerTesting(false), 2000);
    }
  };

  // Process typed message or voice dictation turn
  const handleSendTurn = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isProcessingTurn) return;

    setTranscriptInput('');
    setLiveInterimSpeech('');
    setIsProcessingTurn(true);

    const userTurn: TranscriptTurn = {
      speaker: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userTurn]);

    try {
      // 1. Get smart Pakistani AI response from backend
      const chatRes = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: config.language,
          persona: config.persona,
          assistantName: config.name,
        }),
      });

      const chatData = await chatRes.json();
      const assistantSpeech = chatData.speechText || 'جی میں سن رہا ہوں۔';

      const assistantTurn: TranscriptTurn = {
        speaker: 'assistant',
        text: chatData.englishSummary || assistantSpeech,
        urduText: assistantSpeech,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversation((prev) => [...prev, assistantTurn]);

      // 2. Play spoken audio via Gemini TTS endpoint or fallback
      try {
        const ttsRes = await fetch('/api/assistant/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: assistantSpeech,
            voiceName,
          }),
        });

        const ttsData = await ttsRes.json();
        if (ttsData.success && ttsData.audioBase64) {
          await liveVoiceSession.playAudioWav(ttsData.audioBase64);
        } else {
          speechAssistant.speak(assistantSpeech, config.language, config.voicePitch, config.voiceSpeed);
        }
      } catch {
        speechAssistant.speak(assistantSpeech, config.language, config.voicePitch, config.voiceSpeed);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to process voice turn.');
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    updateConfig({ language: lang });
    if (isActive) {
      triggerSpokenGreeting(lang, config.name);
    }
  };

  const playTurnAudio = async (text: string) => {
    try {
      const res = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName }),
      });
      const data = await res.json();
      if (data.success && data.audioBase64) {
        await liveVoiceSession.playAudioWav(data.audioBase64);
      } else {
        speechAssistant.speak(text, config.language, config.voicePitch, config.voiceSpeed);
      }
    } catch {
      speechAssistant.speak(text, config.language, config.voicePitch, config.voiceSpeed);
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-xl mx-auto flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Status & Language Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{config.name} (PakCall Assistant)</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-blue-400 font-urdu">
                  {config.language === 'urdu'
                    ? 'اردو'
                    : config.language === 'punjabi'
                    ? 'پنجابی'
                    : 'English'}
                </span>
              </div>
              {/* Dynamic Connection Status */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    sessionStatus === 'speaking'
                      ? 'bg-emerald-400 animate-ping'
                      : sessionStatus === 'listening'
                      ? 'bg-blue-400 animate-pulse'
                      : sessionStatus === 'connected'
                      ? 'bg-emerald-400'
                      : sessionStatus === 'connecting'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-300 capitalize">
                  {sessionStatus === 'speaking'
                    ? 'AI Speaking Audio'
                    : sessionStatus === 'listening'
                    ? 'Listening to Microphone'
                    : sessionStatus === 'connected'
                    ? 'Live Audio Stream Ready'
                    : sessionStatus === 'connecting'
                    ? 'Connecting to Gemini Voice...'
                    : 'Voice Session Standby'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Speaker Audio Test Button */}
            <button
              onClick={handleTestSpeaker}
              disabled={isSpeakerTesting}
              className="min-h-[38px] px-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Verify your mobile phone speaker"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakerTesting ? 'text-emerald-400 animate-bounce' : 'text-blue-400'}`} />
              <span className="hidden sm:inline">{isSpeakerTesting ? 'Testing...' : 'Test Speaker'}</span>
            </button>

            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className={`min-h-[38px] px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showConfigDrawer
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Configure Voice & Persona"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Tune</span>
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[
            { id: 'urdu', label: 'اردو (Urdu)' },
            { id: 'punjabi', label: 'پنجابی (Punjabi)' },
            { id: 'english', label: 'English (PK)' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id as Language)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                config.language === lang.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Configuration Drawer (if toggled) */}
        {showConfigDrawer && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Voice Persona & Behavior</span>
              <span className="text-[10px] text-blue-400 font-mono">Gemini 3.8 Audio</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Assistant Name</label>
                <div className="flex gap-1">
                  {['Aiman', 'Hamza', 'Zoya', 'Ali'].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateConfig({ name: n })}
                      className={`flex-1 py-1 rounded-md text-[11px] font-semibold border ${
                        config.name === n
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">TTS Voice Model</label>
                <select
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-1 text-[11px] text-white"
                >
                  <option value="Kore">Kore (Warm Female Voice)</option>
                  <option value="Zephyr">Zephyr (Bright Female Voice)</option>
                  <option value="Puck">Puck (Natural Male Voice)</option>
                  <option value="Fenrir">Fenrir (Authoritative Male Voice)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Persona Style</label>
              <select
                value={config.persona}
                onChange={(e) => updateConfig({ persona: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-md p-1.5 text-xs text-white"
              >
                <option value="polite_urdu">Polite Pakistani Urdu (Respectful & Helpful)</option>
                <option value="formal_corporate">Formal Corporate (Concise & Businesslike)</option>
                <option value="casual_friendly">Casual & Friendly (Informal Pakistani Urdu/Punjabi)</option>
                <option value="strict_gatekeeper">Strict Gatekeeper (Verifies identity directly)</option>
              </select>
            </div>
          </div>
        )}

        {/* Detailed Connection & Permission Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-1.5 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{errorDetails?.title || 'Notice'}</div>
              <button
                onClick={() => {
                  setErrorMessage('');
                  setErrorDetails(null);
                }}
                className="text-rose-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{errorMessage}</p>
            {errorDetails?.hint && (
              <div className="pt-1.5 border-t border-rose-900/60 text-[10px] text-rose-300">
                {errorDetails.hint}
              </div>
            )}
          </div>
        )}

        {/* Honest Disclosure Badge (Requirement 7 & 8) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400">
          <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            <strong>Testing Note:</strong> This voice dialog uses your phone's microphone & speaker. Cellular SIM calls are handled separately by the native companion module.
          </span>
        </div>
      </div>

      {/* Reactive Visualizer Centerpiece */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
        <div className="text-center">
          <div className="text-xs font-bold text-white">
            {isActive
              ? sessionStatus === 'speaking'
                ? `${config.name} is speaking audio...`
                : 'Microphone active — speak in Urdu or English now'
              : 'Microphone & Speaker Ready'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {isActive
              ? liveInterimSpeech
                ? `Recognized: "${liveInterimSpeech}"`
                : 'Listening via phone microphone (Auto speech recognition)'
              : 'Tap Start Voice Conversation to speak with PakCall AI'}
          </div>
        </div>

        {/* Live Soundwave Frequency Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs px-4">
          {[
            0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.9, 0.6, 1.0, 0.8, 0.5, 0.9, 0.7, 0.4, 0.6,
          ].map((barScale, idx) => {
            const activeLevel =
              sessionStatus === 'speaking'
                ? Math.max(0.15, visualizerLevels.aiLevel * barScale * 1.5)
                : isActive
                ? Math.max(0.15, visualizerLevels.micLevel * barScale * 1.8)
                : 0.1;

            const heightPct = Math.min(100, Math.max(15, activeLevel * 100));

            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  sessionStatus === 'speaking'
                    ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                    : isActive
                    ? 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-800'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        {/* Primary Start / End Conversation Action Button */}
        <div className="flex items-center justify-center gap-3 pt-1 w-full">
          {!isActive ? (
            <button
              onClick={handleStartConversation}
              className="w-full max-w-sm min-h-[48px] rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-[0.98] transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>Start Voice Conversation</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full max-w-sm">
              <button
                onClick={() => setMicMuted(!micMuted)}
                className={`min-h-[48px] px-4 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                  micMuted
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {micMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-blue-400" />}
                <span>{micMuted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                onClick={handleEndConversation}
                className="flex-1 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950 active:scale-[0.98] transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Conversation Transcript Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[360px] p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center justify-between">
          <span>Live Conversation Transcript</span>
          <span className="font-mono text-blue-400">{conversation.length} Turns</span>
        </div>

        {conversation.map((turn, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {turn.speaker === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                turn.speaker === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
              }`}
            >
              {turn.urduText && (
                <div className="font-urdu text-sm mb-1 text-slate-100 leading-relaxed">
                  {turn.urduText}
                </div>
              )}
              <div className={turn.urduText ? 'text-slate-400 text-[11px] pt-1 border-t border-slate-800/80' : ''}>
                {turn.text}
              </div>

              <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                <span>{turn.timestamp}</span>
                {turn.speaker === 'assistant' && (
                  <button
                    onClick={() => playTurnAudio(turn.urduText || turn.text)}
                    className="text-blue-400 hover:text-white flex items-center gap-0.5 ml-2"
                    title="Replay Voice Audio"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Play Audio</span>
                  </button>
                )}
              </div>
            </div>

            {turn.speaker === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {liveInterimSpeech && (
          <div className="flex gap-2.5 justify-end">
            <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-blue-600/60 border border-blue-400/40 text-blue-100 italic">
              <span className="text-[10px] opacity-75 mr-1">Hearing:</span>
              "{liveInterimSpeech}..."
            </div>
          </div>
        )}

        {isProcessingTurn && (
          <div className="flex items-center gap-2 text-xs text-blue-400 p-2 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>PakCall AI is responding with natural speech...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Alternative Spoken / Text Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendTurn(transcriptInput);
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={transcriptInput}
          onChange={(e) => setTranscriptInput(e.target.value)}
          placeholder={
            config.language === 'urdu'
              ? 'بولیں یا اردو / انگریزی میں ٹائپ کریں...'
              : 'Speak into microphone or type here...'
          }
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!transcriptInput.trim() || isProcessingTurn}
          className="min-h-[44px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};
