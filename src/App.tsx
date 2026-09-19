import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Lock, 
  AlertCircle,
  Eye, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { InputSection } from './components/InputSection';
import { ResultCard } from './components/ResultCard';
import { SecurityGuideModal } from './components/SecurityGuideModal';
import { HistoryModal, SavedHistoryItem } from './components/HistoryModal';
import { analyzeContent } from './analyzer/detector';
import { AnalysisResult } from './types';
import { PRESET_SAMPLES } from './data/samples';

const STORAGE_KEY = 'phisguard_history_v1';

export default function App() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<SavedHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save history helper
  const saveToHistory = (res: AnalysisResult, rawText: string) => {
    try {
      const firstLine = rawText.trim().split('\n')[0] || rawText.trim();
      const snippet = firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;

      const newItem: SavedHistoryItem = {
        id: Date.now().toString(),
        timestamp: res.analyzedAt,
        snippet,
        score: res.score,
        verdict: res.verdict,
        verdictLabel: res.verdictLabel,
        signalsCount: res.signals.length,
        rawInput: rawText,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.slice(0, 19)]; // Keep last 20
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Perform Analysis
  const handleAnalyze = () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    // Provide a small 350ms delay for visual scanner feedback
    setTimeout(() => {
      const analysis = analyzeContent(input);
      setResult(analysis);
      setIsAnalyzing(false);
      saveToHistory(analysis, input);

      // Smooth scroll to result
      setTimeout(() => {
        const element = document.getElementById('results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }, 350);
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  const handleSelectHistoryItem = (item: SavedHistoryItem) => {
    setInput(item.rawInput);
    const analysis = analyzeContent(item.rawInput);
    setResult(analysis);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Navigation */}
      <Navbar
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center space-y-3 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Moteur heuristique d'inspection de menaces</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Analysez instantanément vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">emails & liens suspects</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Détectez l'urgence artificielle, le typosquatting de marques, les demandes d'identifiants bancaires et les redirections frauduleuses sans transmettre vos données à un serveur tiers.
          </p>
        </section>

        {/* Input Section */}
        <section>
          <InputSection
            input={input}
            onChange={setInput}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onClear={handleClear}
          />
        </section>

        {/* Results Section */}
        {result && (
          <section id="results-section" className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <ResultCard result={result} />
          </section>
        )}

        {/* Feature Highlights (when no result is shown yet) */}
        {!result && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Détection de marques imitées
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algorithme Levenshtein et analyse d'homoglyphes (paypa1, amaz0n, impots-gouv.xyz, etc.).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Filtre d'urgence psychologique
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Repère les pressions temporelles ("sous 24h", "compte bloqué", "dernier délai", etc.).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Protection des identifiants
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Alerte sur les sollicitations de mots de passe, cartes de crédit, codes OTP et numéros fiscaux.
              </p>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080c14] py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-mono">PHIS GUARD</span>
            <span>• Outil de cybersécurité préventif</span>
          </div>

          <p className="text-slate-400 text-[11px] max-w-md">
            L'analyse heuristique fonctionne exclusivement dans votre navigateur (aucun contenu n'est envoyé sur un serveur).
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SecurityGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

    </div>
  );
}
