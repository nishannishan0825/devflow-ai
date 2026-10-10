import { supabase } from './supabase';
import type {
  StudyTask,
  CodingProblem,
  SmartNote,
  NoteCategory,
  FocusSession,
  AppSettings,
} from '../types';

// ==============================================================================
// Converters between App Models (camelCase) & Supabase Tables (snake_case)
// ==============================================================================

export const taskToDb = (task: StudyTask, userId: string) => ({
  id: task.id,
  user_id: userId,
  title: task.title,
  description: task.description || null,
  duration_minutes: task.durationMinutes,
  duration_label: task.durationLabel,
  day: task.day,
  date: task.date,
  type: task.type,
  priority: task.priority,
  completed: task.completed,
  completed_at: task.completedAt || null,
  created_at: task.createdAt,
});

export const dbToTask = (row: any): StudyTask => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  durationMinutes: row.duration_minutes,
  durationLabel: row.duration_label,
  day: row.day,
  date: row.date,
  type: row.type,
  priority: row.priority,
  completed: row.completed,
  completedAt: row.completed_at || undefined,
  createdAt: row.created_at,
});

export const problemToDb = (prob: CodingProblem, userId: string) => ({
  id: prob.id,
  user_id: userId,
  title: prob.title,
  platform: prob.platform,
  url: prob.url || '',
  difficulty: prob.difficulty,
  topic: prob.topic,
  status: prob.status,
  acceptance: prob.acceptance || 50,
  notes: prob.notes || '',
  code: prob.code || '',
  language: prob.language || 'typescript',
  starred: prob.starred,
  solved_at: prob.solvedAt || null,
  created_at: prob.createdAt,
});

export const dbToProblem = (row: any): CodingProblem => ({
  id: row.id,
  title: row.title,
  platform: row.platform,
  url: row.url || '',
  difficulty: row.difficulty,
  topic: row.topic,
  status: row.status,
  acceptance: row.acceptance ? Number(row.acceptance) : 50,
  notes: row.notes || '',
  code: row.code || '',
  language: row.language || 'typescript',
  starred: Boolean(row.starred),
  solvedAt: row.solved_at || undefined,
  createdAt: row.created_at,
});

export const noteToDb = (note: SmartNote, userId: string) => ({
  id: note.id,
  user_id: userId,
  title: note.title,
  content: note.content || '',
  category: note.category,
  tags: note.tags,
  pinned: note.pinned,
  created_at: note.createdAt,
  updated_at: note.updatedAt,
});

