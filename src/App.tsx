/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { LandingPage } from './components/layout/LandingPage';
import { HomeDashboard } from './components/dashboards/HomeDashboard';

function AppContent() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (!user) {
    if (showAuth) return <AuthScreen onBack={() => setShowAuth(false)} />;
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      <HomeDashboard />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

