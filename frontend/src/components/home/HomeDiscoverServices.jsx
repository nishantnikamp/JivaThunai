import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Sparkles, ShoppingBag, Heart, Search, BookOpen, ArrowRight, CheckCircle2 
} from 'lucide-react';

export const HomeDiscoverServices = () => {
  const services = [
    {
      id: 'vet-hospitals',
      title: 'Veterinary Hospitals & Clinics',
      description: 'Discover accredited veterinary hospitals, verified doctors, surgical centers, and 24/7 emergency trauma care.',
      icon: Building2,
      link: '/hospitals',
      badge: 'Accredited Care',
      color: 'from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-200 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-700',
      btnText: 'View Hospitals'
    },
    {
      id: 'pet-services',
      title: 'Pet Care Services',
      description: 'Professional grooming salons, experienced dog walkers, behavioral trainers, pet sitting, and holiday boarding.',
      icon: Sparkles,
      link: '/pet-services',
      badge: 'Verified Pros',
      color: 'from-pink-500/10 via-rose-500/10 to-transparent border-pink-200 text-pink-800',
      iconBg: 'bg-pink-100 text-pink-700',
      btnText: 'Explore Services'
    },
    {
      id: 'pet-shop',
      title: 'Pet Shop & Essentials',
      description: 'Explore breed-specific nutrition, prescription diets, safe toys, healthcare supplements, and grooming essentials.',
      icon: ShoppingBag,
      link: '/shop',
      badge: 'Quality Nutrition',
      color: 'from-blue-500/10 via-indigo-500/10 to-transparent border-blue-200 text-blue-800',
      iconBg: 'bg-blue-100 text-blue-700',
      btnText: 'Shop Products'
    },
    {
      id: 'adoption-rescue',
      title: 'Adoption and Rescue',
      description: 'Meet rescued dogs, cats, and small companions needing loving homes. Apply ethically under PCA Act 1960 standards.',
      icon: Heart,
      link: '/adoption',
      badge: 'Ethical Adoption',
      color: 'from-rose-500/10 via-orange-500/10 to-transparent border-rose-200 text-rose-800',
      iconBg: 'bg-rose-100 text-rose-700',
      btnText: 'Find a Companion'
    },
    {
      id: 'lost-found',
      title: 'Lost and Found Pets',
      description: 'Community reunification network. Report missing pets, coordinate rescue sightings, and check geo-tagged emergency alerts.',
      icon: Search,
      link: '/lost-found',
      badge: 'Reunification',
      color: 'from-amber-500/10 via-yellow-500/10 to-transparent border-amber-200 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-700',
      btnText: 'Report / Search Pets'
    },
    {
      id: 'learning',
      title: 'Pet Learning & Care Guides',
      description: 'Expert veterinary articles, preventive vaccination timelines, puppy training guides, and responsible pet parent advice.',
      icon: BookOpen,
      link: '/learn',
      badge: 'Vet Verified',
      color: 'from-purple-500/10 via-violet-500/10 to-transparent border-purple-200 text-purple-800',
      iconBg: 'bg-purple-100 text-purple-700',
      btnText: 'Read Care Guides'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
          Dedicated Public Services
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Discover Services for Every Pet Need
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Explore dedicated service departments connecting veterinary medicine, daily care, retail, adoption, and rescue support.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <Link
              key={srv.id}
              to={srv.link}
              className="group flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-600/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl ${srv.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {srv.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {srv.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>{srv.btnText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
