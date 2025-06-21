import { useState } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { User as UserType, Role } from '../types';
import Pagination from '../components/common/Pagination';
import { useApi } from '../hooks/useApi';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
}

const UsersPage = () => {
  const { data: users = [], isLoading: isLoadingUsers, error: usersError, refetch: refetchUsers } = useApi(() => api.users.getAll());
  const { data: roles = [], isLoading: isLoadingRoles } = useApi(() => api.roles.getAll());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    avatar: '',
  });

  // Filter users based on search term
  const filteredUsers = users.filter((user: UserType) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: '',
      avatar: '',
    });
    setShowForm(true);
    setError(null);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
      avatar: user.avatar || '',
    });
    setShowForm(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      setError('Name, email, and role are required');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userData = {
        ...formData,
        // Only include password if it's provided (for updates) or if it's a new user
        ...(formData.password && { password: formData.password }),
      };

      if (editingUser) {
        await api.users.update(editingUser.id, userData);
      } else {
        await api.users.create(userData);
      }
      
      await refetchUsers();
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        avatar: '',
      });
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      setError('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.users.delete(id);
        await refetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner"></div>
        <p className="ml-3 text-lg text-neutral-500">Loading users...</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-error-500">Error loading users: {usersError.message}</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-sm text-neutral-500">
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn btn-primary flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
        <table className="min-w-full divide-y divide-neutral-200 rounded-2xl overflow-hidden">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: UserType) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition rounded-xl">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-neutral-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-neutral-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-error-100 text-error-800'
                          : user.role === 'doctor'
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-secondary-100 text-secondary-800'
                      }`}
                    >
                      {user.roleEntity?.name || user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-error-600 hover:text-error-700"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-neutral-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredUsers.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3">
            <div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageClassName="mb-2 mr-2"
                summaryClassName="ml-0"
                showSummaryOnly
              />
            </div>
            <div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageClassName="mb-2 mr-2"
                summaryClassName="hidden"
                showPagesOnly
              />
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/20">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password{!editingUser && '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input w-full"
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  required={!editingUser}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-2">
                  Role*
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="input w-full"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Role</option>
                  {roles.map((role: Role) => (
                    <option key={role.id} value={role.name}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-neutral-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  className="input w-full"
                  placeholder="Enter avatar URL (optional)"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <p className="text-sm text-error-500">{error}</p>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      role: '',
                      avatar: '',
                    });
                    setEditingUser(null);
                    setError(null);
                  }}
                  className="btn btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;