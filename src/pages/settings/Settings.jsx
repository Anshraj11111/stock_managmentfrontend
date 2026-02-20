import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { shopService } from "../../services/shopService";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../store/AuthContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { t } = useTranslation();
  const { isOwner } = useAuth(); // 🔥 role check

  const [shopData, setShopData] = useState({
    shop_name: "",
    category: "",
    address: "",
    owner_phone: "",
    trial_end_date: "",
    subscription_active: false,
    upi_id: "",
    upi_name: "",
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
        shop_name: data.shop_name || "",
        category: data.category || "",
        address: data.address || "",
        owner_phone: data.owner_phone || "",
        trial_end_date: data.trial_end_date || "",
        subscription_active: data.subscription_active || false,
        upi_id: data.upi_id || "",
        upi_name: data.upi_name || "",
      });
    } catch (error) {
      toast.error("Failed to fetch shop details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (!isOwner) return; // ❌ Staff cannot modify state

    setShopData({
      ...shopData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) return; // ❌ Extra safety

    setSaving(true);

    try {
      await shopService.updateShopDetails(shopData);
      toast.success("Shop details updated successfully!");
    } catch (error) {
      toast.error("Failed to update shop details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="px-6 pb-10 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{t('settings.title')}</h1>
        <p className="text-secondary-500 dark:text-secondary-400">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">{t('settings.shopInformation')}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Shop Name */}
          <Input
            label={t('settings.shopName')}
            name="shop_name"
            value={shopData.shop_name}
            onChange={handleChange}
            disabled={!isOwner}   // 🔥 Staff read-only
            required
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
              {t('settings.shopCategory')}
            </label>
            <select
              name="category"
              value={shopData.category}
              onChange={handleChange}
              disabled={!isOwner}   // 🔥 Staff read-only
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">{t('settings.selectCategory')}</option>
              <option value="retail">{t('settings.retail')}</option>
              <option value="wholesale">{t('settings.wholesale')}</option>
              <option value="grocery">{t('settings.grocery')}</option>
              <option value="electronics">{t('settings.electronics')}</option>
              <option value="clothing">{t('settings.clothing')}</option>
              <option value="pharmacy">{t('settings.pharmacy')}</option>
              <option value="other">{t('settings.other')}</option>
            </select>
          </div>

          {/* Shop Address */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
              Shop Address
            </label>
            <textarea
              name="address"
              value={shopData.address}
              onChange={handleChange}
              disabled={!isOwner}
              rows="3"
              placeholder="Enter your shop address (will appear on bills)"
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              This address will be printed on all bills
            </p>
          </div>

          {/* Shop Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
              Shop Phone Number
            </label>
            <input
              type="tel"
              name="owner_phone"
              value={shopData.owner_phone}
              onChange={(e) => {
                if (!isOwner) return;
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setShopData({ ...shopData, owner_phone: value });
              }}
              disabled={!isOwner}
              maxLength="10"
              placeholder="Enter 10-digit phone number"
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {shopData.owner_phone && shopData.owner_phone.length !== 10 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Phone number must be exactly 10 digits
              </p>
            )}
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              This phone number will be printed on all bills
            </p>
          </div>

          {/* UPI Section */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
              {t('settings.upiPaymentSettings')}
            </h3>

            <Input
              label={t('settings.upiId')}
              name="upi_id"
              value={shopData.upi_id}
              onChange={handleChange}
              disabled={!isOwner}
            />

            <Input
              label={t('settings.upiName')}
              name="upi_name"
              value={shopData.upi_name}
              onChange={handleChange}
              disabled={!isOwner}
            />

            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
              {t('settings.upiNote')}
            </p>
          </div>

          {/* Subscription Info */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
              {t('settings.subscriptionStatus')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{t('settings.trialEndDate')}</p>
                <p className="font-semibold text-secondary-900 dark:text-secondary-100">
                  {shopData.trial_end_date
                    ? new Date(shopData.trial_end_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="p-4 border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{t('settings.status')}</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    shopData.subscription_active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  }`}
                >
                  {shopData.subscription_active ? t('settings.subscriptionActive') : t('settings.subscriptionTrial')}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button only for Owner */}
          {isOwner && (
            <div className="flex justify-end pt-4">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                {t('settings.saveChanges')}
              </Button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Settings;
