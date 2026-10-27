import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Sparkles, ShoppingBag, Heart, ArrowRight 
} from 'lucide-react';

export const HomeFindWhatPetNeeds = () => {
  const pillars = [
    {
      id: 'vet-care',
      title: 'Veterinary Care',
      description: 'Discover hospitals, clinics, veterinarians, and available appointments.',
      icon: Stethoscope,
      link: '/hospitals',
      badge: 'Clinics & Doctors',
      gradient: 'from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-200 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'pet-services',
      title: 'Pet Care Services',
      description: 'Find grooming, walking, training, sitting, and boarding services.',
      icon: Sparkles,
      link: '/marketplace',
      badge: 'Grooming & Boarding',
      gradient: 'from-pink-500/10 via-rose-500/10 to-transparent border-pink-200 text-pink-800',
      iconBg: 'bg-pink-100 text-pink-700'
    },
    {
      id: 'pet-shop',
      title: 'Pet Shop',
      description: 'Explore pet food, accessories, toys, and care essentials.',
      icon: ShoppingBag,
      link: '/marketplace',
      badge: 'Nutrition & Toys',
      gradient: 'from-blue-500/10 via-indigo-500/10 to-transparent border-blue-200 text-blue-800',
      iconBg: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'adoption-rescue',
      title: 'Adoption and Rescue',
      description: 'Discover pets needing homes and connect with rescue organizations.',
      icon: Heart,
      link: '/adoptions',
      badge: 'PCA Act 1960',
      gradient: 'from-amber-500/10 via-orange-500/10 to-transparent border-amber-200 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-700'
    }
  ];

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
          Core Pet Care Ecosystem
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Find what your pet needs
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Trusted care, verified professionals, high-grade essentials, and ethical adoption pathways in one unified portal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl ${item.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>Explore Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
