import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import Layout from "../components/layout/Layout";

// Admin imports
import { AdminAuthProvider } from "../admin/context/AdminAuthContext";
import AdminRoute from "../admin/components/AdminRoute";
import AdminLogin from "../admin/pages/AdminLogin";
import AdminSignup from "../admin/pages/AdminSignup";
import AdminDashboard from "../admin/pages/AdminDashboard";
import AdminUsers from "../admin/pages/AdminUsers";
import AdminShops from "../admin/pages/AdminShops";
import AdminAnalytics from "../admin/pages/AdminAnalytics";

// Auth pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Protected pages
import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/products/Products";
import Staff from "../pages/staff/Staff";
import Billing from "../pages/billing/Billing";
import Reports from "../pages/reports/Reports";
import Invoices from "../pages/invoice/Invoice";
import Settings from "../pages/settings/Settings";
import Landing from "../pages/auth/Landing";
import Customers from "../pages/customers/Customers";
import CustomerDetail from "../pages/customers/CustomerDetail";

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { isAuthenticated, isOwner, loading } = useAuth();

  if (loading) {
    return null; // wait until token check complete
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>

      {/* 👇 Smart root redirect - if logged in go to dashboard, else landing */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/landing" replace />
          )
        } 
      />

      {/* ================= ADMIN ROUTES (Completely Isolated) ================= */}
      <Route path="/admin/login" element={
        <AdminAuthProvider>
          <AdminLogin />
        </AdminAuthProvider>
      } />
      
      <Route path="/admin/signup" element={
        <AdminAuthProvider>
          <AdminSignup />
        </AdminAuthProvider>
      } />
      
      <Route path="/admin/dashboard" element={
        <AdminAuthProvider>
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </AdminAuthProvider>
      } />

      <Route path="/admin/users" element={
        <AdminAuthProvider>
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        </AdminAuthProvider>
      } />

      <Route path="/admin/shops" element={
        <AdminAuthProvider>
          <AdminRoute>
            <AdminShops />
          </AdminRoute>
        </AdminAuthProvider>
      } />

      <Route path="/admin/analytics" element={
        <AdminAuthProvider>
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        </AdminAuthProvider>
      } />

      {/* Redirect /admin to /admin/dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ================= USER ROUTES ================= */}
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/landing" element={<Landing />} />


      {/* Protected Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Layout>
              <Billing />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute requireOwner>
            <Layout>
              <Staff />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default AppRoutes;
