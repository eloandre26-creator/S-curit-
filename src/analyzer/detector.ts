import {
  AnalysisResult,
  DetectedSignal,
  CategoryBreakdown,
  SignalCategory,
  VerdictType,
} from '../types';
import {
  parseUrlSafe,
  extractUrlsFromText,
  analyzeBrandSpoofing,
  checkHomoglyphs,
  HIGH_RISK_TLDS,
  KNOWN_SHORTENERS,
} from './domainUtils';
import { HEURISTIC_RULES } from './rules';

export function analyzeContent(input: string): AnalysisResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const signals: DetectedSignal[] = [];

  // Determine if input is a pure URL or text
  const isDirectUrl = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/i.test(trimmed);
  const extractedUrls = isDirectUrl ? [trimmed] : extractUrlsFromText(trimmed);
  const contentType = isDirectUrl ? 'url' : extractedUrls.length > 0 ? 'mixed' : 'email';

  // 1. Analyze URLs found in input
  let primaryDomainDetected: string | undefined = undefined;

  for (const rawUrl of extractedUrls) {
    const parsed = parseUrlSafe(rawUrl);
    if (!parsed) continue;

    if (!primaryDomainDetected) {
      primaryDomainDetected = parsed.domain;
    }

    // A. Brand imitation / Typosquatting / Subdomain spoof
    const brandSpoof = analyzeBrandSpoofing(parsed);
    if (brandSpoof) {
      signals.push({
        id: `dom_brand_spoof_${parsed.domain}`,
        category: 'domain',
        severity: brandSpoof.severity,
        title: `Imitation trompeuse de marque : ${brandSpoof.brand}`,
        description: brandSpoof.explanation,
        matchedText: parsed.rawUrl,
        scoreImpact: brandSpoof.scoreImpact,
        recommendation: `Ne visitez pas ce lien. Rendez-vous directement sur le site légitime officiel de ${brandSpoof.brand} en saisissant l'adresse dans votre barre d'adresse.`,
      });
    }

    // B. IP address host
    if (parsed.isIpAddress) {
      signals.push({
        id: `dom_ip_host_${parsed.hostname}`,
        category: 'domain',
        severity: 'critical',
        title: 'Adresse IP brute au lieu d\'un nom de domaine',
        description: `L'adresse utilise directement l'adresse IP numérique "${parsed.hostname}". Les cybercriminels l'utilisent couramment pour héberger des faux formulaires sans acquérir de nom de domaine traçable.`,
        matchedText: parsed.rawUrl,
        scoreImpact: 35,
        recommendation: 'Ne soumettez aucune donnée sur un site identifié uniquement par une adresse IP numérique.',
      });
    }

    // C. Homoglyphs / Punycode (IDN spoofing)
    const { hasHomoglyph, punycode } = checkHomoglyphs(parsed.hostname);
    if (hasHomoglyph) {
      signals.push({
        id: `dom_homoglyph_${parsed.hostname}`,
        category: 'domain',
        severity: 'critical',
        title: 'Attaque par homoglyphes (Caractères trompeurs / Punycode)',
        description: punycode
          ? `Le domaine utilise le protocole Punycode (${parsed.hostname}) pour afficher des caractères cyrilliques ou grecs visuellement identiques à l'alphabet latin.`
          : `Le domaine contient des caractères spéciaux non-ASCII destinés à tromper l'œil humain en imitant des lettres classiques.`,
        matchedText: parsed.hostname,
        scoreImpact: 35,
        recommendation: 'Cette technique est une signature typique d\'attaque de phishing ciblée.',
      });
    }

    // D. High risk TLD
    const hasHighRiskTld = HIGH_RISK_TLDS.some(tld => parsed.tld.toLowerCase() === tld || parsed.hostname.endsWith(tld));
    if (hasHighRiskTld) {
      signals.push({
        id: `dom_high_risk_tld_${parsed.tld}`,
        category: 'domain',
        severity: 'high',
        title: `Extension de domaine à haut risque (${parsed.tld})`,
        description: `L'extension "${parsed.tld}" fait partie des TLDs massivement sur-représentés dans les campagnes de phishing et cyberfraude en raison de leur faible coût ou absence de contrôle d'identité.`,
        matchedText: parsed.domain,
        scoreImpact: 20,
        recommendation: 'Soyez extrêmement prudent avec les domaines sous ces extensions exotiques lorsqu\'ils touchent à des comptes ou paiements.',
      });
    }

    // E. Shortened URL
    const isShortener = KNOWN_SHORTENERS.some(short => parsed.hostname === short || parsed.hostname.endsWith('.' + short));
    if (isShortener) {
      signals.push({
        id: `dom_shortener_${parsed.hostname}`,
        category: 'links',
        severity: 'high',
        title: 'Lien raccourci masquant la destination finale',
        description: `L'URL passe par le réducteur de lien "${parsed.hostname}". Cela empêche de voir la destination réelle avant d'avoir cliqué.`,
        matchedText: parsed.rawUrl,
        scoreImpact: 18,
        recommendation: 'Utilisez un outil d\'expansion de lien (unshorten) avant d\'ouvrir ce type d\'adresse.',
      });
    }

    // F. Excessive hyphens in domain name (e.g. secure-login-account-update.com)
    const hyphenCount = (parsed.domain.match(/-/g) || []).length;
    if (hyphenCount >= 3) {
      signals.push({
        id: `dom_excessive_hyphens_${parsed.domain}`,
        category: 'domain',
        severity: 'medium',
        title: 'Nom de domaine artificiellement surchargé en tirets',
        description: `Le domaine "${parsed.domain}" cumule ${hyphenCount} tirets, une stratégie fréquente pour concaténer des mots-clés de confiance ("service-client-securite-connexion").`,
        matchedText: parsed.domain,
        scoreImpact: 15,
        recommendation: 'Les grandes marques privilégient des noms courts et officiels, sans succession de mots-clés reliés par des tirets multiples.',
      });
    }

    // G. Multiple subdomains depth (e.g. login.verification.account.secure.site.com)
    const subParts = parsed.subdomains ? parsed.subdomains.split('.') : [];
    if (subParts.length >= 3) {
      signals.push({
        id: `dom_excessive_subdomains_${parsed.hostname}`,
        category: 'domain',
        severity: 'medium',
        title: 'Empilement suspect de sous-domaines',
        description: `Le nom d'hôte possède ${subParts.length} niveaux de sous-domaines ("${parsed.subdomains}"). Cette technique cherche à noyer le véritable domaine racine à la fin de l'URL.`,
        matchedText: parsed.hostname,
        scoreImpact: 15,
        recommendation: 'Regardez toujours les deux derniers segments de l\'adresse (le domaine principal), et non le début.',
      });
    }

    // H. Non-standard port
    if (parsed.port && !['80', '443'].includes(parsed.port)) {
      signals.push({
        id: `dom_non_standard_port_${parsed.port}`,
        category: 'links',
        severity: 'medium',
        title: `Port réseau inhabituel (:${parsed.port})`,
        description: `L'URL spécifie un port réseau non standard (${parsed.port}) plutôt que les ports web conventionnels (80 ou 443).`,
        matchedText: `${parsed.hostname}:${parsed.port}`,
        scoreImpact: 14,
        recommendation: 'Les services de messagerie ou de paiement légitimes n\'utilisent pas de ports exotiques ouverts publiquement.',
      });
    }
  }

  // 2. Run text-based heuristic rules
  for (const rule of HEURISTIC_RULES) {
    if (rule.pattern) {
      // Reset regex state
      rule.pattern.lastIndex = 0;
      const matches = Array.from(trimmed.matchAll(rule.pattern)).map(m => m[0]);
      
      const threshold = rule.minMatches || 1;
      if (matches.length >= threshold) {
        signals.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          matchedText: matches.slice(0, 3), // Keep top 3 examples
          scoreImpact: rule.scoreImpact,
          recommendation: rule.recommendation,
        });
      }
    } else if (rule.customCheck) {
      const checkResult = rule.customCheck(trimmed, lower);
      if (checkResult.matched) {
        signals.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          matchedText: checkResult.matchSnippet,
          scoreImpact: rule.scoreImpact,
          recommendation: rule.recommendation,
        });
      }
    }
  }

  // 3. Compute Risk Score (0 to 100)
  // Base formula: sum of impacts with intelligent weighting and diminishing returns
  let rawScore = 0;
  for (const s of signals) {
    rawScore += s.scoreImpact;
  }

  // Check for critical flags
  const criticalSignals = signals.filter(s => s.severity === 'critical');
  const highSignals = signals.filter(s => s.severity === 'high');
  const mediumSignals = signals.filter(s => s.severity === 'medium');
  const lowSignals = signals.filter(s => s.severity === 'low');

  let finalScore = 0;

  if (signals.length === 0) {
    // If text has significant length, it's analyzed as safe (0-5)
    finalScore = 0;
  } else {
    // Diminishing returns scaling:
    // S = 100 * (1 - e^(-rawScore / 55))
    finalScore = Math.round(100 * (1 - Math.exp(-rawScore / 52)));

    // Multi-factor escalation:
    // If at least one CRITICAL signal exists (e.g. typosquatting, credential harvest),
    // score must be at least 70 (Dangerous)
    if (criticalSignals.length >= 1) {
      finalScore = Math.max(finalScore, 72);
    }
    // If multiple critical signals or critical + high, push to 85-98
    if (criticalSignals.length >= 2 || (criticalSignals.length >= 1 && highSignals.length >= 1)) {
      finalScore = Math.max(finalScore, 88);
    }
    // If at least one HIGH signal exists and multiple mediums
    if (highSignals.length >= 1 && finalScore < 35) {
      finalScore = Math.max(finalScore, 42);
    }

    // Clamp between 0 and 100
    finalScore = Math.min(100, Math.max(0, finalScore));
  }

  // 4. Verdict Classification
  let verdict: VerdictType = 'safe';
  let verdictLabel: 'Sûr' | 'Suspect' | 'Dangereux' = 'Sûr';
  let verdictSummary = '';

  if (finalScore >= 66) {
    verdict = 'dangerous';
    verdictLabel = 'Dangereux';
    verdictSummary = 'Ce message ou cette URL présente des caractéristiques très nettes de tentative d\'escroquerie ou de phishing. N\'interagissez sous aucun prétexte avec ce contenu et ne communiquez aucune information personnelle.';
  } else if (finalScore >= 26) {
    verdict = 'suspicious';
    verdictLabel = 'Suspect';
    verdictSummary = 'Plusieurs signaux suspects ont été relevés. Le contenu emploie des tactiques ambiguës couramment associées aux leurres numériques. Une vigilance rigoureuse s\'impose.';
  } else {
    verdict = 'safe';
    verdictLabel = 'Sûr';
    verdictSummary = 'Aucun signal d\'alarme majeur de phishing n\'a été détecté. Restez toutefois attentif à l\'origine exacte de vos correspondances numériques habituelles.';
  }

  // 5. Category Breakdown
  const categories: { cat: SignalCategory; label: string; color: string; max: number }[] = [
    { cat: 'urgency', label: 'Urgence artificielle', color: 'from-amber-500 to-orange-500', max: 30 },
    { cat: 'domain', label: 'Domaine & Fausse marque', color: 'from-rose-500 to-red-600', max: 40 },
    { cat: 'credentials', label: 'Demande d\'identifiants', color: 'from-red-600 to-rose-700', max: 40 },
    { cat: 'sender', label: 'Expéditeur incohérent', color: 'from-amber-400 to-amber-600', max: 25 },
    { cat: 'links', label: 'Liens suspects', color: 'from-orange-500 to-red-500', max: 25 },
    { cat: 'content', label: 'Contenu & Pièces jointes', color: 'from-amber-500 to-yellow-600', max: 25 },
  ];

  const categoryBreakdown: CategoryBreakdown[] = categories.map(c => {
    const catSignals = signals.filter(s => s.category === c.cat);
    const scoreSum = catSignals.reduce((acc, s) => acc + s.scoreImpact, 0);
    return {
      category: c.cat,
      label: c.label,
      score: Math.min(100, Math.round((scoreSum / c.max) * 100)),
      maxScore: 100,
      signalCount: catSignals.length,
      color: c.color,
    };
  });

  // 6. Actionable Security Recommendations
  const recommendations: string[] = [];
  if (verdict === 'dangerous') {
    recommendations.push('Ne cliquez sur AUCUN lien présent dans ce message.');
    recommendations.push('N\'ouvrez et ne téléchargez aucune pièce jointe.');
    recommendations.push('Ne communiquez jamais de mot de passe, code SMS/OTP ou numéro de carte bancaire.');
    recommendations.push('Supprimez le courriel et signalez-le comme courrier indésirable / phishing dans votre messagerie.');
    recommendations.push('En cas de doute sur votre compte, ouvrez votre navigateur et tapez vous-même l\'adresse officielle du service.');
  } else if (verdict === 'suspicious') {
    recommendations.push('Vérifiez attentivement l\'adresse email exacte de l\'expéditeur (domaine après le @).');
    recommendations.push('Survolez les liens avec votre souris sans cliquer pour inspecter l\'adresse URL de destination.');
    recommendations.push('Contactez le service concerné par un canal officiel indépendant si la notification semble importante.');
  } else {
    recommendations.push('Le message ne présente pas d\'anomalie de phishing apparente.');
    recommendations.push('Conservez les réflexes élémentaires : vérifiez que l\'URL commence par https:// et correspond au domaine attendu.');
  }

  return {
    score: finalScore,
    verdict,
    verdictLabel,
    verdictSummary,
    contentType,
    signals,
    categoryBreakdown,
    stats: {
      totalSignals: signals.length,
      criticalCount: criticalSignals.length,
      highCount: highSignals.length,
      mediumCount: mediumSignals.length,
      lowCount: lowSignals.length,
      analyzedLength: trimmed.length,
      extractedUrls,
      domainDetected: primaryDomainDetected,
    },
    recommendations,
    analyzedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
