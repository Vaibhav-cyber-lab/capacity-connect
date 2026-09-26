import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Home } from 'lucide-react';
import { RealTimeClock } from '../common/RealTimeClock';

export const Layout: React.FC<{ children: React.ReactNode, onNavigateHome?: () => void }> = ({ children, onNavigateHome }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-700 tracking-tight">CAPACITY CONNECT</h1>
              <span className="ml-4 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 uppercase">
                {user?.role} Portal
              </span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <RealTimeClock variant="nav" />
              {onNavigateHome && (
                <button 
                  onClick={onNavigateHome}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4 mr-1.5" />
                  Navigation Hub
                </button>
              )}
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-1.5 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
