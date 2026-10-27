export const BASE_URL = 'http://localhost:8080/api/v1';

export const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const effectiveToken = token || (typeof window !== 'undefined' ? sessionStorage.getItem('jiva_jwt_token') : null);
  if (effectiveToken && effectiveToken !== 'null' && effectiveToken !== 'undefined') {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.warn(`Backend connection attempt to ${endpoint} failed.`, error);
    return null;
  }
};

export const authApi = {
  login: (identifier, password) => apiCall('/auth/login', 'POST', { identifier, password }),
  register: (userData) => apiCall('/auth/register', 'POST', userData),
  sendRegistrationOtp: (data) => apiCall('/auth/send-registration-otp', 'POST', data),
  verifyRegistrationOtp: (data) => apiCall('/auth/verify-registration-otp', 'POST', data),
  completeRegistration: (data) => apiCall('/auth/complete-registration', 'POST', data),
  verifyOtp: (email, otpCode) => apiCall('/auth/verify-otp', 'POST', { email, otpCode }),
  validateOtp: (email, otpCode) => apiCall('/auth/validate-otp', 'POST', { email, otpCode }),
  forgotPassword: (email) => apiCall('/auth/forgot-password', 'POST', { email }),
  resetPassword: (data) => apiCall('/auth/reset-password', 'POST', data),
  resendOtp: (data) => apiCall('/auth/resend-otp', 'POST', data),
};

export const petApi = {
  getPetsByOwner: (ownerId, token) => apiCall(`/pets/owner/${ownerId}`, 'GET', null, token),
  getPublicProfile: (qrHash, token = null, userId = null) => {
    let url = `/pets/public/${qrHash}`;
    if (userId) url += `?requesterId=${encodeURIComponent(userId)}`;
    return apiCall(url, 'GET', null, token);
  },
  getPetProfile: (petId, token = null, userId = null) => {
    let url = `/pets/${petId}`;
    if (userId) url += `?requesterId=${encodeURIComponent(userId)}`;
    return apiCall(url, 'GET', null, token);
  },
  updatePetProfile: async (petId, updateData, token = null, userId = null) => {
    if (updateData instanceof FormData) {
      let url = `${BASE_URL}/pets/${petId}/update`;
      if (userId) url += `?ownerId=${encodeURIComponent(userId)}`;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: updateData
        });
        return await response.json();
      } catch (err) {
        console.warn('Multipart update pet failed', err);
        return null;
      }
    }
    let url = `/pets/${petId}`;
    if (userId) url += `?ownerId=${encodeURIComponent(userId)}`;
    return apiCall(url, 'PUT', updateData, token);
  },
  deletePetProfile: (petId, token = null, userId = null) => {
    let url = `/pets/${petId}`;
    if (userId) url += `?ownerId=${encodeURIComponent(userId)}`;
    return apiCall(url, 'DELETE', null, token);
  },
  getMedicalRecord: (petId, token) => apiCall(`/pets/${petId}/medical`, 'GET', null, token),
  updateMedicalRecord: (petId, record, token) => apiCall(`/pets/${petId}/medical`, 'PUT', record, token),
  getAdoptionListings: () => apiCall('/pets/adoption-listings', 'GET'),
};

export const adoptionApi = {
  submitApplication: (petId, shelterId, questionnaire, token) => 
    apiCall(`/adoptions/submit?petId=${petId}&shelterId=${shelterId}`, 'POST', questionnaire, token),
  getMyApplications: (token) => apiCall('/adoptions/my-applications', 'GET', null, token),
};

export const adminApi = {
  getUsersByRole: (role, token) => apiCall(`/admin/users?role=${role}`, 'GET', null, token),
  updateUserKycStatus: (userId, status, token) => apiCall(`/admin/users/${userId}/kyc-status?status=${encodeURIComponent(status)}`, 'PUT', null, token),
  approveUser: (userId, token) => apiCall(`/admin/users/${userId}/kyc-status?status=VERIFIED`, 'PUT', null, token),
  rejectUser: (userId, token) => apiCall(`/admin/users/${userId}/kyc-status?status=REJECTED`, 'PUT', null, token),
  resetUserKyc: (userId, token) => apiCall(`/admin/users/${userId}/kyc-status?status=PENDING_VERIFICATION`, 'PUT', null, token),
  updateUserRoles: (userId, roles, token) => apiCall(`/admin/users/${userId}/roles`, 'PUT', roles, token),
  getVerificationMode: (token) => apiCall(`/admin/users/settings/verification-mode`, 'GET', null, token),
  updateVerificationMode: (autoVerify, token) => apiCall(`/admin/users/settings/verification-mode`, 'PUT', { autoVerify }, token),
};

