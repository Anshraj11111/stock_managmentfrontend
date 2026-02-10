import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../utils/cn';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { isOwner } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboard',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      current: location.pathname === '/products',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: Receipt,
      current: location.pathname === '/billing',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: location.pathname === '/reports',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      current: location.pathname === '/invoices',
      gradient: 'from-cyan-500 to-blue-600',
    },
    ...(isOwner
      ? [
          {
            name: 'Staff',
            href: '/staff',
            icon: Users,
            current: location.pathname === '/staff',
            gradient: 'from-orange-500 to-red-600',
          },
        ]
      : []),
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
      gradient: 'from-gray-500 to-slate-600',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out lg:translate-x-0  shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">StockSaaS</h1>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300',
                  item.current
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                )}
                onClick={() => onToggle()}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {item.current && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}

                {/* Icon with animation */}
                <div className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300',
                  item.current 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                )}>
                  <Icon className={cn(
                    'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                    item.current ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  )} />
                  
                  {/* Pulse effect on active */}
                  {item.current && (
                    <div className="absolute inset-0 rounded-lg bg-white/30 animate-ping"></div>
                  )}
                </div>

                {/* Text */}
                <span className="flex-1">{item.name}</span>

                {/* Hover arrow */}
                {!item.current && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom decoration */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <p className="text-white font-semibold text-sm mb-1">Premium Plan</p>
              <p className="text-white/80 text-xs">Unlimited access to all features</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
