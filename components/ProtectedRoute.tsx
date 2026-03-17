import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  routePath: string; // The path this route represents
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, routePath }) => {
  const { canAccess, user } = useAuth();

  if (!canAccess(routePath)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="w-16 h-16 bg-[#1e1e24] rounded-full flex items-center justify-center mb-6 border border-[#27272a]">
           <Lock size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-center max-w-md mb-8">
          The persona <strong>{user.title}</strong> ({user.role}) does not have permissions to access the <strong>{routePath}</strong> module.
        </p>
        <div className="p-4 bg-[#1e1e24] rounded-lg border border-[#27272a] text-sm text-gray-400">
           <p>RBAC Policy Enforced by Identity Provider.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;