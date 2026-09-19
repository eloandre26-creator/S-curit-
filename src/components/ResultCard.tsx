import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Filter, 
  Shield, 
  LifeBuoy, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AnalysisResult, SeverityLevel } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { SignalCard } from './SignalCard';

interface ResultCardProps {
  result: AnalysisResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [copiedReport, setCopiedReport] = useState(false);

  // Filter signals
  const filteredSignals = result.signals.filter((s) => {
    if (selectedSeverity === 'all') return true;
    return s.severity === selectedSeverity;
  });

  const handleCopyReport = () => {
    const reportText = `[Rapport d'analyse Phis Guard]
Score de risque : ${result.score}/100
Verdict : ${result.verdictLabel}
Signaux détectés : ${result.signals.length}
${result.signals.map(s => `- [${s.severity.toUpperCase()}] ${s.title}: ${s.description}`).join('\n')}

Recommandations :
${result.recommendations.map(r => `• ${r}`).join('\n')}
Généré le ${result.analyzedAt} via Phis Guard`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Score & Verdict Header */}
      <ScoreGauge
        score={result.score}
        verdict={result.verdict}
        verdictLabel={result.verdictLabel}
        verdictSummary={result.verdictSummary}
      />

      {/* 2. Category Risk Breakdown */}
      {result.signals.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-[#0d131f] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>RÉPARTITION DU RISQUE PAR CATÉGORIE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Évaluation pondérée des vecteurs d'attaque identifiés
              </p>
            </div>
            
            <button
              onClick={handleCopyReport}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Rapport copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copier le rapport</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.categoryBreakdown.map((cat) => {
              const hasAlert = cat.signalCount > 0;
              return (
                <div 
                  key={cat.category}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    hasAlert 
                      ? 'bg-slate-900/90 border-slate-700/80' 
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">
                      {cat.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {cat.signalCount} alerte{cat.signalCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(hasAlert ? 15 : 0, cat.score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Detailed Signals List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <span>SIGNAUX D'ALERTE DÉTECTÉS</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {result.signals.length}
              </span>
            </h3>
          </div>

          {/* Filter Pills */}
          {result.signals.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSeverity('all')}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  selectedSeverity === 'all'
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Tous ({result.signals.length})
              </button>
              {result.stats.criticalCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSeverity('critical')}
                  className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    selectedSeverity === 'critical'
                      ? 'bg-rose-500/30 text-rose-200 border-rose-500/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-300'
                  }`}
                >
                  Critique ({result.stats.criticalCount})
                </button>
              )}
              {result.stats.highCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSeverity('high')}
                  className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    selectedSeverity === 'high'
                      ? 'bg-orange-500/30 text-orange-200 border-orange-500/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-orange-300'
                  }`}
                >
                  Élevé ({result.stats.highCount})
                </button>
              )}
              {result.stats.mediumCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSeverity('medium')}
                  className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                    selectedSeverity === 'medium'
                      ? 'bg-amber-500/30 text-amber-200 border-amber-500/60'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300'
                  }`}
                >
                  Modéré ({result.stats.mediumCount})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Signals Cards or Empty State */}
        {result.signals.length === 0 ? (
          <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">
              Aucun indicateur suspect relevé
            </h4>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              L'analyse n'a détecté aucune formule d'urgence artificielle, ni domaine imitant une marque, ni demande d'identifiants sensible, ni URL raccourcie suspecte.
            </p>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 text-sm">
            Aucun signal ne correspond à ce filtre de sévérité.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSignals.map((signal, idx) => (
              <SignalCard key={signal.id} signal={signal} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Actionable Security Guidance Box */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-[#0c121e] space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <LifeBuoy className="w-4 h-4 text-emerald-400" />
          <span>RECOMMANDATIONS DE SÉCURITÉ IMMÉDIATES</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {result.recommendations.map((rec, i) => (
            <div 
              key={i} 
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
