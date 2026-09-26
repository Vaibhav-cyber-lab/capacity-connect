import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/storage';
import { 
  Home, 
  BookOpen, 
  Library, 
  CheckSquare, 
  BarChart2, 
  Award, 
  User as UserIcon, 
  Bell, 
  MessageSquare, 
  LogOut, 
  ArrowRight, 
  Users, 
  Settings, 
  PlayCircle, 
  PlusCircle, 
  Upload, 
  Book, 
  Target, 
  LayoutDashboard, 
  RotateCw, 
  CheckCircle2, 
  Menu, 
  X,
  Flame,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Lightbulb,
  FileText
} from 'lucide-react';

import { AdminDashboard } from './AdminDashboard';
import { TrainerDashboard } from './TrainerDashboard';
import { TraineeDashboard } from './TraineeDashboard';
import { TopNavBar } from '../common/TopNavBar';
import { RealTimeClock } from '../common/RealTimeClock';
import { AITutorWidget } from '../ai/AITutorWidget';
import { PracticeQuizModule } from '../quiz/PracticeQuizModule';
import { GamificationDashboard } from '../gamification/GamificationDashboard';
import { ResourceHub } from '../resources/ResourceHub';
import { Assessment, Course, GamificationStats, Flashcard, CheatSheet, QuickNote } from '../../types';

