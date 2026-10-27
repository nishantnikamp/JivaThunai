import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Heart, Edit2, Trash2 } from 'lucide-react';

export const MarketplaceCard = ({
  item,
  activeTab,
  canManagePets,
  canManageProducts,
  user,
  activeRole,
  isSaved,
  toggleSave,
  onEdit,
  onDelete,
  addToCart
}) => {
  const navigate = useNavigate();

  const displayTitle = item.name || item.breed || item.title;
  const displayCategory = item.species || item.productType || item.category || (item.categoryId === '1' ? 'Pet Food' : item.categoryId === '2' ? 'Pharmaceuticals' : item.categoryId === '3' ? 'Accessories' : 'General');
  const displayPrice = item.askingPrice || item.retailPrice || item.price;
  const stock = item.activeStockQuantityCount || item.availableStock;
  
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const now = new Date();
    const diff = now - dob;
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 7) return 'Newborn';
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
    }
    
    const ageDate = new Date(diff);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    
    if (years > 0) return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  };
  
  const ageDisplay = activeTab === 'pets' ? calculateAge(item.dob) : null;
  const showEditDelete = ((activeTab === 'pets' && (canManagePets && (item.sellerId === user?.userId || item.sellerId === user?.id || activeRole === 'SUPER_ADMIN'))) || 
                         (activeTab === 'products' && canManageProducts));

  return (
    <div 
      onClick={() => navigate(`/marketplace/${item.id}`, { state: { item: item, type: activeTab } })} 
      className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 group relative overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 backdrop-blur-xl h-full w-full"
    >
      
      {/* Image Container */}
      <div className="h-64 sm:h-72 bg-slate-50 overflow-hidden relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        {item.photoUrl ? (
          <img 
            src={item.photoUrl} 
            alt="" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 relative overflow-hidden">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-20 relative z-10" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 relative z-10">No Image</span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
          {stock !== undefined && stock < 5 && (
            <span className="bg-rose-500/95 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-[0_4px_12px_rgba(225,29,72,0.3)] border border-rose-400/50">
              Low Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSave(item); }} 
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all hover:scale-110 ${isSaved(item.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} 
            title={isSaved(item.id) ? "Remove from Saved" : "Save"}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved(item.id) ? 'fill-current scale-110' : ''} transition-transform`} />
          </button>
          
          {showEditDelete && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 backdrop-blur-md text-blue-600 hover:bg-blue-600 hover:text-white rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all hover:scale-110" title="Edit Listing">
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 hover:bg-rose-600 hover:text-white rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all hover:scale-110" title="Delete Listing">
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1 relative bg-white rounded-b-xl">
        <div className="flex flex-col items-start mb-2">
          <h3 className="font-black text-sm sm:text-base tracking-tight text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">{displayTitle}</h3>
          {activeTab === 'pets' && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 tracking-wide">
              {item.breed && <span className="line-clamp-1">{item.breed}</span>}
              {item.gender && item.gender !== 'UNKNOWN' && (
                <span className="capitalize">{item.gender.toLowerCase()}</span>
              )}
              {ageDisplay && <span>{ageDisplay}</span>}
            </div>
          )}
        </div>
        
        <div className="mb-3 flex flex-col gap-1.5">
          {activeTab !== 'pets' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-block text-[9px] sm:text-[10px] text-slate-600 font-bold uppercase tracking-widest bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200/50">
                {displayCategory}
              </span>
            </div>
          )}
          {item.location && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
              <span className="line-clamp-1 flex-1">{item.location} {item.vendorName ? `• ${item.vendorName}` : ''}</span>
            </div>
          )}
        </div>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3 mt-auto"></div>
        
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-sm sm:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 truncate">
              ₹{Number(displayPrice || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="flex-shrink-0 relative overflow-hidden px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-900 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-300 shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 flex items-center gap-1 group/btn hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500">
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover/btn:-rotate-12 group-hover/btn:scale-110" /> 
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
