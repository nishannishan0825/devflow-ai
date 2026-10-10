import { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
  Trash2,
  Edit3,
  Search,
  Filter,
  Sparkles,
  Check,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import TaskModal from '../components/study/TaskModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import type { StudyTask, TaskType, WeekDay } from '../types';

const days: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date().getDay(); // 0=Sun
const todayIndex = today === 0 ? 6 : today - 1;

const typeColors: Record<TaskType, 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'red' | 'gray'> = {
  DSA: 'purple',
  Practice: 'blue',
  Study: 'cyan',
  Interview: 'amber',
  Review: 'emerald',
  Planning: 'gray',
  Project: 'purple',
};

export default function StudyPlanner() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete, stats } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(todayIndex);
  const [showAllDays, setShowAllDays] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'pending' | 'completed'>('All');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<StudyTask | null>(null);

  const currentDayName = days[selectedDay];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!showAllDays && task.day !== currentDayName) {
        return false;
      }
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'pending' && task.completed) return false;
      if (filterType !== 'All' && task.type !== filterType) return false;
      if (filterPriority !== 'All' && task.priority !== filterPriority.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesType = task.type.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesType) return false;
      }
      return true;
    });
  }, [tasks, showAllDays, currentDayName, filterStatus, filterType, filterPriority, searchQuery]);

  // Day counts
  const dayStats = useMemo(() => {
    return days.map(day => {
      const dayTasks = tasks.filter(t => t.day === day);
      const completed = dayTasks.filter(t => t.completed).length;
      return {
        day,
        total: dayTasks.length,
        completed,
        percent: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0,
      };
    });
  }, [tasks]);

  const handleSaveTask = (taskData: Omit<StudyTask, 'id' | 'createdAt' | 'completedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Study Planner</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Plan study blocks, schedule mock interviews, and track weekly goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={Plus} onClick={() => { setEditingTask(null); setIsCreateModalOpen(true); }}>
            New Session
          </Button>
        </div>
      </div>

      {/* Quick stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-dark-600 rounded-2xl p-4 flex items-center gap-3.5 card-glow">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.totalStudyHours}h</p>
            <p className="text-xs text-gray-400">Total Learning Logged</p>
          </div>
        </div>

        <div className="bg-surface border border-dark-600 rounded-2xl p-4 flex items-center gap-3.5 card-glow">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.currentStreak} Days</p>
            <p className="text-xs text-gray-400">Active Study Streak 🔥</p>
          </div>
        </div>

        <div className="bg-surface border border-dark-600 rounded-2xl p-4 flex items-center gap-3.5 card-glow">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{tasks.filter(t => t.completed).length} / {tasks.length}</p>
            <p className="text-xs text-gray-400">Completed Sessions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main tasks pane */}
        <div className="lg:col-span-2 space-y-4">
          {/* Week calendar selector */}
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600/50">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-purple-400" />
                <h3 className="text-sm font-semibold text-white">
                  Weekly Schedule
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAllDays(!showAllDays)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                    showAllDays
                      ? 'gradient-bg border-transparent text-white'
                      : 'bg-dark-700 border-dark-500 text-gray-400 hover:text-white'
                  }`}
                >
                  {showAllDays ? 'Viewing All Days' : 'View All Days'}
                </button>
                <button
                  onClick={() => { setShowAllDays(false); setSelectedDay(todayIndex); }}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Day buttons */}
            <div className="grid grid-cols-7 gap-1.5 p-3">
              {days.map((day, i) => {
                const stat = dayStats[i];
                const isToday = i === todayIndex;
                const isSelected = !showAllDays && i === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => { setShowAllDays(false); setSelectedDay(i); }}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'gradient-bg text-white shadow-lg shadow-purple-950/40'
                        : isToday
                        ? 'bg-purple-500/15 border border-purple-500/30 text-purple-200'
                        : 'hover:bg-dark-700 text-gray-400'
                    }`}
                  >
                    <span className="text-xs font-semibold">{day}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-dark-600 text-gray-300'}`}>
                      {stat.completed}/{stat.total}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(stat.total, 4) }).map((_, si) => (
                        <div
                          key={si}
                          className={`w-1 h-1 rounded-full ${si < stat.completed ? 'bg-emerald-400' : isSelected ? 'bg-white/40' : 'bg-dark-500'}`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Filters & Search Toolbar */}
          <div className="bg-surface border border-dark-600 rounded-2xl p-4 card-glow space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search tasks by topic or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none flex-1"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-xs text-gray-500 hover:text-white">
                    Clear
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="flex gap-1.5 bg-dark-800 p-1 rounded-xl border border-dark-500">
                {(['All', 'pending', 'completed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      filterStatus === s ? 'gradient-bg text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject / Priority pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1"><Filter size={12} /> Filter:</span>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-dark-800 border border-dark-500 rounded-lg px-2.5 py-1 text-xs text-gray-300 outline-none"
              >
                <option value="All">All Subjects</option>
                <option value="DSA">DSA</option>
                <option value="Practice">Practice</option>
                <option value="Study">Study</option>
                <option value="Interview">Interview</option>
                <option value="Review">Review</option>
                <option value="Planning">Planning</option>
              </select>

              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-dark-800 border border-dark-500 rounded-lg px-2.5 py-1 text-xs text-gray-300 outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              {(filterType !== 'All' || filterPriority !== 'All' || searchQuery || filterStatus !== 'All') && (
                <button
                  onClick={() => {
                    setFilterType('All');
                    setFilterPriority('All');
                    setFilterStatus('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 ml-auto"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Session task list */}
          <Card
            title={showAllDays ? 'All Scheduled Sessions' : `${currentDayName}'s Study Sessions`}
            subtitle={`${filteredTasks.filter(t => t.completed).length} of ${filteredTasks.length} tasks completed`}
            icon={Clock}
            action={
              <Button
                size="sm"
                icon={Plus}
                variant="ghost"
                onClick={() => {
                  setEditingTask(null);
                  setIsCreateModalOpen(true);
                }}
              >
                Add Task
              </Button>
            }
          >
            <div className="space-y-3">
              {filteredTasks.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-200 ${
                    session.completed
                      ? 'bg-dark-800/40 border-dark-600/40 opacity-75'
                      : 'bg-dark-700/50 border-dark-600 hover:border-purple-500/40 hover:bg-dark-700/80 shadow-md shadow-black/20'
                  }`}
                >
                  {/* Completion checkbox */}
                  <button
                    onClick={() => toggleTaskComplete(session.id)}
                    className="flex-shrink-0 cursor-pointer"
                    title={session.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {session.completed ? (
                      <CheckCircle2 size={20} className="text-purple-400 hover:text-purple-300 transition-colors" />
                    ) : (
                      <Circle size={20} className="text-gray-500 hover:text-purple-400 transition-colors" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${session.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {session.title}
                      </p>
                      {session.priority === 'high' && (
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                          High
                        </span>
                      )}
                    </div>
                    {session.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {session.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 font-medium text-gray-400">
                        <CalendarDays size={11} /> {session.day}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {session.durationLabel}
                      </span>
                    </p>
                  </div>

                  {/* Badges and Actions */}
                  <div className="flex items-center gap-2">
                    <Badge variant={typeColors[session.type] || 'gray'}>
                      {session.type}
                    </Badge>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTask(session);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                        title="Edit task"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(session)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {filteredTasks.length === 0 && (
                <EmptyState
                  icon={CalendarDays}
                  title="No study tasks found"
                  description={
                    searchQuery || filterType !== 'All' || filterPriority !== 'All'
                      ? 'No tasks matched your current filter criteria. Try resetting filters.'
                      : `No tasks scheduled for ${showAllDays ? 'your planner' : currentDayName}. Create one to start learning!`
                  }
                  actionText="Create New Task"
                  onAction={() => {
                    setEditingTask(null);
                    setIsCreateModalOpen(true);
                  }}
                  actionIcon={Plus}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-4">
          {/* Dynamic Weekly Progress */}
          <Card title="Weekly Target Progress" icon={Flame}>
            <div className="space-y-3.5">
              {dayStats.map((stat, i) => (
                <div key={stat.day} className="flex items-center gap-3">
                  <span className={`text-xs w-8 font-semibold ${i === todayIndex ? 'text-purple-400' : 'text-gray-400'}`}>
                    {stat.day}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full progress-bar rounded-full transition-all duration-700"
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono w-10 text-right">
                    {stat.completed}/{stat.total}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Study streak badge */}
          <div className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-transparent border border-orange-500/20 rounded-2xl p-5 card-glow">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={18} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Daily Consistency</h3>
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">{stats.currentStreak} Days 🔥</div>
            <p className="text-xs text-gray-400">Keep solving problems and checking off study tasks.</p>
            <div className="flex gap-1.5 mt-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-5 rounded ${i < stats.currentStreak ? 'bg-orange-500/80 shadow-sm shadow-orange-500/40' : 'bg-dark-600'}`}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">14-day study activity track</p>
          </div>

          {/* Upcoming prioritized sessions */}
          <Card title="Priority Focus" icon={Sparkles}>
            <div className="space-y-2.5">
              {tasks.filter(t => !t.completed).slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTaskComplete(t.id)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/40 border border-dark-600/60 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="w-2 h-8 rounded-full bg-gradient-to-b from-purple-500 to-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {t.day} • {t.durationLabel} • {t.type}
                    </p>
                  </div>
                  <div className="p-1 rounded-lg bg-dark-600 group-hover:bg-purple-500/20 text-gray-400 group-hover:text-purple-300">
                    <Check size={12} />
                  </div>
                </div>
              ))}
              {tasks.filter(t => !t.completed).length === 0 && (
                <p className="text-xs text-emerald-400 text-center py-4">All scheduled tasks completed! 🎉</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDay={currentDayName}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Study Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        variant="danger"
      />
    </div>
  );
}
