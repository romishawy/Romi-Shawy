import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  AreaChart, Area
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import { NewsItem, WeeklyInsight, Category, Urgency } from '../types';

// Fix Leaflet Default Icon issue in React
try {
  // @ts-ignore
  if (Icon && Icon.Default) {
    // @ts-ignore
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch (e) {
  console.warn("Leaflet icon fix failed:", e);
}

import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Map as MapIcon, 
  Tag, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AnalyticsDashboardProps {
  news: NewsItem[];
  insight: WeeklyInsight | null;
  onSelectNews: (id: string) => void;
}

// Colors for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];
const CATEGORY_COLORS: Record<string, string> = {
  [Category.TATA_USAHA]: '#6366f1',
  [Category.BIMBINGAN_MASYARAKAT]: '#8b5cf6',
  [Category.PENDIDIKAN]: '#f59e0b',
  [Category.MEDIA_SOSIAL]: '#ec4899',
};

const URGENCY_COLORS: Record<string, string> = {
  [Urgency.TINGGI]: '#ef4444',
  [Urgency.SEDANG]: '#f59e0b',
  [Urgency.RENDAH]: '#10b981',
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ news, insight, onSelectNews }) => {
  
  // 1. Keyword Frequency Calculation
  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(item => {
      item.keywords.forEach(keyword => {
        counts[keyword] = (counts[keyword] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [news]);

  // 2. Urgency Distribution
  const urgencyDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(item => {
      counts[item.urgency] = (counts[item.urgency] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [news]);

  // 3. Category Distribution (from news data if insight is null)
  const categoryData = useMemo(() => {
    if (insight?.categoryDistribution) return insight.categoryDistribution;
    
    const counts: Record<string, number> = {};
    news.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [news, insight]);

  // Map settings
  const centerPosition: [number, number] = [-2.5489, 118.0149];
  const getMarkerIcon = (urgency: Urgency) => {
    let colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
    if (urgency === Urgency.TINGGI) colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
    else if (urgency === Urgency.SEDANG) colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
    else colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';

    return new Icon({
      iconUrl: colorUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Eksplorasi Data Kebijakan</h1>
          <p className="text-slate-500 font-medium">Visualisasi tren, sentimen, dan sebaran isu Kemenag</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
           Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Isu', value: news.length, color: 'indigo' },
          { label: 'Urgensi Tinggi', value: news.filter(n => n.urgency === Urgency.TINGGI).length, color: 'rose' },
          { label: 'Media Sosial', value: news.filter(n => n.category === Category.MEDIA_SOSIAL).length, color: 'pink' },
          { label: 'Kota Terpantau', value: new Set(news.map(n => n.location?.city)).size, color: 'teal' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-4xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section 1: Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Category Distribution */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <PieChartIcon size={18} />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Distribusi Kategori Isu</h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Chart */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Tingkat Urgensi Isu</h3>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgencyDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} width={80} />
                <RechartsTooltip 
                   cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                  {urgencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.name] || '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keyword Frequency */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Tag size={18} />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Topik Tren (Kata Kunci)</h3>
          </div>
          <div className="flex-1">
             <div className="flex flex-wrap gap-2">
                {topKeywords.map((kw, i) => (
                  <div 
                    key={i} 
                    className="group relative bg-slate-50 hover:bg-emerald-600 border border-slate-200 hover:border-emerald-500 px-4 py-3 rounded-2xl transition-all duration-300 cursor-default"
                    style={{ flexGrow: kw.value }}
                  >
                    <span className="text-slate-600 group-hover:text-white font-bold text-sm tracking-tight">{kw.name}</span>
                    <span className="ml-2 py-0.5 px-1.5 bg-slate-200 group-hover:bg-emerald-400 font-black text-[9px] rounded text-slate-500 group-hover:text-white uppercase">{kw.value}x</span>
                  </div>
                ))}
             </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 block">Berdasarkan tagging isu otomatis AI</p>
        </div>
      </div>

      {/* Charts Section 2: Trends & Map */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
        
        {/* Sentiment Trends Overlay */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Tren Analisis Sentimen Publik</h3>
            </div>
            <div className="flex gap-4">
               {['positive', 'neutral', 'negative'].map((type) => (
                  <div key={type} className="flex items-center gap-1.5 capitalize text-[10px] font-black text-slate-400">
                     <div className={`w-2 h-2 rounded-full ${
                       type === 'positive' ? 'bg-emerald-500' : type === 'neutral' ? 'bg-slate-400' : 'bg-rose-500'
                     }`} />
                     {type}
                  </div>
               ))}
            </div>
          </div>
          <div className="flex-1">
            {insight ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insight.sentimentTrend}>
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis hide domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPos)" strokeWidth={3} />
                  <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="negative" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNeg)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="opacity-10 mb-4 animate-pulse" />
                <p className="text-sm font-bold opacity-30">Sedang memproses data historis...</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Distribution Map */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                <MapIcon size={18} />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Sebaran Lokasi Isu</h3>
            </div>
          </div>
          <div className="flex-1 relative z-0">
             <MapContainer 
                center={centerPosition} 
                zoom={5} 
                scrollWheelZoom={true} 
                style={{ height: "100%", width: "100%", zIndex: 0 }}
             >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {news.filter(n => n.location).map((item) => (
                    <Marker 
                        key={item.id} 
                        position={[item.location!.lat, item.location!.lng]}
                        icon={getMarkerIcon(item.urgency)}
                    >
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <h4 className="font-bold text-xs mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-500 mb-2 truncate">{item.location?.city}</p>
                                <button 
                                  onClick={() => onSelectNews(item.id)}
                                  className="w-full text-center text-[10px] font-bold text-indigo-600 flex items-center justify-center gap-1 hover:underline"
                                >
                                  Detail <ArrowRight size={10} />
                                </button>
                            </div>
                        </Popup>
                        <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.9}>
                            <span className="font-bold text-[10px]">{item.location?.city}</span>
                        </LeafletTooltip>
                    </Marker>
                ))}
             </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
