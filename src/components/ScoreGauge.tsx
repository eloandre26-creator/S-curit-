import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { VerdictType } from '../types';

interface ScoreGaugeProps {
  score: number;
  verdict: VerdictType;
  verdictLabel: 'Sûr' | 'Suspect' | 'Dangereux';
  verdictSummary: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  verdict,
  verdictLabel,
  verdictSummary,
}) => {
  // Color configuration based on risk level
  const config = {
    safe: {
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      barColor: 'from-emerald-500 to-teal-400',
      strokeColor: '#10b981',
      icon: ShieldCheck,
      statusDesc: 'Indice de risque minimal',
    },
    suspicious: {
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      barColor: 'from-amber-500 to-orange-500',
      strokeColor: '#f59e0b',
      icon: AlertTriangle,
      statusDesc: 'Plusieurs anomalies détectées',
    },
    dangerous: {
      color: 'text-rose-400',
      bgGlow: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      barColor: 'from-rose-500 to-red-600',
      strokeColor: '#f43f5e',
      icon: ShieldAlert,
      statusDesc: 'Menace avérée de phishing',
    },
  }[verdict];

  const Icon = config.icon;

  // SVG Circular Meter Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Semicircle or full circle? Let's use 240 degree gauge or full circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-6 sm:p-8 rounded-2xl border ${config.border} ${config.bgGlow} bg-[#0f172a]/90 backdrop-blur-md relative overflow-hidden transition-all duration-300`}>
      {/* Background ambient gradient glow */}
      <div 
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none ${
          verdict === 'dangerous' ? 'bg-rose-600' : verdict === 'suspicious' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Circular Gauge Display */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Dynamic Value Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={config.strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center Score Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-white">
                {score}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                / 100
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                Score de risque
              </span>
            </div>
          </div>
        </div>

        {/* Verdict & Explanations */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Verdict de l'analyse :
            </span>
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-bold tracking-wide ${config.badgeBg}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{verdictLabel.toUpperCase()}</span>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              {config.statusDesc}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {verdictSummary}
          </p>

          {/* Color-Coded Linear Scale */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold">0 - 25 : Sûr</span>
              <span className="text-amber-400 font-semibold">26 - 65 : Suspect</span>
              <span className="text-rose-400 font-semibold">66 - 100 : Dangereux</span>
            </div>

            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${config.barColor} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(4, score)}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
