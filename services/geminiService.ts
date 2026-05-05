
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, WeeklyInsight, Category, Urgency, ChatMessage, PolicyAnalysis } from '../types';

// Initialize Gemini Client
// We use a fallback 'dummy-key' if process.env.API_KEY is empty. 
// This prevents the SDK from throwing an error during initialization.
// The API calls will fail gracefully and trigger the MOCK_DATA fallback in the catch blocks.
const apiKey = process.env.API_KEY || 'dummy-key-for-mock-mode';
const ai = new GoogleGenAI({ apiKey: apiKey });

// --- MOCK DATA FOR FALLBACK (Handling Quota Limits) ---
const MOCK_NEWS_DATA: NewsItem[] = [
  {
    id: 'mock-1',
    title: 'Kemenag Perkuat Moderasi Beragama di Kalangan Generasi Z Melalui Media Digital',
    source: 'Kemenag.go.id',
    sourceUrl: 'https://kemenag.go.id/nasional/moderasi-digital-gen-z',
    date: '2026-01-15',
    summary: 'Kementerian Agama meluncurkan inisiatif literasi moderasi beragama digital untuk menangkal penyebaran rasisme dan radikalisme di media sosial yang menyasar anak muda.',
    category: Category.BIMBINGAN_MASYARAKAT,
    keywords: ['Moderasi Beragama', 'Generasi Z', 'Literasi Digital'],
    urgency: Urgency.TINGGI,
    mediaType: 'image',
    mediaCaption: 'ministry of religious affairs launching digital literacy campaign for religious moderation among youth',
    location: { province: 'DKI Jakarta', city: 'Jakarta Pusat', lat: -6.1751, lng: 106.8650 }
  },
  {
    id: 'mock-2',
    title: 'Inovasi Digital: KUA se-Indonesia Mulai Terapkan Pendaftaran Nikah Full Online',
    source: 'Detik News',
    sourceUrl: 'https://news.detik.com/berita/kua-digital-layanan-online',
    date: '2026-02-02',
    summary: 'Layanan Kantor Urusan Agama kini semakin modern dengan integrasi sistem pendaftaran nikah secara daring penuh, memudahkan pasangan calon pengantin tanpa perlu bolak-balik fisik.',
    category: Category.BIMBINGAN_MASYARAKAT,
    keywords: ['KUA Digital', 'Layanan Publik', 'Pernikahan'],
    urgency: Urgency.SEDANG,
    mediaType: 'image',
    mediaCaption: 'modern digitalized office of office of religious affairs KUA in indonesia',
    location: { province: 'Jawa Barat', city: 'Bandung', lat: -6.9175, lng: 107.6191 }
  },
  {
    id: 'mock-3',
    title: 'Kurikulum Madrasah Berbasis AI Mulai Diuji Coba di 50 MAN Unggulan',
    source: 'Kompas Edukasi',
    sourceUrl: 'https://edukasi.kompas.com/read/2026/03/10/kurikulum-ai-madrasah',
    date: '2026-03-10',
    summary: 'Direktorat KSKK Madrasah memulai uji coba kurikulum adaptif berbasis Artificial Intelligence. Siswa akan diajarkan coding dasar dan etika penggunaan teknologi sejak dini.',
    category: Category.PENDIDIKAN,
    keywords: ['Pendidikan AI', 'Madrasah Digital', 'Inovasi'],
    urgency: Urgency.TINGGI,
    mediaType: 'image',
    mediaCaption: 'students in madrasah aliyah using tablets for ai coding lesson classroom',
    location: { province: 'Jawa Timur', city: 'Surabaya', lat: -7.2575, lng: 112.7521 }
  },
  {
    id: 'mock-4',
    title: 'Dialog Lintas Agama: Tokoh Muda Deklarasikan Komitmen Kerukunan Digital',
    source: 'Antara News',
    sourceUrl: 'https://antaranews.com/berita/dialog-lintas-agama-2026',
    date: '2026-04-05',
    summary: 'Ratusan tokoh muda lintas agama berkumpul untuk mendeklarasikan komitmen menjaga ruang digital yang damai dan bebas dari ujaran kebencian bernuansa SARA.',
    category: Category.BIMBINGAN_MASYARAKAT,
    keywords: ['Moderasi Beragama', 'Kerukunan', 'Pemuda'],
    urgency: Urgency.SEDANG,
    mediaType: 'image',
    mediaCaption: 'interfaith youth dialogue forum indonesia peace declaration event',
    location: { province: 'Jawa Tengah', city: 'Semarang', lat: -6.9667, lng: 110.4167 }
  },
  {
    id: 'mock-5',
    title: 'Tiktok: Tren "Outfit Santri" Tembus 50 Juta Penayangan',
    source: 'TikTok',
    sourceUrl: 'https://tiktok.com/@santri_trend/video/999999',
    date: '2026-04-20',
    summary: 'Tren fashion santri yang modis namun tetap syar\'i menguasai FYP TikTok minggu ini. Hal ini dinilai positif sebagai bentuk ekspresi kreatifitas santri di era modern.',
    category: Category.MEDIA_SOSIAL,
    keywords: ['Santri', 'Fashion', 'Tren TikTok'],
    urgency: Urgency.RENDAH,
    socialData: {
      platform: 'TikTok',
      handle: 'SantriStyle',
      likes: 2500000,
      shares: 45000,
      comments: 12000
    },
    mediaType: 'video',
    mediaCaption: 'santri fashion show trend tiktok viral video vertical',
    location: { province: 'Jawa Barat', city: 'Tasikmalaya', lat: -7.3274, lng: 108.2207 }
  }
];

