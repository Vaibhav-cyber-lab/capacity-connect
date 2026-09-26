import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Globe } from 'lucide-react';

interface RealTimeClockProps {
  variant?: 'nav' | 'card' | 'header';
  className?: string;
  showDate?: boolean;
  showSeconds?: boolean;
}

export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  variant = 'nav',
  className = '',
  showDate = true,
  showSeconds = true,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update every second for smooth ticking
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time with 2-digit seconds
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true,
  });

  // Format day and date
  const formattedDay = currentTime.toLocaleDateString([], { weekday: 'short' });
  const formattedFullDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedShortDate = currentTime.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  // Greeting based on time of day
  const hour = currentTime.getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  // Get user's timezone short name
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ');

  if (variant === 'nav') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs font-mono text-xs select-none transition-colors ${className}`}
        title={`Live Real Time • ${formattedFullDate} (${timeZoneName})`}
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </div>
        
        <span className="font-bold text-slate-900 dark:text-white tracking-wider tabular-nums">
          {formattedTime}
        </span>

        {showDate && (
          <span className="hidden md:inline-flex items-center text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2 font-sans font-medium">
            {formattedDay}, {formattedShortDate}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden ${className}`}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Real Time
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{timeZoneName}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {formattedTime}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{formattedFullDate}</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{greeting}! Keep up your learning momentum.</span>
        </div>
      </div>
    );
  }

  // 'header' variant
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/60 text-white dark:text-slate-200 text-xs font-mono tabular-nums shadow-xs ${className}`}
      title={formattedFullDate}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Clock className="w-3.5 h-3.5 text-blue-300 dark:text-indigo-400 shrink-0" />
      <span className="font-bold">{formattedTime}</span>
      <span className="opacity-70 font-sans border-l border-white/20 dark:border-slate-700 pl-2">
        {formattedDay}, {formattedShortDate}
      </span>
    </div>
  );
};
