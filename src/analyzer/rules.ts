import { DetectedSignal } from '../types';

export interface HeuristicRule {
  id: string;
  category: 'urgency' | 'domain' | 'credentials' | 'sender' | 'content' | 'links';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  scoreImpact: number;
  // Regex pattern or evaluator
  pattern?: RegExp;
  minMatches?: number;
  customCheck?: (text: string, lower: string) => { matched: boolean; matchSnippet?: string | string[] };
}

export const HEURISTIC_RULES: HeuristicRule[] = [
  // ================= URGENCY SIGNALS =================
  {
    id: 'urg_account_suspended',
    category: 'urgency',
    severity: 'critical',
    title: 'Menace de suspension de compte immédiate',
    description: 'Le message prétend que votre compte a été ou sera suspendu, bloqué ou résilié pour provoquer une réaction panique irréfléchie.',
    recommendation: 'Ne suivez jamais un lien d\'urgence dans un courriel. Connectez-vous vous-même à l\'application officielle ou à votre espace client via un signet ou votre navigateur.',
    scoreImpact: 25,
    pattern: /\b(?:compte\s+(?:suspendu|bloqu[ée]|verrouill[ée]|restreint|d[ée]sactiv[ée])|(?:votre\s+)?acc[èe]s\s+(?:a\s+[ée]t[ée]\s+)?(?:bloqu[ée]|suspendu)|fermeture\s+(?:imm[ée]diate|d[ée]finitive)\s+de\s+votre\s+compte|account\s+(?:suspended|locked|blocked|restricted|closed)|your\s+account\s+has\s+been\s+(?:locked|suspended))\b/gi,
  },
  {
    id: 'urg_time_pressure',
    category: 'urgency',
    severity: 'high',
    title: 'Pression temporelle extrême (Délai critique)',
    description: 'Imposition d\'un délai court (24h, 48h, "dernier délai") pour vous empêcher de vérifier la véracité du message auprès du service concerné.',
    recommendation: 'Les institutions légitimes n\'imposent pas de sanctions ou de blocages soudains sous 24h par simple email non signé.',
    scoreImpact: 18,
    pattern: /\b(?:sous\s+(?:24|48|12)\s*(?:h|heures?)|dans\s+les\s+(?:24|48)\s*h(?:eures?)?|dernier\s+d[ée]lai|dernier\s+avis|sans\s+d[ée]lai|avant\s+r[ée]siliation|action\s+(?:requise\s+)?imm[ée]diate|agir\s+maintenant|dans\s+un\s+d[ée]lai\s+de\s+24\s*h|within\s+(?:24|48)\s*hours?|act\s+now|immediate\s+action\s+required|final\s+notice)\b/gi,
  },
  {
    id: 'urg_extreme_words',
    category: 'urgency',
    severity: 'medium',
    title: 'Vocabulaire d\'urgence artificielle répété',
    description: 'Mots alarmistes répétés créant un sentiment d\'urgence injustifié ("urgent", "immédiatement", "impératif").',
    recommendation: 'Méfiez-vous des termes alarmistes formulés en majuscules ou insistant lourdement sur la rapidité requise.',
    scoreImpact: 12,
    minMatches: 2,
    pattern: /\b(?:urgent|imm[ée]diatement|imp[ée]ratif|sans\s+attendre|tr[èe]s\s+urgent|immédiat|alarming|urgently)\b/gi,
  },

  // ================= CREDENTIALS & SENSITIVE DATA =================
  {
    id: 'cred_password_request',
    category: 'credentials',
    severity: 'critical',
    title: 'Sollicitation de mot de passe ou code d\'accès',
    description: 'Le message incite à saisir, renseigner ou réinitialiser un mot de passe ou des identifiants d\'authentification.',
    recommendation: 'Aucune société ou institution légitime ne vous demandera votre mot de passe par courriel ou via une page intermédiaire non sollicitée.',
    scoreImpact: 30,
    pattern: /\b(?:votre\s+mot\s+de\s+passe|r[ée]initialiser\s+votre\s+mot\s+de\s+passe|entrez\s+votre\s+mot\s+de\s+passe|saisir\s+vos\s+identifiants|confirmez\s+votre\s+mot\s+de\s+passe|votre\s+code\s+confidentiel|password\s+reset|enter\s+your\s+password|verify\s+your\s+credentials|login\s+details)\b/gi,
  },
  {
    id: 'cred_banking_data',
    category: 'credentials',
    severity: 'critical',
    title: 'Demande de données bancaires sensibles (CB, CVC, RIB)',
    description: 'Demande de carte bancaire, code CVC/CVV à 3 chiffres, numéro IBAN ou coordonnées bancaires complètes.',
    recommendation: 'Ne transmettez JAMAIS vos numéros de carte bancaire ou cryptogramme visuel suite à un email.',
    scoreImpact: 35,
    pattern: /\b(?:num[ée]ro\s+de\s+carte\s+(?:bancaire|de\s+cr[ée]dit)|cryptogramme|code\s+(?:cvv|cvc)|date\s+d'expiration\s+de\s+la\s+carte|coordonn[ée]es\s+bancaires|votre\s+rib|votre\s+iban|credit\s+card\s+number|card\s+security\s+code|cvv2|card\s+expiry)\b/gi,
  },
  {
    id: 'cred_otp_verification',
    category: 'credentials',
    severity: 'critical',
    title: 'Demande de code d\'authentification unique (2FA / OTP / SMS)',
    description: 'Sollicitation directe du code de vérification SMS, jeton de validation ou code temporaire à 6 chiffres.',
    recommendation: 'Le code reçu par SMS ou application 2FA est strictement personnel et ne doit JAMAIS être partagé.',
    scoreImpact: 30,
    pattern: /\b(?:code\s+(?:de\s+)?v[ée]rification|code\s+(?:re[çc]u\s+par\s+)?sms|code\s+otp|code\s+[àa]\s+6\s+chiffres|code\s+de\s+s[ée]curit[ée]|one[\s-]time\s+password|verification\s+code|2fa\s+code|security\s+token)\b/gi,
  },
  {
    id: 'cred_personal_ssn',
    category: 'credentials',
    severity: 'high',
    title: 'Collecte d\'informations d\'identité personnelle (NIR / Sécurité Sociale)',
    description: 'Demande de numéro de sécurité sociale, numéro fiscal ou copie de pièce d\'identité sous prétexte d\'actualisation de dossier.',
    recommendation: 'Vérifiez toujours ces demandes directement sur les portails officiels (ameli.fr, impots.gouv.fr) sans utiliser les liens du message.',
    scoreImpact: 20,
    pattern: /\b(?:num[ée]ro\s+de\s+s[ée]curit[ée]\s+sociale|num[ée]ro\s+fiscal|carte\s+vitale\s+v3|actualiser\s+votre\s+dossier\s+(?:m[ée]dical|fiscal)|copie\s+de\s+(?:votre\s+)?pi[èe]ce\s+d'identit[ée]|social\s+security\s+number|national\s+insurance)\b/gi,
  },

  // ================= SENDER MISMATCH & IMPERSONATION =================
  {
    id: 'snd_free_email_provider',
    category: 'sender',
    severity: 'critical',
    title: 'Expéditeur officiel prétendu utilisant un webmail gratuit',
    description: 'Un service officiel (banque, support technique, impôts, PayPal) émet son message depuis un compte public gratuit (gmail.com, hotmail.com, yahoo.com, outlook.com).',
    recommendation: 'Aucune grande entreprise ou administration n\'écrit à ses usagers depuis une adresse Gmail, Yahoo ou Outlook gratuite.',
    scoreImpact: 35,
    customCheck: (text: string) => {
      // Look for From: headers or email patterns with brand name followed by free webmail
      // e.g. "De: Support Apple <apple-support99@gmail.com>" or "from: Service PayPal <paypal@outlook.fr>"
      const match = text.match(/(?:de|from|exp[ée]diteur)\s*:\s*([^<\n\r]+?)\s*<([a-zA-Z0-9._%+-]+@(gmail|hotmail|yahoo|outlook|live|proton|yopmail)\.[a-z]{2,})>/i) ||
                    text.match(/([a-zA-Z0-9._%+-]*(?:paypal|apple|amazon|ameli|impots|banque|netflix|support|service-client)[a-zA-Z0-9._%+-]*@(gmail|hotmail|yahoo|outlook|live|proton|yopmail)\.[a-z]{2,})/i);
      
      if (match) {
        return { matched: true, matchSnippet: match[0] };
      }
      return { matched: false };
    },
  },
  {
    id: 'snd_generic_greeting',
    category: 'sender',
    severity: 'medium',
    title: 'Formule de salutation impersonnelle générique',
    description: 'Utilisation de formules vagues comme "Cher client", "Cher utilisateur" au lieu de vos prénom et nom habituels.',
    recommendation: 'Les services chez qui vous possédez un compte vous appellent généralement par votre vrai nom enregistré.',
    scoreImpact: 12,
    pattern: /\b(?:cher(?:\s*\(e\))?\s+(?:client|cliente|utilisateur|utilisatrice|abonn[ée]|adh[ée]rent|membre)|dear\s+(?:customer|user|client|member|valued\s+customer)|ch[èe]re\s+cliente)\b/gi,
  },
  {
    id: 'snd_suspicious_from_header',
    category: 'sender',
    severity: 'high',
    title: 'Adresse d\'expéditeur incohérente avec la marque annoncée',
    description: 'Le nom affiché mentionne une marque ou un service officiel mais l\'adresse électronique associée provient d\'un domaine totalement obscur ou tiers.',
    recommendation: 'Examinez toujours attentivement l\'adresse email réelle de l\'expéditeur (après le symbole @), et non pas seulement le nom affiché.',
    scoreImpact: 25,
    customCheck: (text: string) => {
      // e.g. From: "PayPal" <info@security-update-center-9912.xyz>
      const headerRegex = /(?:from|de)\s*:\s*["']?([^"'\n\r<>]+)["']?\s*<([^>]+)>/i;
      const match = text.match(headerRegex);
      if (match) {
        const displayName = match[1].toLowerCase();
        const email = match[2].toLowerCase();
        const knownBrands = ['paypal', 'amazon', 'apple', 'netflix', 'ameli', 'impots', 'banque', 'chronopost', 'laposte', 'microsoft', 'google'];
        for (const brand of knownBrands) {
          if (displayName.includes(brand) && !email.includes(brand)) {
            return {
              matched: true,
              matchSnippet: `Nom affiché: "${match[1]}" vs Adresse réelle: <${match[2]}>`,
            };
          }
        }
      }
      return { matched: false };
    },
  },

  // ================= CONTENT & SCAM TECHNIQUES =================
  {
    id: 'cnt_unrealistic_gain',
    category: 'content',
    severity: 'high',
    title: 'Appât financier invraisemblable (Gain, Remboursement, Héritage)',
    description: 'Promesse d\'un remboursement inattendu (remboursement d\'impôt, trop-perçu Ameli, prime non réclamée) ou d\'un gain mirobolant.',
    recommendation: 'Les remboursements légitimes sont versés automatiquement sur votre compte bancaire sans nécessiter la ressaisie de votre carte.',
    scoreImpact: 22,
    pattern: /\b(?:vous\s+(?:avez\s+le\s+droit\s+[àa]|b[ée]n[ée]ficiez\s+d')un\s+remboursement|remboursement\s+(?:de\s+votre\s+trop-per[çc]u|en\s+votre\s+faveur)|trop-per[çc]u\s+de\s+[0-9]+|virement\s+en\s+attente|somme\s+de\s+[0-9]+[€$]|gagnant\s+du\s+tirage|vous\s+avez\s+remport[ée]|f[ée]licitations,\s+vous\s+avez\s+gagn[ée]|refund\s+notification|tax\s+refund\s+available|unclaimed\s+funds)\b/gi,
  },
  {
    id: 'cnt_package_delivery_scam',
    category: 'content',
    severity: 'high',
    title: 'Arnaque au faux colis en attente (Frais de douane / affranchissement)',
    description: 'Notification prétextant un colis bloqué, des frais d\'expédition manquants (ex: 1,99 €) ou une adresse incomplète.',
    recommendation: 'Les transporteurs (Chronopost, La Poste, Mondial Relay) n\'exigent pas le paiement de petits frais pour reprogrammer une livraison via un lien SMS/email non vérifié.',
    scoreImpact: 22,
    pattern: /\b(?:votre\s+colis\s+(?:est\s+bloqu[ée]|n'a\s+pas\s+pu\s+[êe]tre\s+livr[ée])|frais\s+de\s+(?:douane|port|livraison)\s+(?:de\s+)?[0-9]+[,.][0-9]{2}\s*€?|reprogrammer\s+la\s+livraison|adresse\s+incompl[èe]te|colis\s+en\s+attente\s+d'affranchissement|package\s+(?:delivery\s+pending|could\s+not\s+be\s+delivered)|customs\s+fee|unpaid\s+shipping)\b/gi,
  },
  {
    id: 'cnt_legal_threat_fine',
    category: 'content',
    severity: 'high',
    title: 'Fausse convocation judiciaire ou menace d\'amende',
    description: 'Allégations de convocation par la police, gendarmerie, brigade des mineurs ou amendes impayées avec menace de poursuites.',
    recommendation: 'La justice et les forces de l\'ordre ne convoquent JAMAIS par email et ne réclament jamais de règlement en ligne par coupon ou carte bancaire.',
    scoreImpact: 25,
    pattern: /\b(?:convocation\s+judiciaire|gendarmerie\s+nationale|police\s+judiciaire|brigade\s+des\s+mineurs|mandat\s+d'arr[êe]t|poursuites\s+p[ée]nales|amende\s+forfaitaire|infraction\s+relev[ée]|amende\s+de\s+[0-9]+\s*€|legal\s+action|arrest\s+warrant|subpoena)\b/gi,
  },
  {
    id: 'cnt_suspicious_attachment',
    category: 'content',
    severity: 'high',
    title: 'Mention de pièce jointe à haut risque d\'infection (.exe, .zip, .html, .iso)',
    description: 'Incitation à ouvrir une pièce jointe exécutable, un fichier compressé ou un fichier HTML qui déploie souvent des logiciels malveillants (malware/infostealer).',
    recommendation: 'N\'ouvrez JAMAIS de pièces jointes non sollicitées avec les extensions .zip, .exe, .iso, .html ou contenant des macros.',
    scoreImpact: 20,
    pattern: /\b(?:t[ée]l[ée]chargez\s+la\s+pi[èe]ce\s+jointe|veuillez\s+trouver\s+ci-joint|ouvrir\s+le\s+document\s+joint|facture\s+jointe|d[ée]tails\s+en\s+pi[èe]ce\s+jointe|pi[èe]ce\s+jointe\s+au\s+format\s+(?:zip|pdf|exe|html)|(?:[a-zA-Z0-9_-]+)\.(?:exe|zip|iso|scr|vbs|hta|html?|bat|cmd|apk)\b)\b/gi,
  },
  {
    id: 'cnt_poor_spelling_grammar',
    category: 'content',
    severity: 'medium',
    title: 'Anomalies syntaxiques ou fautes récurrentes',
    description: 'Formulations incohérentes typiques de traductions automatisées de cybercriminels étrangers ("veuillez à mettre à jour", "nous avisons vous").',
    recommendation: 'Un texte institutionnel officiel passe par des relectures rigoureuses et ne comporte pas d\'erreurs de conjugaison flagrantes.',
    scoreImpact: 14,
    pattern: /\b(?:nous\s+avons\s+remarqu[ée]\s+une\s+activit[ée]\s+inhabituel|cliquez\s+ici\s+pour\s+mettre\s+[àa]\s+jour\s+vos\s+informations\s+personnel|votre\s+carte\s+est\s+expir[ée]\s+bient[ôo]t|nous\s+vous\s+prions\s+de\s+bien\s+vouloir\s+cliquer|vous\s+[êe]tes\s+pri[ée]\s+de|mettre\s+[àa]\s+niveau\s+votre\s+s[ée]curit[ée])\b/gi,
  },

  // ================= SUSPICIOUS LINKS & REDIRECTIONS =================
  {
    id: 'lnk_shortener',
    category: 'links',
    severity: 'high',
    title: 'Utilisation de liens raccourcis pour masquer la destination réelle',
    description: 'Présence de services de raccourcissement d\'URL (bit.ly, tinyurl, t.co, is.gd) dissimulant l\'adresse finale du serveur.',
    recommendation: 'Les institutions financières et services gouvernementaux n\'utilisent pas de raccourcisseurs d\'URL publics dans leurs notifications officielles.',
    scoreImpact: 20,
    pattern: /(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy|ow\.ly|buff\.ly|rebrand\.ly|shorturl\.at)\/[a-zA-Z0-9_-]+/gi,
  },
  {
    id: 'lnk_ip_as_host',
    category: 'links',
    severity: 'critical',
    title: 'Lien direct vers une adresse IP numérique au lieu d\'un domaine',
    description: 'L\'URL pointe directement vers une adresse IP (ex: http://192.0.2.1/login) sans passer par un nom de domaine enregistré.',
    recommendation: 'C\'est une technique classique des serveurs pirates temporaires pour contourner les blocages DNS.',
    scoreImpact: 35,
    pattern: /(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/gi,
  },
  {
    id: 'lnk_click_here_call_to_action',
    category: 'links',
    severity: 'medium',
    title: 'Bouton d\'action d\'évitement ("Cliquez ici", "Vérifier maintenant")',
    description: 'Présence d\'appels à l\'action pressants cherchant à détourner l\'utilisateur vers une page externe de capture.',
    recommendation: 'Inspectez toujours l\'URL de destination réelle avant de cliquer sur un bouton générique.',
    scoreImpact: 10,
    pattern: /\b(?:cliquez\s+ici|acc[ée]der\s+[àa]\s+mon\s+espace|v[ée]rifier\s+maintenant|mettre\s+[àa]\s+jour\s+mes\s+coordonn[ée]es|cliquez\s+sur\s+ce\s+lien|confirmer\s+mon\s+identit[ée]|click\s+here|verify\s+now|update\s+account)\b/gi,
  },
];
