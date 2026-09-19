export type SignalCategory = 
  | 'urgency'
  | 'domain'
  | 'credentials'
  | 'sender'
  | 'content'
  | 'links';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type VerdictType = 'safe' | 'suspicious' | 'dangerous';

export interface DetectedSignal {
  id: string;
  category: SignalCategory;
  severity: SeverityLevel;
  title: string;
  description: string;
  matchedText?: string | string[];
  scoreImpact: number;
  recommendation?: string;
}

export interface CategoryBreakdown {
  category: SignalCategory;
  label: string;
  score: number;
  maxScore: number;
  signalCount: number;
  color: string;
}

export interface AnalysisResult {
  score: number; // 0 to 100
  verdict: VerdictType;
  verdictLabel: 'Sûr' | 'Suspect' | 'Dangereux';
  verdictSummary: string;
  contentType: 'url' | 'email' | 'mixed';
  signals: DetectedSignal[];
  categoryBreakdown: CategoryBreakdown[];
  stats: {
    totalSignals: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    analyzedLength: number;
    extractedUrls: string[];
    domainDetected?: string;
  };
  recommendations: string[];
  analyzedAt: string;
}

export interface PresetSample {
  id: string;
  name: string;
  badge: string;
  category: 'email' | 'url';
  difficulty: 'Dangereux' | 'Suspect' | 'Sûr';
  description: string;
  content: string;
}
