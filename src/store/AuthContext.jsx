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
        console.log("Decoded token:", decoded); // Debug log
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token } = response;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      setUser(decoded);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🆕 SIGNUP
  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { token } = response;

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      setUser(decoded);

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  };

 const value = {
  user,
  loading,
  login,
  signup,
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
