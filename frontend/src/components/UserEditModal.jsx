import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Mail, Phone, Shield } from 'lucide-react';

export const UserEditModal = ({ isOpen, onClose, user, onSave, SystemRoles }) => {
  const [formData, setFormData] = useState({});
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        addressLine: user.addressLine || '',
        city: user.city || '',
        state: user.state || '',
        pinCode: user.pinCode || ''
      });
      setSelectedRoles(user.roles || []);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleRole = (roleKey) => {
    if (selectedRoles.includes(roleKey)) {
      setSelectedRoles(prev => prev.filter(r => r !== roleKey));
    } else {
      setSelectedRoles(prev => [...prev, roleKey]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(user.id, formData, selectedRoles);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Edit User Details</h2>
              <p className="text-xs text-slate-500">Update personal information and role assignments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Landscape Layout) */}
        <div className="flex-1 overflow-y-auto">
          <form id="edit-user-form" onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full">
            
            {/* Left Column: Personal Details */}
            <div className="flex-1 p-6 border-r border-slate-100 space-y-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Street Address</label>
                    <input type="text" name="addressLine" value={formData.addressLine} onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 ml-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 ml-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Pin Code</label>
                    <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Roles */}
            <div className="w-full md:w-2/5 p-6 bg-slate-50/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Role Assignments
              </h3>
              <p className="text-xs text-slate-500 mb-4">Select all the roles and permissions this user should have in the platform.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(SystemRoles).map(([roleKey, roleObj]) => {
                  const isActive = selectedRoles.includes(roleKey);
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => toggleRole(roleKey)}
                      className={`text-left flex items-start gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                        isActive 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`}>
                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="leading-tight">{roleObj?.name || roleKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-400 hover:bg-slate-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-user-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
