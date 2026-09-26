import React, { useState } from 'react';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap, 
  Calendar, 
  Star, 
  Lock, 
  Sparkles,
  Trophy,
  BookOpen
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { GamificationStats, Badge } from '../../types';

interface GamificationDashboardProps {
  stats: GamificationStats;
  onCheckInDaily: () => void;
  onExploreCourses?: () => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  stats,
  onCheckInDaily,
  onExploreCourses,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredBadges = selectedCategory === 'all' 
    ? stats.badges 
    : stats.badges.filter(b => b.category === selectedCategory);

  const unlockedCount = stats.badges.filter(b => b.unlocked).length;
  const xpPercentage = Math.min(100, Math.round((stats.xp / stats.nextLevelXp) * 100));
  const dailyGoalPercent = Math.min(100, Math.round((stats.todayMinutesStudied / stats.dailyGoalMinutes) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Study Streak & Daily Check-In */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-200 animate-bounce" />
            Study Habit Tracker
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            🔥 {stats.streakDays}-Day Study Streak!
          </h2>
          <p className="text-orange-100 text-xs sm:text-sm max-w-lg leading-relaxed">
            You&apos;re consistently building competency! Keep the streak alive every day to claim bonus XP and level up faster.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold pt-1">
            <span>Personal Best: <strong className="text-amber-200">{stats.bestStreak} Days</strong></span>
            <span>•</span>
            <span>Completed Quizzes: <strong className="text-amber-200">{stats.completedQuizzesCount}</strong></span>
          </div>
        </div>

        {/* Daily Check-In Button */}
        <div className="z-10 text-center">
          <button
            onClick={onCheckInDaily}
            disabled={stats.hasCheckedInToday}
            className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center gap-2.5 ${
              stats.hasCheckedInToday
                ? 'bg-white/20 text-white cursor-default border border-white/30 backdrop-blur-md'
                : 'bg-white text-orange-700 hover:bg-orange-50 hover:shadow-xl hover:scale-105'
            }`}
          >
            {stats.hasCheckedInToday ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                Checked In Today (+25 XP Claimed)
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                Claim Daily +25 XP Check-In!
              </>
            )}
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid: XP & Level + Weekly Performance Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Level & XP Progression */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Student Tier
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Level {stats.level}: {stats.levelTitle}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-lg shadow-xs">
              {stats.level}
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">{stats.xp} XP</span>
              <span className="text-slate-400">{stats.nextLevelXp} XP to Level {stats.level + 1}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Daily Study Goal */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Daily Goal: {stats.dailyGoalMinutes} mins
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.todayMinutesStudied}m ({dailyGoalPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Average Quiz Score</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{stats.averageScorePercent}%</span>
          </div>
        </div>

        {/* Card 2: Weekly Performance Hours Graph (Recharts) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Analytics
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                Weekly Study Velocity
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
                Hours Studied
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-md bg-slate-300 dark:bg-slate-700 inline-block" />
                Target (1.0h)
              </span>
            </div>
          </div>

          {/* Graph Container */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 4]} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-800">
                          <p className="font-bold">{label}</p>
                          <p className="text-indigo-300">Studied: {payload[0]?.value} hrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Completion Badges & Achievements Showcase */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Completion Badges &amp; Honors
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unlocked {unlockedCount} of {stats.badges.length} badges on your educational journey.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'streak', label: 'Streaks' },
              { id: 'quiz', label: 'Quizzes' },
              { id: 'course', label: 'Courses' },
              { id: 'special', label: 'Special' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                badge.unlocked
                  ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:shadow-xs'
                  : 'bg-slate-100/40 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                badge.unlocked
                  ? 'bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-400" />}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block pt-0.5">
                    Unlocked on {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
