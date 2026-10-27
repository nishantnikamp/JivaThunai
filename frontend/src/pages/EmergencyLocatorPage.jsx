import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Phone, MapPin, Activity, ShieldCheck, 
  Clock, Heart, Navigation, RefreshCw, CheckCircle2, Siren,
  Radio, Droplet, Wind, Ambulance
} from 'lucide-react';
import { emergencyApi } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { PageHeader } from '../components/PageHeader';

export const EmergencyLocatorPage = () => {
  const { showToast } = useNotification();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyCenters();
  }, []);

  const fetchEmergencyCenters = async () => {
    setLoading(true);
    try {
      const res = await emergencyApi.getNearbyHospitals(12.9716, 77.5946, 25);
      if (res && res.data) {
        setHospitals(res.data);
      } else {
        setHospitals([]);
      }
    } catch (e) {
      console.error("Failed to load emergency centers", e);
      showToast('Error fetching live emergency network', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Emergency Header Banner */}
      <PageHeader
        badgeIcon={Siren}
        badgeText="24/7 Critical Care & Veterinary Trauma Center"
        badgeVariant="rose"
        title="Emergency Hospital & Triage Locator"
        titleIcon={Siren}
        description="Immediate connection to 24/7 veterinary hospitals with operational ICUs, oxygen support, blood bank reserves, and mobile animal ambulances."
        actions={
          <a
            href="tel:1800-VET-911"
            className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call National Vet Hotline (1800-VET-911)</span>
          </a>
        }
      />

      {/* Hospital Cards Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            Nearby Operational 24/7 Emergency Centers
          </h3>
          <button
            onClick={fetchEmergencyCenters}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {loading && hospitals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-rose-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Locating 24/7 Veterinary Trauma Hospitals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((h, idx) => (
              <div 
                key={h.hospitalId || idx}
                className="bg-white rounded-3xl p-6 border border-rose-100/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Distance & 24/7 Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full border border-rose-200 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-rose-600 animate-pulse" />
                      24/7 OPEN
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {h.distanceKm} km away
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-tight">{h.hospitalName}</h4>
                    <p className="text-xs text-slate-500 mt-1">{h.address}</p>
                  </div>

                  {/* Facilities Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold">
                    <div className={`p-2 rounded-xl flex items-center gap-1.5 ${h.hasIcu ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ICU Facility: {h.hasIcu ? 'Ready' : 'No'}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-1.5 ${h.hasOxygenSupport ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                      <Wind className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Oxygen: {h.hasOxygenSupport ? 'Available' : 'No'}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-1.5 ${h.hasBloodBank ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                      <Droplet className="w-3.5 h-3.5 text-rose-600" />
                      <span>Blood Bank: {h.hasBloodBank ? 'Stocked' : 'No'}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center gap-1.5 ${h.hasAmbulance ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                      <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ambulance: {h.hasAmbulance ? 'Dispatched' : 'No'}</span>
                    </div>
                  </div>

                  {/* Triage Wait Time & Surgeons */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Est. Triage Wait:</span>
                      <p className="font-bold text-emerald-700">{h.triageWaitTimeMinutes} Minutes</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium">On-Duty Surgeons:</span>
                      <p className="font-bold text-slate-800">{h.activeEmergencySurgeons} Doctors</p>
                    </div>
                  </div>
                </div>

                {/* Call Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${h.emergencyHotline || h.phone}`}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Hotline ({h.emergencyHotline || h.phone})</span>
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EmergencyLocatorPage;
