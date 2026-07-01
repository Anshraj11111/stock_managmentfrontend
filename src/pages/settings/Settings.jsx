import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Mic, MicOff } from "lucide-react";
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
    gstin: "",
    pan: "",
    bank_name: "",
    bank_branch: "",
    bank_account_number: "",
    bank_ifsc: "",
    authorized_signatory: "",
    signature_image: "",
    terms_and_conditions: "",
    trial_end_date: "",
    subscription_active: false,
    upi_id: "",
    upi_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // ✅ Voice command setting - stored in localStorage
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('voiceCommandEnabled') !== 'false';
  });

  const handleVoiceToggle = (enabled) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('voiceCommandEnabled', enabled ? 'true' : 'false');
    toast.success(enabled ? 'Voice commands enabled' : 'Voice commands disabled');
    // Reload page so VoiceButton re-evaluates
    setTimeout(() => window.location.reload(), 800);
  };

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
        gstin: data.gstin || "",
        pan: data.pan || "",
        bank_name: data.bank_name || "",
        bank_branch: data.bank_branch || "",
        bank_account_number: data.bank_account_number || "",
        bank_ifsc: data.bank_ifsc || "",
        authorized_signatory: data.authorized_signatory || "",
        signature_image: data.signature_image || "",
        terms_and_conditions: data.terms_and_conditions || "",
        trial_end_date: data.trial_end_date || "",
        subscription_active: data.subscription_active || false,
        upi_id: data.upi_id || "",
        upi_name: data.upi_name || "",
      });
      
      if (data.signature_image) {
        setSignaturePreview(data.signature_image);
      }
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

  const handleSignatureUpload = (e) => {
    if (!isOwner) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 1MB instead of 2MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Image size should be less than 1MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setShopData({
        ...shopData,
        signature_image: base64String
      });
      setSignaturePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    if (!isOwner) return;
    setShopData({
      ...shopData,
      signature_image: ''
    });
    setSignaturePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) return; // ❌ Extra safety

    setSaving(true);

    try {
      await shopService.updateShopDetails(shopData);
      toast.success("Shop details updated successfully!");
      
      // Refresh shop details after save
      await fetchShopDetails();
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
              <option value="clothes">{t('categories.clothes')}</option>
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

          {/* GSTIN */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
              GSTIN (GST Number)
            </label>
            <input
              type="text"
              name="gstin"
              value={shopData.gstin}
              onChange={(e) => {
                if (!isOwner) return;
                const value = e.target.value.toUpperCase().slice(0, 15);
                setShopData({ ...shopData, gstin: value });
              }}
              disabled={!isOwner}
              maxLength="15"
              placeholder="Enter 15-character GSTIN (e.g., 22AAAAA0000A1Z5)"
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              GST Identification Number (optional, will be printed on tax invoices)
            </p>
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">
              PAN Number
            </label>
            <input
              type="text"
              name="pan"
              value={shopData.pan}
              onChange={(e) => {
                if (!isOwner) return;
                const value = e.target.value.toUpperCase().slice(0, 10);
                setShopData({ ...shopData, pan: value });
              }}
              disabled={!isOwner}
              maxLength="10"
              placeholder="Enter 10-character PAN (e.g., ABCDE1234F)"
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              Permanent Account Number (optional)
            </p>
          </div>

          {/* Bank Details Section */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
              Bank Details (for Invoice)
            </h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">
              These details will be printed on all invoices
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name */}
              <Input
                label="Bank Name"
                name="bank_name"
                value={shopData.bank_name}
                onChange={handleChange}
                disabled={!isOwner}
                placeholder="e.g., ICICI Bank"
              />

              {/* Bank Branch */}
              <Input
                label="Branch Name"
                name="bank_branch"
                value={shopData.bank_branch}
                onChange={handleChange}
                disabled={!isOwner}
                placeholder="e.g., Surat"
              />

              {/* Account Number */}
              <Input
                label="Account Number"
                name="bank_account_number"
                value={shopData.bank_account_number}
                onChange={handleChange}
                disabled={!isOwner}
                placeholder="e.g., 271500356"
              />

              {/* IFSC Code */}
              <Input
                label="IFSC Code"
                name="bank_ifsc"
                value={shopData.bank_ifsc}
                onChange={(e) => {
                  if (!isOwner) return;
                  const value = e.target.value.toUpperCase();
                  setShopData({ ...shopData, bank_ifsc: value });
                }}
                disabled={!isOwner}
                placeholder="e.g., ICIC0458F"
              />
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
              Invoice Signature
            </h3>
            
            <Input
              label="Authorized Signatory Name"
              name="authorized_signatory"
              value={shopData.authorized_signatory}
              onChange={handleChange}
              disabled={!isOwner}
              placeholder="e.g., Proprietor / Manager"
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 mb-4">
              This name will appear as "Authorized Signatory" on invoices
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                Signature Image (Optional)
              </label>
              
              {signaturePreview ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-4 bg-white dark:bg-secondary-800">
                    <img 
                      src={signaturePreview} 
                      alt="Signature" 
                      className="max-h-24 mx-auto"
                    />
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={removeSignature}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove Signature
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-6 text-center bg-secondary-50 dark:bg-secondary-800">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    disabled={!isOwner}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className={`cursor-pointer ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-secondary-600 dark:text-secondary-400">
                      <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm">Click to upload signature image</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                        PNG, JPG up to 1MB
                      </p>
                    </div>
                  </label>
                </div>
              )}
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                This signature will be displayed on invoices
              </p>
            </div>
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

          {/* Terms and Conditions Section */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-4 text-secondary-900 dark:text-secondary-100">
              Bill & Invoice Terms and Conditions
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary-700 dark:text-secondary-300">
                Terms and Conditions
              </label>
              <textarea
                name="terms_and_conditions"
                value={shopData.terms_and_conditions}
                onChange={(e) => {
                  if (!isOwner) return;
                  // ✅ Added: Input validation for terms & conditions
                  const value = e.target.value;
                  if (value.length <= 2000) {
                    setShopData({ ...shopData, terms_and_conditions: value });
                  } else {
                    toast.error('Terms & conditions cannot exceed 2000 characters');
                  }
                }}
                disabled={!isOwner}
                rows="5"
                maxLength="2000"
                placeholder="Enter terms and conditions (e.g., Subject to Maharashtra Jurisdiction, Goods once sold will not be taken back, etc.)"
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg disabled:bg-secondary-100 dark:disabled:bg-secondary-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  These terms will be printed at the bottom of all bills and invoices. Use line breaks for multiple points.
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {shopData.terms_and_conditions.length}/2000
                </p>
              </div>
            </div>
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
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  }`}
                >
                  {shopData.subscription_active ? t('settings.subscriptionActive') : t('settings.subscriptionTrial')}
                </span>
              </div>
            </div>
          </div>

          {/* Voice Command Section */}
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
            <h3 className="text-md font-semibold mb-1 text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Voice Commands
            </h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">
              Control the mic button visibility. When disabled, the mic icon will be completely hidden.
            </p>

            <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${voiceEnabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-secondary-200 dark:bg-secondary-700'}`}>
                  {voiceEnabled 
                    ? <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    : <MicOff className="w-5 h-5 text-secondary-500 dark:text-secondary-400" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {voiceEnabled ? 'Voice Commands: ON' : 'Voice Commands: OFF'}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {voiceEnabled 
                      ? 'Mic button is visible. Say "Hey Stock" to activate.' 
                      : 'Mic button is hidden. Enable to use voice navigation.'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleVoiceToggle(!voiceEnabled)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  voiceEnabled 
                    ? 'bg-blue-500' 
                    : 'bg-secondary-300 dark:bg-secondary-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    voiceEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
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
