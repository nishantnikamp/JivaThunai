import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroMarqueePanel } from '../components/HeroMarqueePanel';
import { Building, Stethoscope, UserPlus, Users } from 'lucide-react';

const VetSignupLandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideAuthBtn={true} showHomeBtn={true} />
      
      <div className="flex-1 flex overflow-hidden">
        <HeroMarqueePanel />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 bg-slate-50 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 relative z-10 my-auto">
            
            <div className="bg-emerald-50 text-emerald-950 p-6 flex flex-col items-center justify-center text-center border-b border-emerald-100">
              <h2 className="text-xl font-black text-emerald-900">Veterinary Portal Signup</h2>
              <p className="text-xs text-emerald-700 mt-1 font-medium">Choose your role to get started with Jiva Thunai</p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                
                {/* Hospital Admin Link */}
                <div className="group border border-emerald-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Hospital Organization</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Register a new veterinary clinic or hospital.</p>
                    </div>
                  </div>
                  <Link to="/vet/signup/hospital" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    Register
                  </Link>
                </div>

                {/* Doctor Link */}
                <div className="group border border-teal-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white hover:bg-teal-50/50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Veterinary Doctor</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Join as a verified practitioner using your invite code.</p>
                    </div>
                  </div>
                  <Link to="/vet/signup/staff?role=ROLE_VET_DOCTOR" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    Join
                  </Link>
                </div>

                {/* Assistant Doctor Link */}
                <div className="group border border-indigo-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Assistant Vet</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Register as an assistant vet with hospital invite.</p>
                    </div>
                  </div>
                  <Link to="/vet/signup/staff?role=ROLE_ASSISTANT_VET" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    Join
                  </Link>
                </div>

                {/* Staff Link */}
                <div className="group border border-blue-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white hover:bg-blue-50/50 cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Hospital Staff</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Join as support staff or receptionist.</p>
                    </div>
                  </div>
                  <Link to="/vet/signup/staff?role=ROLE_VET_STAFF" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                    Join
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetSignupLandingPage;
