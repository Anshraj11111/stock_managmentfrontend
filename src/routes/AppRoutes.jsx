import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Layout from '../components/layout/Layout';

// Auth pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Protected pages
import Dashboard from '../pages/dashboard/Dashboard';
import Products from '../pages/products/Products';
import Staff from '../pages/staff/Staff';
import Billing from '../pages/billing/Billing';
import Reports from '../pages/reports/Reports';
import Invoices from '../pages/invoices/Invoices';
import Settings from '../pages/settings/Settings';

// Protected Route component
const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { isAuthenticated, isOwner } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireOwner>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
