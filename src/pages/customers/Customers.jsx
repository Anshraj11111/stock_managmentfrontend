import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, MapPin, IndianRupee, Search, Eye } from 'lucide-react';
import { customerService } from '../../services/customerService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Credit Customers (Udhar)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer credit accounts and payments
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-6 py-3 rounded-xl border border-red-200 dark:border-red-800">
          <Users className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Customers</p>
            <p className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Customers List */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No customers found' : 'No credit customers yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total Due
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-900 dark:text-secondary-100">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Since {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">
                            {customer.address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
                          parseFloat(customer.total_due) > 0
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          <IndianRupee className="w-4 h-4" />
                          {parseFloat(customer.total_due).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewCustomerDetails(customer.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Visible on Mobile Only */}
            <div className="md:hidden divide-y divide-secondary-200 dark:divide-secondary-800">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  {/* Customer Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base text-secondary-900 dark:text-secondary-100">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Since {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="break-words">{customer.address || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Due Amount & Action */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Due</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm ${
                        parseFloat(customer.total_due) > 0
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        <IndianRupee className="w-4 h-4" />
                        {parseFloat(customer.total_due).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => viewCustomerDetails(customer.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Outstanding</h3>
            <IndianRupee className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            ₹{customers.reduce((sum, c) => sum + parseFloat(c.total_due), 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Customers with Due</h3>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {customers.filter(c => parseFloat(c.total_due) > 0).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cleared Accounts</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => parseFloat(c.total_due) === 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Customers;
