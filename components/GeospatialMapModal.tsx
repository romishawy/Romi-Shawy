import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { NewsItem, Urgency, Category } from '../types';
import { X, Map as MapIcon, Building2, GraduationCap, Users, Smartphone, ExternalLink } from 'lucide-react';
// Remove css import as it is loaded via CDN in index.html to avoid loader errors
import { Icon } from 'leaflet';

// Fix Leaflet Default Icon issue in React
// Use a safety check block to prevent crashes if Leaflet isn't fully loaded
try {
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

interface GeospatialMapModalProps {
  news: NewsItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNews: (id: string) => void;
}

const GeospatialMapModal: React.FC<GeospatialMapModalProps> = ({ news, isOpen, onClose, onSelectNews }) => {
  if (!isOpen) return null;

  // Center of Indonesia
  const centerPosition: [number, number] = [-2.5489, 118.0149];

  // Helper to get marker color/icon based on urgency or category
  const getMarkerIcon = (urgency: Urgency, category: Category) => {
    let colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
    
    if (urgency === Urgency.TINGGI) {
        colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
    } else if (urgency === Urgency.SEDANG) {
        colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
    } else {
        colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
    }

    return new Icon({
      iconUrl: colorUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  const getCategoryIcon = (category: Category) => {
      switch(category) {
          case Category.TATA_USAHA: return <Building2 size={14} />;
          case Category.PENDIDIKAN: return <GraduationCap size={14} />;
          case Category.MEDIA_SOSIAL: return <Smartphone size={14} />;
          default: return <Users size={14} />;
      }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col border border-white/50 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/50">
              <MapIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Peta Sebaran Isu</h2>
              <p className="text-xs text-slate-300 font-medium opacity-80">Geospatial Heatmap & Lokasi Kejadian Perkara</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
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
                        icon={getMarkerIcon(item.urgency, item.category)}
                    >
                        <Popup className="custom-popup">
                            <div className="min-w-[250px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                                        item.urgency === Urgency.TINGGI ? 'bg-red-500' : 
                                        item.urgency === Urgency.SEDANG ? 'bg-orange-500' : 'bg-green-500'
                                    }`}>
                                        {item.urgency}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-semibold truncate max-w-[120px]">
                                        {item.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm leading-tight mb-2 text-slate-800">{item.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.summary}</p>
                                
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-3">
                                    <MapIcon size={10} />
                                    <span>{item.location?.city}, {item.location?.province}</span>
                                </div>

                                <button 
                                    onClick={() => {
                                        onSelectNews(item.id);
                                        onClose();
                                    }}
                                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    Lihat Analisis Detail <ExternalLink size={10} />
                                </button>
                            </div>
                        </Popup>
                        <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                             <span className="font-bold text-xs">{item.location?.city}</span>
                        </Tooltip>
                    </Marker>
                ))}
             </MapContainer>

             {/* Legend Overlay */}
             <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 max-w-xs">
                 <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-2">Legenda Urgensi</h4>
                 <div className="space-y-2">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                         <span className="text-xs font-semibold text-slate-700">Tinggi (Merah)</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-200"></div>
                         <span className="text-xs font-semibold text-slate-700">Sedang (Oranye)</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                         <span className="text-xs font-semibold text-slate-700">Rendah (Hijau)</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default GeospatialMapModal;