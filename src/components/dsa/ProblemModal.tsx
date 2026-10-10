import React, { useState, useEffect } from 'react';
import { Code2, Globe, Tag, AlertCircle, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { CodingProblem, ProblemDifficulty, ProblemPlatform, ProblemStatus } from '../../types';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problem: Omit<CodingProblem, 'id' | 'createdAt' | 'solvedAt'>) => void;
  initialProblem?: CodingProblem | null;
}

const platforms: ProblemPlatform[] = ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'Other'];
const difficulties: ProblemDifficulty[] = ['Easy', 'Medium', 'Hard'];
const commonTopics = [
  'Arrays',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Dynamic Programming',
  'Bit Manipulation',
  'Math & Geometry',
];

export default function ProblemModal({
  isOpen,
  onClose,
  onSave,
  initialProblem,
}: ProblemModalProps) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<ProblemPlatform>('LeetCode');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Medium');
  const [topic, setTopic] = useState('Arrays');
  const [customTopic, setCustomTopic] = useState('');
  const [status, setStatus] = useState<ProblemStatus>('unsolved');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [acceptance, setAcceptance] = useState<number | undefined>(50);
  const [errors, setErrors] = useState<{ title?: string; url?: string; topic?: string }>({});

  useEffect(() => {
    if (initialProblem) {
      setTitle(initialProblem.title);
      setPlatform(initialProblem.platform);
      setUrl(initialProblem.url || '');
      setDifficulty(initialProblem.difficulty);
      if (commonTopics.includes(initialProblem.topic)) {
        setTopic(initialProblem.topic);
        setCustomTopic('');
      } else {
        setTopic('Other');
        setCustomTopic(initialProblem.topic);
      }
      setStatus(initialProblem.status);
      setNotes(initialProblem.notes || '');
      setCode(initialProblem.code || '');
      setAcceptance(initialProblem.acceptance || 50);
    } else {
      setTitle('');
      setPlatform('LeetCode');
      setUrl('');
      setDifficulty('Medium');
      setTopic('Arrays');
      setCustomTopic('');
      setStatus('unsolved');
      setNotes('');
      setCode(`def solution():\n    # Write your solution here\n    pass`);
      setAcceptance(50);
    }
    setErrors({});
  }, [initialProblem, isOpen]);

  const validate = (): boolean => {
    const newErrors: { title?: string; url?: string; topic?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Problem title is required';
    }
    if (topic === 'Other' && !customTopic.trim()) {
      newErrors.topic = 'Please specify a custom topic';
    }
    if (url.trim() && !url.trim().startsWith('http')) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalTopic = topic === 'Other' ? customTopic.trim() : topic;

    onSave({
      title: title.trim(),
      platform,
      url: url.trim() || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title.trim())}`,
      difficulty,
      topic: finalTopic,
      status,
      acceptance: acceptance || 50,
      notes: notes.trim() || undefined,
      code: code.trim() || undefined,
      language: 'python',
      starred: initialProblem ? initialProblem.starred : false,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProblem ? 'Edit Coding Problem' : 'Track New Coding Problem'}
      subtitle="Track problems from LeetCode, GeeksforGeeks, Codeforces & more"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Problem Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 3Sum, Lowest Common Ancestor, Coin Change"
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

        {/* Platform & Problem URL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Globe size={13} className="text-purple-400" /> Platform
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value as ProblemPlatform)}
              className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none cursor-pointer"
            >
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Problem URL / Link
            </label>
            <input
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className={`w-full bg-dark-800 border ${
                errors.url ? 'border-red-500/70' : 'border-dark-500 focus:border-purple-500/60'
              } rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors`}
            />
            {errors.url && (
              <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                <AlertCircle size={12} /> {errors.url}
              </p>
            )}
          </div>
        </div>

        {/* Difficulty & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Difficulty
            </label>
            <div className="flex gap-2">
              {difficulties.map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    difficulty === d
                      ? d === 'Easy'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : d === 'Medium'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-dark-800 border-dark-500 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Solved Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Current Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProblemStatus)}
              className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none cursor-pointer"
            >
              <option value="unsolved">Unsolved</option>
              <option value="attempted">In Progress / Attempted</option>
              <option value="solved">Solved</option>
              <option value="revision">Need Revision</option>
            </select>
          </div>
        </div>

        {/* Topic Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Tag size={13} className="text-cyan-400" /> Topic / Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none cursor-pointer"
            >
              {commonTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="Other">Other / Custom Topic</option>
            </select>
            {topic === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom topic name"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                className="w-full bg-dark-800 border border-purple-500/50 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none"
              />
            )}
          </div>
          {errors.topic && (
            <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
              <AlertCircle size={12} /> {errors.topic}
            </p>
          )}
        </div>

        {/* Notes & Key Takeaways */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Approach & Edge Cases Notes
          </label>
          <textarea
            rows={2}
            placeholder="Time/Space complexity, pattern used (e.g. prefix sum, two pointers)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-dark-800 border border-dark-500 focus:border-purple-500/60 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none resize-none transition-colors"
          />
        </div>

        {/* Code Solution snippet */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Code2 size={13} className="text-purple-400" /> Solution Code (Python / JS / C++)
            </span>
            <span className="text-[11px] text-gray-500">Optional</span>
          </label>
          <textarea
            rows={4}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full bg-dark-900 font-mono border border-dark-500 focus:border-purple-500/60 rounded-xl p-3 text-xs text-purple-200 placeholder-gray-700 outline-none resize-none"
            placeholder="def solution(): ..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-600/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Sparkles}>
            {initialProblem ? 'Save Problem' : 'Track Problem'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
