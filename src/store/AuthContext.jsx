// import { createContext, useContext, useState, useEffect } from 'react';
// import { authService } from '../services/authService';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Check if user is logged in on app start
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');

//     if (token && userData) {
//       setUser(JSON.parse(userData));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await authService.login(credentials);
//       const { token, ...userData } = response;

//       // Store token and user data
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(userData));

//       setUser(userData);
//       toast.success('Login successful!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const signup = async (userData) => {
//     try {
//       const response = await authService.signup(userData);
//       const { token, ...userInfo } = response;

//       // Store token and user data
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(userInfo));

//       setUser(userInfo);
//       toast.success('Account created successfully!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Signup failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     toast.success('Logged out successfully');
//   };

//   const value = {
//     user,
//     login,
//     signup,
//     logout,
//     isAuthenticated: !!user,
//     isOwner: user?.role === 'owner',
//     isStaff: user?.role === 'staff',
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔍 Check token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // ✅ Reject expired access tokens — try silent refresh
        if (decoded.exp * 1000 < Date.now()) {
          silentRefresh();
        } else {
          setUser(decoded);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    }

    setLoading(false);
  }, []);

  // 🔄 SILENT REFRESH — use refresh token to get new access token
  const silentRefresh = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) return;

      const response = await authService.refreshToken(storedRefreshToken);
      if (response?.token) {
        localStorage.setItem("token", response.token);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }
        const decoded = jwtDecode(response.token);
        setUser(decoded);
      }
    } catch {
      // Silent failure — user will be prompted to log in
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  };

  // 🔐 LOGIN
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, refreshToken: rt, trialExpired, subscriptionExpired, warningMessage } = response;

      localStorage.setItem("token", token);
      if (rt) localStorage.setItem("refreshToken", rt);

      const decoded = jwtDecode(token);
      setUser(decoded);

      if (trialExpired || subscriptionExpired) {
        return { 
          success: true, 
          redirectTo: '/subscription',
          trialExpired,
          subscriptionExpired,
          warningMessage
        };
      }

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🆕 SIGNUP
  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { token, refreshToken: rt } = response;

      localStorage.setItem("token", token);
      if (rt) localStorage.setItem("refreshToken", rt);

      const decoded = jwtDecode(token);
      setUser(decoded);

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🔵 GOOGLE OAUTH
  const googleLogin = async (credential, shopData = null) => {
    try {
      const response = await authService.googleAuth(credential, shopData);
      const { token, refreshToken: rt, trialExpired, subscriptionExpired, warningMessage, requiresShopData } = response;

      if (requiresShopData) {
        return { 
          success: false, 
          requiresShopData: true,
          message: "Please provide shop information to complete signup"
        };
      }

      localStorage.setItem("token", token);
      if (rt) localStorage.setItem("refreshToken", rt);

      const decoded = jwtDecode(token);
      setUser(decoded);

      if (trialExpired || subscriptionExpired) {
        return { 
          success: true, 
          redirectTo: '/subscription',
          trialExpired,
          subscriptionExpired,
          warningMessage
        };
      }

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Google authentication failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    toast.success("Logged out successfully");
  };

 const value = {
  user,
  loading,
  login,
  signup,
  googleLogin,
  logout,
  isAuthenticated: !!user,
  isOwner: user?.role === "owner",
  isStaff: user?.role === "staff",
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
