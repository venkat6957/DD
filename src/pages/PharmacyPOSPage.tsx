import { useState } from 'react';
import { Search, Phone, User, Plus, Minus, X } from 'lucide-react';
import { Medicine, PharmacySale, PharmacySaleItem, PharmacyCustomer } from '../types';
import api from '../services/api';

interface SaleItem {
  medicine: Medicine;
  quantity: number;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const PharmacyPOSPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSaleSuccessModal, setShowSaleSuccessModal] = useState(false);

  // Customer state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [customer, setCustomer] = useState<PharmacyCustomer | null>(null);
  const [showCustomerFormModal, setShowCustomerFormModal] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  const handleMedicineSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setIsSearching(true);
        const results = await api.medicines.search(searchTerm.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search medicines:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      setCustomerError('Please enter a phone number');
      return;
    }

    try {
      setIsSearchingCustomer(true);
      setCustomerError(null);

      // 1. Check in patient table first
      const patient = await api.patients.getByPhone(phoneSearch);

      if (patient) {
        // 2. Check if pharmacy customer already exists
        const foundCustomer = await api.pharmacyCustomers.getByPhone(phoneSearch);

        if (foundCustomer) {
          // Pharmacy customer exists, show details
          setCustomer(foundCustomer);
          setShowCustomerFormModal(false);
          return;
        }

        // Not in pharmacy customer, create from patient details
        const newCustomer = await api.pharmacyCustomers.create({
          name: `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
        });
        setCustomer(newCustomer);
        setShowCustomerFormModal(false);
        setCustomerError(null);
        return;
      }

      // 3. If not found in patient table, check pharmacy customer table directly
      const foundCustomer = await api.pharmacyCustomers.getByPhone(phoneSearch);

      if (foundCustomer) {
        setCustomer(foundCustomer);
        setShowCustomerFormModal(false);
        return;
      }

      // 4. If not found in either, show add new customer modal
      setCustomerFormData({
        name: '',
        phone: phoneSearch,
        email: '',
        address: '',
      });
      setShowCustomerFormModal(true);
      setCustomerError('Customer not found. Please enter details.');
    } catch (error) {
      console.error('Failed to search customer:', error);
      setCustomerFormData({
        name: '',
        phone: phoneSearch,
        email: '',
        address: '',
      });
      setShowCustomerFormModal(true);
      setCustomerError('Customer not found. Please enter details.');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerFormData.name || !customerFormData.phone) {
      setCustomerError('Name and phone number are required');
      return;
    }

    try {
      const newCustomer = await api.pharmacyCustomers.create({
        ...customerFormData,
        createdAt: new Date().toISOString(),
      });
      setCustomer(newCustomer);
      setShowCustomerFormModal(false);
      setCustomerError(null);
    } catch (error) {
      console.error('Failed to create customer:', error);
      setCustomerError('Failed to create customer');
    }
  };

  const addMedicineToSale = (medicine: Medicine) => {
    setSaleItems((prev) => {
      const existingItem = prev.find((item) => item.medicine.id === medicine.id);
      if (existingItem) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });

    setSearchResults([]);
    setSearchTerm('');
  };

  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity < 0) return;

    const item = saleItems.find(item => item.medicine.id === medicineId);
    if (item && quantity > item.medicine.stock) {
      alert(`Only ${item.medicine.stock} units available`);
      return;
    }

    setSaleItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const removeMedicineFromSale = (medicineId: number) => {
    setSaleItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const calculateSubtotal = () => {
    return saleItems.reduce(
      (total, item) => total + item.medicine.price * item.quantity,
      0
    );
  };

  const calculateSGST = () => {
    return calculateSubtotal() * 0.09;
  };

  const calculateCGST = () => {
    return calculateSubtotal() * 0.09;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const sgst = calculateSGST();
    const cgst = calculateCGST();
    const total = subtotal + sgst + cgst;
    return total - (discount || 0);
  };

  const handleCompleteSale = async () => {
    if (isProcessing || saleItems.length === 0 || !customer) {
      if (!customer) {
        setCustomerError('Please enter customer details before completing sale');
      }
      return;
    }

    try {
      setIsProcessing(true);

      const subtotal = calculateSubtotal();
      const sgst = calculateSGST();
      const cgst = calculateCGST();
      const total = calculateTotal();

      const sale: PharmacySale = {
        id: 0,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: saleItems.map((item): PharmacySaleItem => ({
          medicineId: item.medicine.id,
          medicineName: item.medicine.name,
          quantity: item.quantity,
          unitPrice: item.medicine.price,
          totalPrice: item.medicine.price * item.quantity
        })),
        subtotal,
        sgst,
        cgst,
        discount,
        total,
        createdAt: new Date().toISOString()
      };

      await api.pharmacySales.create(sale);

      setSaleItems([]);
      setDiscount(0);
      setCustomer(null);
      setPhoneSearch('');
      setSearchResults([]);
      setSearchTerm('');

      setShowSaleSuccessModal(true); // Show modal instead of alert
    } catch (error) {
      console.error('Failed to complete sale:', error);
      alert('Failed to complete sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Pharmacy POS</h1>
        <p className="text-sm text-neutral-500">
          Search for medicines and create sales transactions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left side - Medicine search and Current Sale */}
        <div className="space-y-6">
          {/* Medicine Search */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Search Medicines
            </h2>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Type medicine name and press Enter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleMedicineSearch}
                disabled={isSearching}
              />
            </div>
          </div>

          {/* Current Sale (only show if saleItems.length > 0) */}
          {saleItems.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                Current Sale
              </h2>
              <div className="space-y-4">
                {saleItems.map((item) => (
                  <div
                    key={item.medicine.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {item.medicine.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        ₹{item.medicine.price.toFixed(2)} per {item.medicine.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.medicine.id, item.quantity - 1)
                        }
                        className="rounded-full bg-neutral-100 p-1 text-neutral-600 hover:bg-neutral-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.medicine.id, item.quantity + 1)
                        }
                        className="rounded-full bg-neutral-100 p-1 text-neutral-600 hover:bg-neutral-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeMedicineFromSale(item.medicine.id)}
                        className="rounded-full bg-error-100 p-1 text-error-600 hover:bg-error-200 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-neutral-900">
                        ₹{(item.medicine.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Customer Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Customer Details
            </h2>
            {!customer && (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="tel"
                      className="input pl-10 w-full"
                      placeholder="Enter phone number..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handlePhoneSearch}
                    className="btn btn-primary"
                    disabled={isSearchingCustomer}
                  >
                    {isSearchingCustomer ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {customerError && (
                  <p className="text-sm text-error-500">{customerError}</p>
                )}
              </div>
            )}
            {customer && (
              <div className="rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">{customer.name}</h3>
                      <p className="text-sm text-neutral-500">{customer.phone}</p>
                      {customer.email && (
                        <p className="text-sm text-neutral-500">{customer.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCustomer(null);
                      setPhoneSearch('');
                    }}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sale Summary and Complete Sale Button */}
          {saleItems.length > 0 && (
            <>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">SGST (9%):</span>
                    <span className="font-medium">₹{calculateSGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">CGST (9%):</span>
                    <span className="font-medium">₹{calculateCGST().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Discount:</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="input w-24 text-right"
                    />
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-neutral-900">
                        Grand Total:
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={saleItems.length === 0 || isProcessing || !customer}
                className="btn btn-primary w-full"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Medicine Search Results Modal */}
      {searchResults.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-white/20 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Select Medicine</h3>
              <button
                onClick={() => setSearchResults([])}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {searchResults.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">
                      {medicine.name}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {medicine.type} | Stock: {medicine.stock} {medicine.unit} | ₹{medicine.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      addMedicineToSale(medicine);
                      setSearchResults([]);
                    }}
                    className="btn btn-primary px-3 py-1 text-sm"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Add New Customer</h3>
              <button
                onClick={() => {
                  setShowCustomerFormModal(false);
                  setCustomerError(null);
                }}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Name*
                </label>
                <input
                  type="text"
                  className="input mt-1 w-full"
                  value={customerFormData.name}
                  onChange={(e) => setCustomerFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Phone*
                </label>
                <input
                  type="tel"
                  className="input mt-1 w-full"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <input
                  type="email"
                  className="input mt-1 w-full"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Address
                </label>
                <input
                  type="text"
                  className="input mt-1 w-full"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerFormModal(false);
                    setCustomerError(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Customer
                </button>
              </div>
              {customerError && (
                <p className="text-sm text-error-500">{customerError}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Sale Success Modal */}
      {showSaleSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-white/20">
            <h2 className="text-lg font-semibold mb-4 text-success-700">Sale Completed</h2>
            <p className="mb-6">The sale was completed successfully.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="btn btn-outline"
                onClick={() => setShowSaleSuccessModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowSaleSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPOSPage;