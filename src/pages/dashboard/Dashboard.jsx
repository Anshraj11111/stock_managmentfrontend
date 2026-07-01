import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Package, Users, Receipt, TrendingUp, DollarSign,
  ArrowRight, BarChart3, ShoppingCart, AlertCircle,
  Activity, Calendar, Layers, ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Theme-aware style helpers
// ─────────────────────────────────────────────────────────────────────────────
const getStyles = (isDark) => ({
  page:       isDark ? '#0d1117' : '#f0f4ff',
  card:       isDark ? 'rgba(22,27,34,0.75)'   : 'rgba(255,255,255,0.85)',
  cardBorder: isDark ? 'rgba(48,54,61,0.8)'    : 'rgba(219,234,254,0.9)',
  cardHover:  isDark ? 'rgba(28,35,51,0.9)'    : 'rgba(239,246,255,0.95)',
  borderHover:isDark ? 'rgba(56,139,253,0.5)'  : 'rgba(59,130,246,0.5)',
  textPrimary:isDark ? '#e6edf3'  : '#0f172a',
  textSecond: isDark ? '#8b949e'  : '#64748b',
  textMuted:  isDark ? '#6e7681'  : '#94a3b8',
  accent:     '#2563eb',
  accentLight:isDark ? '#388bfd'  : '#3b82f6',
  heroBg:     isDark
    ? 'linear-gradient(135deg,#0d1a3a 0%,#0d2046 50%,#0a1628 100%)'
    : 'linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#e0f2fe 100%)',
  heroBorder: isDark ? 'rgba(31,111,235,0.3)' : 'rgba(147,197,253,0.6)',
  heroTitle:  isDark ? '#ffffff'  : '#1e3a8a',
  heroSub:    isDark ? '#93c5fd'  : '#3b82f6',
  heroBody:   isDark ? '#6e9fcf'  : '#64748b',
  badgeBg:    isDark ? 'rgba(31,111,235,0.2)' : 'rgba(219,234,254,0.8)',
  badgeBorder:isDark ? 'rgba(56,139,253,0.3)' : 'rgba(147,197,253,0.8)',
  badgeText:  isDark ? '#93c5fd' : '#1d4ed8',
  miniWidget: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
  miniWidgetBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(147,197,253,0.5)',
  progressBg: isDark ? '#21262d' : '#e2e8f0',
  actionBg:   isDark ? 'rgba(22,27,34,0.7)' : 'rgba(255,255,255,0.8)',
  actionBorder:isDark ? 'rgba(48,54,61,0.8)': 'rgba(219,234,254,0.9)',
  sectionLine:isDark
    ? 'linear-gradient(90deg,rgba(37,99,235,0.5),transparent)'
    : 'linear-gradient(90deg,rgba(59,130,246,0.4),transparent)',
});

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────────────────
const Counter = ({ value, prefix = '', suffix = '' }) => {
  const ref = useRef(null);
  const objRef = useRef({ val: 0 });

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    gsap.to(objRef.current, {
      val: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.round(objRef.current.val).toLocaleString()}${suffix}`;
        }
      },
    });
  }, [value]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, badge, badgeColor, subtext, glowColor, onClick, isDark, s }) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        gsap.to(cardRef.current, { scale: 1.02, duration: 0.2, ease: 'power1.out' });
      }}
      onMouseLeave={() => {
        setHovered(false);
        gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' });
      }}
      className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300"
      style={{
        background: hovered ? s.cardHover : s.card,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? s.borderHover : s.cardBorder}`,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,${isDark ? 0.4 : 0.1}), 0 0 20px ${glowColor}22`
          : `0 2px 12px rgba(0,0,0,${isDark ? 0.3 : 0.06})`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Glow orb */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: glowColor, opacity: hovered ? 0.18 : 0.08 }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${glowColor}18`, border: `1px solid ${glowColor}33` }}>
            <Icon className="w-5 h-5" style={{ color: glowColor }} />
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}33` }}>
              {badge}
            </span>
          )}
        </div>

        <p className="text-xs font-medium mb-1" style={{ color: s.textSecond }}>{title}</p>
        <p className="text-2xl font-bold mb-2" style={{ color: s.textPrimary }}>
          {typeof value === 'string' && value.startsWith('₹')
            ? <><span>₹</span><Counter value={parseFloat(value.replace(/[^0-9.]/g, '')) || 0} /></>
            : <Counter value={typeof value === 'number' ? value : 0} />
          }
        </p>

        {subtext && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: s.textMuted }}>
            <Activity className="w-3 h-3" />
            <span>{subtext}</span>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-500 rounded-b-2xl"
        style={{
          background: `linear-gradient(90deg,${glowColor},transparent)`,
          width: hovered ? '100%' : '0%',
        }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Action Card
// ─────────────────────────────────────────────────────────────────────────────
const ActionCard = ({ icon: Icon, title, description, gradient, shadowColor, onClick, isDark, s }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        gsap.to(ref.current, { y: -4, duration: 0.2, ease: 'power1.out' });
      }}
      onMouseLeave={() => {
        setHovered(false);
        gsap.to(ref.current, { y: 0, duration: 0.2, ease: 'power1.out' });
      }}
      className="group relative rounded-2xl p-5 text-left overflow-hidden w-full transition-all duration-300"
      style={{
        background: s.actionBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? s.borderHover : s.actionBorder}`,
        boxShadow: hovered
          ? `0 16px 40px rgba(0,0,0,${isDark ? 0.4 : 0.12}), 0 0 20px ${shadowColor}22`
          : `0 2px 12px rgba(0,0,0,${isDark ? 0.25 : 0.06})`,
      }}
    >
      {/* Shine sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      {/* Background gradient on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: isDark ? `${shadowColor}0a` : `${shadowColor}08` }} />

      {/* Glow orb */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
        style={{ background: gradient }} />

      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ background: gradient, boxShadow: `0 4px 16px ${shadowColor}40` }}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <h3 className="font-bold text-sm mb-1" style={{ color: s.textPrimary }}>{title}</h3>
        <p className="text-xs mb-4" style={{ color: s.textSecond }}>{description}</p>

        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: s.accentLight }}>
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { isOwner, user } = useAuth();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const s         = getStyles(isDark);

  const heroRef   = useRef(null);
  const pageRef   = useRef(null);

  const [stats, setStats]   = useState({ totalProducts: 0, totalSales: 0, totalBills: 0, lowStockProducts: 0 });
  const [loading, setLoading] = useState(true);
  const [time, setTime]     = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { fetchDashboardData(); }, []);

  // Hero entrance animation
  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      const [productsResponse, todayReport] = await Promise.all([
        productService.getProducts(),
        reportService.getDailyReport(),
      ]);

      const products = Array.isArray(productsResponse)
        ? productsResponse
        : (productsResponse?.products || []);

      const today = todayReport || {};

      setStats({
        totalProducts:    products.length,
        totalSales:       today.total_sales || 0,
        totalBills:       today.total_bills || 0,
        lowStockProducts: products.filter(p => {
          const qty = parseFloat(String(p.stock_quantity).replace(/[^0-9.]/g, '')) || 0;
          return qty < (p.low_stock_threshold || 10) && qty > 0;
        }).length,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader size="lg" />
      </div>
    );
  }

  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hour    = time.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const statCards = [
    ...(isOwner ? [{
      icon: DollarSign, title: 'Total Revenue',
      value: `₹${Math.round(stats.totalSales).toLocaleString()}`,
      badge: '+12.5%', badgeColor: '#22c55e',
      subtext: 'vs last month', glowColor: '#2563eb',
    }] : []),
    {
      icon: ShoppingCart, title: 'Total Orders',
      value: stats.totalBills,
      badge: '+8.2%', badgeColor: '#3b82f6',
      subtext: 'Click to view details', glowColor: '#3b82f6',
      onClick: () => navigate('/reports'),
    },
    {
      icon: Package, title: 'Products',
      value: stats.totalProducts,
      badge: '+3.1%', badgeColor: '#8b5cf6',
      subtext: 'vs last month', glowColor: '#8b5cf6',
    },
    ...(isOwner ? [{
      icon: AlertCircle, title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      badge: stats.lowStockProducts > 0 ? 'Needs Attention' : 'All Good',
      badgeColor: stats.lowStockProducts > 0 ? '#f59e0b' : '#22c55e',
      subtext: 'vs last month',
      glowColor: stats.lowStockProducts > 0 ? '#f59e0b' : '#22c55e',
      onClick: () => navigate('/products'),
    }] : []),
  ];

  const quickActions = [
    {
      icon: Receipt, title: 'Create Bill',
      description: 'Generate new invoice',
      gradient: 'linear-gradient(135deg,#2563eb,#3b82f6)',
      shadowColor: '#2563eb', route: '/billing',
    },
    {
      icon: Package, title: 'Manage Products',
      description: 'Update inventory',
      gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
      shadowColor: '#1d4ed8', route: '/products',
    },
    ...(isOwner ? [
      {
        icon: BarChart3, title: 'View Reports',
        description: 'Analytics & insights',
        gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
        shadowColor: '#7c3aed', route: '/reports',
      },
      {
        icon: Users, title: 'Manage Staff',
        description: 'Team management',
        gradient: 'linear-gradient(135deg,#db2777,#ec4899)',
        shadowColor: '#db2777', route: '/staff',
      },
    ] : []),
  ];

  return (
    <div ref={pageRef} className="space-y-6">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: s.heroBg,
          border: `1px solid ${s.heroBorder}`,
          boxShadow: isDark
            ? '0 0 40px rgba(31,111,235,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 4px 24px rgba(59,130,246,0.1)',
        }}
      >
        {/* Animated blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle,rgba(37,99,235,0.25),transparent 70%)' : 'radial-gradient(circle,rgba(147,197,253,0.4),transparent 70%)' }} />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ background: isDark ? 'radial-gradient(circle,rgba(56,139,253,0.15),transparent 70%)' : 'radial-gradient(circle,rgba(191,219,254,0.5),transparent 70%)', animationDelay: '1s' }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.15) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            {/* Greeting badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ background: s.badgeBg, border: `1px solid ${s.badgeBorder}` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: s.accentLight }} />
              <span className="text-xs font-semibold" style={{ color: s.badgeText }}>{greeting} 👋</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: s.heroTitle }}>
              Welcome back, <span style={{ color: s.accentLight }}>{user?.name}</span>!
            </h1>

            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: s.heroSub }}>
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>

            <p className="text-sm" style={{ color: s.heroBody }}>
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Right mini widgets */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { label: 'Revenue', val: `₹${Math.round(stats.totalSales).toLocaleString()}`, icon: TrendingUp, color: s.accentLight },
              { label: 'Orders',  val: stats.totalBills, icon: ShoppingCart, color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label}
                className="flex flex-col items-center gap-1 px-5 py-4 rounded-xl"
                style={{ background: s.miniWidget, border: `1px solid ${s.miniWidgetBorder}`, backdropFilter: 'blur(8px)' }}
              >
                <item.icon className="w-4 h-4 mb-1" style={{ color: item.color }} />
                <span className="text-lg font-bold" style={{ color: s.textPrimary }}>{item.val}</span>
                <span className="text-xs" style={{ color: s.textMuted }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} isDark={isDark} s={s} />
        ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-base font-bold whitespace-nowrap" style={{ color: s.textPrimary }}>
            Quick Actions
          </h2>
          <div className="flex-1 h-px" style={{ background: s.sectionLine }} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <ActionCard
              key={i}
              icon={action.icon}
              title={action.title}
              description={action.description}
              gradient={action.gradient}
              shadowColor={action.shadowColor}
              onClick={() => navigate(action.route)}
              isDark={isDark}
              s={s}
            />
          ))}
        </div>
      </div>

      {/* ── BOTTOM WIDGETS ───────────────────────────────────────────────── */}
      {isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Package,
              title: 'Inventory Health',
              sub: 'Stock status',
              value: stats.lowStockProducts,
              label: 'items need restocking',
              color: stats.lowStockProducts > 0 ? '#f59e0b' : '#22c55e',
              pct: stats.totalProducts > 0 ? (stats.lowStockProducts / stats.totalProducts) * 100 : 0,
              pctGradient: 'linear-gradient(90deg,#f59e0b,#f87171)',
              ctaLabel: 'View Products',
              ctaColor: '#f59e0b',
              route: '/products',
            },
            {
              icon: DollarSign,
              title: "Today's Sales",
              sub: 'Revenue generated',
              value: `₹${Math.round(stats.totalSales).toLocaleString()}`,
              label: `from ${stats.totalBills} transaction${stats.totalBills !== 1 ? 's' : ''}`,
              color: s.accentLight,
              pct: 100,
              pctGradient: 'linear-gradient(90deg,#2563eb,#3b82f6)',
              ctaLabel: 'View Reports',
              ctaColor: s.accentLight,
              route: '/reports',
            },
            {
              icon: Layers,
              title: 'Total Products',
              sub: 'Active in inventory',
              value: stats.totalProducts,
              label: 'products managed',
              color: '#8b5cf6',
              pct: 100,
              pctGradient: 'linear-gradient(90deg,#7c3aed,#8b5cf6)',
              ctaLabel: 'Manage Products',
              ctaColor: '#8b5cf6',
              route: '/products',
            },
          ].map((w, i) => (
            <div key={i}
              className="rounded-2xl p-5 transition-all duration-300"
              style={{
                background: s.card,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${s.cardBorder}`,
                boxShadow: `0 2px 12px rgba(0,0,0,${isDark ? 0.3 : 0.06})`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${w.color}18`, border: `1px solid ${w.color}33` }}>
                  <w.icon className="w-4 h-4" style={{ color: w.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: s.textPrimary }}>{w.title}</h3>
                  <p className="text-xs" style={{ color: s.textMuted }}>{w.sub}</p>
                </div>
              </div>

              <div className="text-2xl font-bold mb-1" style={{ color: s.textPrimary }}>{w.value}</div>
              <p className="text-xs mb-4" style={{ color: s.textSecond }}>{w.label}</p>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full mb-4" style={{ background: s.progressBg }}>
                <div className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, w.pct)}%`, background: w.pctGradient }} />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: w.color }}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.5% vs last month</span>
              </div>

              <button
                onClick={() => navigate(w.route)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold group transition-opacity duration-200 hover:opacity-70"
                style={{ color: w.ctaColor }}
              >
                {w.ctaLabel}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
