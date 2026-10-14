import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';
import { AndroidStatusBar } from './components/Navigation/AndroidStatusBar';
import { TopBar } from './components/Navigation/TopBar';
import { BottomNav, NavTab } from './components/Navigation/BottomNav';
import { DashboardView } from './components/Dashboard/DashboardView';
import { VoiceAssistantView } from './components/VoiceAssistant/VoiceAssistantView';
import { CallHistoryView } from './components/CallHistory/CallHistoryView';
import { CallDetailModal } from './components/CallHistory/CallDetailModal';
import { ContactsView } from './components/Contacts/ContactsView';
import { SpamShieldView } from './components/SpamShield/SpamShieldView';
import { AssistantSettingsView } from './components/AssistantSettings/AssistantSettingsView';
import { PrivacyView } from './components/Privacy/PrivacyView';
import { LiveCallSimulatorModal } from './components/Simulator/LiveCallSimulatorModal';
import { AuthModal } from './components/Auth/AuthModal';
import { AuthScreen } from './components/Auth/AuthScreen';
import { TelephonyGuideModal } from './components/TelephonyBridge/TelephonyGuideModal';
import { CallRecord } from './types';
import { Smartphone, Monitor, Shield, Sliders, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [prefilledSpamCall, setPrefilledSpamCall] = useState<CallRecord | null>(null);
  const [prefilledContactPhone, setPrefilledContactPhone] = useState<string | undefined>(undefined);

  // Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTelephonyGuideOpen, setIsTelephonyGuideOpen] = useState(false);
  const [isSpamShieldModalOpen, setIsSpamShieldModalOpen] = useState(false);

  // Settings sub-tab
  const [settingsSubTab, setSettingsSubTab] = useState<'assistant' | 'privacy'>('assistant');

  // Device view toggle (Mobile Flagship Shell vs Responsive)
  const [isDeviceFrameMode, setIsDeviceFrameMode] = useState(true);

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
  };

  const handleOpenSpamReport = (call: CallRecord) => {
    setPrefilledSpamCall(call);
    setIsSpamShieldModalOpen(true);
    setSelectedCall(null);
  };

  const handleAddContactFromCall = (phone: string) => {
    setPrefilledContactPhone(phone);
    setCurrentTab('contacts');
    setSelectedCall(null);
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col items-center justify-start sm:py-4">
      {/* Top Device Mode Toolbar (Visible on larger screens for reviewing both mobile & expanded modes) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-4xl px-4 py-2 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">PakCall AI Android Preview</span>
          <span>·</span>
          <span>Pakistan Telecom Screening & Shield</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceFrameMode(true)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
              isDeviceFrameMode
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Phone View</span>
          </button>
          <button
            onClick={() => setIsDeviceFrameMode(false)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
              !isDeviceFrameMode
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expanded View</span>
          </button>
        </div>
      </div>

      {/* Main Container / Mobile Frame */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col bg-[#070b14] shadow-2xl ${
          isDeviceFrameMode
            ? 'max-w-md sm:rounded-[36px] sm:border-[8px] sm:border-slate-800/90 sm:ring-1 sm:ring-slate-700/50 min-h-[92vh] overflow-hidden'
            : 'max-w-4xl rounded-2xl border border-slate-800 min-h-[92vh]'
        }`}
      >
        {/* Android Punch Hole Camera on device frame */}
        {isDeviceFrameMode && (
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-slate-800 z-50 pointer-events-none"></div>
        )}

        {/* Android Status Bar */}
        <AndroidStatusBar />

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-900/40 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">PakCall AI</h2>
              <p className="text-xs text-slate-400">Connecting to Firebase Security...</p>
            </div>
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : !isAuthenticated ? (
          // PROTECTED ACCESS: If user is not logged in, show AuthScreen!
          <AuthScreen />
        ) : (
          // AUTHENTICATED: Show Full Protected Application
          <>
            {/* Main App Top Bar */}
            <TopBar
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenTelephonyGuide={() => setIsTelephonyGuideOpen(true)}
              onOpenSpamShield={() => setIsSpamShieldModalOpen(true)}
            />

            {/* Tab Content Views */}
            <main className="flex-1 overflow-y-auto">
              {currentTab === 'dashboard' && (
                <DashboardView
                  onSelectCall={handleSelectCall}
                  onOpenVoice={() => setCurrentTab('voice')}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  onOpenSpamShield={() => setIsSpamShieldModalOpen(true)}
                  onOpenTelephonyGuide={() => setIsTelephonyGuideOpen(true)}
                  onNavigateToCalls={() => setCurrentTab('calls')}
                />
              )}

              {currentTab === 'calls' && (
                <CallHistoryView
                  onSelectCall={handleSelectCall}
                  onOpenSpamReport={handleOpenSpamReport}
                />
              )}

              {currentTab === 'voice' && <VoiceAssistantView />}

              {currentTab === 'contacts' && (
                <ContactsView
                  initialPrefilledPhone={prefilledContactPhone}
                  onClearPrefilled={() => setPrefilledContactPhone(undefined)}
                />
              )}

              {currentTab === 'settings' && (
                <div className="space-y-3">
                  {/* Settings Sub-Tab Toggle */}
                  <div className="px-4 pt-3 max-w-xl mx-auto">
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setSettingsSubTab('assistant')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                          settingsSubTab === 'assistant'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Assistant & Voice</span>
                      </button>
                      <button
                        onClick={() => setSettingsSubTab('privacy')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                          settingsSubTab === 'privacy'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Privacy & Consent</span>
                      </button>
                    </div>
                  </div>

                  {settingsSubTab === 'assistant' ? (
                    <AssistantSettingsView />
                  ) : (
                    <PrivacyView />
                  )}
                </div>
              )}
            </main>

            {/* Ergonomic Bottom Navigation */}
            <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
          </>
        )}
      </div>

      {/* MODALS */}

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
          onOpenSpamReport={handleOpenSpamReport}
          onAddContact={handleAddContactFromCall}
        />
      )}

      {/* Live Call Simulator Modal */}
      {isSimulatorOpen && (
        <LiveCallSimulatorModal onClose={() => setIsSimulatorOpen(false)} />
      )}

      {/* Spam Shield Modal */}
      {isSpamShieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d1424] border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex-1 overflow-y-auto">
              <SpamShieldView
                prefilledCall={prefilledSpamCall}
                onClose={() => {
                  setIsSpamShieldModalOpen(false);
                  setPrefilledSpamCall(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Auth Profile Modal (for logged in user) */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onOpenTelephonyGuide={() => {
            setIsAuthOpen(false);
            setIsTelephonyGuideOpen(true);
          }}
        />
      )}

      {/* Telephony Architecture Guide Modal */}
      {isTelephonyGuideOpen && (
        <TelephonyGuideModal onClose={() => setIsTelephonyGuideOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AssistantProvider>
        <AppContent />
      </AssistantProvider>
    </AuthProvider>
  );
}
