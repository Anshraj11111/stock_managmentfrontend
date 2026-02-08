import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
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
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      current: location.pathname === '/products',
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: Receipt,
      current: location.pathname === '/billing',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: location.pathname === '/reports',
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: FileText,
      current: location.pathname === '/invoices',
    },
    ...(isOwner
      ? [
          {
            name: 'Staff',
            href: '/staff',
            icon: Users,
            current: location.pathname === '/staff',
          },
        ]
      : []),
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 glass-card transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200 dark:border-secondary-700">
          <h1 className="text-xl font-bold text-primary-600">StockSaaS</h1>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'sidebar-link',
                item.current && 'active'
              )}
              onClick={() => onToggle()} // Close mobile menu on navigation
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
