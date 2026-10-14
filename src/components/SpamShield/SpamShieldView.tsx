import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  PhoneCall,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { CallRecord, SpamReport } from '../../types';

interface SpamShieldViewProps {
  prefilledCall?: CallRecord | null;
  onClose?: () => void;
}

export const SpamShieldView: React.FC<SpamShieldViewProps> = ({
  prefilledCall,
  onClose,
}) => {
  const { spamReports, submitSpamReport, config, updateConfig } = useAssistant();
  const [phone, setPhone] = useState(prefilledCall?.phoneNumber || '+92 ');
  const [carrier, setCarrier] = useState(prefilledCall?.carrier || 'Jazz');
  const [category, setCategory] = useState<SpamReport['category']>('lottery_fake_prize');
  const [notes, setNotes] = useState(prefilledCall?.summary || '');
  const [submittedReport, setSubmittedReport] = useState<SpamReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    try {
      const report = await submitSpamReport({
        phoneNumber: phone.trim(),
        carrier,
        category,
        notes: notes.trim() || 'Reported via PakCall AI Fraud Registry',
      });
      setSubmittedReport(report);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              PTA Spam & Fraud Shield
            </h1>
            <p className="text-xs text-slate-400">
              Pakistan Telecommunication Authority Protection Network
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900"
          >
            Close
          </button>
        )}
      </div>

      {/* Official PTA Instruction Callout */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-800/60 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Official PTA Fraud Reporting Guidelines</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Report unsolicited calls directly to PTA: Send spammer number and incident details via SMS to <strong>4009</strong> (free of charge) or forward the message to <strong>9000</strong> across Jazz, Zong, Telenor, and Ufone.
        </p>
      </div>

      {/* Screening Sensitivity Level */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          AI Screening Strictness
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'lenient',
              label: 'Lenient',
              desc: 'Screens only known blacklists',
            },
            {
              id: 'balanced',
              label: 'Balanced',
              desc: 'Screens all non-contacts',
            },
            {
              id: 'strict_pta',
              label: 'Strict PTA',
              desc: 'Auto-blocks financial fraud',
            },
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => updateConfig({ spamFilterLevel: level.id as any })}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                config.spamFilterLevel === level.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">{level.label}</div>
              <div className="text-[10px] mt-0.5 opacity-80 leading-tight">
                {level.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Form */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Report Unwanted Number to PTA Registry
        </h2>

        {submittedReport ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Report Registered Successfully!
            </div>
            <p className="text-xs text-slate-300">
              Reference Tracking Number: <strong className="font-mono text-white">{submittedReport.ptaReportNumber}</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              The number {submittedReport.phoneNumber} ({submittedReport.carrier}) has been marked as high-risk in PakCall AI's local database and submitted for carrier network blacklisting.
            </p>
            <button
              onClick={() => setSubmittedReport(null)}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 text-xs text-white hover:bg-slate-800"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Spammer Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Carrier Network
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Jazz">Jazz (Mobilink)</option>
                  <option value="Zong">Zong (CMPak)</option>
                  <option value="Telenor">Telenor Pakistan</option>
                  <option value="Ufone">Ufone (PTCL)</option>
                  <option value="PTCL">PTCL Landline</option>
                  <option value="Other">Other / International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fraud Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="lottery_fake_prize">Jeeto Pak / Fake Prize</option>
                  <option value="bisp_fake_disbursement">BISP 8171 Fraud</option>
                  <option value="bank_otp_fraud">Bank OTP / PIN Phishing</option>
                  <option value="telemarketing">Unsolicited Telemarketing</option>
                  <option value="robocall">Automated Robocall</option>
                  <option value="impersonation_law">Government Impersonation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Description / Call Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what the caller said or demanded (e.g. asked for advance fee via EasyPaisa/JazzCash)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !phone.trim()}
              className="w-full min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Fraud Report</span>
            </button>
          </form>
        )}
      </div>

      {/* Submitted Reports History */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recent PTA Complaints ({spamReports.length})
        </h2>
        <div className="space-y-2">
          {spamReports.map((report) => (
            <div
              key={report.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white">
                  {report.phoneNumber}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  {report.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Tracking Ref: <span className="font-mono text-slate-200">{report.ptaReportNumber}</span> · {report.carrier}
              </div>
              <p className="text-[11px] text-slate-300">{report.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
