import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Heart, ShieldCheck, Tag, FileText, CheckCircle2, AlertTriangle, Play, Star, MessageSquare, FileCheck, MapPin } from 'lucide-react';
import { SecurePdfViewer } from '../components/SecurePdfViewer';
import { PageHeader } from '../components/PageHeader';

export const MarketplaceItemPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, toggleSave, isSaved } = useCart();
  const { token, user } = useAuth();
  
  const item = location.state?.item;
  const type = location.state?.type;

  // Extract all media
  const allMedia = [];
  if (item?.photoUrl) allMedia.push({ type: 'image', url: item.photoUrl });
  if (item?.photos && Array.isArray(item.photos)) {
    item.photos.forEach(p => {
      const url = typeof p === 'string' ? p : p.url;
      if (url && url !== item.photoUrl) allMedia.push({ type: 'image', url });
    });
  }
  if (item?.videos && Array.isArray(item.videos)) {
    item.videos.forEach(v => {
      const url = typeof v === 'string' ? v : v.url;
      if (url) allMedia.push({ type: 'video', url });
    });
  }
  if (item?.mediaUrls && Array.isArray(item.mediaUrls)) {
    item.mediaUrls.forEach(url => {
      if (url !== item.photoUrl) {
         const isVideo = !!url.match(/\.(mp4|webm|ogg)$/i);
         allMedia.push({ type: isVideo ? 'video' : 'image', url });
      }
    });
  }

  const [activeMedia, setActiveMedia] = React.useState(allMedia.length > 0 ? allMedia[0] : null);

  if (!item) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-slate-500">
        <p className="mb-4">Item not found or session expired.</p>
        <button onClick={() => navigate('/marketplace')} className="text-emerald-600 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>
      </div>
    );
  }

  const displayTitle = item.name || item.breed || item.title;
  const displayCategory = item.species || item.productType || item.category || 'General';
  const displayPrice = item.askingPrice || item.retailPrice || item.price;
  const stock = item.activeStockQuantityCount || item.availableStock;

  const [currentRating, setCurrentRating] = React.useState(item.rating ? parseFloat(item.rating).toFixed(1) : '0.0');
  const [currentReviewsCount, setCurrentReviewsCount] = React.useState(item.reviewCount || 0);

  const [comments, setComments] = React.useState([]);
  const [newComment, setNewComment] = React.useState('');
  const [newRating, setNewRating] = React.useState(0);

  const [activeCertificate, setActiveCertificate] = React.useState(null);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const headers = {};
        if (token) {
           headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`http://localhost:8080/api/v1/marketplace/reviews/item/${item.id}`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
          if (data.length > 0) {
            const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
            setCurrentRating((sum / data.length).toFixed(1));
            setCurrentReviewsCount(data.length);
          }
        }
      } catch (err) {
        console.error("Could not fetch reviews", err);
      }
    };
    if (item?.id) fetchReviews();
  }, [item?.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (newRating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }

    try {
      const payload = {
        itemId: item.id,
        authorName: user?.name || "Current User",
        rating: newRating,
        commentText: newComment
      };

      const res = await fetch(`http://localhost:8080/api/v1/marketplace/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedReview = await res.json();
        const updatedComments = [savedReview, ...comments];
        
        const newCount = currentReviewsCount + 1;
        const newTotalSum = (parseFloat(currentRating) * currentReviewsCount) + newRating;
        const newAverage = (newTotalSum / newCount).toFixed(1);

        setComments(updatedComments);
        setCurrentRating(newAverage);
        setCurrentReviewsCount(newCount);
        setNewComment('');
        setNewRating(0);
      }
    } catch (err) {
      console.error("Could not save review", err);
      alert("Failed to save review. Is the backend running?");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <PageHeader
        badgeText={item.type === 'PET' ? 'COMPANION PET LISTING' : 'VERIFIED PRODUCT LISTING'}
        badgeIcon={item.type === 'PET' ? Heart : ShoppingBag}
        title={displayTitle}
        titleIcon={item.type === 'PET' ? Heart : ShoppingBag}
        description={item.breed ? `${item.breed} • Listed by ${item.sellerName || 'Verified Seller'}` : `Certified listing • Ready for immediate order`}
        variant="emerald"
        actions={
          <button 
            onClick={() => navigate('/marketplace')} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> Back to Marketplace
          </button>
        }
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Header & Image Banner */}
        <div className="w-full bg-slate-900 relative border-b border-slate-100 flex flex-col">
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[450px] flex items-center justify-center relative overflow-hidden">
            {activeMedia && (
              <div 
                 className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl scale-110" 
                 style={{ backgroundImage: `url(${activeMedia.url})` }}
              />
            )}
            {activeMedia ? (
              activeMedia.type === 'video' ? (
                <video src={activeMedia.url} controls className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
              ) : (
                <img src={activeMedia.url} alt={displayTitle} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 relative z-10 bg-slate-50">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-300">No Media Available</span>
              </div>
            )}
            
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => toggleSave(item)} 
                className={`w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg transition-all hover:scale-110 ${isSaved(item.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} 
              >
                <Heart className={`w-6 h-6 ${isSaved(item.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Thumbnails */}
          {allMedia.length > 1 && (
            <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 flex gap-4 overflow-x-auto no-scrollbar relative z-20 justify-center">
              {allMedia.map((media, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveMedia(media)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeMedia?.url === media.url ? 'border-emerald-400 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                      <Play className="w-8 h-8" />
                    </div>
                  ) : (
                    <img src={media.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Details */}
        <div className="w-full p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
          
          {/* Main Info Column */}
          <div className="lg:w-2/3 flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg">
                {displayCategory}
              </span>
              {stock !== undefined && stock < 5 && (
                <span className="bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Only {stock} Left
                </span>
              )}
              {type === 'pets' && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">{displayTitle}</h1>
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-bold text-slate-800 ml-1">{currentRating} <span className="text-slate-500 font-medium">({currentReviewsCount} Reviews)</span></span>
              </div>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <p className="text-slate-500 text-sm font-medium">Listed in Jiva Thunai ecosystem</p>
            </div>

            <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest">Asking Price</p>
              <p className="text-5xl font-black text-emerald-600 flex items-end gap-2">
                ₹{Number(displayPrice || 0).toLocaleString('en-IN')}
                <span className="text-base text-slate-400 font-bold pb-2">tax incl.</span>
              </p>
            </div>

            {item.description && (
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Description / Health Guidelines</h3>
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {(item.healthCertificateUrl || item.breedCertificateUrl) && (
               <div className="mb-8">
                 <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider mb-4">Secure Certificates</h3>
                 <div className="flex flex-col sm:flex-row gap-4">
                   {item.healthCertificateUrl && (
                      <button 
                         onClick={() => setActiveCertificate({ type: 'Health Certificate', url: item.healthCertificateUrl })}
                         className="flex-1 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 hover:shadow-md transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <FileCheck className="w-6 h-6 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-900">Health Certificate</span>
                         </div>
                         <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">View</span>
                      </button>
                   )}
                   {item.breedCertificateUrl && (
                      <button 
                         onClick={() => setActiveCertificate({ type: 'Breed Certificate', url: item.breedCertificateUrl })}
                         className="flex-1 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 hover:shadow-md transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <FileCheck className="w-6 h-6 text-blue-600" />
                            <span className="text-sm font-bold text-blue-900">Breed Certificate</span>
                         </div>
                         <span className="text-xs font-black text-blue-600 uppercase tracking-wider">View</span>
                      </button>
                   )}
                 </div>
               </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="lg:w-1/3 flex flex-col">
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 mb-6">
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <FileText className="w-5 h-5 text-emerald-500" /> Item Details
              </h3>
              <div className="flex flex-col gap-5">
                
                {/* Origin & Vendor */}
                {(item.vendorName || item.location || item.GSTIN) && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Origin & Vendor</h4>
                    
                    {item.vendorName && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Vendor</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.vendorName}</p>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Location</p>
                        <p className="text-sm font-black text-slate-800 text-right flex items-center justify-end gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0"/> <span className="truncate">{item.location}</span></p>
                      </div>
                    )}
                    {item.GSTIN && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">GSTIN</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.GSTIN}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Biological Profile */}
                {(item.species || item.breed || item.gender || item.dob || item.baseCoatColor || item.microchipNumber) && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Biological Profile</h4>
                    
                    {item.species && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Species</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.species}</p>
                      </div>
                    )}
                    {item.breed && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Breed</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.breed}</p>
                      </div>
                    )}
                    {item.gender && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Gender</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.gender}</p>
                      </div>
                    )}
                    {item.dob && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Date of Birth</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.dob}</p>
                      </div>
                    )}
                    {item.baseCoatColor && (
                      <div className="flex justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Coat Color</p>
                        <p className="text-sm font-black text-slate-800 text-right">{item.baseCoatColor}</p>
                      </div>
                    )}
                    {item.microchipNumber && (
                      <div className="flex justify-between items-center gap-4 mt-1 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500 font-bold shrink-0">Microchip</p>
                        <p className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm font-mono tracking-wider">{item.microchipNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky top-6">
              <button 
                onClick={() => addToCart(item)} 
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-xl"
              >
                <ShoppingBag className="w-6 h-6" /> 
                Add to Cart
              </button>
              <p className="text-center text-xs text-slate-500 font-bold mt-4 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Secure Transaction via Jiva Thunai
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Certificate Viewer */}
      {activeCertificate && (
        <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-emerald-50">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <div>
                   <h3 className="text-xl font-black text-emerald-900">{activeCertificate.type}</h3>
                   <p className="text-xs text-emerald-700 font-bold">Viewing secure document. Screenshots and downloads are disabled.</p>
                </div>
             </div>
             <button 
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 text-rose-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
             >
                Close Document
             </button>
          </div>
          <div className="flex-1 p-8 bg-slate-100 flex justify-center items-center">
             <SecurePdfViewer url={activeCertificate.url} token={token} />
          </div>
        </div>
      )}

      {/* Ratings & Comments Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 lg:p-10">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-600" /> Ratings & Reviews
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(currentRating) ? 'fill-current' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-lg font-black text-slate-800 ml-2">{currentRating}</span>
            <span className="text-sm font-medium text-slate-500">out of 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Review Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAddComment} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 sticky top-6">
              <h3 className="text-sm font-black uppercase text-slate-600 tracking-wider mb-4">Write a Review</h3>
              
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-2 block">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setNewRating(star)}
                      className={`transition-transform hover:scale-110 ${newRating >= star ? 'text-amber-500' : 'text-slate-200 hover:text-amber-300'}`}
                    >
                      <Star className={`w-8 h-8 ${newRating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 mb-2 block">Your Experience</label>
                <textarea 
                  required
                  rows="4" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Tell others about your experience..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm resize-none"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                Post Review
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="lg:col-span-2 space-y-6">
            {comments.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="font-bold text-slate-600 mb-1">No reviews yet</h4>
                <p className="text-sm text-slate-500">Be the first to share your experience with this item!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800">{comment.authorName}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{comment.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < comment.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{comment.commentText}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


    </div>
  );
};
