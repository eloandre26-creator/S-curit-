import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Lock, Globe, Mail } from 'lucide-react';

interface SecurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      title: "1. Méfiez-vous de l'urgence artificielle et de la peur",
      description: "Les phrases comme 'Compte suspendu sous 24h', 'Dernier avis avant poursuites' ou 'Action requise immédiatement' sont conçues pour déclencher une réaction émotionnelle et vous empêcher de réfléchir.",
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "2. Inspectez le nom de domaine réel (pas juste le nom affiché)",
      description: "Le nom affiché peut indiquer 'Service Sécurité PayPal', alors que l'adresse d'envoi réelle est 'support@paypal-urgent-update.xyz'. Regardez toujours le domaine principal qui précède l'extension.",
      icon: Globe,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "3. Jamais de mot de passe ou de code SMS demandé par courriel",
      description: "Aucune banque, administration (Ameli, Impôts) ou entreprise légitime ne vous demandera votre mot de passe, code de confirmation SMS (OTP) ou numéro de carte bancaire par email.",
      icon: Lock,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "4. Repérez le typosquatting et les homoglyphes",
      description: "Les fraudeurs remplacent un 'l' minuscule par le chiffre '1', un 'o' par un '0' ('amaz0n.com'), ou ajoutent des mots-clés d'apparence légitime ('apple-securite-login.fr').",
      icon: Eye,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "5. Le réflexe du 'Nouvel Onglet'",
      description: "Si vous recevez une alerte concernant un de vos comptes, ne cliquez jamais sur le lien du message. Ouvrez un nouvel onglet vierge dans votre navigateur et tapez vous-même l'adresse officielle.",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-mono">
                GUIDE DE PRÉVENTION ANTI-PHISHING
              </h3>
              <p className="text-xs text-slate-400">
                Les 5 règles indispensables pour déjouer 99% des fraudes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5"
              >
                <div className={`p-2 rounded-lg border shrink-0 ${rule.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    {rule.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            J'ai compris
          </button>
        </div>

      </div>
    </div>
  );
};
