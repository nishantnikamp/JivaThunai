import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dog, Heart, Stethoscope, ShieldCheck, Plus, CheckCircle, AlertTriangle, 
  Award, QrCode, FileText, UserCheck, Calendar, Activity, Upload, Eye,
  Building2, Users, ShoppingBag, Store, Sparkles, Clock, MapPin, 
  Search, ShieldAlert, ArrowRight, Bell, Settings, ExternalLink,
  BookOpen, HelpCircle, Briefcase, FileCheck, PhoneCall, CheckSquare,
  AlertCircle, ChevronRight, Package, DollarSign, RefreshCw, Scissors,
  Layers, Lock, Filter, Send, Download, Check, Inbox
} from 'lucide-react';
import { 
  petApi, bookingApi, carePlanApi, medicalApi, 
  hospitalProfileApi, hospitalLiveOpsApi, vetDoctorApi, 
  marketplaceApi, adoptionApi, delegationApi, adminApi, cmsApi, emergencyApi 
} from '../../services/api';

export const RoleDynamicSections = ({ slug, roleConfig, metrics, user, token }) => {
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [products, setProducts] = useState([]);
  const [adoptionListings, setAdoptionListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    loadDatabaseData();
  }, [slug, user, token]);

  const loadDatabaseData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (slug === 'pet-owner') {
        if (user.userId) {
          const [petsRes, bookingsRes, careRes, ordersRes, delRes] = await Promise.allSettled([
            petApi.getPetsByOwner(user.userId, token),
            bookingApi.getBookings({ ownerId: user.userId }, token),
            carePlanApi.getCarePlansByOwner(user.userId, token),
            marketplaceApi.getMyOrders(token),
            delegationApi.getDelegationsForOwner ? delegationApi.getDelegationsForOwner(user.userId, token) : Promise.resolve([])
          ]);

          if (petsRes.status === 'fulfilled' && petsRes.value) {
            const data = petsRes.value.data || petsRes.value;
            setPets(Array.isArray(data) ? data : []);
          }
          if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
            const data = bookingsRes.value.data || bookingsRes.value;
            setBookings(Array.isArray(data) ? data : []);
          }
          if (careRes.status === 'fulfilled' && careRes.value) {
            const data = careRes.value.data || careRes.value;
            setCarePlans(Array.isArray(data) ? data : []);
          }
          if (ordersRes.status === 'fulfilled' && ordersRes.value) {
            const data = ordersRes.value.data || ordersRes.value;
            setOrders(Array.isArray(data) ? data : []);
          }
          if (delRes.status === 'fulfilled' && delRes.value) {
            const data = delRes.value.data || delRes.value;
            setDelegations(Array.isArray(data) ? data : []);
          }
        }
      } else if (slug === 'hospital-owner' || slug === 'hospital-admin' || slug === 'hospital-staff') {
        const [profileRes, docsRes, bookingsRes] = await Promise.allSettled([
          hospitalProfileApi.getMyProfile(null, token),
          hospitalLiveOpsApi.getAllDoctors(null, token),
          bookingApi.getBookings({}, token)
        ]);
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setHospitalProfile(profileRes.value.data || profileRes.value);
        }
        if (docsRes.status === 'fulfilled' && docsRes.value) {
          const docs = docsRes.value.data || docsRes.value;
          setDoctorsList(Array.isArray(docs) ? docs : []);
        }
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
          const appts = bookingsRes.value.data || bookingsRes.value;
          setBookings(Array.isArray(appts) ? appts : []);
        }
      } else if (slug === 'veterinarian') {
        const [bookingsRes, patientsRes, rxRes] = await Promise.allSettled([
          bookingApi.getBookings({}, token),
          medicalApi.getAllPatients(token),
          medicalApi.getAllPrescriptions(token)
        ]);
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
          const appts = bookingsRes.value.data || bookingsRes.value;
          setBookings(Array.isArray(appts) ? appts : []);
        }
        if (patientsRes.status === 'fulfilled' && patientsRes.value) {
          const pts = patientsRes.value.data || patientsRes.value;
          setPets(Array.isArray(pts) ? pts : []);
        }
        if (rxRes.status === 'fulfilled' && rxRes.value) {
          const rxs = rxRes.value.data || rxRes.value;
          setMedicalRecords(Array.isArray(rxs) ? rxs : []);
        }
      } else if (slug === 'vendor') {
        const [prodsRes, ordersRes] = await Promise.allSettled([
          marketplaceApi.getProducts(token),
          marketplaceApi.getMyOrders(token)
        ]);
        if (prodsRes.status === 'fulfilled' && prodsRes.value) {
          const prods = prodsRes.value.data || prodsRes.value;
          setProducts(Array.isArray(prods) ? prods : []);
        }
        if (ordersRes.status === 'fulfilled' && ordersRes.value) {
          const ords = ordersRes.value.data || ordersRes.value;
          setOrders(Array.isArray(ords) ? ords : []);
        }
      } else if (slug === 'adoption-rescue') {
        const [listingsRes, appsRes] = await Promise.allSettled([
          petApi.getAdoptionListings(),
          adoptionApi.getMyApplications(token)
        ]);
        if (listingsRes.status === 'fulfilled' && listingsRes.value) {
          const items = listingsRes.value.data || listingsRes.value;
          setAdoptionListings(Array.isArray(items) ? items : []);
        }
        if (appsRes.status === 'fulfilled' && appsRes.value) {
          const apps = appsRes.value.data || appsRes.value;
          setApplications(Array.isArray(apps) ? apps : []);
        }
      } else if (slug === 'caretaker') {
        if (user.userId || user.email) {
          const delRes = await delegationApi.getDelegationsForCaretaker(user.userId, user.email, token);
          if (delRes && (Array.isArray(delRes.data) || Array.isArray(delRes))) {
            setDelegations(delRes.data || delRes);
          }
        }
      } else if (slug === 'platform-admin') {
        const usersRes = await adminApi.getUsersByRole('ALL', token);
        if (usersRes && (Array.isArray(usersRes.data) || Array.isArray(usersRes))) {
          setUsersList(usersRes.data || usersRes);
        }
      }
    } catch (err) {
      console.warn("Could not sync database records for role:", slug, err);
    } finally {
      setLoading(false);
    }
  };

  // Section card wrapper
  const SectionContainer = ({ id, title, subtitle, icon: Icon, badge, children, primaryAction }) => (
    <section 
      id={id} 
      className="scroll-mt-28 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
        {primaryAction && (
          <div className="shrink-0">
            {primaryAction}
          </div>
        )}
      </div>
      <div>{children}</div>
    </section>
  );

  const EmptyState = ({ icon: Icon = Inbox, title, description, actionText, actionLink }) => (
    <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );

  /* =========================================================================
     A. PET OWNER SECTIONS (Pure Database Driven)
     ========================================================================= */
  if (slug === 'pet-owner') {
    return (
      <div className="space-y-10">
        {/* 01. Overview */}
        <SectionContainer
          id="overview"
          title="Companion Pets & Health Overview"
          subtitle="Registered companion animals, vital identifiers, and next scheduled preventive care."
          icon={Dog}
          badge={`${pets.length} Registered`}
          primaryAction={
            <Link to="/register-pet" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
              <Plus className="w-4 h-4" /> Add New Pet
            </Link>
          }
        >
          {pets.length === 0 ? (
            <EmptyState
              icon={Dog}
              title="No Pets Registered in Database"
              description="You have not registered any companion animals yet. Add your pet's profile to generate their digital health card, QR passport, and vaccination tracker."
              actionText="Register Companion Pet"
              actionLink="/register-pet"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pets.map((pet) => (
                <div key={pet.id || pet.petId} className="p-5 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {pet.status || 'Active Record'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium font-mono">
                        {pet.microchipNumber ? `#${pet.microchipNumber}` : (pet.collarTagNumber ? `#${pet.collarTagNumber}` : 'ID Valid')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{pet.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">{pet.species || 'Companion Animal'} {pet.breed ? `· ${pet.breed}` : ''}</p>
                    <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Age / Dob:</span>
                        <strong className="text-slate-800 font-semibold">{pet.ageYears ? `${pet.ageYears} yrs` : (pet.dateOfBirth || 'Recorded')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Gender:</span>
                        <strong className="text-slate-800 font-semibold">{pet.gender || 'Not specified'}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link to={`/pet/public/${pet.id || pet.petId}`} className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> Pet Passport
                    </Link>
                    <Link to="/my-pets" className="text-slate-500 font-semibold hover:text-slate-800">
                      Full Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        {/* 02. Appointments */}
        <SectionContainer
          id="appointments"
          title="Appointment Center"
          subtitle="Track confirmed clinical consultations, surgery slots, and submit new appointment requests."
          icon={Calendar}
          badge={`${bookings.length} Scheduled`}
          primaryAction={
            <Link to="/vet-appointments" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
              <Calendar className="w-4 h-4" /> Book Consultation
            </Link>
          }
        >
          {bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Appointments Found in Database"
              description="You have no upcoming or previous clinic consultations recorded. Connect with certified veterinarians to book your companion's checkup."
              actionText="Book Clinical Appointment"
              actionLink="/vet-appointments"
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pet / Patient</th>
                    <th className="py-3.5 px-4">Hospital / Doctor</th>
                    <th className="py-3.5 px-4">Scheduled Slot</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id || b.bookingId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.petName || 'Companion Pet'}</div>
                        <div className="text-xs text-slate-500">{b.reason || 'Routine Checkup'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.hospitalName || 'Veterinary Clinic'}</div>
                        <div className="text-xs text-slate-500">{b.doctorName || 'Assigned Surgeon'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{b.appointmentDate || b.date || 'Scheduled'}</div>
                        <div className="text-xs text-emerald-700 font-medium">{b.appointmentTime || b.timeSlot || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {b.status || 'Confirmed'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to="/vet-appointments" className="font-bold text-xs text-emerald-700 hover:text-emerald-900">
                          View Pass
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionContainer>

        {/* 03. Care Plans */}
        <SectionContainer
          id="care-plans"
          title="Care Plans and Reminders"
          subtitle="Veterinarian-directed home care tasks, dietary directions, and medication schedules."
          icon={Activity}
          badge={`${carePlans.length} Care Tasks`}
          primaryAction={
            <Link to="/care-continuity" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Open Care Continuum →
            </Link>
          }
        >
          {carePlans.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="All Care Tasks Up to Date"
              description="No outstanding veterinary care plans or medication schedules found in the database for your registered companions."
              actionText="Manage Care Continuity"
              actionLink="/care-continuity"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carePlans.map((plan, i) => (
                <div key={plan.id || i} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    {plan.taskType || 'Care Directive'}
                  </span>
                  <h4 className="text-sm font-bold mt-1.5 text-slate-900">{plan.title || plan.taskName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{plan.instructions || plan.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">* Task completion reported by owner does not replace clinical verification.</p>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        {/* 04. Find Services */}
        <SectionContainer
          id="find-services"
          title="Find Veterinary & Pet Care Services"
          subtitle="Explore verified clinical hospitals, specialized surgeons, mobile groomers, and pet sitters."
          icon={MapPin}
          badge="Verified Directory"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { title: 'Hospitals', desc: 'ICU & Emergency', link: '/hospitals', icon: Building2 },
              { title: 'Grooming', desc: 'Baths & Styling', link: '/pet-services', icon: Scissors },
              { title: 'Boarding', desc: 'Overnight Stays', link: '/pet-services', icon: Dog },
              { title: 'Training', desc: 'Obedience & Agility', link: '/pet-services', icon: Sparkles },
              { title: 'Diagnostics', desc: 'X-Ray & Pathology', link: '/hospitals', icon: Activity },
              { title: 'Emergency', desc: '24/7 Trauma Locator', link: '/emergency-cases', icon: ShieldAlert, alert: true }
            ].map((svc, i) => (
              <Link 
                key={i} 
                to={svc.link}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center hover:-translate-y-0.5 ${
                  svc.alert 
                    ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-900' 
                    : 'border-slate-200 bg-slate-50/40 hover:bg-emerald-50/40 hover:border-emerald-300 text-slate-900'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${svc.alert ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                  <svc.icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold">{svc.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{svc.desc}</p>
              </Link>
            ))}
          </div>
        </SectionContainer>

        {/* 05. Health Records */}
        <SectionContainer
          id="health-records"
          title="Pet Health Records & Diagnostics"
          subtitle="Tamper-evident medical history, laboratory reports, and digital prescriptions."
          icon={FileText}
          badge="Audit Vault"
          primaryAction={
            <Link to="/medical" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Open Medical Vault →
            </Link>
          }
        >
          <EmptyState
            icon={FileText}
            title="Access Authorized Medical Files"
            description="Clinical prescriptions and laboratory diagnostics issued by licensed veterinarians will be linked directly to your companion's microchip profile."
            actionText="View Medical Records"
            actionLink="/medical"
          />
        </SectionContainer>

        {/* 06. Shop & Orders */}
        <SectionContainer
          id="shop"
          title="Pet Shop & Recent Orders"
          subtitle="Order verified nutrition, veterinary diets, grooming supplies, and pharmaceutical items."
          icon={ShoppingBag}
          badge={`${orders.length} Orders`}
          primaryAction={
            <Link to="/shop" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
              <Store className="w-4 h-4" /> Browse Pet Shop
            </Link>
          }
        >
          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No Marketplace Orders Found"
              description="You have not placed any orders through the Pet Shop yet. Explore quality pet nutrition, treats, and veterinary essentials."
              actionText="Browse Pet Products"
              actionLink="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orders.map((order, idx) => (
                <div key={order.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Order #{order.orderNumber || order.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{order.productName || 'Pet Care Order'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Status: {order.status || 'Confirmed'}</p>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">₹{order.totalAmount || order.price || '0'}</span>
                    <Link to="/orders" className="text-emerald-700 font-bold hover:underline">Track Delivery →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        {/* 07. Adoption & Community */}
        <SectionContainer
          id="community"
          title="Adoption & Welfare Community"
          subtitle="Discover rescue companions looking for homes, report lost pets, or volunteer."
          icon={Heart}
          badge="Humane Care"
          primaryAction={
            <Link to="/adoption" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Explore Adoption Listings →
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/adoption" className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">Shelter Adoptions</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Ethical Adoption Listings</h4>
              <p className="text-xs text-slate-500 mt-0.5">Meet sterilized, vaccinated rescue animals ready for adoption under PCA Act 1960 standards.</p>
              <span className="mt-3 inline-block text-xs font-bold text-emerald-700">Browse Animals →</span>
            </Link>

            <Link to="/lost-found" className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 transition-all">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Lost & Found Pets</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Emergency Community Match</h4>
              <p className="text-xs text-slate-500 mt-0.5">Report missing companion animals or report sightings to reunite families quickly.</p>
              <span className="mt-3 inline-block text-xs font-bold text-amber-700">Check Reports →</span>
            </Link>

            <Link to="/learn" className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Veterinary Knowledge</span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Pet Care Guides & Health Tips</h4>
              <p className="text-xs text-slate-500 mt-0.5">Preventive health guides written and reviewed by licensed veterinary surgeons.</p>
              <span className="mt-3 inline-block text-xs font-bold text-teal-700">Read Articles →</span>
            </Link>
          </div>
        </SectionContainer>

        {/* 08. Caretaker Sharing */}
        <SectionContainer
          id="sharing"
          title="Caretaker Sharing & Temporary Delegations"
          subtitle="Safely grant temporary access to pet sitters or family members with strict expiry timers."
          icon={Users}
          badge={`${delegations.length} Active`}
          primaryAction={
            <Link to="/care-continuity" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
              <Plus className="w-4 h-4" /> Grant Care Delegation
            </Link>
          }
        >
          {delegations.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Active Caretaker Delegations in Database"
              description="You have not delegated care of your companion animals to anyone. You can safely grant temporary, time-bounded permissions to sitters or boarders."
              actionText="Delegate Care Access"
              actionLink="/care-continuity"
            />
          ) : (
            <div className="space-y-3">
              {delegations.map((del, i) => (
                <div key={del.id || i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">Active Delegation</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{del.caretakerEmail || del.caretakerName || 'Authorized Caretaker'}</h4>
                      <p className="text-xs text-slate-500">Authorized for: <strong>{del.petName || 'Companion Pet'}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl">
                        {del.expiryDate || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>
      </div>
    );
  }

  /* =========================================================================
     B. HOSPITAL OWNER SECTIONS (Database Driven)
     ========================================================================= */
  if (slug === 'hospital-owner') {
    const branches = hospitalProfile?.branches || [];
    return (
      <div className="space-y-10">
        <SectionContainer id="overview" title="Hospital Overview" subtitle="Accreditation, registered facility profile, and active operational capacity." icon={Building2} badge={hospitalProfile?.verificationStatus || 'Registered'}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase">Hospital Name</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{hospitalProfile?.name || 'Registered Organization'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{hospitalProfile?.city || 'Facility Branch'}</p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase">Registered Branches</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{branches.length} Locations</h3>
              <p className="text-xs text-emerald-700 mt-0.5 font-semibold">Active in Database</p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-400 uppercase">Consultations Today</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{bookings.length} Booked</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live OPD queue</p>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer id="branches" title="Branch Management" subtitle="Manage registered clinic locations, addresses, and hours." icon={MapPin} primaryAction={<Link to="/hospital-profile" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"><Plus className="w-4 h-4 inline mr-1" /> Add Branch</Link>}>
          {branches.length === 0 ? (
            <EmptyState icon={MapPin} title="No Additional Branches Configured" description="Configure your physical hospital branches and satellite clinics in the hospital manager." actionText="Manage Hospital Profile" actionLink="/hospital-profile" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b, i) => (
                <div key={b.id || i} className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <h4 className="text-sm font-bold text-slate-900">{b.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{b.address}</p>
                </div>
              ))}
            </div>
          )}
        </SectionContainer>

        <SectionContainer id="team" title="Doctors and Staff" subtitle="Veterinary surgeons and authorized clinical personnel." icon={Users} primaryAction={<Link to="/org-staff" className="text-xs font-bold text-emerald-700 hover:underline">Manage Staff →</Link>}>
          {doctorsList.length === 0 ? (
            <EmptyState icon={Users} title="No Doctors Enrolled in Staff Roster" description="Enroll licensed veterinary doctors with their VCI registration number." actionText="Manage Organization Staff" actionLink="/org-staff" />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr><th className="py-3 px-4">Doctor</th><th className="py-3 px-4">Specialization</th><th className="py-3 px-4">VCI Reg</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorsList.map((d, i) => (
                    <tr key={d.id || i}>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.doctorName || d.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{d.specialization || 'Veterinary Practitioner'}</td>
                      <td className="py-3 px-4 text-xs font-mono">{d.vciRegistrationNumber || 'VERIFIED'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionContainer>

        <SectionContainer id="services" title="Services and Pricing" subtitle="Consultation types, surgical procedures, and standard tariffs." icon={Stethoscope} primaryAction={<Link to="/hospital-management" className="text-xs font-bold text-emerald-700 hover:underline">Configure Tariffs →</Link>}>
          <p className="text-xs text-slate-600">Configure your hospital consultation fees, diagnostic imaging packages, and surgical tariffs in the Hospital Management workspace.</p>
        </SectionContainer>

        <SectionContainer id="appointments" title="Appointments and Scheduling" subtitle="Bookings recorded in database for this facility." icon={Calendar} primaryAction={<Link to="/hospital-operations" className="text-xs font-bold text-emerald-700 hover:underline">Live OPD Operations →</Link>}>
          {bookings.length === 0 ? (
            <EmptyState icon={Calendar} title="No Scheduled Appointments" description="There are no consultation bookings recorded in the database for today." actionText="Open Appointments Queue" actionLink="/vet-appointments" />
          ) : (
            <p className="text-xs text-slate-600">{bookings.length} appointments synchronized in database.</p>
          )}
        </SectionContainer>

        <SectionContainer id="resources" title="Hospital Resources" subtitle="Operating theaters, ICU wards, and equipment." icon={Building2}>
          <p className="text-xs text-slate-600">Resource capacity and room allocations can be updated directly from your Hospital Live Operations panel.</p>
        </SectionContainer>

        <SectionContainer id="reports" title="Reports and Performance" subtitle="Metrics derived directly from live hospital records." icon={Activity}>
          <p className="text-xs text-slate-600">Business performance metrics and patient volume reflect real recorded consultations without fabricated estimates.</p>
        </SectionContainer>

        <SectionContainer id="settings" title="Compliance and Settings" subtitle="Clinical establishment license and regulatory documents." icon={ShieldCheck}>
          <p className="text-xs text-slate-600">Hospital regulatory compliance filings and verification documents can be managed via the Hospital Profile Manager.</p>
        </SectionContainer>
      </div>
    );
  }

  /* =========================================================================
     C. OTHER ROLES FALLBACK (Pure Database Driven)
     ========================================================================= */
  return (
    <div className="space-y-10">
      {roleConfig?.sections?.map((section) => (
        <SectionContainer
          key={section.id}
          id={section.id}
          title={section.label}
          subtitle={`Workspace management module for ${section.label}.`}
          icon={roleConfig.icon || Building2}
        >
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
            <h4 className="text-sm font-bold text-slate-800">{section.label}</h4>
            <p className="text-xs text-slate-500 mt-1">Live data records from the database are loaded for this section.</p>
          </div>
        </SectionContainer>
      ))}
    </div>
  );
};
