import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Flame, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  LogOut, 
  ChevronDown,
  Award,
  FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Course, Assessment, Flashcard, CheatSheet } from '../../types';
import { RealTimeClock } from './RealTimeClock';

interface TopNavBarProps {
  streakDays: number;
  xp: number;
  level: number;
  courses: Course[];
  assessments: Assessment[];
  flashcards: Flashcard[];
  cheatSheets: CheatSheet[];
  onOpenAITutor: (initialTopic?: string) => void;
  onSelectCourse?: (course: Course) => void;
  onSelectAssessment?: (assessment: Assessment) => void;
  onNavigateSection?: (section: string) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  streakDays,
  xp,
  level,
  courses,
  assessments,
  flashcards,
  cheatSheets,
  onOpenAITutor,
  onSelectCourse,
  onSelectAssessment,
  onNavigateSection,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const q = searchQuery.trim().toLowerCase();
  const filteredCourses = q ? courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredQuizzes = q ? assessments.filter(a => a.title.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredFlashcards = q ? flashcards.filter(f => f.front.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredCheatSheets = q ? cheatSheets.filter(cs => cs.title.toLowerCase().includes(q) || cs.tags.some(t => t.toLowerCase().includes(q))).slice(0, 3) : [];

  const totalResults = filteredCourses.length + filteredQuizzes.length + filteredFlashcards.length + filteredCheatSheets.length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Education</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Ed-Tech
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Interactive Learning &amp; AI Academy
              </p>
            </div>
          </div>

          {/* Universal Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search courses, practice quizzes, flashcards & cheat sheets..."
                className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Universal Search Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Results for &ldquo;{searchQuery}&rdquo;</span>
                  <span>{totalResults} matches found</span>
                </div>

                <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {totalResults === 0 ? (
                    <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                      No matches found.
                      <button
                        onClick={() => {
                          onOpenAITutor(searchQuery);
                          setIsSearchOpen(false);
                        }}
                        className="mt-3 block mx-auto px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      >
                        Ask AI Tutor about &ldquo;{searchQuery}&rdquo; &rarr;
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Courses */}
                      {filteredCourses.length > 0 && (
                        <div className="py-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5">
                            Courses ({filteredCourses.length})
                          </span>
                          <div className="mt-1 space-y-1">
                            {filteredCourses.map(course => (
                              <button
                                key={course.id}
                                onClick={() => {
                                  onSelectCourse?.(course);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 group transition-colors"
                              >
                                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                    {course.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {course.category} • {course.duration || 'Self-paced'}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quizzes */}
                      {filteredQuizzes.length > 0 && (
                        <div className="py-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5">
                            Practice Tests ({filteredQuizzes.length})
                          </span>
                          <div className="mt-1 space-y-1">
                            {filteredQuizzes.map(quiz => (
                              <button
                                key={quiz.id}
                                onClick={() => {
                                  onSelectAssessment?.(quiz);
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 group transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                                    {quiz.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {quiz.questions.length} questions • {quiz.durationMinutes || 5} min timer
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Flashcards & CheatSheets */}
                      {(filteredFlashcards.length > 0 || filteredCheatSheets.length > 0) && (
                        <div className="py-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5">
                            Resources &amp; Flashcards
                          </span>
                          <div className="mt-1 space-y-1">
                            {filteredCheatSheets.map(cs => (
                              <button
                                key={cs.id}
                                onClick={() => {
                                  onNavigateSection?.('resources');
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 group transition-colors"
                              >
                                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                    {cs.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    Cheat Sheet • {cs.readTime}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real Time Clock Widget */}
            <RealTimeClock variant="nav" />

            {/* Gamification Streak Pill */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-orange-200 dark:border-orange-800/60 cursor-pointer hover:scale-105 transition-transform"
              title={`${streakDays}-Day Study Streak! Complete practice sessions to keep your flame alive.`}
              onClick={() => onNavigateSection?.('gamification')}
            >
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
                {streakDays} <span className="hidden sm:inline">Days</span>
              </span>
            </div>

            {/* XP & Level Pill */}
            <div 
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 cursor-pointer hover:scale-105 transition-transform"
              title={`Level ${level} Scholar • ${xp} Total XP earned`}
              onClick={() => onNavigateSection?.('gamification')}
            >
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                Lvl {level} • {xp} XP
              </span>
            </div>

            {/* AI Tutor Slide-Over Trigger Button */}
            <button
              onClick={() => onOpenAITutor()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              title="Open 24/7 AI Doubt Solver & Quiz Generator"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden xs:inline sm:inline">AI Tutor</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[100px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role || 'Trainee'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateSection?.('gamification');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Achievements &amp; XP
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigateSection?.('resources');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Resource Hub
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
