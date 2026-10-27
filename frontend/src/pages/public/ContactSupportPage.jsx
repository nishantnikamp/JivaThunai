import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Clock, MessageSquare, Send, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { usePageNavigation } from '../../context/NavigationContext';

export const ContactSupportPage = () => {
  const { registerSections } = usePageNavigation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'GENERAL',
    message: ''
  });

  const sections = [
    { id: 'home', label: 'Contact Us' },
    { id: 'contact-form', label: 'Send Message' },
    { id: 'helpline', label: 'Helplines' },
    { id: 'locations', label: 'Offices' },
    { id: 'faq', label: 'FAQs' }
  ];

  useEffect(() => {
    registerSections(sections);
    return () => registerSections([]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      
      {/* 01. Hero — #home */}
      <section id="home" className="scroll-mt-28">
        <div className="rounded-3xl bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-teal-700/40">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-teal-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
              Help & Support Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              We're Here for You & Your Pet
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal">
              Have questions regarding hospital verification, digital pet passports, adoption applications, or platform technical assistance? Contact our team.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Contact Form & Fast Help — #contact-form */}
      <section id="contact-form" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Send an Official Message</h2>
            <p className="text-xs text-slate-500">We respond to verified inquiries within 24 business hours.</p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">Message Transmitted Successfully</h3>
              <p className="text-xs text-emerald-800">
                Your ticket has been logged with ticket ID #JT-{Math.floor(100000 + Math.random() * 900000)}. Our team will respond shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Inquiry Department</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  >
                    <option value="GENERAL">General Support & Information</option>
                    <option value="HOSPITAL">Hospital Verification & Doctors</option>
                    <option value="ADOPTION">Adoption & Welfare Screening</option>
                    <option value="VENDOR">Pet Shop & Vendor Queries</option>
                    <option value="LEGAL">PCA Act & Compliance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your inquiry or issue..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* 03. Direct Helplines — #helpline */}
        <div id="helpline" className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">Direct Contact Channels</h3>
            
            <div className="space-y-3 text-xs text-emerald-900">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">National Helpline:</span>
                  <p>1800-419-PETS (Toll Free, 9 AM - 8 PM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Email Inquiries:</span>
                  <p>support@jivathunai.org / care@jivathunai.org</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Operational Timings:</span>
                  <p>Mon - Sat, 09:00 AM - 08:00 PM IST</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">24/7 for Registered Emergency Veterinary Trauma Cases</p>
                </div>
              </div>
            </div>
          </div>

          {/* 04. Registered Offices — #locations */}
          <div id="locations" className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Registered Locations</h3>
            <div className="flex items-start gap-3 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Headquarters:</span>
                <p>Jiva Thunai Pet Care Ecosystem Foundation</p>
                <p>Technology Innovation Hub, Chennai, Tamil Nadu, India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05. Frequently Asked Questions — #faq */}
      <section id="faq" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">
          Support FAQ
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {[
            { q: "How do I report a hospital or provider dispute?", a: "Select 'Hospital Verification & Doctors' in the inquiry form above with the consultation reference number." },
            { q: "How can I request my pet data deletion?", a: "In compliance with digital privacy standards, email privacy@jivathunai.org with your account authorization details." }
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{f.q}</h4>
              <p className="text-xs text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