export const HomeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<string>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Tutor Slide-over State
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiTutorInitialTopic, setAiTutorInitialTopic] = useState('');
  
  // Interactive Practice Quiz State
  const [activePracticeAssessment, setActivePracticeAssessment] = useState<Assessment | null>(null);

  // Gamification & Resources State
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>(() => storage.getGamificationStats());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => storage.getFlashcards());
  const [cheatSheets, setCheatSheets] = useState<CheatSheet[]>(() => storage.getCheatSheets());
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => storage.getQuickNotes());

  const refreshLocalData = () => {
    setGamificationStats(storage.getGamificationStats());
    setFlashcards(storage.getFlashcards());
    setCheatSheets(storage.getCheatSheets());
    setQuickNotes(storage.getQuickNotes());
  };

  useEffect(() => {
    const handleDataChange = () => {
      refreshLocalData();
    };

    window.addEventListener('capacity_data_changed', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('capacity_data_changed', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  if (!user) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshToast(true);
    storage.init();
    refreshLocalData();
    window.dispatchEvent(new CustomEvent('capacity_data_changed'));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
    setTimeout(() => {
      setRefreshToast(false);
    }, 3000);
  };

  const handleViewChange = (view: string) => {
    setActivePracticeAssessment(null);
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  // Gamification Handlers
  const handleCheckInDaily = () => {
    if (gamificationStats.hasCheckedInToday) return;

    const updated = storage.updateGamificationStats((prev) => {
      const newStreak = prev.streakDays + 1;
      const newXp = prev.xp + 25;
      return {
        ...prev,
        streakDays: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        xp: newXp,
        hasCheckedInToday: true,
      };
    });

    setGamificationStats(updated);
  };

  const handleCompleteQuiz = (score: number, maxScore: number, xpEarned: number) => {
    const percent = Math.round((score / maxScore) * 100);

    const updated = storage.updateGamificationStats((prev) => {
      const newXp = prev.xp + xpEarned;
      let newLevel = prev.level;
      let nextXp = prev.nextLevelXp;

      if (newXp >= nextXp) {
        newLevel += 1;
        nextXp = Math.round(nextXp * 1.5);
      }

      // Check badges
      const updatedBadges = prev.badges.map((b) => {
        if (b.id === 'badge_3' && percent >= 90) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return b;
      });

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: nextXp,
        completedQuizzesCount: prev.completedQuizzesCount + 1,
        badges: updatedBadges,
      };
    });

    setGamificationStats(updated);
  };

  const handleToggleFlashcardMastered = (id: string) => {
    storage.toggleFlashcardMastered(id);
    setFlashcards(storage.getFlashcards());
  };

  const handleOpenAITutor = (topic?: string) => {
    if (topic) setAiTutorInitialTopic(topic);
    setIsAITutorOpen(true);
  };

  const handleLaunchPracticeQuiz = (assessment: Assessment) => {
    setActivePracticeAssessment(assessment);
  };

  // Stats fetching from local storage for summary cards
  const courses = storage.getCourses();
  const enrollments = storage.getEnrollmentsByTrainee(user.id);
  const assessments = storage.getAllAssessments();
  const announcements = storage.getAnnouncements();
  
  const activeCoursesCount = user.role === 'admin' 
    ? courses.length 
    : user.role === 'trainer' 
      ? courses.filter(c => c.trainerId === user.id).length
      : enrollments.filter(e => e.status === 'enrolled').length;

  const pendingAssessmentsCount = assessments.length;
  const notificationsCount = announcements.length;

  // Trainee navigation
  const renderSidebarLinks = () => {
    if (user.role === 'admin') {
      return (
        <>
          <button onClick={() => handleViewChange('home')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3 text-current" /> Home Dashboard
          </button>
          <button onClick={() => handleViewChange('users')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3 text-current" /> User Management
          </button>
          <button onClick={() => handleViewChange('courses')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'courses' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen className="w-5 h-5 mr-3 text-current" /> Course Monitor
          </button>
          <button onClick={() => handleViewChange('certificates')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'certificates' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Award className="w-5 h-5 mr-3 text-current" /> Certifications
          </button>
          <button onClick={() => handleViewChange('announcements')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Bell className="w-5 h-5 mr-3 text-current" /> Announcements
          </button>
          <button onClick={() => handleViewChange('advanced')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'advanced' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Target className="w-5 h-5 mr-3 text-current" /> Advanced Ops
          </button>
        </>
      );
    }
    
    if (user.role === 'trainer') {
      return (
        <>
          <button onClick={() => handleViewChange('home')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Home className="w-5 h-5 mr-3 text-current" /> Home Dashboard
          </button>
          <button onClick={() => handleViewChange('profile')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <UserIcon className="w-5 h-5 mr-3 text-current" /> My Profile
          </button>
          <button onClick={() => handleViewChange('courses')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'courses' || activeView === 'course_detail' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen className="w-5 h-5 mr-3 text-current" /> Course Management
          </button>
          <button onClick={() => handleViewChange('assessments')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'assessments' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <CheckSquare className="w-5 h-5 mr-3 text-current" /> Quizzes &amp; Questions
          </button>
          <button onClick={() => handleViewChange('monitor')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'monitor' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3 text-current" /> Trainee Monitoring
          </button>
          <button onClick={() => handleViewChange('feedback')} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeView === 'feedback' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <MessageSquare className="w-5 h-5 mr-3 text-current" /> Course Feedback
          </button>
        </>
      );
    }

    // Trainee / Student
    return (
      <>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Smart Modules
        </div>
        <button 
          onClick={() => handleViewChange('home')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'home' && !activePracticeAssessment ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mr-3 text-current" /> Dashboard Home
        </button>

        <button 
          onClick={() => handleViewChange('catalog')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'catalog' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-3 text-current" /> Course Catalog
        </button>

        <button 
          onClick={() => handleViewChange('learning')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'learning' || activeView === 'learning_course' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Library className="w-4 h-4 mr-3 text-current" /> Active Courses
        </button>

        <button 
          onClick={() => handleViewChange('practice_quizzes')} 
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'practice_quizzes' || activePracticeAssessment ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <CheckSquare className="w-4 h-4 mr-3 text-current" /> Practice Tests
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white">
            {assessments.length}
          </span>
        </button>

        <button 
          onClick={() => handleViewChange('gamification')} 
          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'gamification' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <Flame className="w-4 h-4 mr-3 text-orange-400" /> Habits &amp; Streaks
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/20 text-orange-300">
            {gamificationStats.streakDays}d
          </span>
        </button>

        <button 
          onClick={() => handleViewChange('resources')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'resources' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 mr-3 text-current" /> Resource Hub
        </button>

        <button 
          onClick={() => handleViewChange('performance')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'performance' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 mr-3 text-current" /> Analytics &amp; Scores
        </button>

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">
          Account &amp; Honors
        </div>

        <button 
          onClick={() => handleViewChange('certificates')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'certificates' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 mr-3 text-current" /> Certificates
        </button>

        <button 
          onClick={() => handleViewChange('profile')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4 mr-3 text-current" /> My Profile
        </button>

        <button 
          onClick={() => handleViewChange('feedback')} 
          className={`w-full flex items-center px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
            activeView === 'feedback' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-3 text-current" /> Course Feedback
        </button>
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Top Universal Navigation Bar */}
      <TopNavBar
        streakDays={gamificationStats.streakDays}
        xp={gamificationStats.xp}
        level={gamificationStats.level}
        courses={courses}
        assessments={assessments}
        flashcards={flashcards}
        cheatSheets={cheatSheets}
        onOpenAITutor={handleOpenAITutor}
        onSelectCourse={(course) => {
          handleViewChange('learning');
        }}
        onSelectAssessment={(assessment) => {
          handleLaunchPracticeQuiz(assessment);
        }}
        onNavigateSection={(section) => {
          handleViewChange(section);
        }}
      />

      <div className="flex-1 flex overflow-hidden relative w-full">
        
        {/* Mobile Sidebar overlay backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* Left Navigation Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 top-16 w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out z-40 shrink-0 border-r border-slate-800
          md:static md:translate-x-0 md:top-0
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          {/* Mobile Header in sidebar */}
          <div className="h-12 flex items-center justify-between px-4 bg-slate-950 md:hidden border-b border-slate-800 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-5">
            <nav className="space-y-1 px-3">
              {renderSidebarLinks()}
            </nav>
          </div>

          {/* Sidebar Footer Info with Live Real-Time */}
          <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500 space-y-2.5">
            <RealTimeClock variant="nav" className="w-full justify-center bg-slate-800/90 text-slate-200 border-slate-700/80 shadow-xs" />
            <div>
              <p className="font-semibold text-slate-400">Smart Education Platform</p>
              <p className="mt-0.5">Version 3.2 • Real-Time Active</p>
            </div>
          </div>
        </aside>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70 dark:bg-slate-950 relative">
          
          {/* Mobile Sidebar Toggle Button */}
          <div className="flex md:hidden items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
              {activeView.replace('_', ' ')}
            </span>
          </div>

          {/* ACTIVE PRACTICE QUIZ SCREEN */}
          {activePracticeAssessment ? (
            <PracticeQuizModule
              assessment={activePracticeAssessment}
              onComplete={handleCompleteQuiz}
              onExit={() => setActivePracticeAssessment(null)}
              onAskAITutor={(context) => handleOpenAITutor(context)}
            />
          ) : (
            <>
              {/* HOMEPAGE DASHBOARD */}
              {activeView === 'home' && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
                  
                  {/* Executive Ed-Tech Welcome Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                            Smart Education Academy • Level {gamificationStats.level} Scholar
                          </div>
                          <RealTimeClock variant="header" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                          Welcome back, {user.name.split(' ')[0]}!
                        </h1>
                        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                          {user.role === 'trainee' && "Level up your knowledge with interactive practice tests, 3D flashcards, and instant 24/7 AI tutor guidance."}
                          {user.role === 'trainer' && "Track your student cohorts, monitor live assessment outcomes, and manage instructional syllabi."}
                          {user.role === 'admin' && "Review comprehensive platform metrics, user access tiers, and institutional course completion standards."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {user.role === 'trainee' && (
                          <>
                            <button
                              onClick={() => handleViewChange('learning')}
                              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Continue Learning
                            </button>
                            <button
                              onClick={() => handleOpenAITutor()}
                              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 text-white"
                            >
                              <Sparkles className="w-4 h-4 text-blue-300" />
                              Ask AI Tutor
                            </button>
                          </>
                        )}
                        {user.role === 'trainer' && (
                          <button
                            onClick={() => handleViewChange('courses')}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Manage Courses
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Module Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    
                    {/* Module 1: Active Courses */}
                    <div 
                      onClick={() => handleViewChange('learning')}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Active Courses
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {activeCoursesCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>Enrolled modules</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                      </p>
                    </div>

                    {/* Module 2: Practice Tests */}
                    <div 
                      onClick={() => handleViewChange('practice_quizzes')}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Practice Tests
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {pendingAssessmentsCount}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>Timed with live hints</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                      </p>
                    </div>

                    {/* Module 3: Performance & Gamification */}
                    <div 
                      onClick={() => handleViewChange('gamification')}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-400 dark:hover:border-orange-600 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Study Streak
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {gamificationStats.streakDays} Days
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>{gamificationStats.xp} Total XP</span>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                      </p>
                    </div>

                    {/* Module 4: AI Tutor */}
                    <div 
                      onClick={() => handleOpenAITutor()}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-xs hover:border-indigo-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Real &amp; Sateek AI
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                          <Sparkles className="w-4 h-4 text-blue-200" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Fact-Checked
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center justify-between font-semibold">
                        <span>Google Search Grounded &bull; Hindi/Eng</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                      </p>
                    </div>

                  </div>

                  {/* Trainee Interactive Feature Sections */}
                  {user.role === 'trainee' && (
                    <div className="space-y-8">
                      
                      {/* Section: Practice Tests Spotlight */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                              Interactive Practice Tests
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Real-time countdown timer, step-by-step hints, instant feedback, and XP rewards.
                            </p>
                          </div>
                          <button
                            onClick={() => handleViewChange('practice_quizzes')}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            View All Tests &rarr;
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {assessments.slice(0, 3).map((quiz) => (
                            <div
                              key={quiz.id}
                              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    {quiz.durationMinutes || 5} Min Test
                                  </span>
                                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                                    <Flame className="w-3.5 h-3.5" /> +{quiz.xpReward || 50} XP
                                  </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">
                                  {quiz.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {quiz.questions?.length || 3} multiple-choice questions with step-by-step hints and detailed explanations.
                                </p>
                              </div>

                              <button
                                onClick={() => handleLaunchPracticeQuiz(quiz)}
                                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Start Practice Test &rarr;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section: Academic Resources & Flashcards Preview */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Flashcards Preview Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-indigo-500/20 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="px-2.5 py-1 rounded-md bg-white/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                              Flashcard Deck
                            </span>
                            <h3 className="text-xl font-extrabold text-white">
                              3D Interactive Concept Flashcards
                            </h3>
                            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                              Rapidly memorize high-yield concepts in React, Full-Stack Architecture, Deep Learning, and Financial Management.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-2">
                            <span className="text-[10px] uppercase font-bold text-indigo-300">Featured Card:</span>
                            <p className="text-sm font-bold text-white">
                              &ldquo;{flashcards[0]?.front}&rdquo;
                            </p>
                            <p className="text-xs text-indigo-200 line-clamp-2 italic">
                              Click into the Resource Hub to flip the card, test your recall, and view code snippets.
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-indigo-300">
                              {flashcards.filter(f => f.mastered).length} of {flashcards.length} Cards Mastered
                            </span>
                            <button
                              onClick={() => handleViewChange('resources')}
                              className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                              Explore Deck &rarr;
                            </button>
                          </div>
                        </div>

                        {/* Quick AI Study Prompts */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                                Real &amp; Sateek AI Doubt Solver
                              </h3>
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                Grounded
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Har question ka 100% verified, factual aur sateek answer with Google Search verification.
                            </p>

                            <div className="space-y-2 mt-4">
                              {[
                                'Newton ke 3 laws example ke sath samjhao',
                                'Explain React 19 Actions and Hooks with code',
                                'What is the difference between SQL and NoSQL?',
                              ].map((prompt, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleOpenAITutor(prompt)}
                                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors flex items-center justify-between"
                                >
                                  <span className="truncate">&ldquo;{prompt}&rdquo;</span>
                                  <span className="text-indigo-500 font-bold ml-1 shrink-0">&rarr;</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenAITutor()}
                            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            Open 24/7 AI Doubt Solver &rarr;
                          </button>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* Quick Actions Grid for Trainer / Admin */}
                  {(user.role === 'trainer' || user.role === 'admin') && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Operations</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {user.role === 'trainer' && (
                          <>
                            <QuickCard icon={<PlusCircle className="w-5 h-5 text-indigo-600"/>} title="Create Course" desc="Draft a new instructional syllabus" onClick={() => handleViewChange('courses')} />
                            <QuickCard icon={<Upload className="w-5 h-5 text-blue-600"/>} title="Upload Materials" desc="Add lecture notes, videos & PDFs" onClick={() => handleViewChange('courses')} />
                            <QuickCard icon={<Users className="w-5 h-5 text-emerald-600"/>} title="Monitor Trainees" desc="Review progress and submissions" onClick={() => handleViewChange('monitor')} />
                            <QuickCard icon={<BarChart2 className="w-5 h-5 text-amber-600"/>} title="Course Feedback" desc="View learner feedback & ratings" onClick={() => handleViewChange('feedback')} />
                          </>
                        )}
                        {user.role === 'admin' && (
                          <>
                            <QuickCard icon={<Users className="w-5 h-5 text-indigo-600"/>} title="Manage Users" desc="Approve and assign user roles" onClick={() => handleViewChange('users')} />
                            <QuickCard icon={<BookOpen className="w-5 h-5 text-blue-600"/>} title="Course Directory" desc="Oversight of all active curriculums" onClick={() => handleViewChange('courses')} />
                            <QuickCard icon={<Award className="w-5 h-5 text-amber-600"/>} title="Certificates" desc="Review verified student credentials" onClick={() => handleViewChange('certificates')} />
                            <QuickCard icon={<Settings className="w-5 h-5 text-slate-600"/>} title="Advanced Ops" desc="Competency and framework mapping" onClick={() => handleViewChange('advanced')} />
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* PRACTICE QUIZZES DIRECT VIEW */}
              {activeView === 'practice_quizzes' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Evaluation Center
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        Interactive Practice Tests
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Select an assessment below to practice with real-time countdown, step-by-step hints, and instant explanations.
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenAITutor('Generate a quiz')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      AI Generate Quiz
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {assessments.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {quiz.durationMinutes || 5} Mins
                            </span>
                            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1 font-semibold">
                              <Flame className="w-3.5 h-3.5" /> +{quiz.xpReward || 50} XP
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                            {quiz.title}
                          </h3>

                          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <p>• {quiz.questions?.length || 0} Multiple-choice questions</p>
                            <p>• Passing Threshold: {quiz.passingScorePercent || 70}%</p>
                            <p>• Live step-by-step hint expander enabled</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLaunchPracticeQuiz(quiz)}
                          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Launch Test with Live Timer &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GAMIFICATION DASHBOARD VIEW */}
              {activeView === 'gamification' && (
                <GamificationDashboard
                  stats={gamificationStats}
                  onCheckInDaily={handleCheckInDaily}
                  onExploreCourses={() => handleViewChange('catalog')}
                />
              )}

              {/* RESOURCE HUB VIEW (Flashcards, Cheat Sheets, Quick Notes) */}
              {activeView === 'resources' && (
                <ResourceHub
                  flashcards={flashcards}
                  cheatSheets={cheatSheets}
                  quickNotes={quickNotes}
                  onToggleFlashcardMastered={handleToggleFlashcardMastered}
                  onRequestCustomTopic={(topic) => handleOpenAITutor(topic)}
                />
              )}

              {/* OTHER ROLE OR SUB-VIEWS */}
              {activeView !== 'home' && activeView !== 'practice_quizzes' && activeView !== 'gamification' && activeView !== 'resources' && (
                <div>
                  {user.role === 'admin' && <AdminDashboard currentView={activeView} />}
                  {user.role === 'trainer' && <TrainerDashboard currentView={activeView} />}
                  {user.role === 'trainee' && <TraineeDashboard currentView={activeView} />}
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Floating AI Tutor Quick Launcher Button */}
      <button
        onClick={() => handleOpenAITutor()}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-indigo-500/30 hover:scale-105 transition-all active:scale-95 flex items-center gap-2.5 border border-white/20"
        title="Open 24/7 AI Doubt Solver"
      >
        <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
        <span className="tracking-wide">AI Tutor &amp; Doubts</span>
      </button>

      {/* Collapsible Slide-Over AI Tutor Widget */}
      <AITutorWidget
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        initialTopic={aiTutorInitialTopic}
        onLaunchGeneratedQuiz={(newQuiz) => {
          handleLaunchPracticeQuiz(newQuiz);
        }}
      />

    </div>
  );
};

const QuickCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700 transition-all active:scale-98"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between text-xs sm:text-sm">
        <span>{title}</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </h4>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
};
