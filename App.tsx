
import React, { useState, useEffect, useMemo } from 'react';
import { generateNewsData, generateWeeklyInsight, generateItemAnalysis } from './services/geminiService';
import { NewsItem, WeeklyInsight, Category, Urgency } from './types';
import NewsCard from './components/NewsCard';
import PolicyAnalysisPanel from './components/PolicyAnalysisPanel';
import WeeklyInsightModal from './components/WeeklyInsightModal';
import SourceVerificationModal from './components/SourceVerificationModal';
import GeospatialMapModal from './components/GeospatialMapModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { 
  Layout, 
  Search, 
  Filter, 
  RefreshCcw, 
  BarChart2, 
  Building2, 
  GraduationCap,
  Smartphone,
  Loader2,
  Menu,
  Users,
  Map as MapIcon,
  Bot
} from 'lucide-react';

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState<boolean>(false);
  const [isInsightOpen, setIsInsightOpen] = useState<boolean>(false);
  
  // Geospatial Map State
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  
  // Source Verification Modal State
  const [viewingSourceItem, setViewingSourceItem] = useState<NewsItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  
  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Ref to track items currently being analyzed to prevent duplicate calls
  const analysisQueue = React.useRef<Set<string>>(new Set());

  // Navigation View State
  const [activeView, setActiveView] = useState<'feed' | 'analytics'>('feed');

  const handleFetchData = async () => {
    setLoading(true);
    setInsight(null);
    setIsInsightLoading(false);
    setSelectedNewsId(null);
    
    try {
      // 1. Fetch News Data (Blocking UI)
      const data = await generateNewsData();
      setNews(data);
      
      // 2. Unlock UI IMMEDIATELY so user can interact
      setLoading(false);

      // 3. Fetch Insight Data (Background Process)
      if (data.length > 0) {
        setIsInsightLoading(true);
        const insightData = await generateWeeklyInsight(data);
        setInsight(insightData);
        setIsInsightLoading(false);
      }
      
    } catch (error) {
      console.error("Failed to fetch data", error);
      setLoading(false);
      setIsInsightLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LAZY ANALYSIS LOGIC: Triggered when selectedNewsId changes
  useEffect(() => {
    let isMounted = true;
    
    const analyzeCurrentItem = async () => {
      if (!selectedNewsId) return;
      
      const currentItem = news.find(n => n.id === selectedNewsId);
      
      // Only analyze if analysis is missing AND not already in queue
      if (currentItem && !currentItem.analysis && !analysisQueue.current.has(selectedNewsId)) {
        analysisQueue.current.add(selectedNewsId);
        setIsAnalyzing(true);
        
        try {
          const analysis = await generateItemAnalysis(currentItem);
          if (analysis && isMounted) {
             setNews(prevNews => prevNews.map(n => 
               n.id === selectedNewsId ? { ...n, analysis } : n
             ));
          }
        } catch (e) {
          console.error("Analysis failed", e);
        } finally {
          if (isMounted) {
            setIsAnalyzing(false);
            analysisQueue.current.delete(selectedNewsId);
          }
        }
      }
    };
    
    analyzeCurrentItem();

    return () => {
      isMounted = false;
    };
  }, [selectedNewsId, news]);

  // Filter Logic
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesUrgency = selectedUrgency === 'All' || item.urgency === selectedUrgency;
      
      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [news, searchQuery, selectedCategory, selectedUrgency]);

  const selectedNewsItem = useMemo(() => 
    news.find(n => n.id === selectedNewsId) || null, 
  [news, selectedNewsId]);

  const handleBackToMain = () => {
    setSelectedNewsId(null);
  };

  // Sidebar Categories Configuration
  const categories = [
    { id: 'All', label: 'Semua Berita', icon: Layout, color: 'from-slate-700 to-slate-900' },
    { id: Category.TATA_USAHA, label: 'Tata Usaha', icon: Building2, color: 'from-cyan-500 to-blue-600' },
    { id: Category.BIMBINGAN_MASYARAKAT, label: 'Bimbingan Masyarakat', icon: Users, color: 'from-violet-500 to-purple-600' },
    { id: Category.PENDIDIKAN, label: 'Pendidikan Agama', icon: GraduationCap, color: 'from-amber-500 to-orange-600' },
    { id: Category.MEDIA_SOSIAL, label: 'Media Sosial', icon: Smartphone, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 font-sans bg-transparent selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-white/50 z-40 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_Kementerian_Agama_Republik_Indonesia_2016.svg" className="h-8 w-8" alt="Logo" />
            <span className="font-bold text-sm text-slate-800">Kemenag Analyst</span>
         </div>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-100 rounded-lg">
            <Menu size={20} />
         </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-white/60 backdrop-blur-xl border-r border-white/40 shadow-2xl md:shadow-none transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Header Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
               <img 
                 src="https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_Kementerian_Agama_Republik_Indonesia_2016.svg" 
                 alt="Kemenag Logo" 
                 className="w-6 h-6 invert brightness-0"
               />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none text-slate-800">KEMENAG</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Policy Analyst AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar px-2">
            
            {/* View Switcher Controls */}
            <div className="flex flex-col gap-2 mb-8">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Navigasi Utama</div>
              <button
                onClick={() => {
                  setActiveView('feed');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${activeView === 'feed' ? 'bg-white shadow-lg shadow-slate-200 text-indigo-600 border border-white' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'}
                `}
              >
                <Layout size={18} className={`${activeView === 'feed' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-bold text-sm tracking-wide">Pusat Berita</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('analytics');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${activeView === 'analytics' ? 'bg-white shadow-lg shadow-slate-200 text-indigo-600 border border-white' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'}
                `}
              >
                <BarChart2 size={18} className={`${activeView === 'analytics' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-bold text-sm tracking-wide">Analitik & Visualisasi</span>
              </button>
            </div>

            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Kategori Isu</div>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                    ${isActive ? 'text-white shadow-lg shadow-slate-200 scale-105' : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'}
                  `}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-100 transition-opacity`} />
                  )}
                  <Icon size={18} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="relative z-10 font-bold text-sm tracking-wide">{cat.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 space-y-3 px-2">
            
            {/* Map Button */}
            <button
               onClick={() => setIsMapOpen(true)}
               disabled={news.length === 0}
               className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl transition-all border border-emerald-100 font-bold text-sm group disabled:opacity-50"
            >
               <MapIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
               <span>Peta Sebaran Isu</span>
            </button>

            {/* Insight Button */}
            <button
              onClick={() => setIsInsightOpen(true)}
              disabled={!insight && isInsightLoading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
            >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                       {isInsightLoading ? <Loader2 size={16} className="animate-spin"/> : <BarChart2 size={16} />}
                    </div>
                    <div className="text-left">
                       <div className="text-xs font-bold opacity-80">Analisis Mingguan</div>
                       <div className="text-sm font-black uppercase tracking-wide">Lihat Insight</div>
                    </div>
                 </div>
               </div>
            </button>

            <div className="text-[9px] text-center text-slate-400 font-medium py-3 italic opacity-80">
              designed by romishawy
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative pt-16 md:pt-0">
        {/* Top Bar */}
        <header className={`
          h-20 px-6 md:px-8 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/40 shrink-0 z-30 sticky top-0
          ${activeView === 'analytics' ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {activeView === 'feed' ? (
              <>
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="Cari topik, kata kunci, atau isu..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/70 border border-white/50 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 pl-11 pr-4 py-3 rounded-2xl outline-none transition-all font-medium text-sm shadow-sm"
                  />
                </div>
                
                {/* Filter Dropdown (Simplified) */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-slate-400" />
                  </div>
                  <select 
                      value={selectedUrgency}
                      onChange={(e) => setSelectedUrgency(e.target.value)}
                      className="bg-white/70 border border-white/50 pl-10 pr-8 py-3 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer hover:bg-white transition-all appearance-none shadow-sm"
                  >
                      <option value="All">Semua Urgensi</option>
                      <option value={Urgency.TINGGI}>🚨 Tinggi</option>
                      <option value={Urgency.SEDANG}>⚠️ Sedang</option>
                      <option value={Urgency.RENDAH}>✅ Rendah</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <BarChart2 size={24} />
                 </div>
                 <div>
                    <h2 className="font-black text-slate-800 tracking-tight">Dashboard Analitik</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wawasan Kebijakan Terintegrasi</p>
                 </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={handleFetchData} 
              disabled={loading}
              className="p-3 bg-white/70 hover:bg-white text-slate-600 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
              title="Refresh Data"
            >
              <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto relative bg-transparent">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full animate-pulse"></div>
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-xl font-black text-slate-800">Memuat Data Cerdas...</h3>
                   <p className="text-slate-500 font-medium max-w-xs">AI sedang mengumpulkan berita dan melakukan analisis kebijakan mendalam.</p>
                </div>
             </div>
           ) : activeView === 'feed' ? (
             <div className="flex h-full gap-6 p-4 md:p-6 overflow-hidden">
                {/* Left: News List */}
                <div className={`
                   flex-1 h-full overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-20 transition-all duration-500
                   ${selectedNewsId ? 'hidden md:block md:w-1/3 md:flex-none' : 'w-full'}
                `}>
                   <div className="flex items-center justify-between mb-6 px-2">
                      <h2 className="text-lg font-black text-slate-800 tracking-tight">
                         {selectedCategory === 'All' ? 'Berita Terkini' : categories.find(c => c.id === selectedCategory)?.label}
                      </h2>
                   </div>
                   
                   <div className="space-y-4">
                      {filteredNews.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                           <p>Tidak ada berita yang sesuai filter.</p>
                        </div>
                      ) : (
                        filteredNews.map((item) => (
                           <NewsCard
                              key={item.id}
                              item={item}
                              isSelected={selectedNewsId === item.id}
                              onClick={() => setSelectedNewsId(item.id)}
                              onViewSource={() => setViewingSourceItem(item)}
                           />
                        ))
                      )}
                   </div>

                   {/* AI Disclaimer Footer */}
                   {filteredNews.length > 0 && (
                     <div className="mt-8 mb-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50/80 border border-slate-100 rounded-full text-[10px] text-slate-400 font-medium">
                           <Bot size={12} />
                           <span>Semua berita & analisis dihasilkan oleh simulasi Kecerdasan Buatan (AI)</span>
                        </div>
                     </div>
                   )}
                </div>

                {/* Right: Policy Analysis Panel */}
                <div className={`
                   flex-1 h-full transition-all duration-500
                   ${selectedNewsId ? 'block' : 'hidden md:block'}
                `}>
                   <PolicyAnalysisPanel
                      item={selectedNewsItem}
                      allNews={news}
                      onSelectNews={setSelectedNewsId}
                      onBack={handleBackToMain}
                      onViewSource={(item) => setViewingSourceItem(item)}
                      isAnalyzing={isAnalyzing}
                   />
                </div>
             </div>
           ) : (
             <AnalyticsDashboard 
               news={news} 
               insight={insight} 
               onSelectNews={(id) => {
                 setSelectedNewsId(id);
                 setActiveView('feed');
               }} 
             />
           )}
        </div>
      </main>

      {/* Modals */}
      <WeeklyInsightModal
        insight={insight}
        isOpen={isInsightOpen}
        onClose={() => setIsInsightOpen(false)}
      />

      <GeospatialMapModal
        news={news}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectNews={(id) => {
           setSelectedNewsId(id);
           // Allow time for map to close and selection to update
        }}
      />

      <SourceVerificationModal 
        item={viewingSourceItem}
        isOpen={!!viewingSourceItem}
        onClose={() => setViewingSourceItem(null)}
      />
    </div>
  );
};

export default App;
