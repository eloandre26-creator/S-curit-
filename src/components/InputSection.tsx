import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Clipboard, 
  Sparkles, 
  Globe, 
  Mail, 
  HelpCircle,
  FileCode
} from 'lucide-react';
import { PRESET_SAMPLES } from '../data/samples';
import { PresetSample } from '../types';

interface InputSectionProps {
  input: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClear: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  input,
  onChange,
  onAnalyze,
  isAnalyzing,
  onClear,
}) => {
  const [copiedSampleId, setCopiedSampleId] = useState<string | null>(null);

  // Auto-detection of format
  const trimmed = input.trim();
  const isUrl = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/i.test(trimmed);
  const detectedType = trimmed.length === 0 ? null : isUrl ? 'URL isolée' : 'Texte / Email';

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {
      // Fallback if clipboard API is restricted in iframe
    }
  };

  const handleSampleClick = (sample: PresetSample) => {
    onChange(sample.content);
    setCopiedSampleId(sample.id);
    setTimeout(() => setCopiedSampleId(null), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (trimmed.length > 0 && !isAnalyzing) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Sample Quick Bar */}
      <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tester avec des exemples réalistes :</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Cliquez pour charger instantanément
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_SAMPLES.map((sample) => {
            const isDanger = sample.difficulty === 'Dangereux';
            const isSelected = copiedSampleId === sample.id;

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
                }`}
                title={sample.description}
              >
                {sample.category === 'url' ? (
                  <Globe className="w-3 h-3 text-sky-400" />
                ) : (
                  <Mail className="w-3 h-3 text-amber-400" />
                )}
                <span>{sample.name}</span>
                <span
                  className={`text-[9px] px-1 rounded uppercase font-mono font-bold ${
                    isDanger 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {sample.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl focus-within:border-emerald-500/50 transition-colors">
        
        {/* Header Toolbar */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400 font-medium">Contenu à scanner</span>
            {detectedType && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {detectedType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs"
              title="Coller depuis le presse-papier"
            >
              <Clipboard className="w-3 h-3 text-slate-400" />
              <span>Coller</span>
            </button>

            {/* Clear Button */}
            {trimmed.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-900/40 transition-colors text-xs"
                title="Effacer le champ"
              >
                <Trash2 className="w-3 h-3" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Collez ici le texte intégral d'un email (y compris l'expéditeur, l'objet et les liens) OU une URL suspecte à examiner (ex: https://paypa1-account-update.xyz)..."
          rows={7}
          className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-y font-mono leading-relaxed selection:bg-emerald-500/30"
        />

        {/* Bottom Bar: Character count + Analyze Button */}
        <div className="px-4 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>{input.length} caractères</span>
            {trimmed.length > 0 && (
              <span className="hidden sm:inline text-slate-400">
                • Raccourci : <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Ctrl + Entrée</kbd>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={trimmed.length === 0 || isAnalyzing}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              trimmed.length === 0 || isAnalyzing
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Analyse heuristique en cours...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyser le contenu</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
