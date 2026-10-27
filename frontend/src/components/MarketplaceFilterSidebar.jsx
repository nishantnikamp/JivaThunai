import React, { useState, useMemo } from 'react';
import { 
  Filter, ChevronDown, X, Trash2, Tag, DollarSign, 
  Star, Globe, Sparkles, Layers, Award, Check, Search
} from 'lucide-react';
import { MarketplaceTabSwitcher } from './MarketplaceTabSwitcher';

/**
 * Reusable Searchable Dropdown Panel for Filters
 */
const SearchableDropdown = ({
  title,
  placeholder = "Search options...",
  options = [],
  selectedValues = [],
  onToggleValue,
  onClear,
  isOpen,
  onToggleOpen,
  badgeCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(opt => opt.toLowerCase().includes(query));
  }, [options, searchQuery]);

  return (
    <div className={`border-b transition-colors w-full ${isOpen ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggleOpen}
        className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
          isOpen 
            ? 'bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-950' 
            : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black transition-colors ${isOpen ? 'text-emerald-950' : 'text-slate-800'}`}>{title}</span>
          {badgeCount > 0 && (
            <span className="w-2 h-2 bg-emerald-600"></span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-700' : 'text-slate-500'
          }`} 
        />
      </button>

      {/* Accordion Body with Searchable Dropdown */}
      {isOpen && (
        <div className="p-3.5 bg-emerald-50/30 border-t border-emerald-100/80 space-y-3 animate-in fade-in duration-150">
          
          {/* Live Search Input Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options Results List */}
          {filteredOptions.length > 0 ? (
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {filteredOptions.map(option => {
                const isSelected = selectedValues.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => onToggleValue(option)}
                    className={`w-full flex items-center justify-between p-2 px-2.5 rounded-none text-xs font-semibold transition-all text-left ${
                      isSelected 
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{option}</span>
                    {isSelected ? (
                      <span className="p-0.5 bg-emerald-600 text-white rounded-none flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 border border-slate-300 rounded-none flex-shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50/80 rounded-none text-center space-y-1 border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-600">No matching results</p>
              <p className="text-[11px] text-slate-400">Try a different keyword</p>
            </div>
          )}

          {/* Clear options button inside panel if items selected */}
          {selectedValues.length > 0 && (
            <div className="pt-1 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClear}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
              >
                Deselect All
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export const MarketplaceFilterSidebar = ({ 
  filters, 
  setFilters, 
  activeTab, 
  setActiveTab,
  availableSpecies = [], 
  availableBreedsOrBrands = [],
  dbCategories = [],
  dbLocations = [],
  isOpen = false,
  onClose
}) => {

  // All headings closed by default with arrow icons as requested
  const [openSections, setOpenSections] = useState({
    species: false,
    breedOrBrand: false,
    category: false,
    price: false,
    rating: false,
    specials: false,
    country: false,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterToggle = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        const updated = current.filter(v => v !== value);
        return { ...prev, [key]: updated.length > 0 ? updated : undefined };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const handleRemoveArrayItem = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const updated = current.filter(v => v !== value);
      return { ...prev, [key]: updated.length > 0 ? updated : undefined };
    });
  };

  const handleClearArray = (key) => {
    setFilters(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handlePriceChange = (min, max) => {
    setFilters(prev => {
      const copy = { ...prev };
      if (min !== undefined && min !== '') copy.minPrice = min;
      else delete copy.minPrice;
      if (max !== undefined && max !== '') copy.maxPrice = max;
      else delete copy.maxPrice;
      return copy;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  // Purely database-driven options (No hardcoding)
  const allSpeciesList = Array.from(new Set(availableSpecies)).filter(Boolean).sort();
  const allBreedsOrBrandsList = Array.from(new Set(availableBreedsOrBrands)).filter(Boolean).sort();
  const categoriesList = Array.from(new Set(dbCategories)).filter(Boolean).sort();
  const countriesList = Array.from(new Set(dbLocations)).filter(Boolean).sort();

  // Active filter chips calculation
  const activeChips = [];

  if (filters.species && filters.species.length > 0) {
    filters.species.forEach(sp => {
      activeChips.push({
        id: `species-${sp}`,
        label: `Type: ${sp}`,
        onRemove: () => handleRemoveArrayItem('species', sp)
      });
    });
  }

  if (filters.breedOrBrand && filters.breedOrBrand.length > 0) {
    filters.breedOrBrand.forEach(bb => {
      activeChips.push({
        id: `breedOrBrand-${bb}`,
        label: `${activeTab === 'pets' ? 'Breed' : 'Brand'}: ${bb}`,
        onRemove: () => handleRemoveArrayItem('breedOrBrand', bb)
      });
    });
  }

  if (filters.category) {
    activeChips.push({
      id: 'category',
      label: `Category: ${filters.category}`,
      onRemove: () => handleFilterChange('category', '')
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const minStr = filters.minPrice ? `₹${filters.minPrice}` : '₹0';
    const maxStr = filters.maxPrice ? `₹${filters.maxPrice}` : 'Any';
    activeChips.push({
      id: 'price',
      label: `Price: ${minStr} - ${maxStr}`,
      onRemove: () => handlePriceChange('', '')
    });
  }

  if (filters.rating) {
    activeChips.push({
      id: 'rating',
      label: `Rating: ${filters.rating} Stars & Up`,
      onRemove: () => handleFilterChange('rating', null)
    });
  }

  if (filters.discount) {
    activeChips.push({
      id: 'discount',
      label: 'Has Discount',
      onRemove: () => handleFilterChange('discount', false)
    });
  }

  if (filters.newArrivals) {
    activeChips.push({
      id: 'newArrivals',
      label: 'New Arrivals',
      onRemove: () => handleFilterChange('newArrivals', false)
    });
  }

  if (filters.offers) {
    activeChips.push({
      id: 'offers',
      label: 'Special Offers',
      onRemove: () => handleFilterChange('offers', false)
    });
  }

  if (filters.country) {
    activeChips.push({
      id: 'country',
      label: `Origin: ${filters.country}`,
      onRemove: () => handleFilterChange('country', '')
    });
  }

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Right Fixed Sidebar: fit screen top-to-bottom on desktop */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 lg:w-72 max-w-[85vw] bg-white border-l border-slate-200/90 shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out rounded-none
        lg:top-16 sm:lg:top-20 lg:bottom-0 lg:z-30 lg:shadow-none lg:translate-x-0 lg:h-[calc(100vh-4rem)] sm:lg:h-[calc(100vh-5rem)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Independent Pets & Pet Products Switcher Component (Placed ABOVE Marketplace Filters / Searchable categories & attributes) */}
        <MarketplaceTabSwitcher 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Sidebar Header (Marketplace Filters / Searchable categories & attributes) */}
        <div className="p-3 sm:p-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <Filter className="w-6 h-6 text-emerald-600 shrink-0" strokeWidth={2.2} />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">Marketplace Filters</h2>
              <p className="text-[10px] text-slate-500 font-medium truncate">Searchable categories & attributes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeChips.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            {/* Close button on mobile/tablet */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-none lg:hidden transition-colors"
              title="Close filter panel"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Body (Top to Bottom fit screen) */}
        <div className="flex-1 overflow-y-auto p-0 space-y-0 custom-scrollbar">
        
        {/* ACTIVE SELECTED FILTERS WITH CROSS (X) TO REMOVE */}
        {activeChips.length > 0 && (
          <div className="p-3 bg-emerald-50/70 border-b border-emerald-200 rounded-none space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span>Applied Filters:</span>
              <button onClick={clearAllFilters} className="text-emerald-700 hover:underline text-[10px]">
                Clear All
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {activeChips.map(chip => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-none border border-emerald-300 shadow-sm hover:border-rose-300 hover:bg-rose-50/50 transition-colors group"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="p-0.5 text-slate-400 group-hover:text-rose-600 hover:bg-rose-100 rounded-none transition-colors"
                    title="Remove this filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TYPE / SPECIES FILTER - SEARCHABLE DROPDOWN */}
        <SearchableDropdown
          title="Type / Species"
          placeholder="Search species (e.g. Dog, Cat, Bird)..."
          options={allSpeciesList}
          selectedValues={filters.species || []}
          onToggleValue={(val) => handleArrayFilterToggle('species', val)}
          onClear={() => handleClearArray('species')}
          isOpen={openSections.species}
          onToggleOpen={() => toggleSection('species')}
          badgeCount={(filters.species || []).length}
        />

        {/* BREED (OR BRAND) FILTER - SEARCHABLE DROPDOWN */}
        <SearchableDropdown
          title={activeTab === 'pets' ? 'Breed' : 'Brand / Item'}
          placeholder={`Search ${activeTab === 'pets' ? 'breed (e.g. Labrador, Persian)...' : 'brand (e.g. Royal Canin)...'}`}
          options={allBreedsOrBrandsList}
          selectedValues={filters.breedOrBrand || []}
          onToggleValue={(val) => handleArrayFilterToggle('breedOrBrand', val)}
          onClear={() => handleClearArray('breedOrBrand')}
          isOpen={openSections.breedOrBrand}
          onToggleOpen={() => toggleSection('breedOrBrand')}
          badgeCount={(filters.breedOrBrand || []).length}
        />

        {/* CATEGORY FILTER (FOR PRODUCTS) - SEARCHABLE DROPDOWN */}
        {activeTab === 'products' && (
          <SearchableDropdown
            title="Product Category"
            placeholder="Search category (e.g. Food, Meds)..."
            options={categoriesList}
            selectedValues={filters.category ? [filters.category] : []}
            onToggleValue={(val) => handleFilterChange('category', filters.category === val ? '' : val)}
            onClear={() => handleFilterChange('category', '')}
            isOpen={openSections.category}
            onToggleOpen={() => toggleSection('category')}
            badgeCount={filters.category ? 1 : 0}
          />
        )}

        {/* PRICE RANGE FILTER */}
        <div className={`border-b transition-colors w-full ${openSections.price ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openSections.price 
                ? 'bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-950' 
                : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black transition-colors ${openSections.price ? 'text-emerald-950' : 'text-slate-800'}`}>Price Range (₹)</span>
              {(filters.minPrice || filters.maxPrice) && (
                <span className="w-2 h-2 bg-emerald-600"></span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.price ? 'rotate-180 text-emerald-700' : 'text-slate-500'}`} />
          </button>

          {openSections.price && (
            <div className="p-3.5 bg-emerald-50/30 border-t border-emerald-100/80 space-y-3 animate-in fade-in duration-150">
              {/* Preset Range Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preset Brackets:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Under ₹1,000', min: 0, max: 1000 },
                    { label: '₹1K - ₹5K', min: 1000, max: 5000 },
                    { label: '₹5K - ₹15K', min: 5000, max: 15000 },
                    { label: '₹15K - ₹50K', min: 15000, max: 50000 },
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handlePriceChange(preset.min, preset.max)}
                      className="p-1.5 px-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-none text-[11px] font-bold text-slate-700 transition-colors text-center truncate"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Min/Max Inputs */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Custom Bounds (₹):</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min (₹)"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceChange(e.target.value, filters.maxPrice)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input 
                    type="number" 
                    placeholder="Max (₹)"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceChange(filters.minPrice, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-none text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CUSTOMER RATING FILTER */}
        <div className={`border-b transition-colors w-full ${openSections.rating ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <button
            type="button"
            onClick={() => toggleSection('rating')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openSections.rating 
                ? 'bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-950' 
                : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black transition-colors ${openSections.rating ? 'text-emerald-950' : 'text-slate-800'}`}>Customer Rating</span>
              {filters.rating && (
                <span className="w-2 h-2 bg-emerald-600"></span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.rating ? 'rotate-180 text-emerald-700' : 'text-slate-500'}`} />
          </button>

          {openSections.rating && (
            <div className="p-3.5 bg-emerald-50/30 border-t border-emerald-100/80 space-y-2.5 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                {[4, 3, 2, 1].map(r => {
                  const isChecked = filters.rating === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleFilterChange('rating', isChecked ? null : r)}
                      className={`w-full flex items-center justify-between p-2 px-2.5 rounded-none text-xs font-semibold transition-all ${
                        isChecked 
                          ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300' 
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{r} Stars & Up</span>
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SPECIAL FILTERS & DISCOUNTS */}
        <div className={`border-b transition-colors w-full ${openSections.specials ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <button
            type="button"
            onClick={() => toggleSection('specials')}
            className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              openSections.specials 
                ? 'bg-emerald-50/90 hover:bg-emerald-100/80 text-emerald-950' 
                : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black transition-colors ${openSections.specials ? 'text-emerald-950' : 'text-slate-800'}`}>Offers & Discounts</span>
              {(filters.discount || filters.newArrivals || filters.offers) && (
                <span className="w-2 h-2 bg-emerald-600"></span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openSections.specials ? 'rotate-180 text-emerald-700' : 'text-slate-500'}`} />
          </button>

          {openSections.specials && (
            <div className="p-3.5 bg-emerald-50/30 border-t border-emerald-100/80 space-y-2 animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-2 px-2.5 rounded-none cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Has Active Discount</span>
                </span>
                <input 
                  type="checkbox" 
                  checked={filters.discount || false} 
                  onChange={(e) => handleFilterChange('discount', e.target.checked)} 
                  className="w-4 h-4 rounded-none text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                />
              </label>

              <label className="flex items-center justify-between p-2 px-2.5 rounded-none cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>New Arrivals (Last 30 Days)</span>
                </span>
                <input 
                  type="checkbox" 
                  checked={filters.newArrivals || false} 
                  onChange={(e) => handleFilterChange('newArrivals', e.target.checked)} 
                  className="w-4 h-4 rounded-none text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                />
              </label>

              <label className="flex items-center justify-between p-2 px-2.5 rounded-none cursor-pointer hover:bg-slate-50 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified Breeder Special Deals</span>
                </span>
                <input 
                  type="checkbox" 
                  checked={filters.offers || false} 
                  onChange={(e) => handleFilterChange('offers', e.target.checked)} 
                  className="w-4 h-4 rounded-none text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                />
              </label>
            </div>
          )}
        </div>

        {/* COUNTRY OF ORIGIN - SEARCHABLE DROPDOWN */}
        <SearchableDropdown
          title="Country / Region"
          placeholder="Search country (e.g. India, USA)..."
          options={countriesList}
          selectedValues={filters.country ? [filters.country] : []}
          onToggleValue={(val) => handleFilterChange('country', filters.country === val ? '' : val)}
          onClear={() => handleFilterChange('country', '')}
          isOpen={openSections.country}
          onToggleOpen={() => toggleSection('country')}
          badgeCount={filters.country ? 1 : 0}
        />

        </div>
      </aside>
    </>
  );
};

export default MarketplaceFilterSidebar;
