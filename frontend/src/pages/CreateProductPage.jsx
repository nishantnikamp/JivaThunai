import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Package, Plus, Save, Camera, FileText, ChevronRight, CheckCircle2, Pill, Utensils, Box, Image as ImageIcon, Video } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MediaUploader } from '../components/MediaUploader';
import { PageHeader } from '../components/PageHeader';

export const CreateProductPage = () => {
  const { activeRole, token } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const editItem = location.state?.item;

  const [activeTab, setActiveTab] = useState('core');
  const [productType, setProductType] = useState(editItem ? (editItem.productType || 'STANDARD') : 'STANDARD'); // STANDARD, FOOD, MEDICINE

  // Form State matching MySQL and MongoDB Schema
  const [formData, setFormData] = useState(() => {
    const defaultState = {
      // Core Relational
      skuCode: '',
      barcode: '',
      categoryId: '',
      targetSpeciesId: '',
      breedApplicabilityName: '',
      baseCostPrice: '',
      retailPrice: '',
      discountedActivePrice: '',
      gstPercentageRate: '',
      platformCommissionSplitRate: '',
      activeStockQuantityCount: '',
      lowStockAlertBoundary: '',
      maximumOrderQuantityLimit: '',
      requiresPrescriptionFlag: false,
      isScheduledDrugFlag: false,
      isActiveFlag: true,

      // Document Specifics
      name: '',
      brand: '',
      description: '',
      manufacturingDate: '',
      expiryDate: '',
      netWeightGrams: '',
      length: '',
      width: '',
      height: '',
      photoUrl: '', // For UI rendering main image
      photos: [], // Up to 6
      videos: [], // Up to 2

      // Food Specific
      crudeProteinPercentage: '',
      crudeFatPercentage: '',
      crudeFiberPercentage: '',
      ingredientsManifest: '',
      
      // Medicine Specific
      apis: [{ name: '', mg: '' }], // Dynamic array
      dosagePerKgMetric: '',
      contraindicationsText: '',
      storageConditionInstructions: ''
    };
    if (editItem) {
      return { 
        ...defaultState, 
        ...editItem,
        name: editItem.name || editItem.title || '',
        retailPrice: editItem.retailPrice || editItem.price || '',
        activeStockQuantityCount: editItem.activeStockQuantityCount || editItem.availableStock || '',
        categoryId: editItem.categoryId || (editItem.category === 'FOOD' ? '1' : editItem.category === 'MEDICINE' ? '2' : '3'),
        brand: editItem.brand || '',
      };
    }
    return defaultState;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addApiField = () => {
    setFormData(prev => ({
      ...prev,
      apis: [...prev.apis, { name: '', mg: '' }]
    }));
  };

  const handleApiChange = (index, field, value) => {
    const newApis = [...formData.apis];
    newApis[index][field] = value;
    setFormData(prev => ({ ...prev, apis: newApis }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = editItem 
      ? `http://localhost:8080/api/v1/petproduct/${editItem.id}` 
      : 'http://localhost:8080/api/v1/petproduct';
    const method = editItem ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      productType: productType
    };

    try {
      // NOTE: token might need to be destructured from useAuth() at the top of the component
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          // Assuming token is added to the component via useAuth()
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`${productType === 'MEDICINE' ? 'Medicine' : 'Product'} catalog item ${editItem ? 'updated' : 'saved'} successfully!`, 'success');
        navigate('/marketplace');
      } else {
        showToast('Action forbidden or failed to save', 'error');
      }
    } catch (err) {
      showToast('Network error during save', 'error');
    }
  };

  if (activeRole !== 'SUPER_ADMIN' && activeRole !== 'ADMIN' && activeRole !== 'SELLER') {
    return (
      <div className="flex justify-center py-20">
        <h2 className="text-xl font-bold text-slate-500">Access Denied. Only Sellers and Admins can create catalog entries.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <PageHeader
        badgeText={editItem ? 'CATALOG MODIFICATION' : 'COMMERCE REGISTRY'}
        badgeIcon={Package}
        title={editItem ? 'Edit Catalog Item' : 'Onboard Catalog Item'}
        titleIcon={Package}
        description={editItem ? 'Update product pricing, inventory thresholds, specifications, and clinical tags.' : 'Create a new verified product, feed formula, or pharmaceutical item in the registry.'}
        variant="emerald"
        actions={
          <div className="flex bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner flex-wrap">
            <button 
              type="button"
              onClick={() => setProductType('STANDARD')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                productType === 'STANDARD' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> General
            </button>
            <button 
              type="button"
              onClick={() => setProductType('FOOD')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                productType === 'FOOD' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" /> Pet Food
            </button>
            <button 
              type="button"
              onClick={() => { setProductType('MEDICINE'); setActiveTab('medical'); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                productType === 'MEDICINE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Pill className="w-3.5 h-3.5" /> Medicine
            </button>
          </div>
        }
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="col-span-1 space-y-2">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm sticky top-6">
            <button type="button" onClick={() => setActiveTab('core')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'core' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              Basic Details <ChevronRight className={`w-4 h-4 ${activeTab === 'core' ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            <button type="button" onClick={() => setActiveTab('pricing')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pricing' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              Pricing & Stock <ChevronRight className={`w-4 h-4 ${activeTab === 'pricing' ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            <button type="button" onClick={() => setActiveTab('specs')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'specs' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              Specifications <ChevronRight className={`w-4 h-4 ${activeTab === 'specs' ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            
            <button type="button" onClick={() => setActiveTab('food')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'food' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              Nutritional Profile <ChevronRight className={`w-4 h-4 ${activeTab === 'food' ? 'opacity-100' : 'opacity-0'}`} />
            </button>

            {productType === 'MEDICINE' && (
              <button type="button" onClick={() => setActiveTab('medical')} className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'medical' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                Medical Manifest <ChevronRight className={`w-4 h-4 ${activeTab === 'medical' ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            )}

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button type="submit" className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md">
                <Save className="w-4 h-4" /> {editItem ? 'Update Catalog Item' : 'Publish to Catalog'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          
          {/* Core Settings */}
          {activeTab === 'core' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-500"/> Core Identifiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Display Title</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Royal Canin Maxi Puppy 15kg" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold text-slate-800 transition-all" required />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">SKU Code</label>
                  <input type="text" name="skuCode" value={formData.skuCode} onChange={handleInputChange} placeholder="Unique string" className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" required />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">GTIN / Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Global Trade Item Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Category ID</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-slate-700">
                    <option value="">Select Category...</option>
                    <option value="1">Pet Food</option>
                    <option value="2">Pharmaceuticals</option>
                    <option value="3">Accessories & Toys</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Brand / Manufacturer</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Inventory */}
          {activeTab === 'pricing' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-slate-800 mb-6">Pricing & Live Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Retail Price (MRP) ₹</label>
                  <input type="number" step="0.01" name="retailPrice" value={formData.retailPrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 font-black text-slate-700 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Discounted Active Price ₹</label>
                  <input type="number" step="0.01" name="discountedActivePrice" value={formData.discountedActivePrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700 outline-none" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Base Cost Price ₹</label>
                  <input type="number" step="0.01" name="baseCostPrice" value={formData.baseCostPrice} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">GST Percentage %</label>
                  <select name="gstPercentageRate" value={formData.gstPercentageRate} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>

                <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-700 mb-4 uppercase tracking-widest">Inventory Management</h3>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Active Stock Quantity</label>
                  <input type="number" name="activeStockQuantityCount" value={formData.activeStockQuantityCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Low-Stock Alert Boundary</label>
                  <input type="number" name="lowStockAlertBoundary" value={formData.lowStockAlertBoundary} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {activeTab === 'specs' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-slate-800 mb-6">Physical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Long Form Description</label>
                  <textarea rows="4" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Net Weight (grams)</label>
                  <input type="number" name="netWeightGrams" value={formData.netWeightGrams} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div className="col-span-3"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Package Dimensions (cm)</label></div>
                  <input type="number" name="length" placeholder="Length" value={formData.length} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm outline-none" />
                  <input type="number" name="width" placeholder="Width" value={formData.width} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm outline-none" />
                  <input type="number" name="height" placeholder="Height" value={formData.height} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm outline-none" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Manufacturing Date</label>
                  <input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>

                <div className="md:col-span-3 pt-8 mt-2 border-t border-slate-100">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2"><Camera className="w-5 h-5 text-emerald-500"/> Media Gallery</h3>
                    <p className="text-sm text-slate-500">Upload high-resolution product images and videos. Great visuals significantly improve buyer engagement and trust.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-emerald-500" /> Product Photos (Max 6)</label>
                      <MediaUploader 
                        type="image" 
                        maxFiles={6} 
                        initialFiles={formData.photos?.length > 0 ? formData.photos : (formData.photoUrl ? [formData.photoUrl] : [])}
                        onUploadComplete={(url) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            photoUrl: prev.photoUrl || url,
                            photos: [...(prev.photos || []), url] 
                          }));
                        }} 
                        onRemove={(url) => {
                          setFormData(prev => ({
                            ...prev,
                            photoUrl: prev.photoUrl === url ? (prev.photos?.find(p => p !== url) || null) : prev.photoUrl,
                            photos: (prev.photos || []).filter(p => p !== url)
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"><Video className="w-4 h-4 text-emerald-500" /> Product Videos (Max 2)</label>
                      <MediaUploader 
                        type="video" 
                        maxFiles={2} 
                        initialFiles={formData.videos || []}
                        onUploadComplete={(url) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            videos: [...(prev.videos || []), url] 
                          }));
                        }} 
                        onRemove={(url) => {
                          setFormData(prev => ({
                            ...prev,
                            videos: (prev.videos || []).filter(v => v !== url)
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Food Profile */}
          {activeTab === 'food' && (
            <div className="bg-orange-50/50 p-6 sm:p-8 rounded-3xl shadow-sm border border-orange-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black text-orange-800 mb-6 flex items-center gap-2"><Utensils className="w-6 h-6" /> Nutritional Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Custom Premium Inputs */}
                <div className="relative bg-white p-5 rounded-2xl border border-orange-200 shadow-sm group focus-within:ring-2 focus-within:ring-orange-500 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                  <span className="block text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Protein</span>
                  <div className="flex items-baseline gap-1 mt-4 ml-2">
                    <input type="number" step="0.1" name="crudeProteinPercentage" value={formData.crudeProteinPercentage} onChange={handleInputChange} placeholder="--" className="w-16 bg-transparent outline-none text-4xl font-black text-orange-900 placeholder:text-slate-300 p-0 m-0" />
                    <span className="text-2xl font-black text-orange-900/50">%</span>
                  </div>
                </div>

                <div className="relative bg-white p-5 rounded-2xl border border-orange-200 shadow-sm group focus-within:ring-2 focus-within:ring-orange-500 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                  <span className="block text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Fat</span>
                  <div className="flex items-baseline gap-1 mt-4 ml-2">
                    <input type="number" step="0.1" name="crudeFatPercentage" value={formData.crudeFatPercentage} onChange={handleInputChange} placeholder="--" className="w-16 bg-transparent outline-none text-4xl font-black text-orange-900 placeholder:text-slate-300 p-0 m-0" />
                    <span className="text-2xl font-black text-orange-900/50">%</span>
                  </div>
                </div>

                <div className="relative bg-white p-5 rounded-2xl border border-orange-200 shadow-sm group focus-within:ring-2 focus-within:ring-orange-500 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                  <span className="block text-xs font-black uppercase tracking-widest text-orange-500 ml-2">Fiber</span>
                  <div className="flex items-baseline gap-1 mt-4 ml-2">
                    <input type="number" step="0.1" name="crudeFiberPercentage" value={formData.crudeFiberPercentage} onChange={handleInputChange} placeholder="--" className="w-16 bg-transparent outline-none text-4xl font-black text-orange-900 placeholder:text-slate-300 p-0 m-0" />
                    <span className="text-2xl font-black text-orange-900/50">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-orange-800/70 uppercase tracking-wider mb-2 block">Ingredients Manifest (Comma Separated)</label>
                <textarea rows="3" name="ingredientsManifest" value={formData.ingredientsManifest} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-orange-900"></textarea>
              </div>
            </div>
          )}

          {/* Medical Manifest */}
          {activeTab === 'medical' && productType === 'MEDICINE' && (
            <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl shadow-sm border border-rose-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-rose-800 flex items-center gap-2"><Pill className="w-6 h-6" /> Medical Manifest</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-black uppercase tracking-widest">
                  Restricted Class
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-white rounded-2xl border border-rose-100">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" name="requiresPrescriptionFlag" checked={formData.requiresPrescriptionFlag} onChange={handleInputChange} className="w-6 h-6 text-rose-600 rounded border-slate-300 focus:ring-rose-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-black text-slate-800 block">Requires Valid Vet Prescription</span>
                    <span className="text-xs font-medium text-slate-500">Enforces buyer upload interceptor at checkout.</span>
                  </div>
                </label>
                <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" name="isScheduledDrugFlag" checked={formData.isScheduledDrugFlag} onChange={handleInputChange} className="w-6 h-6 text-rose-600 rounded border-slate-300 focus:ring-rose-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-black text-slate-800 block">Is Scheduled Drug (Schedule H/H1)</span>
                    <span className="text-xs font-medium text-slate-500">Strict regulatory tracking applied.</span>
                  </div>
                </label>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-800/70 uppercase tracking-wider">Active Pharmaceutical Ingredients (APIs)</label>
                  <button type="button" onClick={addApiField} className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add API</button>
                </div>
                {formData.apis.map((api, idx) => (
                  <div key={idx} className="flex gap-4">
                    <input type="text" placeholder="Generic Name (e.g. Ivermectin)" value={api.name} onChange={(e) => handleApiChange(idx, 'name', e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" />
                    <input type="text" placeholder="Dose (e.g. 10mg)" value={api.mg} onChange={(e) => handleApiChange(idx, 'mg', e.target.value)} className="w-1/3 px-4 py-2.5 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-bold text-rose-800/70 uppercase tracking-wider mb-2 block">Dosage Per Kg Metric</label>
                  <input type="number" step="0.01" name="dosagePerKgMetric" value={formData.dosagePerKgMetric} onChange={handleInputChange} placeholder="e.g. 0.5" className="w-full md:w-1/2 px-4 py-3 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-rose-800/70 uppercase tracking-wider mb-2 block">Contraindications (Hazards)</label>
                  <textarea rows="3" name="contraindicationsText" value={formData.contraindicationsText} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm"></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-800/70 uppercase tracking-wider mb-2 block">Storage Instructions</label>
                  <input type="text" name="storageConditionInstructions" value={formData.storageConditionInstructions} onChange={handleInputChange} placeholder="e.g. Store below 25°C" className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm" />
                </div>
              </div>

            </div>
          )}

        </div>
      </form>
    </div>
  );
};
