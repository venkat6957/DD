import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, UserPlus, Eye } from 'lucide-react';
import { Patient } from '../types';
import PatientForm from '../components/patients/PatientForm';
import Pagination from '../components/common/Pagination';
import { usePatients } from '../hooks/useApi';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const PatientsPage = () => {
  const { data: patients = [], isLoading, error, refetch } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient: any) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddPatient = async (patient: Patient) => {
    try {
      await api.patients.create(patient);
      refetch();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner"></div>
        <p className="ml-3 text-lg text-neutral-500">Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="card text-center">
          <p className="text-lg text-error-500">Error loading patients: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Patients</h1>
          <p className="text-sm text-neutral-500">
            Manage your patient records and information
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add New Patient
        </button>
      </div>

      {/* Search and filters (removed card wrapper for consistency with AppointmentsPage) */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="input pl-12 w-full"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <button className="btn btn-outline flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
        <table className="min-w-full divide-y divide-neutral-200 rounded-2xl overflow-hidden">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Last Visit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-neutral-50 transition rounded-xl">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-neutral-900">
                    {patient.firstName} {patient.lastName}
                    <div className="text-xs text-neutral-400">ID: #{patient.id}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-neutral-600">
                    {patient.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-neutral-600">
                    {patient.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-neutral-600">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-neutral-600">
                    {patient.lastVisit
                      ? new Date(patient.lastVisit).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      to={`/patients/${patient.id}`}
                      className="inline-flex items-center justify-center rounded-full p-2 hover:bg-primary-50 hover:text-primary-700 transition"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500">
                  No patients found
                  {searchTerm ? (
                    <div className="mt-2 text-neutral-400">
                      Try adjusting your search criteria.
                    </div>
                  ) : (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                      >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Add First Patient
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {filteredPatients.length > 0 && totalPages > 1 && (
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

      {/* Patient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="mb-6 text-2xl font-bold gradient-text">Add New Patient</h2>
            <PatientForm
              onSubmit={handleAddPatient}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;