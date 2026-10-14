import React, { useState } from 'react';
import {
  X,
  Cpu,
  PhoneCall,
  Server,
  Lock,
  Radio,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Volume2,
  Mic,
  ShieldAlert,
} from 'lucide-react';

interface TelephonyGuideModalProps {
  onClose: () => void;
}

export const TelephonyGuideModal: React.FC<TelephonyGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'stage3_voice' | 'android_native' | 'telephony_sip' | 'firebase_backend'>('stage3_voice');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-[#0d1424] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090e1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Stage 3: AI Voice Integration Architecture
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Android SIM Audio Limits · Acoustic Bridge · Gemini Live Urdu Engine
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 p-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('stage3_voice')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'stage3_voice'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 3: AI Voice Bridge
          </button>
          <button
            onClick={() => setActiveTab('android_native')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'android_native'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Android Native
          </button>
          <button
            onClick={() => setActiveTab('telephony_sip')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'telephony_sip'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. GSM & SIP Telephony
          </button>
          <button
            onClick={() => setActiveTab('firebase_backend')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'firebase_backend'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Firebase Backend
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB: STAGE 3 AI VOICE BRIDGE */}
          {activeTab === 'stage3_voice' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Android Cellular Audio Restriction (Truth & Transparency)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Android OS strictly forbids third-party apps from tapping the baseband modem's raw digital audio stream. 
                  APIs like <code className="text-amber-200">AudioSource.VOICE_CALL</code> and <code className="text-amber-200">VOICE_DOWNLINK</code> require the <code className="text-amber-200">CAPTURE_AUDIO_OUTPUT</code> system-signature permission, granted only to device manufacturer system ROMs (OEMs) or rooted phones.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-blue-400" />
                  The Supported Free Android Solution: Acoustic Call Bridge
                </h3>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <strong className="text-white">InCallService Auto-Answer:</strong>
                      <p className="text-[11px] text-slate-400">
                        When an incoming call is received, <code className="text-blue-300">PakInCallService</code> (holding <code className="text-blue-300">ROLE_DIALER</code>) programmatically answers via <code className="text-blue-300">call.answer(STATE_AUDIO_ONLY)</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-white">Acoustic Coupling & Hardware AEC:</strong>
                      <p className="text-[11px] text-slate-400">
                        The phone activates in-call speakerphone (<code className="text-blue-300">AudioManager.MODE_IN_CALL</code>). <code className="text-blue-300">AcousticCallBridge</code> records ambient caller speech using <code className="text-blue-300">VOICE_COMMUNICATION</code> with hardware <code className="text-blue-300">AcousticEchoCanceler</code> active.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-white">Low-Latency Urdu WebSocket to Gemini:</strong>
                      <p className="text-[11px] text-slate-400">
                        Audio frames (16kHz PCM) stream over WebSocket to the secure PakCall backend (<code className="text-blue-300">/api/live</code>). Gemini processes natural Urdu/Punjabi dialogue without exposing API keys on the client.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <strong className="text-white">AudioTrack Playback into Call:</strong>
                      <p className="text-[11px] text-slate-400">
                        The assistant's spoken Urdu reply streams back as PCM audio and plays out the device speaker, allowing the caller to hear the AI in real time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Free Alternative: GSM Conditional Forwarding + Free PBX (Asterisk)
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <p>
                    For users who want 100% digital audio without relying on physical speakerphone:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    <li>Dial standard GSM code <code className="text-emerald-300">*67*&lt;SIP_DID&gt;#</code> (forward when declined/busy).</li>
                    <li>Incoming screened calls route digitally to a free Asterisk/FreePBX SIP server.</li>
                    <li>Asterisk bridges caller RTP audio directly to the PakCall AI WebSocket backend.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ANDROID NATIVE */}
          {activeTab === 'android_native' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300 space-y-1">
                <span className="font-bold">Android Calling Assistant Reality:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Web applications cannot directly intercept raw GSM voice streams from an Android physical SIM card due to Android sandbox security rules. To build a true Android AI call assistant, the app requires a native Kotlin/Java Android component using Google's official Telecom APIs.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  Required Android APIs & Permissions
                </h3>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5">
                  <div className="text-blue-400">// AndroidManifest.xml permissions</div>
                  <div>&lt;uses-permission android:name="android.permission.READ_PHONE_STATE" /&gt;</div>
                  <div>&lt;uses-permission android:name="android.permission.ANSWER_PHONE_CALLS" /&gt;</div>
                  <div>&lt;uses-permission android:name="android.permission.RECORD_AUDIO" /&gt;</div>
                  <div>&lt;uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" /&gt;</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Key Implementation Components:</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white">CallScreeningService (Android 10+):</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enables background evaluation of incoming numbers against your local PakCall contacts and PTA blacklist before ringing. Can automatically disallow or reject known scammers.
                    </p>
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-white">InCallService (Default Phone App):</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Required if you want the assistant to answer the call, stream audio, and display real-time live transcription overlay on the phone screen like Google Pixel Call Screen.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: GSM & SIP TELEPHONY */}
          {activeTab === 'telephony_sip' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-1">
                <span className="font-bold">Telephony Bridge Architecture (Pakistani Carriers):</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  How real AI phone calling works seamlessly with Jazz, Telenor, Zong, and Ufone SIM cards without requiring custom ROMs or rooting.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-blue-400" />
                    Step 1: Conditional Call Forwarding (MMI Codes)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Users dial standard GSM conditional forwarding codes on their phone (e.g. <code>*67*+92XXXXXXXXX#</code> or <code>*61*</code>). When an unknown number rings or the user declines, the carrier forwards the audio channel to the PakCall AI Telephony Gateway.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-blue-400" />
                    Step 2: Bidirectional WebRTC / Audio Stream
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The SIP trunk (Twilio, Telnyx, or Pakistani local telecom DID) opens a WebSocket audio stream (PCM 8kHz / 16kHz) to the Gemini Real-time API. Gemini answers in Urdu or Punjabi, analyzes caller replies, and streams synthesized speech back to the caller in &lt;300ms.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    Step 3: Call Transfer / Ring-Through
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If the caller is verified safe (e.g. Foodpanda delivery rider or doctor), the assistant executes a SIP REFER command to transfer the live call back to the user's mobile device with a screen summary push notification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE & BACKEND ARCHITECTURE */}
          {activeTab === 'firebase_backend' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300 space-y-1">
                <span className="font-bold">Firebase Authentication & Cloud Backend:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  How this frontend is architected to seamlessly plug into Firebase Auth and Cloud Firestore.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-400" />
                  Firestore Schema Blueprint
                </h3>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>/users/{'{userId}'} : user profile, carrier, city</div>
                  <div>/users/{'{userId}'}/calls/{'{callId}'} : summaries, transcripts, audioUrls</div>
                  <div>/users/{'{userId}'}/contacts/{'{contactId}'} : VIP rules, bypass flags</div>
                  <div>/spam_registry/{'{phoneNumber}'} : PTA reports, blacklist flags</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Firebase Security Rules:</h4>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
                  match /users/{'{userId}'}/* {'{'} <br />
                  &nbsp;&nbsp;allow read, write: if request.auth.uid == userId;<br />
                  {'}'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#090e1a] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
