// Target brands commonly targeted by phishing
export const TARGET_BRANDS: { name: string; domains: string[]; category: string }[] = [
  { name: 'PayPal', domains: ['paypal.com', 'paypal.fr'], category: 'Paiement' },
  { name: 'Amazon', domains: ['amazon.com', 'amazon.fr'], category: 'E-commerce' },
  { name: 'Apple', domains: ['apple.com', 'icloud.com'], category: 'Tech' },
  { name: 'Microsoft', domains: ['microsoft.com', 'live.com', 'office.com', 'outlook.com'], category: 'Tech' },
  { name: 'Google', domains: ['google.com', 'google.fr', 'gmail.com'], category: 'Tech' },
  { name: 'Netflix', domains: ['netflix.com'], category: 'Streaming' },
  { name: 'Ameli (Assurance Maladie)', domains: ['ameli.fr'], category: 'Administration' },
  { name: 'Impôts Gouv', domains: ['impots.gouv.fr'], category: 'Administration' },
  { name: 'CAF', domains: ['caf.fr'], category: 'Administration' },
  { name: 'La Banque Postale', domains: ['labanquepostale.fr'], category: 'Banque' },
  { name: 'Crédit Agricole', domains: ['credit-agricole.fr'], category: 'Banque' },
  { name: 'Société Générale', domains: ['societegenerale.fr'], category: 'Banque' },
  { name: 'BNP Paribas', domains: ['bnpparibas.com', 'mabanque.bnpparibas'], category: 'Banque' },
  { name: 'Boursorama / BoursoBank', domains: ['boursorama.com', 'boursobank.com'], category: 'Banque' },
  { name: 'Chronopost', domains: ['chronopost.fr'], category: 'Livraison' },
  { name: 'La Poste', domains: ['laposte.fr'], category: 'Livraison' },
  { name: 'Mondial Relay', domains: ['mondialrelay.fr'], category: 'Livraison' },
  { name: 'DHL', domains: ['dhl.com', 'dhl.fr'], category: 'Livraison' },
  { name: 'UPS', domains: ['ups.com'], category: 'Livraison' },
  { name: 'Facebook / Meta', domains: ['facebook.com', 'meta.com'], category: 'Réseaux Sociaux' },
  { name: 'Instagram', domains: ['instagram.com'], category: 'Réseaux Sociaux' },
  { name: 'LinkedIn', domains: ['linkedin.com'], category: 'Réseaux Sociaux' },
  { name: 'Binance', domains: ['binance.com'], category: 'Crypto' },
  { name: 'MetaMask', domains: ['metamask.io'], category: 'Crypto' },
  { name: 'WhatsApp', domains: ['whatsapp.com'], category: 'Messagerie' },
  { name: 'Orange', domains: ['orange.fr'], category: 'Télécom' },
  { name: 'SFR', domains: ['sfr.fr'], category: 'Télécom' },
  { name: 'Free', domains: ['free.fr'], category: 'Télécom' },
];

export const KNOWN_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy', 'ow.ly',
  'buff.ly', 'goo.gl', 'rebrand.ly', 'bl.ink', 'shorturl.at', 'soo.gd'
];

export const HIGH_RISK_TLDS = [
  '.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.club',
  '.work', '.icu', '.country', '.zip', '.mov', '.cam', '.live', '.rest',
  '.sbs', '.cfd', '.quest', '.skin', '.surf', '.ru'
];

// Levenshtein distance calculation
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[lenA][lenB];
}

// Normalize leetspeak substitutions: 0 -> o, 1 -> l/i, 3 -> e, 5 -> s, @ -> a
export function normalizeLeetspeak(str: string): string {
  return str
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/rn/g, 'm');
}

export interface ParsedUrlDetails {
  rawUrl: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  domain: string; // root domain e.g. "example.com"
  subdomains: string; // e.g. "auth.secure"
  tld: string;
  isIpAddress: boolean;
}

export function parseUrlSafe(input: string): ParsedUrlDetails | null {
  try {
    let clean = input.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const url = new URL(clean);
    const hostname = url.hostname.toLowerCase();
    
    // Check if IP address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const isIp = ipv4Regex.test(hostname);

    const parts = hostname.split('.');
    let tld = '';
    let domain = hostname;
    let subdomains = '';

    if (!isIp && parts.length >= 2) {
      // Handle two-part TLDs like .gouv.fr, .co.uk, .com.fr
      const lastTwo = parts.slice(-2).join('.');
      if (['gouv.fr', 'co.uk', 'com.fr', 'org.uk', 'asso.fr'].includes(lastTwo) && parts.length >= 3) {
        tld = '.' + lastTwo;
        domain = parts[parts.length - 3] + tld;
        subdomains = parts.slice(0, parts.length - 3).join('.');
      } else {
        tld = '.' + parts[parts.length - 1];
        domain = parts.slice(-2).join('.');
        subdomains = parts.slice(0, -2).join('.');
      }
    }

    return {
      rawUrl: input,
      protocol: url.protocol,
      hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      domain,
      subdomains,
      tld,
      isIpAddress: isIp,
    };
  } catch {
    return null;
  }
}

