import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, Star, ShieldCheck, 
  ArrowRight, RefreshCw, ChevronRight, Package, Truck, CheckCircle2 
} from 'lucide-react';
import { marketplaceApi } from '../../services/api';
import { usePageNavigation } from '../../context/NavigationContext';

export const PetShopServicePage = () => {
  const { registerSections } = usePageNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const sections = [
    { id: 'home', label: 'Pet Shop Overview' },
    { id: 'search', label: 'Filter Products' },
    { id: 'results', label: 'Curated Catalogue' },
    { id: 'how-it-works', label: 'Ordering Process' },
    { id: 'trust', label: 'Quality Standards' },
    { id: 'faq', label: 'FAQs' },
    { id: 'get-started', label: 'Sell on Jiva Thunai' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await marketplaceApi.getProducts();
      if (res && res.data) {
        const items = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setProducts(items);
      }
    } catch (err) {
      console.warn("Could not load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (searchQuery.trim() && !p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  const faqs = [
    { q: "Are pet food and health supplements authentic?", a: "Yes, all products are sourced exclusively from verified pet shops, authorized importers, and licensed veterinary pharmaceutical distributors." },
    { q: "Can I order prescription veterinary diets?", a: "Prescription urinary, renal, and gastrointestinal diets require an active digital prescription from a verified veterinarian." },
    { q: "What are the return and refund policies?", a: "Unopened dry goods and accessories can be returned within 7 days. Perishable or sterile medical supplies cannot be returned once opened." }
  ];

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Service Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-blue-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-blue-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Pet Nutrition & Retail
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Premium Pet Nutrition, Toys & Medical Care
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              High-quality food, veterinary-recommended supplements, ergonomic accessories, and safe entertainment for dogs, cats, birds, and small animals.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a 
                href="#search"
                className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-blue-700" />
                <span>Browse Products</span>
              </a>
              <Link 
                to="/create-product"
                className="px-6 py-3 rounded-2xl bg-blue-600/80 text-white font-bold text-xs sm:text-sm hover:bg-blue-500 transition-all border border-blue-400/40"
              >
                <span>Vendor Store Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Search and Filters — #search */}
      <section id="search" className="scroll-mt-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Filter Product Catalogue
            </h2>
            <p className="text-xs text-slate-500">Search by product keyword or category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search puppy food, cat scratchers, vitamins, shampoos, harness..."
              className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="FOOD">Nutrition & Food</option>
              <option value="TREATS">Treats & Chews</option>
              <option value="HEALTH">Health & Supplements</option>
              <option value="TOYS">Toys & Interactive</option>
              <option value="ACCESSORIES">Harness & Accessories</option>
            </select>
          </div>
        </div>
      </section>

      {/* 03. Available Options — #results */}
      <section id="results" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Curated Products ({filteredProducts.length})
          </h2>
          <button 
            onClick={loadProducts} 
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Catalog</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No Products Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try broadening your keyword search or selecting 'All Categories'.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div 
                key={p.id}
                className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-500/60 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {p.category || 'RETAIL'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.description || "High quality pet essential item."}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">₹{p.price || 499}</span>
                  <Link
                    to={`/product/${p.id}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 04. How the Service Works — #how-it-works */}
      <section id="how-it-works" className="scroll-mt-28 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Fulfillment
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How Ordering Works on Jiva Thunai
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Select Product", desc: "Choose authentic nutrition or accessories tailored to your pet's life-stage." },
            { step: "02", title: "Safe Checkout", desc: "Pay securely with tracking and integrated digital invoices." },
            { step: "03", title: "Vendor Dispatch", desc: "Verified vendors package and dispatch orders via temperature-monitored routes." },
            { step: "04", title: "Doorstep Delivery", desc: "Fast contactless delivery with complete customer support." }
          ].map(st => (
            <div key={st.step} className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-2">
              <span className="text-2xl font-black text-blue-600">{st.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 05. Trust and Important Information — #trust */}
      <section id="trust" className="scroll-mt-28 p-8 rounded-3xl bg-blue-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold tracking-tight">Authenticity & Batch Quality Verification</h2>
        </div>
        <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-3xl">
          All food and edible pet treats sold on Jiva Thunai comply with statutory food safety standards and import regulations. Products near expiry are automatically flagged and removed from the store catalog.
        </p>
      </section>

      {/* 06. Frequently Asked Questions — #faq */}
      <section id="faq" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 07. Call to Action — #get-started */}
      <section id="get-started" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Become a Verified Pet Product Vendor</h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
          Expand your retail brand across India. List items, manage stock, and fulfill verified pet parent orders.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/register"
            className="px-6 py-3 rounded-2xl bg-white text-blue-950 font-bold text-xs sm:text-sm hover:bg-blue-50 shadow-md"
          >
            Register as a Vendor
          </Link>
        </div>
      </section>

    </div>
  );
};
