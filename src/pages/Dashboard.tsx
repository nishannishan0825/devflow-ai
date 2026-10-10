import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  Flame,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  Activity,
  Trophy,
  Brain,
  Star,
  ArrowRight,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TaskModal from '../components/study/TaskModal';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, settings, activities, tasks, toggleTaskComplete, addTask } = useApp();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Today's goals (tasks for Saturday / today)
  const todayTasks = tasks.slice(0, 5);
  const doneCount = todayTasks.filter(t => t.completed).length;

  const radialData = [{ name: 'Progress', value: stats.accuracyRate || 75, fill: '#8b5cf6' }];

  const getTimeAgo = (timestamp: string): string => {
    try {
      const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-blue-600/15 to-cyan-600/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-orange-400 animate-bounce" />
            <span className="text-sm font-medium text-orange-300">{stats.currentStreak}-day streak! 🔥</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {settings.profile.name}! 👋
          </h1>
          <p className="text-gray-400 text-sm">
            You've solved <span className="text-purple-300 font-semibold">{stats.totalProblemsSolved} problems</span> and logged <span className="text-blue-300 font-semibold">{stats.totalStudyHours}h</span> of focused learning.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm" icon={Code2} onClick={() => navigate('/dsa-practice')}>
              Practice Problems
            </Button>
            <Button size="sm" variant="secondary" icon={BookOpen} onClick={() => navigate('/study-planner')}>
              Study Planner
            </Button>
            <Button size="sm" variant="secondary" icon={Zap} onClick={() => navigate('/markdown-focus')}>
              Focus Timer
            </Button>
          </div>
        </div>
        {/* Decorative ambient lighting */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-16 w-36 h-36 bg-blue-500/10 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />
      </div>

      {/* Dynamic Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={`${stats.totalProblemsSolved}`}
          change={`+${stats.totalProblemsSolved} Total`}
          trend="up"
          icon={Code2}
          iconColor="text-purple-400"
          gradient="from-purple-500/20 to-purple-600/10"
          subtitle={`${stats.totalProblemsCount} tracked in PSC`}
        />
        <StatCard
          title="Study & Focus Hours"
          value={`${stats.totalStudyHours}h`}
          change="Logged"
          trend="up"
          icon={Clock}
          iconColor="text-blue-400"
          gradient="from-blue-500/20 to-blue-600/10"
          subtitle="Tasks + Pomodoro"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          change="Active"
          trend="up"
          icon={Flame}
          iconColor="text-orange-400"
          gradient="from-orange-500/20 to-orange-600/10"
          subtitle="Consistent learning"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracyRate}%`}
          change="Solved ratio"
          trend="up"
          icon={Target}
          iconColor="text-emerald-400"
          gradient="from-emerald-500/20 to-emerald-600/10"
          subtitle="Problem completion"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - spans 2 cols */}
        <div className="lg:col-span-2">
          <Card
            title="Weekly Learning Activity"
            subtitle="Problems solved & study hours per day"
            icon={Activity}
            action={
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />Problems</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Hours</span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={stats.weeklyActivity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gProblems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a45" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#16162a', border: '1px solid #2a2a45', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="problems" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gProblems)" name="Problems Solved" />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gHours)" name="Study Hours" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Overall Progress Radial */}
        <Card title="Overall Mastery" subtitle="Algorithmic problem coverage" icon={Trophy}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <RadialBarChart
                width={160}
                height={160}
                cx={80}
                cy={80}
                innerRadius={55}
                outerRadius={75}
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#2a2a45' }} />
              </RadialBarChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold gradient-text">{stats.accuracyRate}%</span>
                <span className="text-[11px] text-gray-400">Solved Rate</span>
              </div>
            </div>
            <div className="w-full space-y-2.5 mt-3">
              {stats.topicMastery.slice(0, 4).map((topic) => (
                <div key={topic.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${topic.color === 'purple' ? 'bg-purple-400' : topic.color === 'blue' ? 'bg-blue-400' : topic.color === 'cyan' ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
                    <span className="text-gray-400">{topic.label}</span>
                  </div>
                  <span className="font-semibold text-gray-300">{topic.progress}% ({topic.solved}/{topic.total})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Progress */}
        <Card title="Topic Mastery" subtitle="Dynamic progress by category" icon={Brain}>
          <div className="space-y-4">
            {stats.topicMastery.map((t) => (
              <ProgressBar
                key={t.label}
                label={t.label}
                sublabel={`${t.solved} of ${t.total} problems solved`}
                value={t.progress}
                color={t.color}
                size="md"
              />
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card
          title="Recent Activity"
          subtitle="Real-time timeline of actions"
          icon={Activity}
          action={
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              View Analytics <ArrowRight size={12} />
            </button>
          }
        >
          <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
            {activities.slice(0, 5).map((a) => {
              const IconComp = a.type === 'problem_solved' ? Code2 : a.type === 'task_completed' ? CheckCircle2 : a.type === 'focus_completed' ? Sparkles : Star;
              return (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-700/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <IconComp size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-500">{a.subtitle} · {getTimeAgo(a.timestamp)}</p>
                  </div>
                  {a.tag && <Badge variant={a.tagVariant || 'purple'} size="sm">{a.tag}</Badge>}
                </div>
              );
            })}
            {activities.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No recent activities logged yet.</p>
            )}
          </div>
        </Card>

        {/* Today's Goals */}
        <Card
          title="Today's Goals"
          subtitle={`${doneCount}/${todayTasks.length} tasks completed`}
          icon={Target}
          action={
            <Button size="sm" variant="ghost" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>
              Add
            </Button>
          }
        >
          <div className="mb-4">
            <ProgressBar
              value={doneCount}
              max={todayTasks.length || 1}
              color="purple"
              size="sm"
              showValue={false}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              {todayTasks.length > 0 ? Math.round((doneCount / todayTasks.length) * 100) : 0}% of today's study goals finished
            </p>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {todayTasks.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleTaskComplete(goal.id)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                  goal.completed ? 'opacity-60 bg-dark-800/30' : 'hover:bg-dark-700/60 bg-dark-800/60'
                }`}
              >
                {goal.completed ? (
                  <CheckCircle2 size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle size={16} className="text-gray-500 flex-shrink-0 mt-0.5 hover:text-purple-400 transition-colors" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${goal.completed ? 'line-through text-gray-500 font-normal' : 'text-gray-200 font-medium'}`}>
                    {goal.title}
                  </p>
                  <p className="text-[11px] text-gray-500">{goal.day} · {goal.durationLabel} · {goal.type}</p>
                </div>
              </button>
            ))}
            {todayTasks.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 mb-2">No study goals scheduled for today</p>
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => setIsTaskModalOpen(true)}>
                  Create Goal
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={addTask}
      />
    </div>
  );
}
