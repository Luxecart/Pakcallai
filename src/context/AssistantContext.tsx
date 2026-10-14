import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AssistantConfig,
  CallRecord,
  Contact,
  SpamReport,
  TranscriptTurn,
} from '../types';
import {
  defaultAssistantConfig,
  initialCalls,
  initialContacts,
  initialSpamReports,
} from '../data/mockData';

interface AssistantContextType {
  config: AssistantConfig;
  updateConfig: (updates: Partial<AssistantConfig>) => void;
  calls: CallRecord[];
  addCall: (call: CallRecord) => void;
  deleteCall: (id: string) => void;
  clearAllCalls: () => void;
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  spamReports: SpamReport[];
  submitSpamReport: (report: Omit<SpamReport, 'id' | 'reportedAt' | 'ptaReportNumber' | 'status'>) => Promise<SpamReport>;
  // Active simulator call state
  activeCallSimulator: {
    isOpen: boolean;
    callerNumber: string;
    callerName: string;
    carrier: CallRecord['carrier'];
    scenario: string;
    transcript: TranscriptTurn[];
    isAiSpeaking: boolean;
    isListening: boolean;
    verdict?: 'allow' | 'screen' | 'block_spam';
  } | null;
  startCallSimulation: (scenario: {
    callerNumber: string;
    callerName: string;
    carrier: CallRecord['carrier'];
    scenarioName: string;
    initialCallerMessage: string;
    initialCallerUrdu?: string;
  }) => void;
  endCallSimulation: (action: 'allow' | 'block' | 'save_voicemail') => void;
  sendSimulatorMessage: (message: string) => Promise<void>;
  setIsSimulatorListening: (listening: boolean) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

const CONFIG_KEY = 'pakcall_config_v1';
const CALLS_KEY = 'pakcall_calls_v1';
const CONTACTS_KEY = 'pakcall_contacts_v1';
const SPAM_KEY = 'pakcall_spam_v1';

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AssistantConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      return saved ? JSON.parse(saved) : defaultAssistantConfig;
    } catch {
      return defaultAssistantConfig;
    }
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    try {
      const saved = localStorage.getItem(CALLS_KEY);
      return saved ? JSON.parse(saved) : initialCalls;
    } catch {
      return initialCalls;
    }
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(CONTACTS_KEY);
      return saved ? JSON.parse(saved) : initialContacts;
    } catch {
      return initialContacts;
    }
  });

  const [spamReports, setSpamReports] = useState<SpamReport[]>(() => {
    try {
      const saved = localStorage.getItem(SPAM_KEY);
      return saved ? JSON.parse(saved) : initialSpamReports;
    } catch {
      return initialSpamReports;
    }
  });

  const [activeCallSimulator, setActiveCallSimulator] = useState<AssistantContextType['activeCallSimulator']>(null);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(CALLS_KEY, JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(SPAM_KEY, JSON.stringify(spamReports));
  }, [spamReports]);

  const updateConfig = (updates: Partial<AssistantConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const addCall = (call: CallRecord) => {
    setCalls((prev) => [call, ...prev]);
  };

  const deleteCall = (id: string) => {
    setCalls((prev) => prev.filter((c) => c.id !== id));
  };

  const clearAllCalls = () => {
    setCalls([]);
  };

  const addContact = (contactData: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}`,
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const submitSpamReport = async (
    report: Omit<SpamReport, 'id' | 'reportedAt' | 'ptaReportNumber' | 'status'>
  ): Promise<SpamReport> => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const newReport: SpamReport = {
      ...report,
      id: `rep_${Date.now()}`,
      reportedAt: new Date().toISOString(),
      ptaReportNumber: `PTA-DIRBS-${new Date().getFullYear()}-${randomCode}`,
      status: 'submitted',
    };

    setSpamReports((prev) => [newReport, ...prev]);

    // Also update any matching call record
    setCalls((prev) =>
      prev.map((c) =>
        c.phoneNumber === report.phoneNumber ? { ...c, isSpamReported: true } : c
      )
    );

    return newReport;
  };

  const startCallSimulation = (scenario: {
    callerNumber: string;
    callerName: string;
    carrier: CallRecord['carrier'];
    scenarioName: string;
    initialCallerMessage: string;
    initialCallerUrdu?: string;
  }) => {
    // Determine assistant opening greeting based on config language and persona
    let greetingEn = `Assalam-o-Alaikum, I am ${config.name}, AI call assistant for Tariq Khan. Who is calling and what is the purpose of your call?`;
    let greetingUrdu = `السلام علیکم! میں طارق خان کی اے آئی اسسٹنٹ ${config.name} ہوں۔ فرمائیے آپ کون بات کر رہے ہیں اور کال کا کیا مقصد ہے؟`;

    if (config.language === 'punjabi') {
      greetingUrdu = `سلام جی! میں فون اسسٹنٹ ${config.name} ہاں۔ دسو کون گل کر رہیا اے تے کی کم اے؟`;
      greetingEn = `Salam! I am ${config.name}, speaking in Punjabi. Please let me know who is calling and your purpose.`;
    }

    const initialTranscript: TranscriptTurn[] = [
      {
        speaker: 'assistant',
        text: greetingEn,
        urduText: greetingUrdu,
        timestamp: '00:02',
      },
      {
        speaker: 'caller',
        text: scenario.initialCallerMessage,
        urduText: scenario.initialCallerUrdu,
        timestamp: '00:07',
      },
    ];

    setActiveCallSimulator({
      isOpen: true,
      callerNumber: scenario.callerNumber,
      callerName: scenario.callerName,
      carrier: scenario.carrier,
      scenario: scenario.scenarioName,
      transcript: initialTranscript,
      isAiSpeaking: true,
      isListening: false,
      verdict: 'screen',
    });

    // Auto-trigger assistant response to the caller message
    setTimeout(() => {
      respondToCaller(scenario.initialCallerMessage, initialTranscript);
    }, 1200);
  };

  const respondToCaller = async (callerMessage: string, currentTranscript: TranscriptTurn[]) => {
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: callerMessage,
          language: config.language,
          persona: config.persona,
          assistantName: config.name,
          conversationHistory: currentTranscript,
        }),
      });

      const data = await response.json();
      const assistantTurn: TranscriptTurn = {
        speaker: 'assistant',
        text: data.englishSummary || data.speechText,
        urduText: data.speechText,
        timestamp: '00:15',
      };

      setActiveCallSimulator((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          transcript: [...prev.transcript, assistantTurn],
          isAiSpeaking: false,
          verdict: data.verdict || 'screen',
        };
      });
    } catch (err) {
      // Local fallback
      setActiveCallSimulator((prev) => {
        if (!prev) return null;
        const fallbackTurn: TranscriptTurn = {
          speaker: 'assistant',
          text: 'Thank you. I have logged your message and notified the recipient.',
          urduText: 'شکریہ۔ میں نے آپ کا پیغام نوٹ کر لیا ہے اور صاحب کو مطلع کر دیا ہے۔',
          timestamp: '00:16',
        };
        return {
          ...prev,
          transcript: [...prev.transcript, fallbackTurn],
          isAiSpeaking: false,
          verdict: 'allow',
        };
      });
    }
  };

  const sendSimulatorMessage = async (message: string) => {
    if (!activeCallSimulator) return;

    const callerTurn: TranscriptTurn = {
      speaker: 'caller',
      text: message,
      timestamp: '00:22',
    };

    const newTranscript = [...activeCallSimulator.transcript, callerTurn];

    setActiveCallSimulator((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        transcript: newTranscript,
        isAiSpeaking: true,
      };
    });

    await respondToCaller(message, newTranscript);
  };

  const setIsSimulatorListening = (listening: boolean) => {
    setActiveCallSimulator((prev) => (prev ? { ...prev, isListening: listening } : null));
  };

  const endCallSimulation = (action: 'allow' | 'block' | 'save_voicemail') => {
    if (!activeCallSimulator) return;

    const isSpam = action === 'block' || activeCallSimulator.verdict === 'block_spam';
    const newRecord: CallRecord = {
      id: `call_sim_${Date.now()}`,
      phoneNumber: activeCallSimulator.callerNumber,
      contactName: activeCallSimulator.callerName,
      callerType: isSpam ? 'suspected_spam' : 'delivery',
      carrier: activeCallSimulator.carrier,
      direction: 'incoming',
      status: action === 'block' ? 'screened_blocked' : action === 'allow' ? 'screened_allowed' : 'voicemail',
      timestamp: 'Just now',
      durationSeconds: 38,
      summary: isSpam
        ? 'Potential spam call screened and blocked by PakCall AI.'
        : `Screened inquiry regarding: ${activeCallSimulator.scenario}.`,
      urgency: isSpam ? 'low' : 'medium',
      sentiment: isSpam ? 'suspicious' : 'friendly',
      actionItems: isSpam
        ? ['Flagged for PTA Spam Registry', 'Number added to blacklist']
        : ['Transcript saved to call log', 'Notification sent to phone'],
      transcript: activeCallSimulator.transcript,
      hasRecording: config.recordWithConsent,
      spamReason: isSpam ? 'Suspicious telemarketing or verification scam' : undefined,
    };

    addCall(newRecord);
    setActiveCallSimulator(null);
  };

  return (
    <AssistantContext.Provider
      value={{
        config,
        updateConfig,
        calls,
        addCall,
        deleteCall,
        clearAllCalls,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        spamReports,
        submitSpamReport,
        activeCallSimulator,
        startCallSimulation,
        endCallSimulation,
        sendSimulatorMessage,
        setIsSimulatorListening,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within an AssistantProvider');
  return context;
};
