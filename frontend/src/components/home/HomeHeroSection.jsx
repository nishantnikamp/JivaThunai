import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Stethoscope, Heart, ShieldCheck, 
  UserCheck, Building2, Calendar, Activity, Search
} from 'lucide-react';

import hamsterImg from '../../assets/hamster.jpeg';
import rabbitImg from '../../assets/rabbit.jpeg';
import squirrelImg from '../../assets/squirrel.jpeg';
import blackDogImg from '../../assets/black dog.jpeg';
import kittenImg from '../../assets/kitten.jpeg';
import fishRedImg from '../../assets/fish red.jpeg';
import greenParrotImg from '../../assets/green parrot.jpeg';
import duckImg from '../../assets/duck.jpeg';
import birdColorImg from '../../assets/bird color.webp';
import rioBirdImg from '../../assets/rio bird.jpg';
import orangeBirdImg from '../../assets/orange bird.jpg';
import orangeFishImg from '../../assets/orange fish.jpg';
import hamsterFmImg from '../../assets/hamster fm.jpg';
import lakeTortoiseImg from '../../assets/lake tortoise.jpg';

export const HomeHeroSection = ({ user, onRestrictedAction }) => {
  const navigate = useNavigate();

  const CARD_DIMENSIONS = "w-36 lg:w-40 xl:w-44 h-48 xl:h-52";

  const petImages = [
    { src: hamsterImg, alt: "Hamster", className: CARD_DIMENSIONS },
    { src: rabbitImg, alt: "Rabbit", className: CARD_DIMENSIONS },
    { src: squirrelImg, alt: "Squirrel", className: CARD_DIMENSIONS },
    { src: birdColorImg, alt: "Bird Color", className: CARD_DIMENSIONS },
    { src: rioBirdImg, alt: "Rio Bird", className: CARD_DIMENSIONS },
    { src: blackDogImg, alt: "Black Dog", className: CARD_DIMENSIONS },
    { src: kittenImg, alt: "Kitten", className: CARD_DIMENSIONS },
    { src: fishRedImg, alt: "Red Fish", className: CARD_DIMENSIONS },
    { src: orangeBirdImg, alt: "Orange Bird", className: CARD_DIMENSIONS },
    { src: orangeFishImg, alt: "Orange Fish", className: CARD_DIMENSIONS },
    { src: greenParrotImg, alt: "Green Parrot", className: CARD_DIMENSIONS },
    { src: duckImg, alt: "Duck", className: CARD_DIMENSIONS },
    { src: hamsterFmImg, alt: "Hamster FM", className: CARD_DIMENSIONS },
    { src: lakeTortoiseImg, alt: "Lake Tortoise", className: CARD_DIMENSIONS },
  ];

  const getShuffledImages = (offset) => {
    return [...petImages.slice(offset), ...petImages.slice(0, offset)];
  };

  const col1Images = getShuffledImages(0);
  const col2Images = getShuffledImages(5);
  const col3Images = getShuffledImages(10);

  return (
    <section className="relative overflow-hidden w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
      
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-10">

        {/* Left Column: Headlines, Value Prop & Key Navigation Buttons (occupies left half) */}
        <div className="w-full lg:w-1/2 lg:max-w-xl xl:max-w-2xl space-y-6 text-left shrink-0">
          
          {/* Tagline without container */}
          <div className="inline-flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thoughtful care. Trusted connections. Happier companions.</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Every Paw Deserves a Healthier, Happier Life.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
              From everyday wellness to expert care, grooming, training, and adoption, Jiva Thunai brings the pet-care journey together in one thoughtful platform.
            </p>
          </div>

          {/* Action Button Row 1: Primary CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/pet-services"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-white fill-white/20" />
              <span>Explore Pet Care</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              to="/hospitals"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200/90 shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Find a Service</span>
            </Link>
          </div>



          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 text-[11px] text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PCA 1960 Legal Standard</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Doctors & VCI</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>24/7 Emergency Care</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3 Columns Marquee Pet Animation (Starts right from the center line) */}
        <div className="hidden lg:flex flex-1 justify-start items-start gap-4 xl:gap-5 h-[480px] overflow-hidden -rotate-2 xl:-rotate-4 mask-image-vertical-fade">
          
          {/* Column 1 */}
          <div className="flex flex-col animate-marquee-fast shrink-0">
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
              {col1Images.map((img, idx) => (
                <img 
                  key={`c1-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
              {col1Images.map((img, idx) => (
                <img 
                  key={`c1-dup-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col animate-marquee-medium mt-12 shrink-0">
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
              {col2Images.map((img, idx) => (
                <img 
                  key={`c2-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
              {col2Images.map((img, idx) => (
                <img 
                  key={`c2-dup-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col animate-marquee-slow mt-4 shrink-0">
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
              {col3Images.map((img, idx) => (
                <img 
                  key={`c3-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
            <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
              {col3Images.map((img, idx) => (
                <img 
                  key={`c3-dup-${idx}`} 
                  src={img.src} 
                  alt={img.alt} 
                  className={`${img.className} shrink-0 object-cover rounded-2xl shadow-md border border-slate-200/80`} 
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
