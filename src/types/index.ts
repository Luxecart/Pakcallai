export type Language = 'urdu' | 'punjabi' | 'english' | 'bilingual';

export type AssistantPersona = 'polite_urdu' | 'formal_corporate' | 'casual_friendly' | 'strict_gatekeeper';

export type AssistantStatus = 'active' | 'standby' | 'dnd' | 'vip_only';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  carrier: 'Jazz' | 'Zong' | 'Telenor' | 'Ufone' | 'SCOM' | 'PTCL';
  avatar?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AssistantConfig {
  name: string;
  language: Language;
  persona: AssistantPersona;
  voicePitch: number;
  voiceSpeed: number;
  customPromptInstructions: string;
  mandatoryAiDisclosure: boolean;
  recordWithConsent: boolean;
  screenUnknownCallers: boolean;
  autoTranscribe: boolean;
  spamFilterLevel: 'lenient' | 'balanced' | 'strict_pta';
  status: AssistantStatus;
}

export type CallerType = 'known' | 'delivery' | 'business' | 'telecom' | 'suspected_spam' | 'unknown';
export type CallStatus = 'screened_allowed' | 'screened_blocked' | 'transferred' | 'missed' | 'voicemail';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type Sentiment = 'friendly' | 'neutral' | 'urgent' | 'suspicious';

export interface TranscriptTurn {
  speaker: 'assistant' | 'caller' | 'user';
  text: string;
  urduText?: string;
  timestamp: string;
}

export interface CallRecord {
  id: string;
  phoneNumber: string;
  contactName?: string;
  callerType: CallerType;
  carrier: 'Jazz' | 'Telenor' | 'Zong' | 'Ufone' | 'PTCL' | 'Other';
  direction: 'incoming' | 'outgoing';
  status: CallStatus;
  timestamp: string;
  durationSeconds: number;
  summary: string;
  urgency: UrgencyLevel;
  sentiment: Sentiment;
  actionItems: string[];
  transcript: TranscriptTurn[];
  hasRecording: boolean;
  spamReason?: string;
  isSpamReported?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  category: 'family' | 'work' | 'vip' | 'general' | 'blocked';
  alwaysScreen: boolean;
  carrier?: string;
  notes?: string;
}

export interface SpamReport {
  id: string;
  phoneNumber: string;
  category: 'lottery_fake_prize' | 'bisp_fake_disbursement' | 'bank_otp_fraud' | 'telemarketing' | 'impersonation_law' | 'robocall';
  notes: string;
  carrier: string;
  reportedAt: string;
  ptaReportNumber: string;
  status: 'submitted' | 'under_review' | 'carrier_blacklisted';
}
