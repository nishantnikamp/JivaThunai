import React, { useState, useEffect } from 'react';
import { Package, FileText, ChevronRight, CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';

export const MyOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [activeTab, setActiveTab] = useState('pets'); // 'pets' or 'products'

    useEffect(() => {
        const saved = localStorage.getItem('petcare_orders');
        if (saved) {
            const currentUser = user?.userId || user?.id || 'guest';
            const parsed = JSON.parse(saved);
            
            const userOrders = parsed.filter(o => 
                String(o.userId) === String(currentUser) || (!o.userId && currentUser === 'guest')
            );
            
            setOrders(userOrders.reverse()); // newest first
        }
    }, [user]);

    const currentOrders = orders.filter(o => 
        (activeTab === 'pets' && (!o.type || o.type === 'pets')) || 
        (activeTab === 'products' && o.type === 'products')
    );

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
            <PageHeader
                badgeText="ORDER HISTORY & RECEIPTS"
                badgeIcon={Package}
                title="My Orders & Receipts"
                titleIcon={Package}
                description="View your past transactions, track fulfillment, and download official tax receipts."
                variant="emerald"
            />

            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
                <button 
                    onClick={() => setActiveTab('pets')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'pets' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <ShieldCheck className="w-4 h-4" /> Pets Orders
                </button>
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'products' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <Package className="w-4 h-4" /> Products Orders
                </button>
            </div>

            {currentOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">No {activeTab} orders yet</h3>
                    <p className="text-slate-500 mt-2 mb-6">Looks like you haven't made any purchases for {activeTab} yet.</p>
                    <Link to="/marketplace" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {currentOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="text-sm font-mono font-bold text-slate-700">{order.id}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-sm font-black text-emerald-600">₹{order.total.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                        <CheckCircle2 className="w-5 h-5" /> Order Completed
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setActiveReceipt(`http://localhost:8086/api/v1/payments/${order.id}/receipt`)}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 border border-emerald-200"
                                        >
                                            <FileText className="w-4 h-4" /> Preview Receipt
                                        </button>
                                        <a 
                                            href={`http://localhost:8086/api/v1/payments/${order.id}/receipt`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-3 border-t border-slate-100 first:border-0 first:pt-0">
                                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                {item.photoUrl ? (
                                                    <img src={item.photoUrl} alt="Item" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{item.title || item.breed || item.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{item.productType || item.species || item.category}</p>
                                                <p className="text-sm font-bold text-slate-600 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-800">
                                                    ₹{(Number(item.discountedActivePrice || item.retailPrice || item.askingPrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Inline Receipt Preview Viewer */}
            {activeReceipt && (
                <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-sm p-4 sm:p-12 animate-in fade-in duration-200">
                    <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-5xl mx-auto border border-emerald-200 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-emerald-50">
                            <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h3 className="text-xl font-black text-emerald-900">Receipt Preview</h3>
                                    <p className="text-xs text-emerald-700 font-bold">Official purchase receipt</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={activeReceipt}
                                    download={`Receipt-${activeReceipt.split('/').slice(-2, -1)[0]}.pdf`}
                                    className="px-4 py-2 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download PDF
                                </a>
                                <button 
                                    onClick={() => setActiveReceipt(null)}
                                    className="px-4 py-2 text-rose-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-0 bg-slate-100 flex justify-center items-center relative overflow-hidden">
                            <iframe 
                                src={activeReceipt}
                                className="w-full h-full border-none"
                                title="Receipt Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
