import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { shopService } from '../../services/shopService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Settings = () => {
  const [shopData, setShopData] = useState({
    shop_name: '',
    category: '',
    trial_end_date: '',
    subscription_active: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const data = await shopService.getShopDetails();
      setShopData({
        shop_name: data.shop_name,
        category: data.category,
        trial_end_date: data.trial_end_date,
        subscription_active: data.subscription_active,
      });
    } catch (error) {
      toast.error('Failed to fetch shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await shopService.updateShopDetails({
        shop_name: shopData.shop_name,
        category: shopData.category,
      });

      toast.success('Shop details updated successfully!');
    } catch (error) {
      toast.error('Failed to update shop details');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setShopData({
      ...shopData,
      [e.target.name]: e.target.value,
    });
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
          Settings
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Manage your shop details and preferences
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="glass-card">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Shop Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Shop Name"
              type="text"
              name="shop_name"
              value={shopData.shop_name}
              onChange={handleChange}
              placeholder="Enter your shop name"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Shop Category
              </label>
              <select
                name="category"
                value={shopData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                required
              >
                <option value="">Select category</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="grocery">Grocery</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium text-secondary-900 dark:text-secondary-100">
                Subscription Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Trial End Date
                  </p>
                  <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100">
                    {new Date(shopData.trial_end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Subscription Status
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      shopData.subscription_active
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
                        : 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                    }`}
                  >
                    {shopData.subscription_active ? 'Active' : 'Trial'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Settings Sections */}
        <div className="glass-card mt-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Account Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                  Change Password
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
                  Export Data
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Download all your business data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
