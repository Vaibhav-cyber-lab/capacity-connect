export type Role = 'trainee' | 'trainer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: UserStatus;
  createdAt?: string;
  profile: {
    phone?: string;
    qualifications?: string;
    workExperience?: string;
    skills?: string;
    interests?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  trainerId: string;
  status: 'draft' | 'published';
  createdAt: string;
  thumbnail?: string;
  category?: string;
  duration?: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
}

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  hint?: string;
  explanation?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  deadline: string;
  questions: Question[];
  durationMinutes?: number;
  passingScorePercent?: number;
  xpReward?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  traineeId: string;
  progress: number;
  status: 'enrolled' | 'completed';
  enrolledAt: string;
}

export interface Score {
  id: string;
  assessmentId: string;
  traineeId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

export interface Feedback {
  id: string;
  courseId: string;
  traineeId: string;
  rating: number; // 1-5
  comment: string;
  submittedAt: string;
}

export interface Evaluation {
  id: string;
  traineeId: string;
  trainerId: string;
  courseId: string;
  competencyScore: number; // 1-5
  remarks: string;
  evaluatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'trainee' | 'trainer';
  sentAt: string;
}

export interface CompetencyMap {
  id: string;
  roleTitle: string;
  requiredSkills: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'quiz' | 'course' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationStats {
  streakDays: number;
  bestStreak: number;
  lastCheckInDate: string;
  hasCheckedInToday: boolean;
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  dailyGoalMinutes: number;
  todayMinutesStudied: number;
  completedQuizzesCount: number;
  averageScorePercent: number;
  badges: Badge[];
  weeklyActivity: { day: string; hours: number; target: number }[];
}

export interface Flashcard {
  id: string;
  category: string;
  front: string;
  back: string;
  codeSnippet?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mastered: boolean;
}

export interface CheatSheet {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  readTime: string;
  content: string;
}

export interface QuickNote {
  id: string;
  title: string;
  category: string;
  readTime: string;
  keyPoints: string[];
  summary: string;
}
