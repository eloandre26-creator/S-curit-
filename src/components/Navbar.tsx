import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, ExternalLink, Terminal } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide, historyCount, onOpenHistory }) => {
  return (
    <header className="border-b border-slate-800 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-rose-500/20 border border-slate-700/80 shadow-inner">
            <ShieldAlert className="w-5 h-5 text-rose-400 absolute" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute translate-x-1 translate-y-1" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                PHIS<span className="text-emerald-400">GUARD</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Détecteur de phishing & analyseur heuristique d'emails et d'URLs
            </p>
          </div>
        </div>

        {/* Right side badges & actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side • Zéro fuite de données</span>
          </div>

          {/* History button */}
          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Historique des analyses"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Historique ({historyCount})</span>
            </button>
          )}

          {/* Guide button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            <span>Règles d'or anti-fraude</span>
          </button>
        </div>

      </div>
    </header>
  );
};