export const dbToNote = (row: any): SmartNote => ({
  id: row.id,
  title: row.title,
  content: row.content || '',
  category: row.category,
  tags: Array.isArray(row.tags) ? row.tags : [],
  pinned: Boolean(row.pinned),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const categoryToDb = (cat: NoteCategory, userId: string) => ({
  id: cat.id,
  user_id: userId,
  name: cat.name,
  color: cat.color,
});

export const dbToCategory = (row: any): NoteCategory => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

export const focusSessionToDb = (s: FocusSession, userId: string) => ({
  id: s.id,
  user_id: userId,
  mode: s.mode,
  duration_minutes: s.durationMinutes,
  completed_at: s.completedAt,
  task_title: s.taskTitle || 'Deep Work Session',
});

export const dbToFocusSession = (row: any): FocusSession => ({
  id: row.id,
  mode: row.mode,
  durationMinutes: row.duration_minutes,
  completedAt: row.completed_at,
  taskTitle: row.task_title,
});

// ==============================================================================
// Database Operations Service
// ==============================================================================

export const dbService = {
  // Fetch all user records from Supabase
  async fetchUserData(userId: string) {
    if (!supabase) return null;

    try {
      const [
        tasksRes,
        probsRes,
        notesRes,
        catsRes,
        focusRes,
        profileRes,
      ] = await Promise.all([
        supabase.from('study_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('coding_problems').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('smart_notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
        supabase.from('note_categories').select('*').eq('user_id', userId),
        supabase.from('focus_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      return {
        tasks: tasksRes.data ? tasksRes.data.map(dbToTask) : [],
        problems: probsRes.data ? probsRes.data.map(dbToProblem) : [],
        notes: notesRes.data ? notesRes.data.map(dbToNote) : [],
        categories: catsRes.data ? catsRes.data.map(dbToCategory) : [],
        focusSessions: focusRes.data ? focusRes.data.map(dbToFocusSession) : [],
        settings: profileRes.data?.settings as Partial<AppSettings> | undefined,
        profile: profileRes.data,
      };
    } catch (err) {
      console.error('Failed to fetch data from Supabase:', err);
      return null;
    }
  },

  // Save single Task
  async upsertTask(task: StudyTask, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('study_tasks').upsert(taskToDb(task, userId));
    } catch (err) {
      console.error('Error syncing task:', err);
    }
  },

  async deleteTask(taskId: string, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('study_tasks').delete().eq('id', taskId).eq('user_id', userId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  },

  // Save single Coding Problem
  async upsertProblem(prob: CodingProblem, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('coding_problems').upsert(problemToDb(prob, userId));
    } catch (err) {
      console.error('Error syncing problem:', err);
    }
  },

  async deleteProblem(problemId: string, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('coding_problems').delete().eq('id', problemId).eq('user_id', userId);
    } catch (err) {
      console.error('Error deleting problem:', err);
    }
  },

  // Save single Smart Note
  async upsertNote(note: SmartNote, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('smart_notes').upsert(noteToDb(note, userId));
    } catch (err) {
      console.error('Error syncing note:', err);
    }
  },

  async deleteNote(noteId: string, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('smart_notes').delete().eq('id', noteId).eq('user_id', userId);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  },

  // Save Category
  async upsertCategory(cat: NoteCategory, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('note_categories').upsert(categoryToDb(cat, userId));
    } catch (err) {
      console.error('Error syncing category:', err);
    }
  },

  async deleteCategory(catId: string, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('note_categories').delete().eq('id', catId).eq('user_id', userId);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  },

  // Save Focus Session
  async insertFocusSession(session: FocusSession, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('focus_sessions').insert(focusSessionToDb(session, userId));
    } catch (err) {
      console.error('Error inserting focus session:', err);
    }
  },

  // Save Settings & Profile to Supabase
  async saveSettings(settings: AppSettings, userId: string) {
    if (!supabase) return;
    try {
      await supabase.from('profiles').update({
        settings,
        name: settings.profile.name,
        location: settings.profile.location,
        bio: settings.profile.bio,
        avatar_text: settings.profile.avatarText,
        plan: settings.profile.plan,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    } catch (err) {
      console.error('Error saving settings to cloud:', err);
    }
  },

  // Full Migration: Upload all local state to user's Supabase account
  async migrateLocalDataToCloud(
    userId: string,
    data: {
      tasks: StudyTask[];
      problems: CodingProblem[];
      notes: SmartNote[];
      categories: NoteCategory[];
      focusSessions: FocusSession[];
      settings: AppSettings;
    }
  ) {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    try {
      // 1. Batch upsert tasks
      if (data.tasks.length > 0) {
        const dbTasks = data.tasks.map(t => taskToDb(t, userId));
        await supabase.from('study_tasks').upsert(dbTasks);
      }

      // 2. Batch upsert problems
      if (data.problems.length > 0) {
        const dbProblems = data.problems.map(p => problemToDb(p, userId));
        await supabase.from('coding_problems').upsert(dbProblems);
      }

      // 3. Batch upsert notes
      if (data.notes.length > 0) {
        const dbNotes = data.notes.map(n => noteToDb(n, userId));
        await supabase.from('smart_notes').upsert(dbNotes);
      }

      // 4. Batch upsert categories
      if (data.categories.length > 0) {
        const dbCats = data.categories.map(c => categoryToDb(c, userId));
        await supabase.from('note_categories').upsert(dbCats);
      }

      // 5. Batch insert focus sessions
      if (data.focusSessions.length > 0) {
        const dbSessions = data.focusSessions.map(s => focusSessionToDb(s, userId));
        await supabase.from('focus_sessions').upsert(dbSessions);
      }

      // 6. Save profile and settings
      await supabase.from('profiles').upsert({
        id: userId,
        settings: data.settings,
        name: data.settings.profile.name,
        location: data.settings.profile.location,
        bio: data.settings.profile.bio,
        avatar_text: data.settings.profile.avatarText,
        plan: data.settings.profile.plan,
        updated_at: new Date().toISOString(),
      });

      return { success: true, count: data.tasks.length + data.problems.length + data.notes.length };
    } catch (err: any) {
      console.error('Migration failed:', err);
      return { success: false, error: err.message || 'Data migration failed' };
    }
  },
};
