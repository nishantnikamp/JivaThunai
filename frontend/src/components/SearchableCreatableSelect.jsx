import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, X, Sparkles } from 'lucide-react';

export const SearchableCreatableSelect = ({
  options = [],
  value,
  onChange,
  onAddNew,
  placeholder = "Search or select...",
  addNewPlaceholder = "Enter new custom item...",
  label,
  sharpEdges = false,
  className = "",
  disabled = false,
  allowAdd = true,
  addNewButtonLabel = "Add"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format options: support string[] or object[] ({ label, value, code, icon, description })
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt, code: opt };
    }
    return {
      label: opt.label || opt.name || opt.code || opt.value || '',
      value: opt.value || opt.code || opt.label || '',
      code: opt.code || opt.value || '',
      icon: opt.icon,
      description: opt.description
    };
  });

  const filteredOptions = normalizedOptions.filter(opt =>
    (opt.label || '').toLowerCase().includes(search.toLowerCase()) ||
    (opt.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = normalizedOptions.find(opt => 
    opt.value === value || opt.code === value || opt.label === value
  );

  const handleCreateNew = async (newVal) => {
    const clean = (newVal || customInput || search || '').trim();
    if (!clean) return;

    // Check if already in options
    const exists = normalizedOptions.find(o => 
      o.label.toLowerCase() === clean.toLowerCase() || 
      o.value.toLowerCase() === clean.toLowerCase()
    );

    if (exists) {
      onChange(exists.value);
    } else {
      if (onAddNew) {
        try {
          await onAddNew(clean);
        } catch (e) {
          console.warn("Could not save new item to server:", e);
        }
      }
      onChange(clean);
    }

    setSearch('');
    setCustomInput('');
    setShowAddForm(false);
    setIsOpen(false);
  };

  const roundedCls = sharpEdges ? 'rounded-none' : 'rounded-xl';

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className={`block text-xs font-bold text-slate-700 mb-1`}>
          {label}
        </label>
      )}

      {/* Select Box Toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-300 ${roundedCls} text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-left shadow-2xs ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:border-slate-400'}`}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 mt-1 bg-white ${sharpEdges ? 'rounded-none' : 'rounded-2xl'} shadow-xl border border-slate-200 p-2 max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95`}>
          
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    onChange(filteredOptions[0].value);
                    setIsOpen(false);
                    setSearch('');
                  } else if (allowAdd && search.trim()) {
                    handleCreateNew(search.trim());
                  }
                }
              }}
              placeholder="Search or type to filter..."
              className={`w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 ${sharpEdges ? 'rounded-none' : 'rounded-lg'} text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500`}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 max-h-44">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value || opt.code === value || opt.label === value;
                return (
                  <button
                    key={opt.value + '_' + opt.label}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 ${sharpEdges ? 'rounded-none' : 'rounded-xl'} text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && opt.description !== opt.label && (
                        <span className="text-[10px] text-slate-400 truncate">{opt.description}</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching options found
              </div>
            )}
          </div>

          {/* Add New Section */}
          {allowAdd && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              {search.trim() && !normalizedOptions.some(o => o.label.toLowerCase() === search.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleCreateNew(search.trim())}
                  className={`w-full text-left px-3 py-1.5 mb-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold ${sharpEdges ? 'rounded-none' : 'rounded-lg'} flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/80`}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">Add & select <strong>"{search.trim()}"</strong></span>
                </button>
              )}

              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full text-center py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 hover:bg-emerald-50/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Custom Item</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateNew(customInput);
                      }
                    }}
                    placeholder={addNewPlaceholder}
                    className={`flex-1 px-2.5 py-1.5 bg-white border border-slate-300 ${sharpEdges ? 'rounded-none' : 'rounded-lg'} text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateNew(customInput)}
                    disabled={!customInput.trim()}
                    className={`px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold ${sharpEdges ? 'rounded-none' : 'rounded-lg'} transition-colors cursor-pointer flex items-center gap-1 shrink-0`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{addNewButtonLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setCustomInput('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
