import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { trackLogin, trackGoogleAuth } from '../../utils/analytics';

const Login = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
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
      // Track successful login
      trackLogin('email');
      
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

  const handleGoogleSuccess = async (credentialResponse) => {
    trackGoogleAuth('Login Attempt');
    
    setLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    setLoading(false);

    if (result?.success) {
      trackLogin('google');
      trackGoogleAuth('Login Success');
      
      if (result.redirectTo) {
        if (result.trialExpired) {
          toast.error(
            '⚠️ Your trial has expired! Please pay ₹100 deposit to continue.',
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
    } else {
      trackGoogleAuth('Login Failed');
    }
  };

  const handleGoogleError = () => {
    trackGoogleAuth('Login Error');
    toast.error("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-300 mb-6 text-center">
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
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="text-center text-sm mt-6 text-secondary-600 dark:text-secondary-400">
          {t('auth.dontHaveAccount')}{" "}
          <Link to="/signup" className="text-emerald-600 dark:text-emerald-300 font-medium hover:text-emerald-700 dark:hover:text-emerald-200">
            {t('auth.createOne')}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;