export const bookingApi = {
  createBooking: (bookingData, token) => apiCall('/vet-appointments', 'POST', bookingData, token),
  getBookings: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/vet-appointments${query ? `?${query}` : ''}`, 'GET', null, token);
  },
  getBookingById: (bookingId, token) => apiCall(`/vet-appointments/${bookingId}`, 'GET', null, token),
  updateBookingStatus: (bookingId, statusData, token) => apiCall(`/vet-appointments/${bookingId}/status`, 'PATCH', statusData, token),
  getHospitalQueue: (hospitalId, token) => apiCall(`/vet-appointments/hospital/${hospitalId}/queue`, 'GET', null, token),
  getHospitals: (token) => apiCall('/vet-appointments/hospitals', 'GET', null, token),
  getDoctors: (hospitalId = null, token = null) => {
    let url = '/vet-appointments/doctors';
    if (hospitalId) url += `?hospitalId=${encodeURIComponent(hospitalId)}`;
    return apiCall(url, 'GET', null, token);
  },
};

export const medicalApi = {
  getPetMedicalRecord: (petId, petName = null, ownerId = null, token = null) => {
    let url = `/medical/pets/${petId}`;
    const params = new URLSearchParams();
    if (petName) params.append('petName', petName);
    if (ownerId) params.append('ownerId', ownerId);
    if (params.toString()) url += `?${params.toString()}`;
    return apiCall(url, 'GET', null, token);
  },
  writePrescription: (petId, prescriptionData, token) => 
    apiCall(`/medical/pets/${petId}/prescriptions`, 'POST', prescriptionData, token),
  editPrescription: (petId, prescriptionId, prescriptionData, token) =>
    apiCall(`/medical/pets/${petId}/prescriptions/${prescriptionId}`, 'PUT', prescriptionData, token),
  deletePrescription: (petId, prescriptionId, token) =>
    apiCall(`/medical/pets/${petId}/prescriptions/${prescriptionId}`, 'DELETE', null, token),
  logVaccination: (petId, vaccineData, token) => 
    apiCall(`/medical/pets/${petId}/vaccinations`, 'POST', vaccineData, token),
  editVaccination: (petId, vaccineId, vaccineData, token) =>
    apiCall(`/medical/pets/${petId}/vaccinations/${vaccineId}`, 'PUT', vaccineData, token),
  deleteVaccination: (petId, vaccineId, token) =>
    apiCall(`/medical/pets/${petId}/vaccinations/${vaccineId}`, 'DELETE', null, token),
  uploadVaccineCertificate: (petId, vaccineId, certData, token) =>
    apiCall(`/medical/pets/${petId}/vaccinations/${vaccineId}/certificate`, 'POST', certData, token),
  addAllergy: (petId, allergyData, token) => 
    apiCall(`/medical/pets/${petId}/allergies`, 'POST', allergyData, token),
  editAllergy: (petId, allergyId, allergyData, token) =>
    apiCall(`/medical/pets/${petId}/allergies/${allergyId}`, 'PUT', allergyData, token),
  deleteAllergy: (petId, allergyId, token) =>
    apiCall(`/medical/pets/${petId}/allergies/${allergyId}`, 'DELETE', null, token),
  addVitalSign: (petId, vitalData, token) => 
    apiCall(`/medical/pets/${petId}/vitals`, 'POST', vitalData, token),
  getAllPatients: (token) => apiCall('/medical/patients', 'GET', null, token),
  getOwnerPetRecords: (ownerId, token = null) => apiCall(`/medical/owner/${ownerId}/pets`, 'GET', null, token),
  getAllPrescriptions: (token) => apiCall('/medical/prescriptions', 'GET', null, token),
  triggerVaccineAlerts: (token) => apiCall('/medical/cron/trigger-vaccine-alerts', 'POST', null, token),
};

export const profileApi = {
  getProfile: (userId, token) => apiCall(`/profile/${userId}`, 'GET', null, token),
  updateProfile: (userId, data, token) => apiCall(`/profile/${userId}`, 'PUT', data, token),
  getVeterinaryHospitals: (token = null) => apiCall('/profile/veterinary-hospitals', 'GET', null, token),
  getVeterinaryDoctors: (hospitalId = null, token = null) => {
    let url = '/profile/veterinary-doctors';
    if (hospitalId) url += `?hospitalId=${encodeURIComponent(hospitalId)}`;
    return apiCall(url, 'GET', null, token);
  },
};

export const emergencyApi = {
  getNearbyHospitals: (lat, lng, radiusKm = 25) => 
    apiCall(`/emergency/nearby-hospitals?lat=${lat || 12.9716}&lng=${lng || 77.5946}&radiusKm=${radiusKm}`, 'GET'),
};


export const marketplaceApi = {
  getFilterOptions: (token = null) => apiCall('/marketplace/filter-options', 'GET', null, token),
  getPets: (token = null) => apiCall('/pet', 'GET', null, token),
  getProducts: (token = null) => apiCall('/petproduct', 'GET', null, token),
};

export const vetDoctorApi = {
  assignPatient: (data, token) => apiCall('/vet/doctor/assign-patient', 'POST', data, token),
  getMyPatients: (doctorId, statusFilter = 'ALL', token = null) => {
    let url = `/vet/doctor/my-patients?doctorId=${encodeURIComponent(doctorId)}`;
    if (statusFilter && statusFilter !== 'ALL') url += `&statusFilter=${encodeURIComponent(statusFilter)}`;
    return apiCall(url, 'GET', null, token);
  },
  getPatientSummary: (petId, token = null) => apiCall(`/vet/doctor/patients/${petId}/summary`, 'GET', null, token),
  updatePatientCaseStatus: (petId, doctorId, status, token = null) => 
    apiCall(`/vet/doctor/patients/${petId}/status?doctorId=${encodeURIComponent(doctorId)}&status=${encodeURIComponent(status)}`, 'PATCH', null, token),
  unassignPatient: (petId, doctorId, token = null) =>
    apiCall(`/vet/doctor/patients/${petId}/unassign?doctorId=${encodeURIComponent(doctorId)}`, 'DELETE', null, token),
};

export const vetOrgApi = {
  registerOrganization: (orgData, token = null) => apiCall('/vet/org/register', 'POST', orgData, token),
  getOrganizationDetails: (orgId, token = null) => apiCall(`/vet/org/${orgId}`, 'GET', null, token),
  inviteStaff: (orgId, staffData, token = null) => apiCall(`/vet/org/${orgId}/invite-staff`, 'POST', staffData, token),
  getStaff: (orgId, token = null) => apiCall(`/vet/org/${orgId}/staff`, 'GET', null, token),
  removeStaff: (orgId, userId, token = null) => apiCall(`/vet/org/${orgId}/staff/${userId}`, 'DELETE', null, token),
  updateKycStatus: (orgId, status, token = null) => apiCall(`/vet/org/${orgId}/kyc-status?status=${encodeURIComponent(status)}`, 'PATCH', null, token),
};

export const carePlanApi = {
  createCarePlan: (planData, token = null) => apiCall('/medical/care-plans', 'POST', planData, token),
  getCarePlansByPet: (petId, token = null) => apiCall(`/medical/care-plans/pet/${petId}`, 'GET', null, token),
  getActiveCarePlan: (petId, token = null) => apiCall(`/medical/care-plans/pet/${petId}/active`, 'GET', null, token),
  getCarePlansByOwner: (ownerId, token = null) => apiCall(`/medical/care-plans/owner/${ownerId}`, 'GET', null, token),
  completeCareTask: (planId, taskId, completionData, token = null) => 
    apiCall(`/medical/care-plans/${planId}/tasks/${taskId}/complete`, 'PATCH', completionData, token),
  cancelCareTask: (planId, taskId, reason, token = null) =>
    apiCall(`/medical/care-plans/${planId}/tasks/${taskId}/cancel`, 'PATCH', { reason }, token),
};

export const missedCareApi = {
  runEvaluation: (token = null) => apiCall('/medical/missed-care/evaluate', 'POST', null, token),
  getCasesByOwner: (ownerId, token = null) => apiCall(`/medical/missed-care/owner/${ownerId}`, 'GET', null, token),
  getCasesByPet: (petId, token = null) => apiCall(`/medical/missed-care/pet/${petId}`, 'GET', null, token),
  getOpenCases: (token = null) => apiCall('/medical/missed-care/open', 'GET', null, token),
  resolveCase: (caseId, actionData, token = null) => 
    apiCall(`/medical/missed-care/${caseId}/resolve`, 'POST', actionData, token),
};

export const delegationApi = {
  createDelegation: (delegationData, token = null) => apiCall('/medical/delegations', 'POST', delegationData, token),
  getDelegationsByOwner: (ownerId, token = null) => apiCall(`/medical/delegations/owner/${ownerId}`, 'GET', null, token),
  getDelegationsForCaretaker: (caretakerId = null, email = null, token = null) => {
    let url = '/medical/delegations/caretaker';
    const params = new URLSearchParams();
    if (caretakerId) params.append('caretakerId', caretakerId);
    if (email) params.append('email', email);
    if (params.toString()) url += `?${params.toString()}`;
    return apiCall(url, 'GET', null, token);
  },
  getDelegationsByPet: (petId, token = null) => apiCall(`/medical/delegations/pet/${petId}`, 'GET', null, token),
  revokeDelegation: (delegationId, reason = null, token = null) => 
    apiCall(`/medical/delegations/${delegationId}/revoke`, 'POST', { reason }, token),
  getCaretakerDashboard: (delegationId, token = null) => 
    apiCall(`/medical/delegations/${delegationId}/care-dashboard`, 'GET', null, token),
};

export const hospitalLiveOpsApi = {
  getHospitalSnapshot: (hospitalId, token = null) => apiCall(`/medical/live-operations/hospital/${hospitalId}`, 'GET', null, token),
  getAllDoctors: (hospitalId = null, token = null) => {
    let url = '/medical/live-operations/doctors';
    if (hospitalId) url += `?hospitalId=${encodeURIComponent(hospitalId)}`;
    return apiCall(url, 'GET', null, token);
  },
  updateDoctorStatus: (doctorId, statusData, token = null) => 
    apiCall(`/medical/live-operations/doctors/${doctorId}/status`, 'PUT', statusData, token),
  getResources: (hospitalId = null, type = null, token = null) => {
    let url = '/medical/live-operations/resources';
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospitalId', hospitalId);
    if (type) params.append('type', type);
    if (params.toString()) url += `?${params.toString()}`;
    return apiCall(url, 'GET', null, token);
  },
  updateResourceStatus: (resourceId, statusData, token = null) => 
    apiCall(`/medical/live-operations/resources/${resourceId}/status`, 'PATCH', statusData, token),
  scheduleProcedure: (procedureData, token = null) => 
    apiCall('/medical/live-operations/ot-procedures', 'POST', procedureData, token),
  getProcedures: (hospitalId = null, token = null) => {
    let url = '/medical/live-operations/ot-procedures';
    if (hospitalId) url += `?hospitalId=${encodeURIComponent(hospitalId)}`;
    return apiCall(url, 'GET', null, token);
  },
  startProcedure: (procedureId, token = null) => 
    apiCall(`/medical/live-operations/ot-procedures/${procedureId}/start`, 'PATCH', null, token),
  completeProcedure: (procedureId, postOpRecoveryPlan = null, token = null) => 
    apiCall(`/medical/live-operations/ot-procedures/${procedureId}/complete`, 'PATCH', { postOpRecoveryPlan }, token),
};

export const hospitalProfileApi = {
  getMyProfile: (orgId = null, token = null) => {
    let url = '/medical/hospitals/my-profile';
    if (orgId) url += `?orgId=${encodeURIComponent(orgId)}`;
    return apiCall(url, 'GET', null, token);
  },
  getHospitalById: (hospitalId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}`, 'GET', null, token),
  updateProfile: (hospitalId, updateData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/profile`, 'PUT', updateData, token),
  saveBranch: (hospitalId, branchData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches`, 'POST', branchData, token),
  deleteBranch: (hospitalId, branchId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches/${branchId}`, 'DELETE', null, token),
  updateBranchLocation: (hospitalId, branchId, locationData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches/${branchId}/location`, 'PUT', locationData, token),
  submitLocationEvidence: (hospitalId, branchId, evidenceData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches/${branchId}/location-evidence`, 'POST', evidenceData, token),
  updateLocationEvidence: (hospitalId, branchId, evidenceId, evidenceData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches/${branchId}/location-evidence/${evidenceId}`, 'PUT', evidenceData, token),
  deleteLocationEvidence: (hospitalId, branchId, evidenceId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/branches/${branchId}/location-evidence/${evidenceId}`, 'DELETE', null, token),
  saveMedia: (hospitalId, mediaData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/media`, 'POST', mediaData, token),
  deleteMedia: (hospitalId, mediaId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/media/${mediaId}`, 'DELETE', null, token),
  saveService: (hospitalId, serviceData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/services`, 'POST', serviceData, token),
  deleteService: (hospitalId, serviceId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/services/${serviceId}`, 'DELETE', null, token),
  saveFacility: (hospitalId, facilityData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/facilities`, 'POST', facilityData, token),
  deleteFacility: (hospitalId, facilityId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/facilities/${facilityId}`, 'DELETE', null, token),
  saveDoctor: (hospitalId, doctorData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/doctors`, 'POST', doctorData, token),
  deleteDoctor: (hospitalId, doctorId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/doctors/${doctorId}`, 'DELETE', null, token),
  saveOpeningHours: (hospitalId, hoursData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/opening-hours`, 'PUT', hoursData, token),
  submitForReview: (hospitalId, userNotes = null, token = null) => {
    let url = `/medical/hospitals/${hospitalId}/submit-for-review`;
    if (userNotes) url += `?userNotes=${encodeURIComponent(userNotes)}`;
    return apiCall(url, 'POST', null, token);
  },
  publishProfile: (hospitalId, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/publish`, 'POST', null, token),
  unpublishProfile: (hospitalId, reason = null, token = null) => {
    let url = `/medical/hospitals/${hospitalId}/unpublish`;
    if (reason) url += `?reason=${encodeURIComponent(reason)}`;
    return apiCall(url, 'POST', null, token);
  },
  reviewProfile: (hospitalId, reviewData, token = null) => 
    apiCall(`/medical/hospitals/${hospitalId}/review`, 'POST', reviewData, token),
  getPublicProfile: (slugOrId) => 
    apiCall(`/medical/public/hospitals/${slugOrId}`, 'GET'),
  listPublishedHospitals: (query = null, city = null) => {
    let url = '/medical/public/hospitals';
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (city) params.append('city', city);
    if (params.toString()) url += `?${params.toString()}`;
    return apiCall(url, 'GET');
  },
};

export const taxonomyApi = {
  getAll: (token = null) => apiCall('/medical/taxonomies', 'GET', null, token),
  getCategory: (category, token = null) => apiCall(`/medical/taxonomies/${category}`, 'GET', null, token),
  addItem: (category, itemData, token = null) => {
    const payload = typeof itemData === 'string' ? { label: itemData } : itemData;
    return apiCall(`/medical/taxonomies/${category}`, 'POST', payload, token);
  },
};

export const cmsApi = {
  getPublicSettings: () => apiCall('/public/cms/settings', 'GET'),
  getPublicSetting: (key) => apiCall(`/public/cms/settings/${key}`, 'GET'),
  getNews: (category = null, page = 1, size = 12) => {
    let url = `/public/cms/news?page=${page}&size=${size}`;
    if (category && category !== 'ALL') url += `&category=${encodeURIComponent(category)}`;
    return apiCall(url, 'GET');
  },
  getNewsArticle: (slugOrId) => apiCall(`/public/cms/news/${slugOrId}`, 'GET'),
  getAdminSettings: (token) => apiCall('/admin/cms/settings', 'GET', null, token),
  updateAdminSetting: (key, value, category = null, token) => {
    let url = `/admin/cms/settings/${key}`;
    if (category) url += `?category=${encodeURIComponent(category)}`;
    return apiCall(url, 'PUT', value, token);
  },
  getAdminNews: (category = null, page = 1, size = 20, token) => {
    let url = `/admin/cms/news?page=${page}&size=${size}`;
    if (category && category !== 'ALL') url += `&category=${encodeURIComponent(category)}`;
    return apiCall(url, 'GET', null, token);
  },
  createNews: (articleData, token) => apiCall('/admin/cms/news', 'POST', articleData, token),
  updateNews: (id, articleData, token) => apiCall(`/admin/cms/news/${id}`, 'PUT', articleData, token),
  deleteNews: (id, token) => apiCall(`/admin/cms/news/${id}`, 'DELETE', null, token),
};
