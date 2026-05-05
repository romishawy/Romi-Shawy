
import React from 'react';
import { WeeklyInsight } from '../types';
import { X, TrendingUp, Target, Award, PieChart as PieIcon, BarChart2, Activity } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

interface WeeklyInsightModalProps {
  insight: WeeklyInsight | null;
  isOpen: boolean;
  onClose: () => void;
}

// Updated Colorful Palette
const COLORS = [
  '#0ea5e9', // Sky Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#f59e0b'  // Amber
];

const SENTIMENT_COLORS = {
  positive: '#10b981', // Emerald
  neutral: '#94a3b8', // Slate
  negative: '#f43f5e'  // Rose
};

const WeeklyInsightModal: React.FC<WeeklyInsightModalProps> = ({ insight, isOpen, onClose }) => {
  if (!isOpen || !insight) return null;

  // Calculate totals and percentages for the bar chart
  const total = insight.categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  const barData = insight.categoryDistribution.map(item => ({
    ...item,
    percentage: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0,
    shortName: item.name.includes('/') ? item.name.split('/')[0].trim() : item.name
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Insight Mingguan</h2>
              <p className="text-xs text-slate-500 font-medium">Laporan Eksekutif & Tren Strategis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Left Column: Stats & Trends */}
            <div className="md:col-span-1 space-y-6">
              
              {/* Pie Chart: Distribution Count */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-700">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <PieIcon size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Komposisi Isu</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={insight.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {insight.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Percentage Distribution */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-700">
                  <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
                    <BarChart2 size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Persentase Kategori</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={barData}
                      margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="shortName" 
                        type="category" 
                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} 
                        width={75}
                        interval={0}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        formatter={(value: number) => [`${value}%`, 'Persentase']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={12}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Text Trends List */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                  <TrendingUp size={18} />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Tren Minggu Ini</h3>
                </div>
                <ul className="space-y-3">
                  {insight.trends.map((trend, idx) => (
                    <li key={idx} className="text-xs font-medium text-slate-600 flex gap-2 leading-relaxed">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Strategy & Recommendations & NEW SENTIMENT CHART */}
            <div className="md:col-span-2 space-y-6">
               
               {/* NEW: Sentiment Trend Chart */}
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                        <Activity size={20} />
                      </div>
                      <div>
                         <h3 className="font-bold text-base uppercase tracking-wide">Grafik Tren Sentimen</h3>
                         <p className="text-xs text-slate-400">Pergerakan 12 Minggu Terakhir (Positif vs Negatif)</p>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Positif</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Netral</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Negatif</div>
                    </div>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={insight.sentimentTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="week" 
                          tick={{fontSize: 10, fill: '#94a3b8'}} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{fontSize: 10, fill: '#94a3b8'}} 
                          axisLine={false}
                          tickLine={false}
                          unit="%"
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="positive" 
                          stackId="1" 
                          stroke={SENTIMENT_COLORS.positive} 
                          fill="url(#colorPos)" 
                          strokeWidth={2}
                          name="Positif"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="neutral" 
                          stackId="1" 
                          stroke={SENTIMENT_COLORS.neutral} 
                          fill="url(#colorNeu)" 
                          strokeWidth={2}
                          name="Netral"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="negative" 
                          stackId="1" 
                          stroke={SENTIMENT_COLORS.negative} 
                          fill="url(#colorNeg)" 
                          strokeWidth={2}
                          name="Negatif"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                
                <div className="flex items-center gap-2 mb-5 text-amber-600 relative z-10">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Target size={20} />
                  </div>
                  <h3 className="font-bold text-base uppercase tracking-wide">Isu Strategis Lintas Kategori</h3>
                </div>
                <div className="grid gap-3 relative z-10">
                  {insight.strategicIssues.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 text-slate-700 text-sm font-medium shadow-sm hover:bg-amber-50 transition-colors">
                      {issue}
                    </div>
                  ))}
                </div>
               </div>

               <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>

                <div className="flex items-center gap-2 mb-6 text-emerald-700 relative z-10">
                  <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
                    <Award size={22} />
                  </div>
                  <h3 className="font-bold text-lg uppercase tracking-wide">3 Rekomendasi Prioritas</h3>
                </div>
                <div className="space-y-4 relative z-10">
                  {insight.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-white/60 p-4 rounded-xl border border-emerald-100/50 shadow-sm backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-200">
                        {idx + 1}
                      </div>
                      <p className="text-emerald-900 text-sm md:text-base font-semibold pt-1 leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
               </div>
            </div>

          </div>
        </div>
        
        <div className="bg-white border-t border-slate-100 p-4 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          AI Policy Analyst System • Kementerian Agama
        </div>
      </div>
    </div>
  );
};

export default WeeklyInsightModal;
