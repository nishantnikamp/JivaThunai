import React from 'react';
import { Dog, Package } from 'lucide-react';

/**
 * MarketplaceTabSwitcher Component
 * Independent switcher component for toggling between "Pets" and "Pet Products"
 */
export const MarketplaceTabSwitcher = ({ 
  activeTab = 'pets', 
  onTabChange, 
  className = '' 
}) => {
  return (
    <div className={`p-2.5 bg-white border-b border-slate-200 grid grid-cols-2 gap-1.5 shrink-0 ${className}`}>
      {/* Pets Tab Button */}
      <button
        type="button"
        onClick={() => onTabChange && onTabChange('pets')}
        className={`w-full py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-lg ${
          activeTab === 'pets'
            ? 'bg-emerald-600 text-white shadow-xs border border-emerald-600'
            : 'bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-100'
        }`}
      >
        <Dog className="w-4 h-4" />
        <span>Pets</span>
      </button>

      {/* Pet Products Tab Button */}
      <button
        type="button"
        onClick={() => onTabChange && onTabChange('products')}
        className={`w-full py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer rounded-lg ${
          activeTab === 'products'
            ? 'bg-emerald-600 text-white shadow-xs border border-emerald-600'
            : 'bg-slate-50 text-slate-700 hover:text-slate-950 border border-slate-200 hover:bg-slate-100'
        }`}
      >
        <Package className="w-4 h-4" />
        <span>Pet Products</span>
      </button>
    </div>
  );
};

export default MarketplaceTabSwitcher;
