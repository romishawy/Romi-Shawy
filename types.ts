
export enum Category {
  TATA_USAHA = 'Tata Usaha / Setjen',
  BIMBINGAN_MASYARAKAT = 'Bimbingan Masyarakat',
  PENDIDIKAN = 'Pendidikan Agama',
  MEDIA_SOSIAL = 'Media Sosial',
}

export enum Urgency {
  RENDAH = 'Rendah',
  SEDANG = 'Sedang',
  TINGGI = 'Tinggi',
}

export interface PolicyAnalysis {
  coreProblem: string;
  rootCause: string;
  stakeholders: string[];
  implications: string;
  policyOptions: string[];
  recommendation: string;
  relevantRegulations: string[]; // Existing Field for Regulatory Matching
  theoreticalBasis: string[]; // New: Public Policy Theory or Perka-LAN
  references: string[]; // New: APA Style References
  productRecommendation: string; // New: Telaah Staf, Policy Brief, etc.
}

export interface SocialData {
  platform: 'Twitter/X' | 'Instagram' | 'TikTok' | 'Facebook';
  handle: string;
  likes: number;
  shares: number;
  comments: number;
}

export interface LocationData {
  province: string;
  city: string;
  lat: number;
  lng: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string; // URL Link to original source
  date: string;
  summary: string;
  category: Category;
  keywords: string[];
  urgency: Urgency;
  analysis?: PolicyAnalysis; // Made Optional for Lazy Loading
  // Optional fields for Social Media
  socialData?: SocialData;
  mediaType?: 'image' | 'video' | 'text';
  mediaCaption?: string;
  // New: Geospatial Data
  location?: LocationData;
}

export interface SentimentTrend {
  week: string; // e.g., "M1", "M2"
  positive: number;
  neutral: number;
  negative: number;
}

export interface WeeklyInsight {
  trends: string[];
  strategicIssues: string[];
  recommendations: string[];
  categoryDistribution: { name: string; value: number }[];
  sentimentTrend: SentimentTrend[]; // New field for Trend Graph
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
