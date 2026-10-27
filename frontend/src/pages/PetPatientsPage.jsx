import React, { useState, useEffect } from 'react';
import { 
  Dog, User, Stethoscope, Search, ShieldAlert, Calendar, 
  Activity, ArrowRight, Plus, CheckCircle2, Phone,
  AlertTriangle, Filter, ExternalLink, Radio, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { medicalApi, petApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { PageHeader } from '../components/PageHeader';

export const PetPatientsPage = () => {
  const { user, token, activeRole } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const isVetStaff = ['VETERINARY_DOCTOR', 'VETERINARY_ADMIN', 'ROLE_VET_DOCTOR', 'ROLE_VET_ORGANIZATION', 'ADMIN', 'SUPER_ADMIN'].includes(activeRole || user?.role);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('ALL');

  const isPatientRecord = (p) => {
    if (!p) return false;
    const hasAllergies = Array.isArray(p.allergies) && p.allergies.length > 0;
    const hasVaccines = Array.isArray(p.vaccinationSchedule) && p.vaccinationSchedule.length > 0;
    const hasPrescriptions = Array.isArray(p.clinicalEPrescriptions) && p.clinicalEPrescriptions.length > 0;
    const hasVitals = Array.isArray(p.vitalSignsHistory) && p.vitalSignsHistory.length > 0;
    const hasActiveCase = Boolean(p.hasActiveCase || p.hasAppointment || p.caseStatus);
    return hasAllergies || hasVaccines || hasPrescriptions || hasVitals || hasActiveCase;
  };

  useEffect(() => {
    fetchPatients();
    // Auto-sync every 15 seconds
    const interval = setInterval(() => {
      fetchPatients(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [user, token, isVetStaff]);

  const fetchPatients = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!isVetStaff) {
        // Pet Owners: strictly only fetch their own registered pets that are actual medical patients
        if (user?.userId) {
          try {
            const medRes = await medicalApi.getOwnerPetRecords(user.userId, token);
            if (medRes && medRes.data && Array.isArray(medRes.data)) {
              const onlyPatients = medRes.data.filter(isPatientRecord);
              setPatients(onlyPatients);
              return;
            }
          } catch (e) {
            console.warn("Could not fetch owner medical records", e);
          }
          setPatients([]);
        } else {
          setPatients([]);
        }
        return;
      }

      // Clinical Staff: fetch hospital patient directory
      const res = await medicalApi.getAllPatients(token);
      if (res && res.data && Array.isArray(res.data)) {
        const onlyPatients = res.data.filter(isPatientRecord);
        setPatients(onlyPatients);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.error("Failed to fetch patient records", e);
      if (!silent) showToast('Error loading patient records', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filteredPatients = patients
    .filter(isPatientRecord)
    .filter(p => {
      const matchesSpecies = speciesFilter === 'ALL' || (p.species && p.species.toUpperCase() === speciesFilter);
      const petName = p.petName || p.name || '';
      const breed = p.breed || '';
      const ownerName = p.ownerName || '';
      const ownerPhone = p.ownerPhone || '';
      const matchesSearch = searchQuery === '' ||
        petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ownerPhone.includes(searchQuery);
      return matchesSpecies && matchesSearch;
    });

  return (
    <div className="w-full space-y-6 pb-20 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Header */}
      <PageHeader
        badgeIcon={Dog}
        badgeText="Veterinary Hospital Registry"
        badgeVariant="emerald"
        title="Pet Patient Records & Health Vault"
        titleIcon={Dog}
        description="Directory of all registered pet patients with live allergy profiles, vaccination due dates, and medical histories."
        meta={<span>• Active Clinical Database</span>}
        actions={
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl text-xs font-bold shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Live Vault Feed
            </span>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by pet name, breed, owner, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'DOG', 'CAT', 'BIRD', 'OTHER'].map(sp => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                speciesFilter === sp
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Directory Grid */}
      {loading && patients.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-emerald-100">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Patient Records from MongoDB...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-emerald-100">
          <Dog className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Patient Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or register a new pet in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const hasAllergies = patient.allergies && patient.allergies.length > 0;
            const nextVax = patient.vaccinationSchedule && patient.vaccinationSchedule.length > 0
              ? patient.vaccinationSchedule[0]
              : null;

            return (
              <div 
                key={patient.id || patient.petId}
                className="bg-white rounded-3xl p-6 border border-emerald-100/90 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Name, Species & Allergy Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {patient.petName && patient.petName !== 'Pet Patient' ? patient.petName : (patient.name || 'Pet Patient')}
                      </h3>
                      <p className="text-xs font-bold text-emerald-700">
                        {patient.breed || patient.species || 'Companion Animal'}
                      </p>
                    </div>

                    {hasAllergies ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        ALLERGIC
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md">
                        NO ALLERGIES
                      </span>
                    )}
                  </div>

                  {/* Patient Attributes */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Guardian:</span>
                      <span className="font-semibold text-slate-800">
                        {patient.ownerName && patient.ownerName !== 'Pet Owner' ? patient.ownerName : (user?.fullName || patient.ownerName || 'Pet Parent')}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Phone:</span>
                      <span>
                        {patient.ownerPhone && patient.ownerPhone !== 'N/A' ? patient.ownerPhone : (user?.phone || patient.ownerPhone || 'N/A')}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Blood Type:</span>
                      <span className="font-black text-rose-700">{patient.bloodGroup || 'DEA 1.1 +'}</span>
                    </p>
                  </div>

                  {/* Allergy Alert Preview if active */}
                  {hasAllergies && (
                    <div className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-200 text-[11px] text-rose-800 font-semibold space-y-1">
                      <p className="font-black text-rose-900 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-700" /> Active Allergens:
                      </p>
                      <p className="line-clamp-1">{patient.allergies.map(a => a.allergen).join(', ')}</p>
                    </div>
                  )}

                  {/* Next Vaccine Due */}
                  {nextVax && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Next Booster Due</p>
                        <p className="font-black text-emerald-950">{nextVax.vaccineName}</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                        {nextVax.nextDueDate ? new Date(nextVax.nextDueDate).toLocaleDateString() : 'Scheduled'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/medical?petId=${patient.petId}`)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>View Medical EHR</span>
                  </button>

                  <button
                    onClick={() => navigate(`/vet-appointments`)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                    title="Book Consultation"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default PetPatientsPage;
