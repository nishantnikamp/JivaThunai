import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export const SearchableSelect = ({ options = [], value, onChange, placeholder = "Search or select item...", label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    (opt.label || opt.name || opt.code || opt.value || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => (opt.value || opt.code) === value);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}

      {/* Select Box Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-left"
      >
        <span className={selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400'}>
          {selectedOption ? (selectedOption.label || selectedOption.name) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 max-h-60 overflow-hidden flex flex-col animate-fade-in">
          
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto space-y-1 flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const optVal = opt.value || opt.code;
                const isSelected = optVal === value;
                return (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.label || opt.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">No matching items found</div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
