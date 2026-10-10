export type TaskType = 'DSA' | 'Practice' | 'Study' | 'Interview' | 'Review' | 'Planning' | 'Project';
export type TaskPriority = 'low' | 'medium' | 'high';
export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  durationLabel: string; // e.g. "1.5h", "45m"
  day: WeekDay;
  date: string; // YYYY-MM-DD
  type: TaskType;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemPlatform = 'LeetCode' | 'GeeksforGeeks' | 'Codeforces' | 'HackerRank' | 'Other';
export type ProblemStatus = 'solved' | 'attempted' | 'unsolved' | 'revision';

export interface CodingProblem {
  id: string;
  title: string;
  platform: ProblemPlatform;
  url: string;
  difficulty: ProblemDifficulty;
  topic: string;
  status: ProblemStatus;
  acceptance?: number;
  notes?: string;
  code?: string;
  language?: string;
  starred: boolean;
  solvedAt?: string;
  createdAt: string;
}

export interface SmartNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt: string;
  taskTitle?: string;
}

export type ActivityType = 'problem_solved' | 'task_completed' | 'note_created' | 'focus_completed' | 'streak_milestone';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
  tag?: string;
  tagVariant?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'red' | 'gray';
}

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  location: string;
  bio: string;
  avatarText: string;
  plan: string;
}

export interface PomodoroSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // every N focus sessions
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface AppSettings {
  profile: UserProfile;
  pomodoro: PomodoroSettings;
  appearance: {
    darkMode: boolean;
    accentColor: string;
    compactSidebar: boolean;
    animations: boolean;
    fontSize: 'Small' | 'Medium' | 'Large';
    language: string;
  };
  notifications: {
    dailyReminder: boolean;
    streakAlert: boolean;
    newContent: boolean;
    weeklyReport: boolean;
    browser: boolean;
  };
  ai: {
    autoHints: boolean;
    voiceEnabled: boolean;
    contextAware: boolean;
    learningMode: boolean;
    dataCollection: boolean;
    model: 'Balanced' | 'Precise' | 'Creative';
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
