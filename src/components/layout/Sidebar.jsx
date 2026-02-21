import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  X,
  Sparkles,
  Plus,
  Wallet,
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../store/AuthContext";
import { cn } from "../../utils/cn";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isOwner } = useAuth();

  const navigation = [
    {
      name: t('sidebar.dashboard'),
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: t('sidebar.products'),
      href: "/products",
      icon: Package,
      current: location.pathname === "/products",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      name: t('sidebar.billing'),
      href: "/billing",
      icon: Receipt,
      current: location.pathname === "/billing",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      name: "Customers (Udhar)",
      href: "/customers",
      icon: Wallet,
      current: location.pathname.startsWith("/customers"),
      gradient: "from-red-500 to-orange-600",
    },
  
    

    // ✅ OWNER ONLY STAFF SECTION
    ...(isOwner
      ? [
          {
            name: t('sidebar.staff'),
            href: "/staff",
            icon: Users,
            current: location.pathname === "/staff",
            gradient: "from-orange-500 to-red-600",
          },
          {
            name: t('sidebar.addStaff'),
            href: "/staff?add=true",
            icon: Plus,
            current:
              location.pathname === "/staff" &&
              location.search.includes("add=true"),
            gradient: "from-pink-500 to-rose-600",
          },
          {
            name: t('sidebar.reports'),
            href: "/reports",
            icon: BarChart3,
            current: location.pathname === "/reports",
            gradient: "from-emerald-500 to-teal-600",
          },
          {
            name: t('sidebar.invoices'),
            href: "/invoices",
            icon: FileText,
            current: location.pathname === "/invoices",
            gradient: "from-cyan-500 to-blue-600",
          },
        ]
      : []),

    {
      name: t('sidebar.settings'),
      href: "/settings",
      icon: Settings,
      current: location.pathname === "/settings",
      gradient: "from-gray-500 to-slate-600",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-950 border-r border-secondary-200 dark:border-secondary-800 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200 dark:border-secondary-800 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">StockSaaS</h1>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/20 lg:hidden"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300",
                  item.current
                    ? "bg-gradient-to-r " +
                        item.gradient +
                        " text-white shadow-lg transform scale-[1.02]"
                    : "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:transform hover:scale-[1.02]"
                )}
                onClick={() => onToggle()}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {item.current && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full"></div>
                )}

                <div
                  className={cn(
                    "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300",
                    item.current
                      ? "bg-white/20 shadow-lg"
                      : "bg-secondary-100 dark:bg-secondary-900 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      item.current
                        ? "text-white"
                        : "text-secondary-600 dark:text-secondary-400 group-hover:text-secondary-700 dark:group-hover:text-secondary-300"
                    )}
                  />
                </div>

                <span className="flex-1 text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-6 border-t border-secondary-200 dark:border-secondary-800">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 text-white text-sm shadow-lg">
            <div className="font-semibold mb-1">{t('sidebar.premiumPlan')}</div>
            <div className="text-xs opacity-90 leading-relaxed">
              {t('sidebar.unlimitedAccess')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
