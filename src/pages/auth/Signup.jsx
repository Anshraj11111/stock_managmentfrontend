import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: '',
    category: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key]) {
        toast.error('All fields are required');
        return;
      }
    }

    setLoading(true);
    const result = await signup(formData);
    setLoading(false);

    if (result?.success) {
      navigate('/dashboard');
    } else {
      toast.error(result?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-secondary-900 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">StockSaaS</h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              Start managing your business today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Owner Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="owner@shop.com"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-primary-500"
                  placeholder="Create password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-secondary-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            <Input
              label="Shop Name"
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              placeholder="Your shop name"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Shop Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                <option value="grocery">Grocery</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="electronics">Electronics</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-secondary-600 dark:text-secondary-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
