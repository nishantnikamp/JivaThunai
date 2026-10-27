import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Heart, Sparkles, Award, Users, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { usePageNavigation } from '../../context/NavigationContext';

export const AboutUsPage = () => {
  const { registerSections } = usePageNavigation();

  const sections = [
    { id: 'home', label: 'About Us' },
    { id: 'mission', label: 'Our Mission' },
    { id: 'ecosystem', label: 'The Ecosystem' },
    { id: 'standards', label: 'Compliance Standards' },
    { id: 'team', label: 'Stakeholders' },
    { id: 'contact', label: 'Get in Touch' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-emerald-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              About Jiva Thunai
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              India's Unified Companion Animal Care Platform
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
              Jiva Thunai connects pet parents, accredited veterinary hospitals, compassionate care providers, ethical shelters, and regulatory welfare officers into one transparent digital network.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Mission — #mission */}
      <section id="mission" className="scroll-mt-28 p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 space-y-6">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Thoughtful care. Trusted connections. Happier companions.
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Every Paw Deserves a Healthier, Happier Life.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From everyday wellness to expert care, grooming, training, and adoption, Jiva Thunai brings the pet-care journey together in one thoughtful platform.
          </p>
        </div>
      </section>

      {/* 03. The Ecosystem — #ecosystem */}
      <section id="ecosystem" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          What Sets Jiva Thunai Apart
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Clinical Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every hospital branch, veterinarian, and licensed pharmacy is vetted for credentials, qualifications, and sterile facility readiness.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3">
            <Sparkles className="w-8 h-8 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Digital Pet Passport</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tamper-proof medical logs, vaccination records, microchip identification, and care delegation instructions that travel everywhere with your pet.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3">
            <Heart className="w-8 h-8 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Ethical Animal Welfare</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zero tolerance for illegal breeding or abandonment. Adoptions strictly adhere to PCA Act 1960 and AWBI guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* 04. Statutory Standards — #standards */}
      <section id="standards" className="scroll-mt-28 p-8 sm:p-12 rounded-3xl bg-emerald-950 text-white space-y-4">
        <div className="flex items-center gap-3">
          <Award className="w-7 h-7 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-tight">Prevention of Cruelty to Animals (PCA) Act 1960</h2>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-3xl">
          Jiva Thunai is governed under the statutory legal principles of the Prevention of Cruelty to Animals Act 1960, the Animal Birth Control (ABC) Rules 2023, and Dog Breeding and Marketing Rules. We work alongside municipal authorities and law enforcement to eradicate illegal pet commercialization.
        </p>
      </section>

      {/* 05. Stakeholders — #team */}
      <section id="team" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Unified Stakeholder Personas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { role: "Pet Parents", desc: "Digital records, appointments, and care task sharing." },
            { role: "Veterinarians", desc: "Consultations, digital prescriptions, and patient queues." },
            { role: "Hospital Directors", desc: "Multi-branch operations, staff rosters, and OT beds." },
            { role: "Welfare NGOs", desc: "Rescue dispatch, foster placements, and ethical adoption." }
          ].map((st, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">{st.role}</h3>
              <p className="text-xs text-slate-500">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 06. Contact Link — #contact */}
      <section id="contact" className="scroll-mt-28 text-center p-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black">Have Questions or Want to Partner?</h2>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          Reach our team for hospital onboarding, welfare NGO integration, or technical support.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/contact"
            className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-md"
          >
            Contact Jiva Thunai Team
          </Link>
        </div>
      </section>

    </div>
  );
};
