import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, Receipt, BarChart3,
  FileText, Settings, X, Zap, Plus, Wallet, CreditCard,
  Lock, ClipboardList, ChevronUp,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../store/AuthContext";
import { useTheme } from "../../store/ThemeContext";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { getCurrentSubscription } from "../../services/subscriptionService";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isOwner } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [lockedFeatures, setLockedFeatures] = useState([]);
  const [planName, setPlanName] = useState('');

  // Theme-aware colors
  const bg         = isDark ? '#0d1117'  : '#ffffff';
  const border     = isDark ? '#21262d'  : '#e2e8f0';
  const textColor  = isDark ? '#8b949e'  : '#64748b';
  const hoverBg    = isDark ? '#161b22'  : '#f1f5f9';
  const hoverText  = isDark ? '#e6edf3'  : '#0f172a';
  const activeBg   = isDark ? 'rgba(37,99,235,0.12)' : 'rgba(219,234,254,0.7)';
  const activeBorder = isDark ? '#2563eb' : '#3b82f6';
  const activeText = isDark ? '#388bfd'  : '#2563eb';
  const badgeBg    = isDark ? 'linear-gradient(135deg,#1c2333,#1f2937)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)';
  const badgeBorder= isDark ? '#21262d'  : '#bfdbfe';
  const badgeAccent= isDark ? '#388bfd'  : '#2563eb';

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await getCurrentSubscription();
      setLockedFeatures(response.subscription.features_locked || []);
      setPlanName(response.subscription.plan_name || 'trial');
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const isFeatureLocked = (feature) => lockedFeatures.includes(feature);

  const navigation = [
    {
      name: t('sidebar.dashboard'),
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
    },
    {
      name: t('sidebar.products'),
      href: "/products",
      icon: Package,
      current: location.pathname.startsWith("/products"),
    },
    {
      name: t('sidebar.billing'),
      href: "/billing",
      icon: Receipt,
      current: location.pathname === "/billing",
    },
    {
      name: "Customers (Udhar)",
      href: "/customers",
      icon: Wallet,
      current: location.pathname.startsWith("/customers"),
      feature: "customers",
    },
    {
      name: "Quotations",
      href: "/quotations",
      icon: ClipboardList,
      current: location.pathname.startsWith("/quotations"),
    },
    ...(isOwner
      ? [
          {
            name: t('sidebar.staff'),
            href: "/staff",
            icon: Users,
            current: location.pathname === "/staff",
            feature: "staff",
          },
          {
            name: t('sidebar.reports'),
            href: "/reports",
            icon: BarChart3,
            current: location.pathname === "/reports",
            feature: "reports",
          },
          {
            name: t('sidebar.invoices'),
            href: "/invoices",
            icon: FileText,
            current: location.pathname === "/invoices",
          },
        ]
      : []),
    {
      name: t('sidebar.settings'),
      href: "/settings",
      icon: Settings,
      current: location.pathname === "/settings",
    },
  ];

  const planLabel = planName?.startsWith('premium') ? 'Premium Plan'
    : planName?.startsWith('business') ? 'Business Plan'
    : planName?.startsWith('starter')  ? 'Starter Plan'
    : planName?.startsWith('founder')  ? '🔥 Founder Plan'
    : 'Free Trial';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: bg,
          borderRight: `1px solid ${border}`,
          boxShadow: isDark ? 'none' : '2px 0 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* ── Logo Header ── */}
        <div
          className="flex items-center justify-between h-16 px-5"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold" style={{ color: isDark ? '#e6edf3' : '#0f172a' }}>
              StockSaaS
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg lg:hidden transition-colors"
            style={{ color: textColor }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const locked = item.feature && isFeatureLocked(item.feature);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onToggle}
                className={cn("group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 relative", locked && "opacity-60")}
                style={
                  item.current
                    ? { backgroundColor: activeBg, borderLeft: `3px solid ${activeBorder}`, paddingLeft: '9px', color: activeText }
                    : { color: textColor, borderLeft: '3px solid transparent' }
                }
                onMouseEnter={e => {
                  if (!item.current) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                    e.currentTarget.style.color = hoverText;
                  }
                }}
                onMouseLeave={e => {
                  if (!item.current) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = textColor;
                  }
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm">{item.name}</span>
                {locked && <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#6e7681' : '#94a3b8' }} />}
              </Link>
            );
          })}
        </nav>

        {/* ── Plan Badge ── */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ borderTop: `1px solid ${border}`, backgroundColor: bg }}
        >
          <div
            className="rounded-xl p-4 relative overflow-hidden"
            style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
              style={{ background: 'linear-gradient(90deg,#2563eb,#3b82f6)' }}
            />
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: badgeAccent }}>
                {planLabel}
              </span>
              <ChevronUp className="w-3.5 h-3.5" style={{ color: isDark ? '#6e7681' : '#94a3b8' }} />
            </div>
            <p className="text-xs" style={{ color: isDark ? '#6e7681' : '#64748b' }}>
              {t('sidebar.unlimitedAccess')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
