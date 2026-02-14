import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { shopService } from "../../services/shopService";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../store/AuthContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { isOwner } = useAuth(); // 🔥 role check

  const [shopData, setShopData] = useState({
    shop_name: "",
    category: "",
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
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your shop details and payment configuration
        </p>
      </div>

      <div className="glass-card p-6 rounded-xl border">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold">Shop Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Shop Name */}
          <Input
            label="Shop Name"
            name="shop_name"
            value={shopData.shop_name}
            onChange={handleChange}
            disabled={!isOwner}   // 🔥 Staff read-only
            required
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Shop Category
            </label>
            <select
              name="category"
              value={shopData.category}
              onChange={handleChange}
              disabled={!isOwner}   // 🔥 Staff read-only
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* UPI Section */}
          <div className="border-t pt-6">
            <h3 className="text-md font-semibold mb-4">
              UPI Payment Settings
            </h3>

            <Input
              label="UPI ID"
              name="upi_id"
              value={shopData.upi_id}
              onChange={handleChange}
              disabled={!isOwner}
            />

            <Input
              label="UPI Name"
              name="upi_name"
              value={shopData.upi_name}
              onChange={handleChange}
              disabled={!isOwner}
            />

            <p className="text-xs text-gray-500 mt-2">
              This UPI ID will be used to generate QR code during billing.
            </p>
          </div>

          {/* Subscription Info */}
          <div className="border-t pt-6">
            <h3 className="text-md font-semibold mb-4">
              Subscription Status
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Trial End Date</p>
                <p className="font-semibold">
                  {shopData.trial_end_date
                    ? new Date(shopData.trial_end_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    shopData.subscription_active
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {shopData.subscription_active ? "Active" : "Trial"}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button only for Owner */}
          {isOwner && (
            <div className="flex justify-end pt-4">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Settings;
