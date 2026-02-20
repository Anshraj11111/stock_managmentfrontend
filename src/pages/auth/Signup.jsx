// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import { useAuth } from '../../store/AuthContext';
// import Input from '../../components/common/Input';
// import Button from '../../components/common/Button';
// import toast from 'react-hot-toast';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     shop_name: '',
//     category: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     for (const key in formData) {
//       if (!formData[key]) {
//         toast.error('All fields are required');
//         return;
//       }
//     }

//     setLoading(true);
//     const result = await signup(formData);
//     setLoading(false);

//     if (result?.success) {
//       navigate('/dashboard');
//     } else {
//       toast.error(result?.message || 'Signup failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 px-4">
//       <div className="w-full max-w-md">
//         <div className="rounded-2xl bg-white dark:bg-secondary-900 shadow-xl p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-primary-600">StockSaaS</h1>
//             <p className="text-secondary-600 dark:text-secondary-400 mt-1">
//               Start managing your business today
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <Input
//               label="Owner Name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Your full name"
//             />

//             <Input
//               label="Email Address"
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="owner@shop.com"
//             />

//             <div>
//               <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 pr-10 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-primary-500"
//                   placeholder="Create password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5 text-secondary-400" />
//                   ) : (
//                     <Eye className="w-5 h-5 text-secondary-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <Input
//               label="Shop Name"
//               name="shop_name"
//               value={formData.shop_name}
//               onChange={handleChange}
//               placeholder="Your shop name"
//             />

//             <div>
//               <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
//                 Shop Category
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 focus:ring-2 focus:ring-primary-500"
//               >
//                 <option value="">Select category</option>
//                 <option value="grocery">Grocery</option>
//                 <option value="retail">Retail</option>
//                 <option value="wholesale">Wholesale</option>
//                 <option value="electronics">Electronics</option>
//                 <option value="pharmacy">Pharmacy</option>
//                 <option value="clothing">Clothing</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             <Button type="submit" loading={loading} className="w-full">
//               Create Account
//             </Button>
//           </form>

//           <p className="text-center text-sm text-secondary-600 dark:text-secondary-400 mt-6">
//             Already have an account?{' '}
//             <Link to="/login" className="text-primary-600 font-medium">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Signup = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "trial";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: '',
    category: '',
    owner_phone: '',
    address: '',
    plan_type: selectedPlan,
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
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-950 dark:to-secondary-900 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">StockSaaS</h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              {t('auth.selectedPlan')}: <span className="font-semibold">{selectedPlan.toUpperCase()}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label={t('auth.ownerName')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            <Input
              label={t('auth.email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="owner@shop.com"
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('auth.createPassword')}
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

            <Input
              label={t('auth.shopName')}
              name="shop_name"
              value={formData.shop_name}
              onChange={handleChange}
              placeholder="Your shop name"
            />

            <Input
              label="Owner Phone Number"
              name="owner_phone"
              type="tel"
              value={formData.owner_phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">Shop Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter shop address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-secondary-700 dark:text-secondary-300">{t('auth.shopCategory')}</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('auth.selectCategory')}</option>
                <option value="grocery">{t('categories.grocery')}</option>
                <option value="retail">{t('categories.retail')}</option>
                <option value="electronics">{t('categories.electronics')}</option>
                <option value="pharmacy">{t('categories.pharmacy')}</option>
                <option value="others">Others</option>
              </select>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {t('auth.createAccount')}
            </Button>

          </form>

          <p className="text-center text-sm mt-6 text-secondary-600 dark:text-secondary-400">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
              {t('auth.signIn')}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
