import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowLeft, Heart, Share2, ShieldCheck, Truck, Star, Info, Package, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuth();
  const { showToast } = useNotification();
  const { addToCart, toggleSave, isSaved } = useCart();
  
  const [product, setProduct] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!product);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/petproduct`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const found = data.find(p => p.sku === id || p.id === id);
        if (found) {
          setProduct({
            ...found,
            id: found.sku || found.id,
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch product", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold">
        <h2>Product not found.</h2>
        <button onClick={() => navigate('/marketplace')} className="mt-4 text-emerald-600 hover:underline">Return to Marketplace</button>
      </div>
    );
  }

  const images = [...(product.photos?.length > 0 ? product.photos : (product.photoUrl ? [product.photoUrl] : ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80']))];
  const allMedia = [...images, ...(product.videos || []).map(v => ({ type: 'video', url: v }))];

  const displayPrice = product.discountedActivePrice || product.retailPrice || product.price;
  const isDiscounted = product.discountedActivePrice && product.discountedActivePrice < product.retailPrice;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <PageHeader
        badgeText={product.brand || 'VERIFIED PRODUCT SPECIFICATION'}
        badgeIcon={Package}
        title={product.name || product.title}
        titleIcon={Package}
        description={product.description ? (product.description.length > 120 ? `${product.description.substring(0, 120)}...` : product.description) : 'Verified retail item details, specifications, and fast dispatch checkout.'}
        variant="emerald"
        actions={
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Catalog
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
        
        {/* Left Column: Media Gallery */}
        <div className="space-y-6">
          <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative group flex items-center justify-center p-8">
            {typeof allMedia[activeImage] === 'string' ? (
              <img src={allMedia[activeImage]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <video src={allMedia[activeImage].url} controls className="w-full h-full object-cover rounded-2xl" />
            )}
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.categoryId === '1' && <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-md">Pet Food</span>}
              {product.categoryId === '2' && <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-md">Medicine</span>}
              {isDiscounted && <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-md">Sale</span>}
            </div>
          </div>
          
          {allMedia.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {allMedia.map((media, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-2 bg-slate-50 ${activeImage === idx ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                  {typeof media === 'string' ? (
                    <img src={media} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">Video</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{product.name || product.title}</h1>
            <p className="text-emerald-600 font-bold mt-1 text-sm">{product.brand || 'Premium Brand'}</p>
          </div>

          <div className="flex items-end gap-4 mb-8 pb-8 border-b border-slate-100">
            <span className="text-4xl font-black text-slate-900">₹{displayPrice}</span>
            {isDiscounted && (
              <>
                <span className="text-lg font-bold text-slate-400 line-through mb-1.5">₹{product.retailPrice}</span>
                <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded mb-1.5">{Math.round(((product.retailPrice - product.discountedActivePrice) / product.retailPrice) * 100)}% OFF</span>
              </>
            )}
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
              <Package className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Availability</p>
                <p className="text-sm font-bold text-slate-700">{product.activeStockQuantityCount > 0 || product.activeStockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
              <Truck className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Shipping</p>
                <p className="text-sm font-bold text-slate-700">Free over ₹499</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Authenticity</p>
                <p className="text-sm font-bold text-slate-700">100% Genuine</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto">
            <button 
              onClick={() => { addToCart(product, 1); }}
              className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Add to Cart
            </button>
            <button 
              onClick={() => toggleSave(product.id, 'product')}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-colors ${isSaved(product.id, 'product') ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}>
              <Heart className={`w-6 h-6 ${isSaved(product.id, 'product') ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Details Tabs / Content */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 pb-4 border-b border-slate-100">Product Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Description */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Description</h4>
              <p className="text-slate-600 leading-relaxed">{product.description || 'No description provided by the seller.'}</p>
            </div>
            
            {(product.crudeProteinPercentage || product.crudeFatPercentage || product.crudeFiberPercentage || product.ingredientsManifest) && (
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h4 className="text-sm font-black text-orange-900 mb-4 uppercase tracking-wider">Nutritional Profile</h4>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-xl shadow-sm"><span className="block text-[10px] text-orange-500 font-bold uppercase">Protein</span><span className="text-lg font-black text-orange-900">{product.crudeProteinPercentage || '--'}%</span></div>
                  <div className="bg-white p-3 rounded-xl shadow-sm"><span className="block text-[10px] text-orange-500 font-bold uppercase">Fat</span><span className="text-lg font-black text-orange-900">{product.crudeFatPercentage || '--'}%</span></div>
                  <div className="bg-white p-3 rounded-xl shadow-sm"><span className="block text-[10px] text-orange-500 font-bold uppercase">Fiber</span><span className="text-lg font-black text-orange-900">{product.crudeFiberPercentage || '--'}%</span></div>
                </div>
                {product.ingredientsManifest && (
                  <div>
                    <h5 className="text-xs font-bold text-orange-800 mb-1">Ingredients:</h5>
                    <p className="text-sm text-orange-900/80">{product.ingredientsManifest}</p>
                  </div>
                )}
              </div>
            )}

            {product.categoryId === '2' && (
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h4 className="text-sm font-black text-rose-900 mb-4 uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Medical Guidelines</h4>
                {product.requiresPrescriptionFlag && (
                  <p className="text-sm font-bold text-rose-600 bg-white px-4 py-2 rounded-lg shadow-sm mb-4 inline-flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> Prescription Required at Checkout</p>
                )}
                <div className="space-y-4 text-sm text-rose-900/80">
                  {product.dosagePerKgMetric && <p><strong>Dosage:</strong> {product.dosagePerKgMetric} per Kg</p>}
                  {product.contraindicationsText && <p><strong>Contraindications:</strong> {product.contraindicationsText}</p>}
                  {product.storageConditionInstructions && <p><strong>Storage:</strong> {product.storageConditionInstructions}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Specifications</h4>
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {product.netWeightGrams && <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Net Weight</span><span className="font-bold text-slate-800">{product.netWeightGrams}g</span></div>}
              {product.brand && <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Brand</span><span className="font-bold text-slate-800">{product.brand}</span></div>}
              {product.skuCode && <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">SKU</span><span className="font-bold text-slate-800">{product.skuCode}</span></div>}
              {product.manufacturingDate && <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Mfg Date</span><span className="font-bold text-slate-800">{new Date(product.manufacturingDate).toLocaleDateString()}</span></div>}
              {product.expiryDate && <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Expiry</span><span className="font-bold text-slate-800">{new Date(product.expiryDate).toLocaleDateString()}</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