// Extract all URLs or domain-like strings from a text block
export function extractUrlsFromText(text: string): string[] {
  // Regex matches full URLs and domain-like addresses
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+|(?:[a-zA-Z0-9-]+\.)+(?:com|fr|org|net|io|eu|xyz|info|biz|co|top|tk|ru|online|site|app)[^\s<>"'{}|\\^`]*/gi;
  const matches = text.match(urlRegex) || [];
  
  // Deduplicate and clean trailing punctuation
  const cleaned = matches.map(u => u.replace(/[.,;!?)]+$/, ''));
  return Array.from(new Set(cleaned));
}

// Check for homoglyphs / punycode
export function checkHomoglyphs(hostname: string): { hasHomoglyph: boolean; punycode: boolean } {
  const punycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
  // Check non-ASCII characters in hostname
  // Cyrillic, Greek, or special Latin ranges often used in IDN spoofing
  const nonAsciiRegex = /[^\x00-\x7F]/;
  const hasHomoglyph = nonAsciiRegex.test(hostname) || punycode;
  return { hasHomoglyph, punycode };
}

export interface BrandMatchResult {
  brand: string;
  type: 'typosquatting' | 'subdomain_spoof' | 'keyword_combination' | 'homoglyph';
  explanation: string;
  severity: 'critical' | 'high';
  scoreImpact: number;
}

// Analyze a hostname for brand imitation
export function analyzeBrandSpoofing(parsedUrl: ParsedUrlDetails): BrandMatchResult | null {
  const { hostname, domain, subdomains } = parsedUrl;
  const domainWithoutTld = domain.replace(/\.[a-z.]+$/, '');
  const normalizedDomain = normalizeLeetspeak(domainWithoutTld);

  for (const target of TARGET_BRANDS) {
    const brandLower = target.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const officialDomains = target.domains.map(d => d.toLowerCase());

    // If it's the genuine domain, it's safe for this brand
    if (officialDomains.includes(domain.toLowerCase())) {
      continue;
    }

    // 1. Check Subdomain Spoofing:
    // e.g. "paypal.com.verify-account.com" or "ameli.fr.connexion-assure.xyz"
    const hasBrandInSubdomain = subdomains.split('.').some(sub => {
      const cleanSub = sub.toLowerCase();
      return cleanSub === brandLower || officialDomains.some(od => cleanSub === od.replace(/\.[a-z.]+$/, ''));
    });

    if (hasBrandInSubdomain) {
      return {
        brand: target.name,
        type: 'subdomain_spoof',
        explanation: `La marque officielle "${target.name}" est utilisée comme faux sous-domaine sur un domaine tiers non officiel (${domain}). Les attaquants utilisent cette ruse pour tromper l'utilisateur distrait.`,
        severity: 'critical',
        scoreImpact: 35,
      };
    }

    // 2. Check Combination with hyphens / keywords:
    // e.g. "paypal-security.com", "banque-postale-alerte.fr", "appleid-login.com"
    const isCombo = domainWithoutTld.includes(brandLower) || 
      brandLower.length >= 5 && normalizedDomain.includes(brandLower);

    if (isCombo && !officialDomains.includes(domain)) {
      return {
        brand: target.name,
        type: 'keyword_combination',
        explanation: `Le nom de domaine "${domain}" incorpore le nom de la marque "${target.name}" combiné avec des tirets ou mots-clés pour imiter un service légitime.`,
        severity: 'critical',
        scoreImpact: 35,
      };
    }

    // 3. Check Typosquatting via Levenshtein / Leetspeak:
    // e.g. paypa1, amaz0n, g00gle
    if (brandLower.length >= 4) {
      const distDirect = levenshteinDistance(domainWithoutTld, brandLower);
      const distNormalized = levenshteinDistance(normalizedDomain, brandLower);

      if (distDirect > 0 && distDirect <= 2 && domainWithoutTld.length >= brandLower.length - 1) {
        return {
          brand: target.name,
          type: 'typosquatting',
          explanation: `Faute de frappe suspecte (typosquatting) détectée : "${domainWithoutTld}" ressemble fortement à la marque officielle "${target.name}" (distance Levenshtein: ${distDirect}).`,
          severity: 'critical',
          scoreImpact: 40,
        };
      }

      if (distNormalized === 0 && domainWithoutTld !== brandLower) {
        return {
          brand: target.name,
          type: 'typosquatting',
          explanation: `Substitutions de caractères (leetspeak) détectées imitant la marque "${target.name}" (ex: remplacement de lettres par des chiffres comme 0, 1, 3).`,
          severity: 'critical',
          scoreImpact: 40,
        };
      }
    }
  }

  return null;
}
