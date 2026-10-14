import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Eye,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { useAuth } from '../../context/AuthContext';

export const PrivacyView: React.FC = () => {
  const { config, updateConfig, calls } = useAssistant();
  const { deleteAccount, user } = useAuth();
  const [retentionDays, setRetentionDays] = useState<'7' | '30' | '90' | 'never'>('30');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ user, config, calls }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pakcall_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') return;
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-3 max-w-xl mx-auto">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Privacy & Security
        </h1>
        <p className="text-xs text-slate-400">
          Pakistan Telecommunications Act & PECA 2016 Compliance
        </p>
      </div>

      {/* Mandatory AI Disclosure Section */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Mandatory AI Disclosure
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          PakCall AI strictly complies with transparency standards. Every incoming caller is immediately notified that an artificial intelligence assistant is answering before any speech is processed.
        </p>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-semibold text-slate-200">Active Audio Disclosure Script:</div>
          <p className="italic text-slate-300">
            "Assalam-o-Alaikum, this is PakCall AI screening on behalf of {user?.name}. Please state your name and purpose."
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300">Enforce AI Disclosure</span>
          <span className="text-xs text-emerald-400 font-semibold font-mono">
            Always Enabled (Locked)
          </span>
        </div>
      </div>

      {/* Call Recording Consent (PECA Compliance) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Recording Consent & PECA Guidelines
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Under the <strong>Prevention of Electronic Crimes Act (PECA) 2016</strong>, unauthorized wiretapping is illegal. PakCall AI requires clear notice and caller consent before recording any audio conversation.
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-medium text-white">Require Caller Consent for Audio</div>
            <div className="text-[10px] text-slate-400">
              Only transcribe text if consent is denied
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

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Cloud Recording Retention Period
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'never', label: 'Never Store' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setRetentionDays(period.id as any)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  retentionDays === period.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-4 h-4 text-blue-400" />
          Export Your Transcripts
        </h2>
        <p className="text-xs text-slate-300">
          Download a complete portable archive of your call logs, transcripts, and contact screening preferences.
        </p>
        <button
          onClick={handleExportData}
          className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export All Data (JSON)</span>
        </button>
      </div>

      {/* Account Deletion */}
      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" />
          Permanent Account & Data Deletion
        </h2>
        <p className="text-xs text-slate-300">
          Permanently delete your PakCall AI profile, all recorded audio, transcripts, contacts, and custom screening configurations. This action cannot be reversed.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="min-h-[44px] px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
        >
          Delete Account & Wipe Data
        </button>
      </div>

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0d1424] border border-rose-900/60 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Confirm Account Deletion
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will erase all logs for <strong>{user?.phone}</strong> immediately. Type <span className="font-mono text-white font-bold bg-slate-900 px-1 py-0.5 rounded">delete</span> below to proceed:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="type 'delete'"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText.toLowerCase() !== 'delete' || isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
