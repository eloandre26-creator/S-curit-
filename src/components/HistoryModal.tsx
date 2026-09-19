import React from 'react';
import { X, Trash2, Clock, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '../types';

export interface SavedHistoryItem {
  id: string;
  timestamp: string;
  snippet: string;
  score: number;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  verdictLabel: string;
  signalsCount: number;
  rawInput: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedHistoryItem[];
  onSelect: (item: SavedHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-mono">
                HISTORIQUE DES ANALYSES
              </h3>
              <p className="text-xs text-slate-400">
                {history.length} analyse{history.length > 1 ? 's' : ''} enregistrée{history.length > 1 ? 's' : ''} localement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 transition-colors text-xs flex items-center gap-1 border border-transparent hover:border-rose-900/50"
                title="Vider l'historique"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Vider</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="p-5 overflow-y-auto space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Aucune analyse enregistrée pour le moment.
            </div>
          ) : (
            history.map((item) => {
              const badgeStyle = {
                safe: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                suspicious: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                dangerous: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              }[item.verdict];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${badgeStyle}`}>
                        {item.verdictLabel} ({item.score}/100)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {item.signalsCount} signal{item.signalsCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate font-mono">
                      {item.snippet}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