const MOCK_ANALYSIS: PolicyAnalysis = {
  coreProblem: "Keterbatasan infrastruktur digital di daerah 3T menghambat pemerataan layanan keagamaan.",
  rootCause: "Alokasi anggaran infrastruktur TIK belum merata dan kendala geografis.",
  stakeholders: ["Setjen Kemenag", "Ditjen Bimas", "Ditjen Pendis", "Kominfo"],
  implications: "Kesenjangan kualitas layanan antara pusat dan daerah semakin lebar, potensi ketidakpuasan publik meningkat.",
  policyOptions: [
    "Kerjasama strategis dengan Kominfo untuk penyediaan satelit internet khusus madrasah/KUA di daerah 3T.",
    "Pengembangan mode aplikasi 'offline-first' untuk sistem pendaftaran nikah dan administrasi madrasah di daerah minim sinyal."
  ],
  recommendation: "Prioritaskan pengembangan mode offline-first dan alokasikan dana khusus penguatan infrastruktur digital di KUA dan Madrasah daerah 3T.",
  relevantRegulations: [
    "PMA No. 2 Tahun 2024 tentang Transformasi Digital Layanan Keagamaan",
    "Perpres No. 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)",
    "UU No. 20 Tahun 2023 tentang Aparatur Sipil Negara"
  ],
  theoreticalBasis: [
    "Teori Difusi Inovasi (Everett Rogers): Tahapan adopsi teknologi dalam birokrasi.",
    "Peraturan LAN No. 1 Tahun 2021 tentang Pelatihan Dasar CPNS (Agenda Smart ASN)."
  ],
  references: [
    "Dunn, W. N. (2018). Public Policy Analysis: An Integrated Approach. Routledge.",
    "Kementerian Agama RI. (2024). Cetak Biru Transformasi Digital Kemenag."
  ],
  productRecommendation: "Policy Paper"
};

const MOCK_INSIGHT: WeeklyInsight = {
  trends: [
    "Meningkatnya sentimen positif terhadap transformasi digital di KUA.",
    "Isu kurikulum AI di madrasah mendapat sorotan tinggi di media massa.",
    "Moderasi beragama di ruang digital menjadi fokus utama generasi muda."
  ],
  strategicIssues: [
    "Kesenjangan literasi digital antar pegawai KUA di daerah.",
    "Keamanan data pribadi dalam aplikasi Pusaka Super Apps.",
    "Penguatan narasi moderasi menjelang dinamika tahun politik."
  ],
  recommendations: [
    "Lakukan bimtek masif literasi digital untuk operator KUA dan penyuluh agama.",
    "Audit keamanan siber berkala pada seluruh platform digital Kemenag.",
    "Perbanyak konten moderasi beragama yang kreatif dan relevan dengan Gen-Z."
  ],
  categoryDistribution: [
    { name: Category.TATA_USAHA, value: 30 },
    { name: Category.PENDIDIKAN, value: 40 },
    { name: Category.BIMBINGAN_MASYARAKAT, value: 15 },
    { name: Category.MEDIA_SOSIAL, value: 15 }
  ],
  sentimentTrend: [
    { week: "M-12", positive: 45, neutral: 30, negative: 25 },
    { week: "M-11", positive: 48, neutral: 28, negative: 24 },
    { week: "M-10", positive: 50, neutral: 30, negative: 20 },
    { week: "M-9", positive: 52, neutral: 25, negative: 23 },
    { week: "M-8", positive: 40, neutral: 35, negative: 25 },
    { week: "M-7", positive: 42, neutral: 33, negative: 25 },
    { week: "M-6", positive: 55, neutral: 25, negative: 20 },
    { week: "M-5", positive: 60, neutral: 20, negative: 20 },
    { week: "M-4", positive: 58, neutral: 22, negative: 20 },
    { week: "M-3", positive: 65, neutral: 20, negative: 15 },
    { week: "M-2", positive: 62, neutral: 23, negative: 15 },
    { week: "M-1", positive: 70, neutral: 20, negative: 10 },
  ]
};

