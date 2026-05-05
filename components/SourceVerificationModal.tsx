import React from 'react';
import { NewsItem, Category } from '../types';
import { X, Lock, RefreshCw, ChevronLeft, ChevronRight, Share, MoreHorizontal, Heart, MessageCircle, Repeat } from 'lucide-react';

interface SourceVerificationModalProps {
  item: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const SourceVerificationModal: React.FC<SourceVerificationModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const isSocial = item.category === Category.MEDIA_SOSIAL;
  const isTwitter = item.socialData?.platform === 'Twitter/X';
  
  // Generate a relevant image url same as used in other components
  const safeTitle = item.title.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 100);
  const keywords = item.keywords.slice(0, 3).join(' ');
  let promptBase = '';
  if (item.mediaCaption) {
     promptBase = `${item.mediaCaption}, realistic, indonesia context, high resolution, detailed`;
  } else {
     if (isSocial) {
        promptBase = `viral social media photo regarding ${safeTitle}, ${keywords}, phone screen style, user generated content, indonesia context`;
     } else {
        promptBase = `realistic journalism photography of ${safeTitle}, ${keywords}, ${item.category}, indonesia government context, documentary style`;
     }
  }
  const imagePrompt = encodeURIComponent(promptBase);
  const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=800&height=600&nologo=true&seed=${item.id}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-600 ring-4 ring-slate-800/50 relative">
        
        {/* Browser Chrome / Header */}
        <div className="h-14 bg-slate-800 flex items-center px-4 gap-4 shrink-0 border-b border-slate-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" onClick={onClose}></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          
          <div className="flex gap-4 text-slate-400 mx-2">
            <ChevronLeft size={18} className="hover:text-white cursor-pointer" />
            <ChevronRight size={18} className="hover:text-white cursor-pointer" />
            <RefreshCw size={16} className="hover:text-white cursor-pointer hover:rotate-180 transition-transform" />
          </div>

          <div className="flex-1 bg-slate-900 rounded-lg h-8 flex items-center px-3 text-xs text-slate-400 font-mono border border-slate-700 shadow-inner">
            <Lock size={10} className="mr-2 text-emerald-500" />
            <span className="truncate">{item.sourceUrl}</span>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Content Viewport */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isSocial && isTwitter ? 'bg-black' : 'bg-white'}`}>
          
          {/* A. SOCIAL MEDIA LAYOUT */}
          {isSocial ? (
            <div className="max-w-xl mx-auto min-h-full border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-black pt-4">
              {isTwitter ? (
                // Twitter/X Layout
                <div className="px-4 text-white">
                  <div className="flex gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {item.socialData?.handle.charAt(1).toUpperCase() || 'U'}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm">{item.source}</span>
                          <span className="text-slate-500 text-sm">{item.socialData?.handle}</span>
                          <span className="text-slate-500 text-sm">· {item.date}</span>
                        </div>
                        <p className="text-[15px] mt-1 leading-normal whitespace-pre-wrap">{item.title} {item.summary}</p>
                        
                        {/* Media */}
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800">
                           <img src={imageUrl} alt="Post Media" className="w-full h-auto object-cover max-h-[400px]" />
                        </div>

                        {/* Twitter Actions */}
                        <div className="flex justify-between text-slate-500 mt-3 max-w-md text-xs pb-4 border-b border-slate-800">
                           <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-400">
                              <MessageCircle size={16} /> <span>{item.socialData?.comments}</span>
                           </div>
                           <div className="flex items-center gap-2 group cursor-pointer hover:text-green-400">
                              <Repeat size={16} /> <span>{item.socialData?.shares}</span>
                           </div>
                           <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-400">
                              <Heart size={16} /> <span>{item.socialData?.likes}</span>
                           </div>
                           <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-400">
                              <Share size={16} />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                // Instagram/General Social Layout
                <div className="bg-white text-black pb-8">
                   <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-[2px]">
                            <div className="w-full h-full bg-white rounded-full p-0.5">
                               <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} alt="avatar" />
                               </div>
                            </div>
                         </div>
                         <span className="font-semibold text-sm">{item.socialData?.handle}</span>
                      </div>
                      <MoreHorizontal size={20} />
                   </div>
                   
                   <div className="w-full aspect-square bg-slate-100">
                      <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
                   </div>

                   <div className="px-4 py-3">
                      <div className="flex justify-between mb-3">
                         <div className="flex gap-4">
                            <Heart size={24} className="hover:text-red-500 cursor-pointer" />
                            <MessageCircle size={24} className="hover:text-slate-500 cursor-pointer" />
                            <Share size={24} className="hover:text-slate-500 cursor-pointer" />
                         </div>
                         <div className="w-6 h-6 border-2 border-black rounded-sm"></div>
                      </div>
                      <p className="font-semibold text-sm mb-1">{item.socialData?.likes.toLocaleString()} likes</p>
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{item.socialData?.handle}</span>
                        {item.title} {item.summary}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">{item.date}</p>
                   </div>
                </div>
              )}
            </div>
          ) : (
            // B. NEWS PORTAL LAYOUT
            <div className="bg-white min-h-full">
              {/* Portal Navigation Mockup */}
              <div className="border-b border-slate-200 sticky top-0 bg-white z-10">
                 <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-black text-2xl italic tracking-tighter text-indigo-900 uppercase">
                       {item.source.split(' ')[0]}<span className="text-red-600">NEWS</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-xs font-bold text-slate-600 uppercase tracking-wide">
                       <span className="hover:text-red-600 cursor-pointer">Home</span>
                       <span className="text-red-600 cursor-pointer border-b-2 border-red-600">Nasional</span>
                       <span className="hover:text-red-600 cursor-pointer">Hukum</span>
                       <span className="hover:text-red-600 cursor-pointer">Ekonomi</span>
                    </div>
                    <button className="bg-indigo-900 text-white px-4 py-1.5 rounded text-xs font-bold">Login</button>
                 </div>
              </div>

              {/* Article Content */}
              <div className="max-w-3xl mx-auto px-6 py-8">
                 <div className="mb-2 text-xs font-bold text-red-600 uppercase tracking-wider">
                    Berita &gt; {item.category}
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 font-serif">
                    {item.title}
                 </h1>
                 <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-100">
                    <span className="font-bold text-slate-700">{item.source}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    <span>•</span>
                    <div className="flex gap-2">
                       <div className="p-1 bg-blue-600 text-white rounded"><Share size={12} /></div>
                       <div className="p-1 bg-green-500 text-white rounded"><MessageCircle size={12} /></div>
                    </div>
                 </div>

                 {/* Illustration Removed */}

                 <div className="prose prose-lg max-w-none text-slate-800 font-serif leading-loose">
                    <p className="font-bold text-lg mb-4">
                       <span className="text-red-600 uppercase mr-1">{item.source.split(' ')[0]} -</span> 
                       {item.summary}
                    </p>
                    <p>
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Kementerian Agama terus berupaya meningkatkan kualitas layanan publik melalui transformasi digital dan penguatan moderasi beragama. Hal ini sejalan dengan visi misi pembangunan nasional di bidang agama.
                    </p>
                    <p>
                       "Kami berkomitmen untuk menyelesaikan isu ini secepatnya demi kemaslahatan umat," ujar juru bicara dalam keterangan resminya, {item.date}.
                    </p>
                    
                    {/* SAFE ANALYSIS CONTENT - HANDLES LAZY LOADING */}
                    {item.analysis ? (
                       <p>
                          Analisis lebih lanjut menunjukkan bahwa <span className="font-semibold">{item.analysis.coreProblem.toLowerCase()}</span> menjadi fokus utama perbaikan. {item.analysis.implications}. Oleh karena itu, langkah strategis perlu segera diambil.
                       </p>
                    ) : (
                       <p className="text-slate-400 italic">
                          [Analisis mendalam sedang diproses oleh sistem AI...]
                       </p>
                    )}

                    <p>
                       Masyarakat diimbau untuk tetap tenang dan memantau perkembangan informasi melalui saluran resmi.
                    </p>
                 </div>

                 {/* Tags */}
                 <div className="mt-10 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Tagar Terkait:</h4>
                    <div className="flex flex-wrap gap-2">
                       {item.keywords.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium hover:bg-slate-200 cursor-pointer">
                             #{tag}
                          </span>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SourceVerificationModal;