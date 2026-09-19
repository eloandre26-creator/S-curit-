import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Clock, 
  Globe, 
  Key, 
  Mail, 
  Link as LinkIcon, 
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { DetectedSignal, SeverityLevel, SignalCategory } from '../types';

interface SignalCardProps {
  signal: DetectedSignal;
  index: number;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, index }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Category visual mapping
  const categoryConfig: Record<SignalCategory, { label: string; icon: React.ElementType }> = {
    urgency: { label: 'Urgence artificielle', icon: Clock },
    domain: { label: 'Domaine & Fausse marque', icon: Globe },
    credentials: { label: 'Identifiants & Données', icon: Key },
    sender: { label: 'Expéditeur & Identité', icon: Mail },
    links: { label: 'Liens & Redirections', icon: LinkIcon },
    content: { label: 'Contenu & Pièces jointes', icon: FileText },
  };

  // Severity visual mapping
  const severityConfig: Record<SeverityLevel, { label: string; badge: string; border: string; icon: React.ElementType }> = {
    critical: {
      label: 'Critique',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      border: 'border-rose-500/40 hover:border-rose-500/70',
      icon: AlertOctagon,
    },
    high: {
      label: 'Élevé',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      border: 'border-orange-500/30 hover:border-orange-500/60',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Modéré',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      icon: AlertTriangle,
    },
    low: {
      label: 'Faible',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      border: 'border-sky-500/20 hover:border-sky-500/40',
      icon: Info,
    },
    info: {
      label: 'Information',
      badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      border: 'border-slate-700 hover:border-slate-600',
      icon: Info,
    },
  };

  const cat = categoryConfig[signal.category] || { label: signal.category, icon: Info };
  const sev = severityConfig[signal.severity] || severityConfig.medium;
  const CatIcon = cat.icon;
  const SevIcon = sev.icon;

  const matchedSnippets = Array.isArray(signal.matchedText) 
    ? signal.matchedText 
    : signal.matchedText 
      ? [signal.matchedText] 
      : [];

  return (
    <div 
      className={`rounded-xl border bg-slate-900/70 backdrop-blur-sm transition-all duration-200 overflow-hidden ${sev.border}`}
    >
      {/* Header bar */}
      <div 
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5 text-slate-300">
            <CatIcon className="w-4 h-4 text-emerald-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Category pill */}
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {cat.label}
              </span>

              {/* Severity badge */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border font-mono ${sev.badge}`}>
                <SevIcon className="w-3 h-3" />
                {sev.label}
              </span>

              {/* Impact points */}
              <span className="text-[11px] font-mono text-rose-400 font-semibold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/50">
                +{signal.scoreImpact} pts
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
              {signal.title}
            </h4>
          </div>
        </div>

        <button 
          type="button" 
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Body details */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-slate-800/60 mt-1 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3">
            {signal.description}
          </p>

          {/* Matched text quote */}
          {matchedSnippets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                Extrait détecté :
              </span>
              <div className="flex flex-col gap-1.5">
                {matchedSnippets.map((snippet, i) => (
                  <div 
                    key={i} 
                    className="p-2.5 rounded-lg bg-[#070b12] border border-rose-950/60 font-mono text-xs text-rose-300/90 break-all select-all flex items-start gap-2"
                  >
                    <span className="text-rose-500 font-bold select-none">❯</span>
                    <span>"{snippet}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {signal.recommendation && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-semibold text-emerald-300">Conseil d'expert : </span>
                {signal.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
