import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { personas } from '../mockData';

interface AuthContextType {
  user: UserProfile;
  switchRole: (role: UserRole) => void;
  canAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Executive (Sarah)
  const [user, setUser] = useState<UserProfile>(personas[0]);

  const switchRole = (role: UserRole) => {
    const newUser = personas.find(p => p.role === role);
    if (newUser) {
      setUser(newUser);
    }
  };

  const canAccess = (path: string): boolean => {
    // Check if the path starts with any allowed route
    // This allows sub-paths e.g., /chat/123 if /chat is allowed
    // Also handling root path '/'
    if (path === '/') return true;
    return user.allowedRoutes.some(route => 
      route !== '/' && path.startsWith(route)
    );
  };

  return (
    <AuthContext.Provider value={{ user, switchRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};