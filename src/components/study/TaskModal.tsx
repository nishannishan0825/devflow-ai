import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { StudyTask, TaskType, TaskPriority, WeekDay } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<StudyTask, 'id' | 'createdAt' | 'completedAt'>) => void;
  initialTask?: StudyTask | null;
  defaultDay?: WeekDay;
}

const taskTypes: TaskType[] = ['DSA', 'Practice', 'Study', 'Interview', 'Review', 'Planning', 'Project'];
const weekDays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDay = 'Mon',
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState<WeekDay>(defaultDay);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [type, setType] = useState<TaskType>('DSA');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [errors, setErrors] = useState<{ title?: string; duration?: string }>({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDay(initialTask.day);
      setDurationMinutes(initialTask.durationMinutes || 60);
      setType(initialTask.type);
      setPriority(initialTask.priority);
    } else {
      setTitle('');
      setDescription('');
      setDay(defaultDay);
      setDurationMinutes(90);
      setType('DSA');
      setPriority('medium');
    }
    setErrors({});
  }, [initialTask, defaultDay, isOpen]);

  const validate = (): boolean => {
    const newErrors: { title?: string; duration?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (durationMinutes < 5 || durationMinutes > 480) {
      newErrors.duration = 'Duration must be between 5 min and 8 hours';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let durationLabel = `${durationMinutes}m`;
    if (durationMinutes >= 60) {
      const hours = durationMinutes / 60;
      durationLabel = hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      day,
      date: '2026-10-11',
      durationMinutes,
      durationLabel,
      type,
      priority,
      completed: initialTask ? initialTask.completed : false,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Study Task' : 'Create New Study Task'}
      subtitle="Schedule your study sessions, problem sets, and reviews"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Task Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Master Binary Search & Sliding Window"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full bg-dark-800 border ${
              errors.title ? 'border-red-500/70 focus:border-red-500' : 'border-dark-500 focus:border-purple-500/60'
            } rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors`}
          />
          {errors.title && (
            <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
              <AlertCircle size={12} /> {errors.title}
            </p>
          )}
        </div>

        {/* Day & Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <CalendarDays size={13} className="text-purple-400" /> Day of Week
            </label>
            <select
              value={day}
              onChange={e => setDay(e.target.value as WeekDay)}
              className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none cursor-pointer"
            >
              {weekDays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-400" /> Duration
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(mins => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-2 text-xs rounded-xl border transition-all ${
                    durationMinutes === mins
                      ? 'gradient-bg border-transparent text-white font-semibold'
                      : 'bg-dark-800 border-dark-500 text-gray-400 hover:text-white'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
            {errors.duration && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle size={12} /> {errors.duration}
              </p>
            )}
          </div>
        </div>

        {/* Type & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category/Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Tag size={13} className="text-cyan-400" /> Subject / Category
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as TaskType)}
              className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none cursor-pointer"
            >
              {taskTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded-xl border transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : p === 'medium'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-dark-800 border-dark-500 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Details & Resources (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Sub-topics, target problem numbers, textbook chapters..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none resize-none transition-colors"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-600/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
