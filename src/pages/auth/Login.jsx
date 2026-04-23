import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Check for trial expired message from sessionStorage
  useEffect(() => {
    const loginError = sessionStorage.getItem('loginError');
    if (loginError) {
      toast.error(loginError, { duration: 6000 });
      sessionStorage.removeItem('loginError');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields required");
      return;
    }

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result?.success) {
      // Check if redirect is needed (trial/subscription expired)
      if (result.redirectTo) {
        // Show toaster for trial expiry
        if (result.trialExpired) {
          toast.error(
            '⚠️ Your trial has expired! Please pay ₹100 deposit to continue. This deposit is fully refundable after 2 months!',
            { duration: 8000 }
          );
          navigate('/trial-expired');
        } else if (result.subscriptionExpired) {
          toast.error(
            '⚠️ Your subscription has expired! Please renew your subscription.',
            { duration: 8000 }
          );
          navigate('/trial-expired');
        }
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-950 dark:to-secondary-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label={t('auth.email')}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div>
            <label className="block text-sm mb-1 text-secondary-700 dark:text-secondary-300">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-secondary-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {t('auth.signIn')}
          </Button>

        </form>

        <p className="text-center text-sm mt-6 text-secondary-600 dark:text-secondary-400">
          {t('auth.dontHaveAccount')}{" "}
          <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
            {t('auth.createOne')}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;