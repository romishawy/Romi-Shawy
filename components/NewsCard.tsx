import React from 'react';
import { NewsItem, Urgency, Category } from '../types';
import { Clock, Share2, Play, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  onClick: () => void;
  isSelected: boolean;
  onViewSource?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onClick, isSelected, onViewSource }) => {
  // Category-based Color Themes (Futuristic Neon Palette)
  const theme = {
    [Category.TATA_USAHA]: {
      border: 'border-l-cyan-500',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      glow: 'shadow-cyan-500/20',
      accent: 'text-cyan-600'
    },
    [Category.BIMBINGAN_MASYARAKAT]: {
      border: 'border-l-violet-500',
      badge: 'bg-violet-50 text-violet-700 border-violet-200',
      glow: 'shadow-violet-500/20',
      accent: 'text-violet-600'
    },
    [Category.PENDIDIKAN]: {
      border: 'border-l-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      glow: 'shadow-amber-500/20',
      accent: 'text-amber-600'
    },
    [Category.MEDIA_SOSIAL]: {
      border: 'border-l-fuchsia-500',
      badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      glow: 'shadow-fuchsia-500/20',
      accent: 'text-fuchsia-600'
    },
  }[item.category];

  const urgencyColor = {
    [Urgency.RENDAH]: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    [Urgency.SEDANG]: 'text-amber-600 bg-amber-50 border-amber-200',
    [Urgency.TINGGI]: 'text-rose-600 bg-rose-50 border-rose-200',
  }[item.urgency];

  const hasMedia = item.mediaType === 'image' || item.mediaType === 'video' || item.category === Category.MEDIA_SOSIAL;
  
  // --- ENHANCED IMAGE GENERATION LOGIC ---
  // Construct a highly specific prompt based on content to simulate "Original Source" photo
  
  // 1. Extract Key Visual Elements
  const safeTitle = item.title.replace(/[^a-zA-Z0-9\s]/g, '');
  const context = item.summary.substring(0, 80).replace(/[^a-zA-Z0-9\s]/g, '');
  const keywords = item.keywords.slice(0, 3).join(', ');

  // 2. Define Visual Style based on Category
  let visualStyle = "";
  switch (item.category) {
    case Category.MEDIA_SOSIAL:
      visualStyle = "viral social media photo, amateur phone camera shot, realistic, user generated content, raw footage style";
      break;
    case Category.TATA_USAHA:
      visualStyle = "official government press photo, formal meeting, ministry office indonesia, documentary style, high quality journalism";
      break;
    case Category.PENDIDIKAN:
      visualStyle = "indonesian islamic school classroom, madrasah students, education activity, realistic photography, documentary";
      break;
    case Category.BIMBINGAN_MASYARAKAT:
      visualStyle = "community gathering indonesia, religious harmony event, realistic press photography, outdoor or indoor hall";
      break;
    default:
      visualStyle = "realistic news photography, 4k, highly detailed, indonesia context";
  }

  // 3. Combine into final prompt
  // If AI provided a specific caption, prioritize it. Otherwise build from title + summary.
  const promptContent = item.mediaCaption 
    ? `${item.mediaCaption}, ${visualStyle}` 
    : `${safeTitle}, ${context}, ${keywords}, ${visualStyle}`;

  const imagePrompt = encodeURIComponent(`${promptContent}, indonesia context`);
  const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=320&height=240&nologo=true&seed=${item.id}`;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: item.sourceUrl || window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${item.title}\n${item.sourceUrl}`);
    }
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewSource) {
      onViewSource();
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group relative p-5 rounded-2xl border-y border-r border-slate-100/50 backdrop-blur-md transition-all duration-500 cursor-pointer overflow-hidden
        border-l-[6px] ${theme.border}
        ${isSelected 
          ? `bg-white/90 shadow-xl ${theme.glow} scale-[1.02] z-10` 
          : 'bg-white/60 hover:bg-white/80 hover:shadow-lg hover:-translate-y-1'
        }
      `}
    >
      {/* Background Gradient Blob for selected state */}
      {isSelected && <div className={`absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-transparent to-${theme.accent.split('-')[1]}-100/30 blur-3xl pointer-events-none`} />}

      <div className="relative z-10">
        {/* Header Badges */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-1 rounded-md border uppercase tracking-wider ${urgencyColor}`}>
              {item.urgency}
            </span>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md border truncate max-w-[120px] ${theme.badge}`}>
              {item.category}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-white/50 px-2 py-1 rounded-full backdrop-blur-sm border border-slate-100">
            <Clock size={10} /> {item.date}
          </span>
        </div>
        
        <div className="flex gap-4">
          {/* Text Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className={`font-bold text-sm mb-2 leading-snug line-clamp-3 transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
              {item.title}
            </h3>
            
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed font-medium">
              {item.summary}
            </p>

            {/* Action Area */}
            <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100/50">
               <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                 <span className="truncate max-w-[80px]">{item.source}</span>
               </div>
               
               <div className="flex gap-2">
                 <button 
                    onClick={handleSourceClick}
                    className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full transition-all border ${isSelected ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                 >
                    Lihat Sumber <ExternalLink size={9} />
                 </button>
                 <button 
                    onClick={handleShare}
                    className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                 >
                    <Share2 size={14} />
                 </button>
               </div>
            </div>
          </div>

          {/* Thumbnail */}
          {hasMedia && (
            <div className="shrink-0 w-24 h-24 rounded-xl relative overflow-hidden shadow-md group-hover:shadow-lg transition-all border border-white/50">
               <img 
                 src={imageUrl} 
                 alt="Thumbnail" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 loading="lazy"
               />
               {/* Overlay Icon */}
               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.mediaType === 'video' ? <Play size={20} className="text-white fill-white" /> : <ImageIcon size={18} className="text-white" />}
               </div>
               {item.mediaType === 'video' && (
                 <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                   VIDEO
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;