/**
 * Generates a list of simulated news headlines (LIGHTWEIGHT).
 * Does NOT include deep policy analysis to ensure speed.
 */
export const generateNewsData = async (): Promise<NewsItem[]> => {
  const prompt = `
    Bertindaklah sebagai aggregator berita cerdas untuk Kementerian Agama (Kemenag) Indonesia.
    
    Tugas:
    1. Buat 6 item berita simulasi yang REALISTIS berdasarkan isu-isu terkini Kemenag.
    2. DILARANG menyertakan berita atau informasi apa pun terkait ibadah Haji.
    3. DILARANG menyertakan berita atau informasi apa pun terkait Jaminan Produk Halal atau Sertifikasi Halal.
    4. ATURAN WAKTU: Tanggal penerbitan WAJIB dalam rentang 1 Januari 2026 sampai hari ini April 2026. 
       - DILARANG menggunakan tahun sebelum 2026.
    
    3. Sumber harus mencakup media nasional (Kompas, Detik, dll) DAN Media Sosial (Twitter/X, Instagram, TikTok).
       - PENTING: Sertakan 'sourceUrl' yang valid secara struktur (URL pattern) untuk setiap berita.
    
    4. Kategorikan berita ke dalam salah satu dari:
       - "Tata Usaha / Setjen"
       - "Bimbingan Masyarakat"
       - "Pendidikan Agama"
       - "Media Sosial"
    
    5. LOKASI: Tentukan lokasi spesifik (Provinsi, Kota) di Indonesia yang relevan dengan isi berita.
       - Berikan koordinat lat/lng perkiraan untuk kota tersebut.
    
    6. Sertakan ringkasan singkat, urgensi, data sosial/media, dan data lokasi.
    
    Output harus berupa JSON murni.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        source: { type: Type.STRING },
        sourceUrl: { type: Type.STRING },
        date: { type: Type.STRING, description: "YYYY-MM-DD" },
        summary: { type: Type.STRING },
        category: { 
          type: Type.STRING, 
          enum: [
            Category.TATA_USAHA, 
            Category.BIMBINGAN_MASYARAKAT, 
            Category.PENDIDIKAN,
            Category.MEDIA_SOSIAL
          ] 
        },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        urgency: { type: Type.STRING, enum: [Urgency.RENDAH, Urgency.SEDANG, Urgency.TINGGI] },
        
        socialData: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            handle: { type: Type.STRING },
            likes: { type: Type.NUMBER },
            shares: { type: Type.NUMBER },
            comments: { type: Type.NUMBER },
          },
          nullable: true
        },
        mediaType: { type: Type.STRING },
        mediaCaption: { type: Type.STRING },
        
        // NEW: Location Data
        location: {
          type: Type.OBJECT,
          properties: {
            province: { type: Type.STRING },
            city: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ["province", "city", "lat", "lng"]
        }
      },
      required: ["id", "title", "source", "sourceUrl", "date", "summary", "category", "keywords", "urgency", "location"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return JSON.parse(jsonText) as NewsItem[];

  } catch (error) {
    console.warn("API Quota Exceeded or Error. Using Mock Data.");
    return MOCK_NEWS_DATA;
  }
};

/**
 * Generates deep policy analysis for a SINGLE news item.
 */
export const generateItemAnalysis = async (item: NewsItem): Promise<PolicyAnalysis | null> => {
  const prompt = `
    Sebagai Analis Kebijakan Senior Kemenag, lakukan analisis mendalam untuk berita berikut:
    Judul: "${item.title}"
    Ringkasan: "${item.summary}"
    Kategori: "${item.category}"

    Berikan:
    1. Masalah Inti & Akar Masalah (Root Cause).
    2. Stakeholder terkait.
    3. Implikasi kebijakan.
    4. Opsi kebijakan (min 2).
    5. Rekomendasi prioritas paling feasible.
    6. REGULASI: Identifikasi 2-3 dasar hukum/peraturan (UU, PP, Perpres, PMA/KMA) yang relevan dan spesifik dengan masalah ini.
    7. LANDASAN TEORETIS: Sebutkan 1-2 teori kebijakan publik (contoh: Teori Sistem Easton, Rational Choice, Difusi Inovasi) ATAU referensi Peraturan Lembaga Administrasi Negara (Perka-LAN) yang relevan sebagai pisau analisis.
    8. REFERENSI: Berikan 1-2 daftar pustaka dalam format APA Style yang valid terkait topik atau teori tersebut.
    9. FORMAT PRODUK: Pilih satu format produk kebijakan yang paling tepat untuk menindaklanjuti masalah ini, yaitu salah satu dari: "Telaah Staf", "Memo Kebijakan", "Policy Brief", atau "Policy Paper". Pilih berdasarkan kompleksitas dan urgensi.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      coreProblem: { type: Type.STRING },
      rootCause: { type: Type.STRING },
      stakeholders: { type: Type.ARRAY, items: { type: Type.STRING } },
      implications: { type: Type.STRING },
      policyOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendation: { type: Type.STRING },
      relevantRegulations: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Daftar peraturan (UU/PP/PMA) yang relevan"
      },
      theoreticalBasis: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Teori kebijakan publik atau Perka-LAN yang relevan"
      },
      references: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Daftar pustaka format APA"
      },
      productRecommendation: {
        type: Type.STRING,
        enum: ["Telaah Staf", "Memo Kebijakan", "Policy Brief", "Policy Paper"],
        description: "Rekomendasi format produk kebijakan"
      }
    },
    required: ["coreProblem", "rootCause", "stakeholders", "implications", "policyOptions", "recommendation", "relevantRegulations", "theoreticalBasis", "references", "productRecommendation"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis returned");
    return JSON.parse(jsonText) as PolicyAnalysis;

  } catch (error) {
    console.warn("API Error during analysis. Using Mock Analysis.");
    return MOCK_ANALYSIS;
  }
};

