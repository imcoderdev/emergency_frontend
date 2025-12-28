import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
  citizen: 1,
  responder: 2,
  admin: 3
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('emergencyHub_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('emergencyHub_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (role, name = '') => {
    const newUser = {
      role,
      name: name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      loginTime: new Date().toISOString(),
      id: `${role}_${Date.now()}`
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('emergencyHub_user', JSON.stringify(newUser));
    
    return newUser;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('emergencyHub_user');
  };

  // Check if user has required permission level
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  // Check if user is specific role
  const isRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    isRole,
    isCitizen: user?.role === 'citizen',
    isResponder: user?.role === 'responder',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
