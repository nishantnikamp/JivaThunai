import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Trash2, Edit2, Save, X, Heart, Star, MapPin, Filter, Dog, Package, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaUploader } from '../components/MediaUploader';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { PetProductCard } from '../components/PetProductCard';
import { MarketplaceFilterSidebar } from '../components/MarketplaceFilterSidebar';
import { Client } from '@stomp/stompjs';
import { marketplaceApi } from '../services/api';
import { PageHeader } from '../components/PageHeader';

export const MarketplacePage = () => {
  const { token, user, activeRole } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const { addToCart, toggleSave, isSaved } = useCart();
  const [activeTab, setActiveTab] = useState('pets');
  
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const allPetsScrollRef = useRef(null);
  const featuredScrollRef = useRef(null);

  const scrollPets = (direction) => {
    if (allPetsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      allPetsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollFeatured = (direction) => {
    if (featuredScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      featuredScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const [dbFilterOptions, setDbFilterOptions] = useState({
    species: [],
    breeds: [],
    categories: [],
    brands: [],
    locations: []
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  // Debounce backend fetch trigger
  const [debouncedFilters, setDebouncedFilters] = useState({});
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(handler);
  }, [filters]);

  
  // RBAC Flags
  const canManagePets = ['SUPER_ADMIN', 'ADMIN', 'SELLER', 'BREEDER'].includes(activeRole);
  const canManageProducts = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_SHOP_OWNER'].includes(activeRole);

  // Form State with Auto-Save
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('marketplaceDraft');
    return saved ? JSON.parse(saved) : {};
  });
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    localStorage.setItem('marketplaceDraft', JSON.stringify(formData));
  }, [formData]);

  // WebSocket for Real-Time Updates
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8085/ws/marketplace/websocket',
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/marketplace', (msg) => {
          if (msg.body) {
            console.log('Real-time update received:', msg.body);
            // Refresh data when inventory changes
            setRefreshTrigger(prev => !prev);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP broker warning:', frame.headers['message']);
      },
      onWebSocketError: () => {
        // Suppress noisy console errors if websocket server is not currently reachable
      }
    });
    client.activate();
    
    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab, debouncedFilters, refreshTrigger]);

  useEffect(() => {
    marketplaceApi.getFilterOptions(token)
      .then(res => {
        if (res && res.data) {
          setDbFilterOptions(res.data);
        } else if (res && (res.species || res.breeds || res.categories)) {
          setDbFilterOptions(res);
        }
      })
      .catch(e => console.warn("Failed to fetch database filter options", e));
  }, [token, refreshTrigger]);

  const getUrl = (id = '') => {
    let baseUrl = '';
    if (activeTab === 'pets') baseUrl = `http://localhost:8080/api/v1/pet${id ? '/' + id : ''}`;
    else baseUrl = `http://localhost:8080/api/v1/petproduct${id ? '/' + id : ''}`;
    
    if (!id && Object.keys(debouncedFilters).length > 0) {
      const params = new URLSearchParams();
      if (debouncedFilters.category && activeTab === 'products') params.append('category', debouncedFilters.category);
      if (debouncedFilters.minPrice) params.append('minPrice', debouncedFilters.minPrice);
      if (debouncedFilters.maxPrice) params.append('maxPrice', debouncedFilters.maxPrice);
      
      const queryString = params.toString();
      if (queryString) return `${baseUrl}?${queryString}`;
    }
    return baseUrl;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(getUrl(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        setItems(activeTab === 'pets' ? data.map(d => ({
          ...d.listing, 
          id: d.listing.id,
          rating: d.listing.rating || 0.0,
          reviewCount: d.listing.reviewCount || 0,
          countryOfOrigin: d.listing.countryOfOrigin || 'India',
          hasOffers: d.listing.hasOffers || false,
          createdAt: d.listing.createdAt || new Date().toISOString(),
          photoUrl: d.metadata?.photos?.find(p => p.isPrimary)?.s3Url || d.metadata?.photos?.[0]?.s3Url || null,
          photos: d.metadata?.photos?.map(p => p.s3Url) || [],
          videos: d.metadata?.videos?.map(v => v.videoUrl) || [],
          healthCertificateUrl: d.metadata?.documents?.find(doc => doc.type === 'HEALTH_CERTIFICATE')?.secureFileUrl || null,
          breedCertificateUrl: d.metadata?.documents?.find(doc => doc.type === 'PEDIGREE_CERTIFICATE')?.secureFileUrl || null,
          description: d.metadata?.lineageTracking?.breederNotes || ''
        })) : data.map(d => ({
          ...d,
          id: d.sku || d.id,
          rating: d.rating || 0.0,
          reviewCount: d.reviewCount || 0,
          countryOfOrigin: d.countryOfOrigin || 'India',
          hasOffers: d.hasOffers || false,
          createdAt: d.createdAt || new Date().toISOString(),
          discountedActivePrice: d.discountedActivePrice || null
        })));
        return;
      }
    } catch (e) {
      console.warn("Backend unavailable or fetch failed:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(getUrl(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Item deleted successfully', 'success');
        fetchData();
      } else {
        showToast('Not authorized to delete this item', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'pets' && !formData.photoUrl) {
      showToast('You must upload at least one clear image of the Pet.', 'error');
      return;
    }

    const url = getUrl(editingItem?.id);
    const method = editingItem ? 'PUT' : 'POST';

    // Map payload for PetSaleDTO
    const payload = activeTab === 'pets' ? {
      listing: {
        id: editingItem?.id,
        sellerId: user?.userId || user?.id || editingItem?.sellerId || 1,
        name: formData.name || null,
        species: formData.species,
        breed: formData.breed,
        askingPrice: parseFloat(formData.askingPrice) || 0,
        dob: formData.dob || new Date().toISOString().split('T')[0],
        gender: formData.gender || 'UNKNOWN',
        status: formData.status || 'ACTIVE',
        negotiationAllowed: formData.negotiationAllowed || false,
        gstin: formData.GSTIN || null,
        breederLicenseNumber: formData.breederLicenseNumber || null,
        baseCoatColor: formData.baseCoatColor || null,
        microchipNumber: formData.microchipNumber || null,
        pedigreeCertificateRef: formData.pedigreeCertificateRef || null,
        location: formData.location || null,
        vendorName: formData.vendorName || null
      },
      metadata: {
        photos: [...new Set([...(formData.photos || []), ...(formData.photoUrl ? [formData.photoUrl] : [])])]
          .filter(Boolean)
          .map(url => ({ s3Url: url, isPrimary: url === formData.photoUrl })),
        videos: (formData.videos || []).filter(Boolean).map(url => ({ videoUrl: url })),
        documents: [
          ...(formData.healthCertificateUrl ? [{ type: 'HEALTH_CERTIFICATE', secureFileUrl: formData.healthCertificateUrl }] : []),
          ...(formData.breedCertificateUrl ? [{ type: 'PEDIGREE_CERTIFICATE', secureFileUrl: formData.breedCertificateUrl }] : [])
        ],
        lineageTracking: { breederNotes: formData.description || '' }
      }
    } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Successfully ${editingItem ? 'updated' : 'created'} listing`, 'success');
        setIsFormOpen(false);
        setFormData({});
        localStorage.removeItem('marketplaceDraft');
        fetchData();
      } else {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        showToast(`Error: ${res.status} ${res.statusText}. Check console for details.`, 'error');
      }
    } catch (err) {
      showToast('Network error during save', 'error');
    }
  };

  const openForm = (item = null) => {
    setEditingItem(item);
    setFormData(item || (activeTab === 'pets' ? { breed: '', species: '', askingPrice: '', dob: '', gender: 'UNKNOWN', photos: [], videos: [] } : { name: '', category: 'FOOD', price: '', availableStock: '', photos: [], videos: [] }));
    setIsFormOpen(true);
  };

  const availableSpecies = useMemo(() => {
    const speciesSet = new Set(items.map(i => (i.species || i.targetSpecies || '').trim()).filter(Boolean));
    return Array.from(speciesSet).sort();
  }, [items]);

  const availableBreedsOrBrands = useMemo(() => {
    const set = new Set(items.map(i => {
      const val = activeTab === 'pets' ? i.breed : (i.brand || i.name);
      return (val || '').trim();
    }).filter(Boolean));
    return Array.from(set).sort();
  }, [items, activeTab]);

  const filteredItems = useMemo(() => {
    return items.filter(p => {
      // Base tab filter
      const isBaseMatch = activeTab === 'pets' 
        ? (p.type === 'pet' || p.species || !p.type) 
        : (p.type === 'product' || (!p.species && (p.category || p.categoryId)));
      if (!isBaseMatch) return false;

      // Frontend-only filters
      if (filters.breedOrBrand && filters.breedOrBrand.length > 0) {
        if (activeTab === 'pets') {
          if (!filters.breedOrBrand.includes(p.breed?.trim())) return false;
        } else {
          const match = filters.breedOrBrand.some(b => 
            p.brand?.toLowerCase().includes(b.toLowerCase()) || 
            p.name?.toLowerCase().includes(b.toLowerCase())
          );
          if (!match) return false;
        }
      }

      if (filters.species && filters.species.length > 0) {
        const itemSpecies = (p.species || p.targetSpecies || '').trim();
        if (!filters.species.includes(itemSpecies)) return false;
      }
      
      if (filters.rating) {
        const rating = parseFloat(p.rating || '0');
        if (rating < filters.rating) return false;
      }
      
      if (filters.discount && !p.discountedActivePrice) return false;
      
      if (filters.newArrivals) {
        const date = new Date(p.createdAt || p.updatedAt);
        const daysOld = (new Date() - date) / (1000 * 60 * 60 * 24);
        if (isNaN(daysOld) || daysOld > 30) return false; // Not new if older than 30 days
      }
      
      if (filters.offers && !p.hasOffers && !p.offers) return false;
      
      if (filters.country && p.countryOfOrigin !== filters.country) return false;

      return true;
    });
  }, [items, activeTab, filters]);

  if (isFormOpen) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        {/* Page Level Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              {editingItem ? 'Edit Listing' : 'Create New Listing'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Fill out the details completely to ensure maximum buyer trust.</p>
          </div>
          <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>

        {/* Page Level Form Content */}
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm border border-slate-100 space-y-10">
          <div className="space-y-10">
              {/* Core Details */}
              <section>
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-6">Core Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="text-xs font-bold text-slate-600">Pet Name *</label><input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Breed *</label><input type="text" required value={formData.breed || ''} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Species *</label><input type="text" required value={formData.species || ''} onChange={e => setFormData({...formData, species: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div><label className="text-xs font-bold text-slate-600">Price (₹) *</label><input type="number" required value={formData.askingPrice || ''} onChange={e => setFormData({...formData, askingPrice: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Gender *</label>
                    <select value={formData.gender || 'UNKNOWN'} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-slate-600">DOB *</label><input type="date" required value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div><label className="text-xs font-bold text-slate-600">Location</label><input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="City, State" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Vendor Name</label><input type="text" value={formData.vendorName || ''} onChange={e => setFormData({...formData, vendorName: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Name of Shop or Breeder" /></div>
                </div>
              </section>
              
              {/* Physical Attributes */}
              <section className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-6">Physical Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="text-xs font-bold text-slate-600">Base Coat Color</label><input type="text" value={formData.baseCoatColor || ''} onChange={e => setFormData({...formData, baseCoatColor: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Microchip Number</label><input type="text" value={formData.microchipNumber || ''} onChange={e => setFormData({...formData, microchipNumber: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                </div>
              </section>

              {/* Legal & Compliance */}
              <section className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-6">Legal & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="text-xs font-bold text-slate-600">GSTIN</label><input type="text" value={formData.GSTIN || ''} onChange={e => setFormData({...formData, GSTIN: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Optional" /></div>
                  <div><label className="text-xs font-bold text-slate-600">Breeder License No.</label><input type="text" value={formData.breederLicenseNumber || ''} onChange={e => setFormData({...formData, breederLicenseNumber: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Optional" /></div>
                </div>
                <div className="mt-6"><label className="text-xs font-bold text-slate-600">Pedigree Certificate Ref</label><input type="text" value={formData.pedigreeCertificateRef || ''} onChange={e => setFormData({...formData, pedigreeCertificateRef: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div>
                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={formData.negotiationAllowed || false} onChange={e => setFormData({...formData, negotiationAllowed: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">Allow Price Negotiation by Buyers</span>
                  </label>
                </div>
              </section>

              {/* Secure Certificates */}
              <section className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-6">Secure Certificates</h3>
                <p className="text-xs text-slate-500 mb-4">Upload PDF certificates. These will be stored securely and only accessible to authorized viewers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Health Certificate (PDF) *</label>
                    <MediaUploader 
                      type="document" 
                      maxFiles={1}
                      initialFiles={formData.healthCertificateUrl ? [formData.healthCertificateUrl] : []}
                      onUploadComplete={(url) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          healthCertificateUrl: url 
                        }));
                      }} 
                      onRemove={(url) => {
                        setFormData(prev => ({
                          ...prev,
                          healthCertificateUrl: prev.healthCertificateUrl === url ? null : prev.healthCertificateUrl
                        }));
                      }}
                    />
                    {formData.healthCertificateUrl && <span className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Health Certificate Attached</span>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Breed Certificate (PDF) *</label>
                    <MediaUploader 
                      type="document" 
                      maxFiles={1}
                      initialFiles={formData.breedCertificateUrl ? [formData.breedCertificateUrl] : []}
                      onUploadComplete={(url) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          breedCertificateUrl: url 
                        }));
                      }} 
                      onRemove={(url) => {
                        setFormData(prev => ({
                          ...prev,
                          breedCertificateUrl: prev.breedCertificateUrl === url ? null : prev.breedCertificateUrl
                        }));
                      }}
                    />
                    {formData.breedCertificateUrl && <span className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Breed Certificate Attached</span>}
                  </div>
                </div>
              </section>
              
              {/* Media & Description */}
              <section className="pt-8 border-t border-slate-100">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-6">Media & Description</h3>
                <div>
                  <label className="text-xs font-bold text-slate-600">Description / Health Guidelines</label>
                  <textarea rows="5" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="Rich text description..."></textarea>
                </div>
                <div className="mt-8">
                  <label className="text-sm font-bold text-slate-800 mb-1 block">Media Gallery</label>
                  <p className="text-xs text-slate-500 mb-4">Upload high-resolution images and videos of the pet. Engage buyers with clear visuals.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Photos (Max 6)</label>
                      <MediaUploader 
                        type="image" 
                        maxFiles={6}
                        initialFiles={[...(formData.photoUrl ? [formData.photoUrl] : []), ...(formData.photos || [])].filter((v, i, a) => a.indexOf(v) === i)}
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
                            photoUrl: prev.photoUrl === url ? (prev.photos.find(p => p !== url) || null) : prev.photoUrl,
                            photos: (prev.photos || []).filter(p => p !== url)
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Videos (Max 2)</label>
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
              </section>
            </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors w-full sm:w-auto text-center">Cancel</button>
            <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"><Save className="w-5 h-5" /> Save Listing</button>
          </div>
        </form>
      </div>
    );
  }


  const featuredItems = filteredItems.slice(0, 10);
  
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const renderCard = (item) => (
    activeTab === 'products' ? (
      <PetProductCard
        key={item.id}
        item={item}
        canManageProducts={canManageProducts}
        isSaved={isSaved}
        toggleSave={toggleSave}
        onEdit={() => navigate('/edit-product', { state: { item } })}
        onDelete={handleDelete}
        addToCart={addToCart}
      />
    ) : (
      <MarketplaceCard
        key={item.id}
        item={item}
        activeTab={activeTab}
        canManagePets={canManagePets}
        canManageProducts={canManageProducts}
        user={user}
        activeRole={activeRole}
        isSaved={isSaved}
        toggleSave={toggleSave}
        onEdit={() => openForm(item)}
        onDelete={handleDelete}
        addToCart={addToCart}
      />
    )
  );

  return (
    <div className="w-full space-y-6 lg:pr-72">
      {/* Marketplace Header */}
      <PageHeader
        badgeIcon={ShoppingBag}
        badgeText="AWBI & PCA 1960 Compliant Marketplace"
        badgeVariant="emerald"
        title="Verified Pet & Product Marketplace"
        titleIcon={ShoppingBag}
        description="Discover, buy, and manage pets and pet care products safely with verified breeder accreditation and compliant health checks."
        actions={
          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-none text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Open Filters"
            >
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
              {Object.keys(filters).length > 0 && (
                <span className="w-2 h-2 bg-emerald-600 rounded-xs"></span>
              )}
            </button>

            {((activeTab === 'pets' && canManagePets) || (activeTab === 'products' && canManageProducts)) && (
              <button 
                type="button"
                onClick={() => activeTab === 'products' ? navigate('/create-product') : openForm()} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-none text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create New Listing
              </button>
            )}
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row relative items-start w-full">
        <div className="flex-1 w-full min-w-0">
          {filteredItems.length > 0 ? (
        <>
          {/* Horizontal Scroll Section (Featured Highlights) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Featured Highlights
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollFeatured('left')}
                  className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
                  aria-label="Scroll featured left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFeatured('right')}
                  className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
                  aria-label="Scroll featured right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative group">
              <div ref={featuredScrollRef} className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style dangerouslySetInnerHTML={{__html: `
                  .hide-scrollbar::-webkit-scrollbar { display: none; }
                `}} />
                {featuredItems.map(item => (
                  <div key={item.id} className="snap-start shrink-0 w-[260px] sm:w-[300px]">
                    {renderCard(item)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* All Pets (Horizontal Scroll) or All Products (Grid with Pagination) */}
          {activeTab === 'pets' ? (
            <section className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Dog className="w-5 h-5 text-emerald-600" /> All Pets
                  </h2>
                  <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-none">
                    {filteredItems.length} Total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollPets('left')}
                    className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
                    aria-label="Scroll pets left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollPets('right')}
                    className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-sm"
                    aria-label="Scroll pets right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative group">
                <div 
                  ref={allPetsScrollRef} 
                  className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style dangerouslySetInnerHTML={{__html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                  `}} />
                  {filteredItems.map(item => (
                    <div key={item.id} className="snap-start shrink-0 w-[260px] sm:w-[300px]">
                      {renderCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">All Products</h2>
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-none">{totalItems} Total</span>
              </div>
              
              {/* The Responsive Grid Structure */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 sm:gap-6">
                {paginatedItems.map(item => (
                  <div key={item.id} className="h-full">
                    {renderCard(item)}
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              <div className="pt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-none border border-slate-100 border-dashed text-slate-500">
          <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-700">No listings found</p>
          <p className="text-sm mt-1">There are no active listings available in this category.</p>
        </div>
      )}
        </div>

        {/* Right Corner Fixed Sidebar (Top to Bottom fit screen) */}
        <MarketplaceFilterSidebar 
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters} 
          setFilters={setFilters} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }} 
          availableSpecies={dbFilterOptions.species?.length > 0 ? dbFilterOptions.species : availableSpecies}
          availableBreedsOrBrands={activeTab === 'pets' 
            ? (dbFilterOptions.breeds?.length > 0 ? dbFilterOptions.breeds : availableBreedsOrBrands)
            : (dbFilterOptions.brands?.length > 0 ? dbFilterOptions.brands : availableBreedsOrBrands)}
          dbCategories={dbFilterOptions.categories}
          dbLocations={dbFilterOptions.locations}
        />
      </div>
    </div>
  );
};
