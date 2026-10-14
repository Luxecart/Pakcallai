import React, { useState } from 'react';
import {
  Sliders,
  Bot,
  Languages,
  Mic,
  Volume2,
  Check,
  Shield,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';
import { AssistantPersona, Language } from '../../types';
import { speechAssistant } from '../../services/speechService';

export const AssistantSettingsView: React.FC = () => {
  const { config, updateConfig } = useAssistant();
  const [name, setName] = useState(config.name);
  const [persona, setPersona] = useState<AssistantPersona>(config.persona);
  const [language, setLanguage] = useState<Language>(config.language);
  const [pitch, setPitch] = useState(config.voicePitch);
  const [speed, setSpeed] = useState(config.voiceSpeed);
  const [instructions, setInstructions] = useState(config.customPromptInstructions);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestVoice = () => {
    let testPhrase = '';
    if (language === 'urdu') {
      testPhrase = `السلام علیکم! میں آپ کی اسسٹنٹ ${name} ہوں۔`;
    } else if (language === 'punjabi') {
      testPhrase = `سلام جی! میں تہاڈی فون اسسٹنٹ ${name} ہاں۔`;
    } else {
      testPhrase = `Assalam-o-Alaikum! I am your calling assistant ${name}.`;
    }
    speechAssistant.speak(testPhrase, language, pitch, speed);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      name: name.trim() || 'Aiman',
      persona,
      language,
      voicePitch: pitch,
      voiceSpeed: speed,
      customPromptInstructions: instructions,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-28 px-4 pt-3 max-w-xl mx-auto">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Assistant Customization
        </h1>
        <p className="text-xs text-slate-400">
          Personalize PakCall AI voice, language, and behavior
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Assistant Identity & Name */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-blue-400" />
            Assistant Identity
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assistant Name
            </label>
            <div className="flex gap-2">
              {['Aiman', 'Hamza', 'Zoya', 'Ali'].map((preName) => (
                <button
                  type="button"
                  key={preName}
                  onClick={() => setName(preName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    name === preName
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preName}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Or enter custom name..."
              className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Primary Language */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Primary Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'urdu', label: 'Urdu (اردو)', desc: 'Official Pakistani Urdu' },
                { id: 'punjabi', label: 'Punjabi (پنجابی)', desc: 'Spoken dialect & greetings' },
                { id: 'english', label: 'Pakistani English', desc: 'Clear corporate English' },
                { id: 'bilingual', label: 'Bilingual Hybrid', desc: 'Urdu + English adaptive' },
              ].map((l) => (
                <button
                  type="button"
                  key={l.id}
                  onClick={() => setLanguage(l.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    language === l.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{l.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Persona Style */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Screening Persona
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="polite_urdu">Polite Pakistani Urdu (Assalam-o-Alaikum, respectful & courteous)</option>
              <option value="formal_corporate">Formal Corporate (Strictly professional, concise inquiry)</option>
              <option value="casual_friendly">Casual & Friendly (Relaxed tone for friends and deliveries)</option>
              <option value="strict_gatekeeper">Strict Gatekeeper (Demands caller identity before connecting)</option>
            </select>
          </div>
        </div>

        {/* Voice Audio Controls */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Speech Synthesis Tuning
            </h2>
            <button
              type="button"
              onClick={handleTestVoice}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Voice Pitch</span>
                <span className="font-mono text-slate-400">{pitch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Speaking Rate / Speed</span>
                <span className="font-mono text-slate-400">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-600 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Custom Instructions Prompt */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            Custom Screening Directives
          </h2>
          <p className="text-[11px] text-slate-400">
            Tell the AI how to handle specific callers (e.g. food delivery riders, real estate agents, doctors):
          </p>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="e.g. Always ask delivery riders to leave packages at the gate guard. Do not connect marketing calls."
          />
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-950 transition-colors"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Settings Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Assistant Preferences</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