/**
 * Generates a weekly insight summary based on the news items.
 */
export const generateWeeklyInsight = async (newsItems: NewsItem[]): Promise<WeeklyInsight> => {
  const prompt = `
    Sebagai Kepala Analisis Kebijakan, buatlah "Insight Eksekutif" berdasarkan data berikut:
    ${JSON.stringify(newsItems.map(n => ({ title: n.title, category: n.category, urgency: n.urgency })))}

    Tambahkan simulasi data tren sentimen publik selama 12 minggu terakhir (M-12 sampai M-1).
    Format tren: { week: "M-X", positive: number, neutral: number, negative: number }.
    Pastikan total (positif+netral+negatif) per minggu mendekati 100.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      trends: { type: Type.ARRAY, items: { type: Type.STRING } },
      strategicIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      categoryDistribution: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER }
          }
        } 
      },
      sentimentTrend: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.STRING },
            positive: { type: Type.NUMBER },
            neutral: { type: Type.NUMBER },
            negative: { type: Type.NUMBER }
          }
        }
      }
    },
    required: ["trends", "strategicIssues", "recommendations", "categoryDistribution", "sentimentTrend"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

     const jsonText = response.text;
    if (!jsonText) throw new Error("No insight data returned");
    return JSON.parse(jsonText) as WeeklyInsight;

  } catch (error) {
    console.warn("API Error during insight generation. Using Mock Insight.");
    return MOCK_INSIGHT;
  }
};

/**
 * Chat with the AI Policy Analyst regarding a specific news item.
 */
export const askPolicyAnalyst = async (newsItem: NewsItem, question: string, history: ChatMessage[]): Promise<string> => {
  try {
    const chat = ai.models.startChat({
      model: 'gemini-2.0-flash',
      history: history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      systemInstruction: `Anda adalah Analis Kebijakan Senior di Kementerian Agama. 
      Tugas Anda adalah menjawab pertanyaan pengguna secara spesifik berdasarkan data berita: "${newsItem.title}" 
      dengan ringkasan: "${newsItem.summary}". 
      Selalu gunakan bahasa Indonesia yang formal namun progresif.`
    });

    const result = await chat.sendMessage(question);
    return result.response.text() || "Maaf, saya tidak dapat menjawab saat ini.";
  } catch (error) {
    console.warn("API Error during chat.", error);
    return "Maaf, sistem analisis AI sedang sibuk (Quota Exceeded). Silakan coba beberapa saat lagi.";
  }
};
