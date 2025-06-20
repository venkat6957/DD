import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../services/api';

interface Manufacturer {
  id: number;
  name: string;
  createdAt: string;
}

interface MedicineType {
  id: number;
  name: string;
  createdAt: string;
}

const ConfigurePage = () => {
  const [activeTab, setActiveTab] = useState('manufacturers');
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showMedicineTypeModal, setShowMedicineTypeModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [editingMedicineType, setEditingMedicineType] = useState<MedicineType | null>(null);
  const [manufacturerName, setManufacturerName] = useState('');
  const [medicineTypeName, setMedicineTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch manufacturers and medicine types
  const { data: manufacturers = [], isLoading: isLoadingManufacturers, refetch: refetchManufacturers } = useApi(() => api.manufacturers.getAll());
  const { data: medicineTypes = [], isLoading: isLoadingMedicineTypes, refetch: refetchMedicineTypes } = useApi(() => api.medicineTypes.getAll());

  const handleAddManufacturer = () => {
    setEditingManufacturer(null);
    setManufacturerName('');
    setShowManufacturerModal(true);
    setError(null);
  };

  const handleEditManufacturer = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setManufacturerName(manufacturer.name);
    setShowManufacturerModal(true);
    setError(null);
  };

  const handleAddMedicineType = () => {
    setEditingMedicineType(null);
    setMedicineTypeName('');
    setShowMedicineTypeModal(true);
    setError(null);
  };

  const handleEditMedicineType = (medicineType: MedicineType) => {
    setEditingMedicineType(medicineType);
    setMedicineTypeName(medicineType.name);
    setShowMedicineTypeModal(true);
    setError(null);
  };

  const handleSubmitManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturerName.trim()) {
      setError('Manufacturer name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingManufacturer) {
        await api.manufacturers.update(editingManufacturer.id, { name: manufacturerName.trim() });
      } else {
        await api.manufacturers.create({ name: manufacturerName.trim() });
      }
      
      await refetchManufacturers();
      setShowManufacturerModal(false);
      setManufacturerName('');
      setEditingManufacturer(null);
    } catch (error) {
      console.error('Failed to save manufacturer:', error);
      setError('Failed to save manufacturer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMedicineType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineTypeName.trim()) {
      setError('Medicine type name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingMedicineType) {
        await api.medicineTypes.update(editingMedicineType.id, { name: medicineTypeName.trim() });
      } else {
        await api.medicineTypes.create({ name: medicineTypeName.trim() });
      }
      
      await refetchMedicineTypes();
      setShowMedicineTypeModal(false);
      setMedicineTypeName('');
      setEditingMedicineType(null);
    } catch (error) {
      console.error('Failed to save medicine type:', error);
      setError('Failed to save medicine type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManufacturer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this manufacturer?')) {
      try {
        await api.manufacturers.delete(id);
        await refetchManufacturers();
      } catch (error) {
        console.error('Failed to delete manufacturer:', error);
        alert('Failed to delete manufacturer. It may be in use.');
      }
    }
  };

  const handleDeleteMedicineType = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medicine type?')) {
      try {
        await api.medicineTypes.delete(id);
        await refetchMedicineTypes();
      } catch (error) {
        console.error('Failed to delete medicine type:', error);
        alert('Failed to delete medicine type. It may be in use.');
      }
    }
  };

  return (
    <div className="slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configure Masters</h1>
        <p className="text-sm text-neutral-500">
          Manage master data for manufacturers and medicine types
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('manufacturers')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'manufacturers'
                ? 'border-b-2 border-primary-600 text-primary-700'
                : 'text-neutral-600 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Manufacturers
          </button>
          <button
            onClick={() => setActiveTab('medicineTypes')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'medicineTypes'
                ? 'border-b-2 border-primary-600 text-primary-700'
                : 'text-neutral-600 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Medicine Types
          </button>
        </nav>
      </div>

      {/* Manufacturers Tab */}
      {activeTab === 'manufacturers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-neutral-900">Manufacturers</h2>
            <button
              onClick={handleAddManufacturer}
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Manufacturer
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {isLoadingManufacturers ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-neutral-500">
                      Loading manufacturers...
                    </td>
                  </tr>
                ) : manufacturers.length > 0 ? (
                  manufacturers.map((manufacturer: Manufacturer) => (
                    <tr key={manufacturer.id} className="hover:bg-neutral-50 transition">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                        {manufacturer.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                        {new Date(manufacturer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditManufacturer(manufacturer)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteManufacturer(manufacturer.id)}
                            className="text-error-600 hover:text-error-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-neutral-500">
                      No manufacturers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Medicine Types Tab */}
      {activeTab === 'medicineTypes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-neutral-900">Medicine Types</h2>
            <button
              onClick={handleAddMedicineType}
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Medicine Type
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {isLoadingMedicineTypes ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-neutral-500">
                      Loading medicine types...
                    </td>
                  </tr>
                ) : medicineTypes.length > 0 ? (
                  medicineTypes.map((medicineType: MedicineType) => (
                    <tr key={medicineType.id} className="hover:bg-neutral-50 transition">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                        {medicineType.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                        {new Date(medicineType.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMedicineType(medicineType)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedicineType(medicineType.id)}
                            className="text-error-600 hover:text-error-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-neutral-500">
                      No medicine types found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manufacturer Modal */}
      {showManufacturerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/20">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">
              {editingManufacturer ? 'Edit Manufacturer' : 'Add New Manufacturer'}
            </h2>
            <form onSubmit={handleSubmitManufacturer} className="space-y-4">
              <div>
                <label htmlFor="manufacturerName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Manufacturer Name*
                </label>
                <input
                  type="text"
                  id="manufacturerName"
                  value={manufacturerName}
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter manufacturer name"
                  required
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
                    setShowManufacturerModal(false);
                    setManufacturerName('');
                    setEditingManufacturer(null);
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
                  {isSubmitting ? 'Saving...' : editingManufacturer ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicine Type Modal */}
      {showMedicineTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md p-8 shadow-2xl border border-white/20">
            <h2 className="mb-6 text-xl font-bold text-neutral-900">
              {editingMedicineType ? 'Edit Medicine Type' : 'Add New Medicine Type'}
            </h2>
            <form onSubmit={handleSubmitMedicineType} className="space-y-4">
              <div>
                <label htmlFor="medicineTypeName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Medicine Type Name*
                </label>
                <input
                  type="text"
                  id="medicineTypeName"
                  value={medicineTypeName}
                  onChange={(e) => setMedicineTypeName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter medicine type name"
                  required
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
                    setShowMedicineTypeModal(false);
                    setMedicineTypeName('');
                    setEditingMedicineType(null);
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
                  {isSubmitting ? 'Saving...' : editingMedicineType ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurePage;