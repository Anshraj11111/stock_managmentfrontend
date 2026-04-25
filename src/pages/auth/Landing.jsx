import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Moon, Sun, Check, X, ArrowRight, Sparkles, 
  TrendingUp, Shield, Zap, Users, BarChart3, Package 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../store/ThemeContext";
import LanguageSelector from "../../components/common/LanguageSelector";
import Footer from "../../components/common/Footer";

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const goToTrial = () => navigate("/signup?plan=trial");
  const goToSubscription = () => navigate("/subscription");

  // Subscription Plans Data
  const plans = {
    basic: [
      { duration: 7, months: 7, price: 7999 },
      { duration: 9, months: 9, price: 6899 },
      { duration: 12, months: 12, price: 9999 }
    ],
    premium: [
      { duration: 7, months: 7, price: 9499 },
      { duration: 9, months: 9, price: 8399 },
      { duration: 12, months: 12, price: 11499 }
    ]
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-50 overflow-hidden transition-colors duration-500">

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Stock<span className="text-emerald-600">SaaS</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full -top-40 -right-40"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/5 blur-[120px] rounded-full -bottom-40 -left-40"
          />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/15 rounded-full mb-6 border border-emerald-200 dark:border-emerald-600"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {t('landing.heroTagline')}
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-slate-900 dark:text-slate-100">
                {t('landing.heroTitle')}
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {t('landing.heroDescription')} <span className="font-semibold text-emerald-600 dark:text-emerald-300">{t('landing.heroHighlight')}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToTrial}
                className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t('landing.startFreeTrial')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToSubscription}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl font-bold text-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300"
              >
                View Pricing
              </motion.button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
              {/* Mock Dashboard Preview - More Realistic */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">Dashboard</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Real-time Overview</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Revenue", value: "₹45.2K", change: "+12%", color: "emerald" },
                    { label: "Orders", value: "1,234", change: "+8%", color: "blue" },
                    { label: "Products", value: "856", change: "+5%", color: "purple" }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600"
                    >
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{stat.label}</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                      <div className={`text-xs font-semibold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                        {stat.change}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Realistic Chart */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sales Analytics</h4>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded">Week</span>
                      <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">Month</span>
                    </div>
                  </div>
                  
                  {/* Chart Bars */}
                  <div className="h-40 flex items-end justify-around gap-2">
                    {[
                      { height: 45, label: "Mon", value: "₹12K" },
                      { height: 75, label: "Tue", value: "₹18K" },
                      { height: 55, label: "Wed", value: "₹14K" },
                      { height: 90, label: "Thu", value: "₹22K" },
                      { height: 65, label: "Fri", value: "₹16K" },
                      { height: 85, label: "Sat", value: "₹20K" },
                      { height: 70, label: "Sun", value: "₹17K" }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${bar.height}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="w-full bg-emerald-500 dark:bg-emerald-600 rounded-t-lg relative group cursor-pointer hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {bar.value}
                          </div>
                        </motion.div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-teal-500 dark:bg-teal-600 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Live Updates
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Real-time Analytics
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to streamline your business operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Package, 
                title: "Smart Inventory", 
                desc: "Track products with real-time updates and low-stock alerts",
                color: "emerald"
              },
              { 
                icon: BarChart3, 
                title: "Advanced Analytics", 
                desc: "Gain insights with detailed reports and visual dashboards",
                color: "teal"
              },
              { 
                icon: Users, 
                title: "Team Management", 
                desc: "Collaborate seamlessly with role-based access control",
                color: "cyan"
              },
              { 
                icon: Zap, 
                title: "Lightning Fast", 
                desc: "Optimized performance for instant data processing",
                color: "amber"
              },
              { 
                icon: Shield, 
                title: "Bank-Grade Security", 
                desc: "Your data is encrypted and protected 24/7",
                color: "slate"
              },
              { 
                icon: TrendingUp, 
                title: "Growth Focused", 
                desc: "Scale effortlessly as your business expands",
                color: "emerald"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Start with a free trial. No credit card required. Cancel anytime.
            </p>
          </motion.div>

          {/* Trial Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-emerald-600 dark:bg-emerald-600 p-10 mb-16 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Start Your 7-Day Free Trial</h3>
              <p className="text-lg md:text-xl mb-6 text-emerald-50 max-w-2xl mx-auto">
                Experience all premium features free for 7 days. Then continue with just ₹100 refundable deposit!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToTrial}
                className="bg-white text-emerald-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition shadow-2xl inline-flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="mt-4 text-sm text-emerald-100">
                ✓ No credit card required  •  ✓ Cancel anytime  •  ✓ Full refund available
              </p>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Basic Plan</h3>
                <p className="text-slate-600 dark:text-slate-400">Perfect for small businesses</p>
              </div>

              <div className="p-8">
                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    { text: "Dashboard & Analytics", included: true },
                    { text: "Products Management", included: true },
                    { text: "Billing & Invoices", included: true },
                    { text: "Advanced Reports", included: false },
                    { text: "Staff Management", included: false },
                    { text: "Customers/Udhar", included: false }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <X className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <span className={feature.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Options */}
                <div className="space-y-3">
                  {plans.basic.map((plan) => (
                    <motion.div
                      key={plan.duration}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{plan.duration} Months</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">₹{Math.round(plan.price / plan.duration)}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">₹{plan.price}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-emerald-600 dark:bg-emerald-600 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Popular Badge */}
              <div className="absolute top-6 right-6 bg-teal-400 dark:bg-teal-500 text-slate-900 dark:text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg z-10">
                ⭐ MOST POPULAR
              </div>

              <div className="p-8 border-b border-white/20">
                <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
                <p className="text-emerald-100">All features unlocked</p>
              </div>

              <div className="p-8">
                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    "All Basic Features",
                    "Advanced Reports & Analytics",
                    "Staff Management",
                    "Customers/Udhar Tracking",
                    "Priority Support",
                    "Multi-User Access"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Options */}
                <div className="space-y-3">
                  {plans.premium.map((plan) => (
                    <motion.div
                      key={plan.duration}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white">{plan.duration} Months</p>
                          <p className="text-sm text-emerald-100">₹{Math.round(plan.price / plan.duration)}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">₹{plan.price}</p>
                          <p className="text-xs text-emerald-100">Save ₹1,500</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToSubscription}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              View All Plans & Subscribe
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-600 dark:text-slate-400">
              <span>💳 Secure UPI Payment</span>
              <span>•</span>
              <span>🔒 100% Refundable Deposit</span>
              <span>•</span>
              <span>📞 24/7 Support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-6xl mb-6"
          >
            🚀
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('landing.readyToTransform')}
          </h2>

          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            {t('landing.transformDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToTrial}
              className="px-10 py-4 bg-white text-emerald-900 rounded-2xl font-bold text-lg shadow-2xl hover:bg-emerald-50 transition-all inline-flex items-center justify-center gap-2"
            >
              {t('landing.startTrialToday')}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToSubscription}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg border-2 border-emerald-500 hover:bg-emerald-700 transition-all"
            >
              View Pricing
            </motion.button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-emerald-200">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Free 7-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>24/7 support</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
