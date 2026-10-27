import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Heart, Plus, Minus, CreditCard, ChevronRight, CheckCircle2, MapPin, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logoBase64 } from '../logoBase64';
import { PageHeader } from '../components/PageHeader';

export const CartPage = () => {
    const { cartItems, savedItems, removeFromCart, updateQuantity, toggleSave, isSaved, clearCart } = useCart();
    const { showToast } = useNotification();
    const { user } = useAuth();
    
    // 'cart-pets' | 'cart-products' | 'saved-pets' | 'saved-products'
    const [activeTab, setActiveTab] = useState('cart-pets'); 
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Helpers to distinguish Pets vs Pet Products
    const isProduct = (item) => item.retailPrice || item.barcode || item.categoryId;
    const isPet = (item) => !isProduct(item);

    const petCartItems = cartItems.filter(isPet);
    const productCartItems = cartItems.filter(isProduct);
    
    const savedPets = savedItems.filter(isPet);
    const savedProducts = savedItems.filter(isProduct);

    const currentItems = activeTab === 'cart-pets' ? petCartItems : activeTab === 'cart-products' ? productCartItems : [];
    const currentTotal = currentItems.reduce((total, item) => total + (Number(item.discountedActivePrice || item.retailPrice || item.price || item.askingPrice || 0) * item.quantity), 0);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsCheckingOut(true);
        
        const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID';
        const orderId = 'ORD-' + Date.now();
        const endpoint = activeTab === 'cart-pets' ? '/api/v1/pet/checkout' : '/api/v1/petproduct/checkout';

        const finalizeOrder = async () => {
            try {
                // Determine roles
                const roles = user?.roles ? user.roles.join(',') : (user?.accountType ? user.accountType.toUpperCase() : 'USER');
                await fetch(`http://localhost:8080${endpoint}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-User-Roles': roles,
                        'Authorization': user?.token ? `Bearer ${user.token}` : ''
                    },
                    body: JSON.stringify({
                        buyerId: user?.id || user?.userId || 1,
                        items: currentItems.map(i => ({ productId: i.id || i.sku, quantity: i.quantity })),
                        prescriptionUrl: ''
                    })
                });
            } catch(err) { console.error('Failed to trigger checkout backend:', err); }

            const existingOrders = JSON.parse(localStorage.getItem('petcare_orders') || '[]');
            existingOrders.push({
                id: orderId,
                userId: user?.id || user?.userId || 'guest',
                date: new Date().toISOString(),
                total: currentTotal * 1.18,
                items: currentItems,
                type: activeTab === 'cart-pets' ? 'pets' : 'products'
            });
            localStorage.setItem('petcare_orders', JSON.stringify(existingOrders));
            
            // Remove checked out items from cart
            currentItems.forEach(item => removeFromCart(item.id));
            
            setPaymentSuccess(orderId);
            showToast('Payment successful! Your order has been placed.', 'success');
        };

        if (RAZORPAY_KEY === 'rzp_test_YOUR_KEY_ID') {
            showToast('Razorpay Key not configured. Running in Demo Mode!', 'info');
            setTimeout(() => {
                setIsCheckingOut(false);
                finalizeOrder();
            }, 1000);
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            showToast('Razorpay SDK failed to load. Are you online?', 'error');
            setIsCheckingOut(false);
            return;
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: Math.round((currentTotal * 1.18) * 100),
            currency: 'INR',
            name: 'Jiva Thunai',
            description: `Checkout ${activeTab === 'cart-pets' ? 'Pets' : 'Pet Products'}`,
            image: logoBase64,
            handler: async function (response) {
                setIsCheckingOut(false);
                await finalizeOrder();
            },
            prefill: {
                name: user?.name || 'Guest User',
                email: user?.email || 'customer@example.com',
                contact: '9999999999'
            },
            theme: { color: '#10b981' },
            modal: { ondismiss: function() { setIsCheckingOut(false); } }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    if (paymentSuccess) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">Payment Successful!</h1>
                    <p className="text-slate-500 text-center max-w-md mt-2">Your official receipt has been emailed to you and is available for download below.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Receipt Preview</h3>
                        <a 
                            href={`http://localhost:8086/api/v1/payments/${paymentSuccess}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-xl text-sm transition-colors"
                        >
                            Download PDF
                        </a>
                    </div>
                    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <iframe src={`http://localhost:8086/api/v1/payments/${paymentSuccess}/receipt`} className="w-full h-full" title="Receipt Preview" />
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Link to="/orders" className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all">
                        View My Orders
                    </Link>
                    <Link to="/marketplace" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const renderItemCard = (item, isProductType) => (
        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full sm:w-32 h-32 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0">
                {item.photoUrl || (item.photos && item.photos[0]) ? (
                    <img src={item.photoUrl || item.photos[0]} alt={item.title || item.breed || item.name} className="w-full h-full object-cover object-center" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                    </div>
                )}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-lg font-black text-slate-800">
                            {item.name || item.title || item.breed || 'Item'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 tracking-wide">
                            {isProductType ? (
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Product</span>
                            ) : (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Pet</span>
                            )}
                            {(item.breed || item.category || item.species) && (
                                <span className="line-clamp-1">{item.breed || item.category || item.species}</span>
                            )}
                        </div>
                        {(item.location || item.city) && (
                            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
                                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
                                <span className="line-clamp-1 flex-1">{item.location || item.city}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-lg font-black text-slate-900">₹{Number(item.discountedActivePrice || item.retailPrice || item.askingPrice || item.price || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isProductType && !activeTab.startsWith('saved') ? (
                            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ) : !activeTab.startsWith('saved') ? (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Qty: 1</span>
                        ) : null}
                        
                        <button 
                            onClick={() => toggleSave(item)} 
                            className={`p-2 rounded-lg transition-colors border ${isSaved(item.id) ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 border-transparent'}`}
                            title={isSaved(item.id) ? "Remove from Saved" : "Save for later"}
                        >
                            <Heart className={`w-5 h-5 ${isSaved(item.id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    
                    {activeTab.startsWith('cart') ? (
                        <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 p-2 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" /> Remove
                        </button>
                    ) : (
                         <Link to={isProductType ? `/product/${item.id || item.sku}` : `/marketplace/${item.id}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                            View Details <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <PageHeader
                badgeText="SHOPPING BAG & CHECKOUT"
                badgeIcon={ShoppingBag}
                title="My Cart & Saved Items"
                titleIcon={ShoppingBag}
                description="Manage your selected companion animals and veterinary products, review pricing, and check out securely."
                variant="emerald"
            />

            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
                <button 
                    onClick={() => setActiveTab('cart-pets')}
                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'cart-pets' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <ShieldCheck className="w-4 h-4" /> Pets Cart ({petCartItems.length})
                </button>
                <button 
                    onClick={() => setActiveTab('cart-products')}
                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'cart-products' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <Package className="w-4 h-4" /> Products Cart ({productCartItems.length})
                </button>
                <button 
                    onClick={() => setActiveTab('saved-pets')}
                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'saved-pets' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <Heart className="w-4 h-4" /> Saved Pets ({savedPets.length})
                </button>
                <button 
                    onClick={() => setActiveTab('saved-products')}
                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 ${activeTab === 'saved-products' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <Heart className="w-4 h-4" /> Saved Products ({savedProducts.length})
                </button>
            </div>

            {activeTab.startsWith('cart') && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {currentItems.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Your {activeTab === 'cart-pets' ? 'Pets' : 'Products'} cart is empty</h3>
                                <p className="text-slate-500 mt-2 mb-6">Looks like you haven't added anything to this cart yet.</p>
                                <div className="relative inline-flex mt-2">
                                    <Link to="/marketplace" className="relative px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl transition-all shadow-xl flex items-center gap-2 hover:scale-105">
                                        Browse Marketplace
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            currentItems.map(item => renderItemCard(item, activeTab === 'cart-products'))
                        )}
                    </div>

                    {/* Individual Order Summary & Payment Form */}
                    {currentItems.length > 0 && (
                        <div className="w-full lg:w-96 shrink-0">
                            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white sticky top-28">
                                <h3 className="text-xl font-black mb-6 border-b border-slate-700/50 pb-4">
                                    {activeTab === 'cart-pets' ? 'Pet Order Summary' : 'Product Order Summary'}
                                </h3>
                                <div className="space-y-4 text-sm font-medium text-slate-300">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{currentTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes (GST 18%)</span>
                                        <span>₹{(currentTotal * 0.18).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="text-emerald-400">Free</span>
                                    </div>
                                </div>
                                <div className="my-6 border-t border-slate-700/50"></div>
                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-sm font-bold text-slate-400">Total</span>
                                    <span className="text-3xl font-black text-white">₹{(currentTotal * 1.18).toLocaleString('en-IN')}</span>
                                </div>

                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <button 
                                        type="submit" 
                                        disabled={isCheckingOut}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isCheckingOut ? 'Processing...' : `Pay ₹${(currentTotal * 1.18).toLocaleString('en-IN')}`}
                                        {!isCheckingOut && <ChevronRight className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab.startsWith('saved') && (
                <div className="space-y-4">
                    {activeTab === 'saved-pets' ? savedPets.length === 0 ? (
                        <div className="py-16 text-center text-slate-500">
                            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">No saved pets</h3>
                        </div>
                    ) : (
                        savedPets.map(p => renderItemCard(p, false))
                    ) : savedProducts.length === 0 ? (
                        <div className="py-16 text-center text-slate-500">
                            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">No saved products</h3>
                        </div>
                    ) : (
                        savedProducts.map(p => renderItemCard(p, true))
                    )}
                </div>
            )}
        </div>
    );
};
