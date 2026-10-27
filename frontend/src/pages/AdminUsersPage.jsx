import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShieldAlert, Search, Edit2, Users, UserPlus, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { UserEditModal } from '../components/UserEditModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { PageHeader } from '../components/PageHeader';

export const AdminUsersPage = () => {
  const { token, SystemRoles } = useAuth();
  const { showToast } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [metrics, setMetrics] = useState({ totalUsers: 0, newSignupsToday: 0, roleDistribution: {} });
  
  // Editing state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Deletion state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, size: 20 });
      if (search) query.append('search', search);
      if (roleFilter) query.append('role', roleFilter);
      
      const response = await fetch(`http://localhost:8080/api/v1/admin/users?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.content);
        setTotalPages(data.data.totalPages);
      } else {
        showToast('Failed to fetch users', 'error');
      }
    } catch (error) {
      showToast('Network error while fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/users/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics', error);
    }
  };

  const handleUpdateUser = async (userId, userUpdates, newRoles) => {
    try {
      // 1. Update personal details
      const updateDetailsRes = await fetch(`http://localhost:8080/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userUpdates)
      });
      
      // 2. Update roles
      const updateRolesRes = await fetch(`http://localhost:8080/api/v1/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRoles)
      });

      if (updateDetailsRes.ok && updateRolesRes.ok) {
        showToast('User details updated successfully', 'success');
        setIsModalOpen(false);
        fetchUsers();
        fetchMetrics();
      } else {
        showToast('Failed to fully update user', 'error');
      }
    } catch (error) {
      showToast('Network error during update', 'error');
    }
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, user) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('User deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
        fetchMetrics();
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Network error during deletion', 'error');
    }
  };

  return (
    <div className="w-full space-y-6">
      
      <PageHeader
        badgeText="SECURITY & ACCESS CONTROL"
        badgeIcon={ShieldAlert}
        title="User & Role Management"
        titleIcon={Users}
        description="Super Administrative console to govern global identities, assign institutional roles, and monitor user security."
        variant="slate"
        meta={`Managing ${metrics.totalUsers || 0} registered identity accounts across all domains`}
      />

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-800">{metrics.totalUsers}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sign Ups Today</p>
            <h3 className="text-2xl font-black text-slate-800">{metrics.newSignupsToday}</h3>
          </div>
        </div>

        {/* Dynamic top roles KPI */}
        {Object.entries(metrics.roleDistribution || {}).slice(0, 2).map(([roleKey, count], idx) => (
          <div key={roleKey} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate" title={SystemRoles[roleKey]?.name || roleKey}>{SystemRoles[roleKey]?.name || roleKey}</p>
              <h3 className="text-2xl font-black text-slate-800">{count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search by email, name or phone..." 
            className="pl-9 pr-4 py-2 bg-white border border-slate-400 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            {Object.entries(SystemRoles).map(([key, roleObj]) => (
              <option key={key} value={key}>{roleObj?.name || key}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Current Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                      <Users className="w-12 h-12" />
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleRowClick(u)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{u.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{u.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {u.roles.map(r => (
                          <span key={r} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-100/50">
                            {SystemRoles[r]?.name || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        u.kycStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRowClick(u); }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={(p) => setPage(p)} 
            />
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      <UserEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
        onSave={handleUpdateUser} 
        SystemRoles={SystemRoles} 
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen && !!userToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User?"
        itemName={userToDelete?.fullName}
        confirmText="Yes, Delete User"
        message="This action cannot be undone and will permanently remove this user from the system."
      />
      
    </div>
  );
};
