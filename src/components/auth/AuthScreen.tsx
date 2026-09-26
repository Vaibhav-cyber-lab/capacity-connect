import React, { useState } from 'react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { BookOpen, KeyRound, Mail, User as UserIcon, ArrowLeft } from 'lucide-react';

export const AuthScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('trainee');
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isLogin) {
      const user = storage.getUserByEmail(email);
      if (user && user.password === password) {
        login(user);
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } else {
      const existingUser = storage.getUserByEmail(email);
      if (existingUser) {
        setError('Email address is already registered.');
        return;
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password,
        role,
        status: 'approved' as const,
        createdAt: new Date().toISOString(),
        profile: {}
      };
      
      storage.saveUser(newUser);
      login(newUser);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      
      {/* Left Side (Branding & Abstract Background) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,100 L0,100 Z" fill="#ffffff" />
          </svg>
          <div className="absolute top-[30%] left-[20%] w-[30%] aspect-square bg-white rounded-full opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-[70%] left-[80%] w-[40%] aspect-square bg-white rounded-full opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl mr-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight leading-none">CAPACITY</h1>
              <h1 className="text-4xl font-black tracking-tight leading-none text-blue-300">CONNECT</h1>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-6 leading-snug">
            Empower your organization with intelligent learning.
          </h2>
          <p className="text-indigo-100 text-lg leading-relaxed">
            The premium capacity building platform for seamless training, dynamic assessments, and verifiable certifications.
          </p>
        </div>
      </div>

      {/* Right Side (Forms) */}
      <div className="w-full lg:w-1/2 flex flex-col relative justify-center">
        
        {/* Back to Home Link */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 sm:left-12 flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
        )}

        <div className="w-full max-w-md mx-auto px-6 sm:px-12">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="flex lg:hidden items-center justify-center mb-10 text-indigo-700">
            <BookOpen className="w-8 h-8 mr-2 text-indigo-600" />
            <span className="text-2xl font-black tracking-tight">CAPACITY CONNECT</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create your Account'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Please enter your details to sign in.' : 'Join the platform to start learning or teaching.'}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-start">
              <svg className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Account Type</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="trainee">Trainee (I want to learn)</option>
                    <option value="trainer">Trainer (I want to teach)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-0.5 transition-all"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                {isLogin ? 'Create a new account' : 'Sign in instead'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
