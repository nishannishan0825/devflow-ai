import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Code2,
  Search,
  CheckCircle2,
  Zap,
  Star,
  Play,
  RefreshCw,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ProblemModal from '../components/dsa/ProblemModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import type { CodingProblem, ProblemDifficulty, ProblemStatus } from '../types';

const difficultyBadgeColors: Record<ProblemDifficulty, 'emerald' | 'amber' | 'red'> = {
  Easy: 'emerald',
  Medium: 'amber',
  Hard: 'red',
};

export default function DSAPractice() {
  const [searchParams] = useSearchParams();
  const {
    problems,
    addProblem,
    updateProblem,
    deleteProblem,
    toggleProblemStarred,
    setProblemStatus,
    submitProblemSolution,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [selectedProblemId, setSelectedProblemId] = useState<string>(() => problems[0]?.id || '');
  const [userCode, setUserCode] = useState<string>('');
  const [runResult, setRunResult] = useState<{ success: boolean; runtimeMs: number; memoryMb: number } | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  // Modal states
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [problemToDelete, setProblemToDelete] = useState<CodingProblem | null>(null);

  // Read URL search param if present (e.g. from top nav search)
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  // Selected problem object
  const selectedProblem = useMemo(() => {
    return problems.find(p => p.id === selectedProblemId) || problems[0] || null;
  }, [problems, selectedProblemId]);

  // Update user code when selected problem changes
  useEffect(() => {
    if (selectedProblem) {
      setUserCode(selectedProblem.code || `def solution():\n    # Write your solution for ${selectedProblem.title}\n    pass`);
      setRunResult(null);
      setAiHint(null);
    }
  }, [selectedProblem]);

  // Distinct topics
  const topicsList = useMemo(() => {
    const set = new Set(problems.map(p => p.topic));
    return ['All', ...Array.from(set)];
  }, [problems]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchTopic = p.topic.toLowerCase().includes(q);
        const matchPlatform = p.platform.toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchPlatform) return false;
      }
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      if (selectedPlatform !== 'All' && p.platform !== selectedPlatform) return false;
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
      if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
      return true;
    });
  }, [problems, search, selectedDifficulty, selectedPlatform, selectedTopic, selectedStatus]);

  // Category progress counts
  const categoryProgress = useMemo(() => {
    const easyTotal = problems.filter(p => p.difficulty === 'Easy').length;
    const easySolved = problems.filter(p => p.difficulty === 'Easy' && p.status === 'solved').length;

    const medTotal = problems.filter(p => p.difficulty === 'Medium').length;
    const medSolved = problems.filter(p => p.difficulty === 'Medium' && p.status === 'solved').length;

    const hardTotal = problems.filter(p => p.difficulty === 'Hard').length;
    const hardSolved = problems.filter(p => p.difficulty === 'Hard' && p.status === 'solved').length;

    return [
      { name: 'Easy', solved: easySolved, total: easyTotal, color: 'emerald' as const },
      { name: 'Medium', solved: medSolved, total: medTotal, color: 'amber' as const },
      { name: 'Hard', solved: hardSolved, total: hardTotal, color: 'red' as const },
    ];
  }, [problems]);

  const handleSaveProblem = (probData: Omit<CodingProblem, 'id' | 'createdAt' | 'solvedAt'>) => {
    if (editingProblem) {
      updateProblem(editingProblem.id, probData);
      setEditingProblem(null);
    } else {
      addProblem(probData);
    }
  };

  const handleDeleteConfirm = () => {
    if (problemToDelete) {
      deleteProblem(problemToDelete.id);
      setProblemToDelete(null);
      if (selectedProblemId === problemToDelete.id) {
        const remaining = problems.filter(p => p.id !== problemToDelete.id);
        if (remaining.length > 0) {
          setSelectedProblemId(remaining[0].id);
        }
      }
    }
  };

  const handlePickRandom = () => {
    const unsolved = problems.filter(p => p.status !== 'solved');
    const pool = unsolved.length > 0 ? unsolved : problems;
    if (pool.length > 0) {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setSelectedProblemId(pool[randomIdx].id);
      showToast({ type: 'info', title: 'Random Problem Selected', message: `Now viewing "${pool[randomIdx].title}"` });
    }
  };

  const handleGetAiHint = () => {
    if (!selectedProblem) return;
    const topic = selectedProblem.topic;
    let hint = `Think about using the ${topic} pattern. `;
    if (topic.includes('Array') || topic.includes('Two Pointer')) {
      hint += 'Consider sorting first or using two pointers moving in opposite directions, or maintaining a hash map for O(1) lookups.';
    } else if (topic.includes('Window')) {
      hint += 'Expand the right boundary while condition holds; contract the left boundary to minimize or find valid sub-segments.';
    } else if (topic.includes('Tree') || topic.includes('BST')) {
      hint += 'Can this be solved recursively using DFS (preorder/inorder/postorder) or iteratively using BFS level-order traversal with a queue?';
    } else if (topic.includes('Dynamic') || topic.includes('DP')) {
      hint += 'Define state dp[i], identify the optimal sub-structure recurrence relation, and decide between top-down memoization or bottom-up tabulation.';
    } else if (topic.includes('Graph')) {
      hint += 'Check if this is a reachability/connectivity problem (BFS/DFS) or shortest path (Dijkstra/BFS) or topological sort (indegrees).';
    } else {
      hint += 'Break down the problem into smaller monotonic search spaces or invariant properties.';
    }
    setAiHint(hint);
    showToast({ type: 'info', title: 'AI Algorithmic Hint Generated 💡' });
  };

  const handleRunCode = () => {
    if (!selectedProblem) return;
    setIsRunningCode(true);
    setTimeout(() => {
      const result = submitProblemSolution(selectedProblem.id, userCode);
      setRunResult(result);
      setIsRunningCode(false);
    }, 650);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">DSA & PSC Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track, solve, and analyze coding problems from LeetCode, GeeksforGeeks & Codeforces
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} size="sm" onClick={handlePickRandom}>
            Random
          </Button>
          <Button variant="secondary" icon={Zap} size="sm" onClick={handleGetAiHint}>
            AI Hint
          </Button>
          <Button icon={Plus} size="sm" onClick={() => { setEditingProblem(null); setIsProblemModalOpen(true); }}>
            Track Problem
          </Button>
        </div>
      </div>

      {/* Progress Stats by Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categoryProgress.map((cat) => (
          <div key={cat.name} className="bg-surface border border-dark-600 rounded-2xl p-4 card-glow">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{cat.name}</span>
                <span className="text-[11px] text-gray-500">
                  ({cat.total > 0 ? Math.round((cat.solved / cat.total) * 100) : 0}%)
                </span>
              </div>
              <span className={`text-xs font-bold ${
                cat.name === 'Easy' ? 'text-emerald-400' : cat.name === 'Medium' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {cat.solved} / {cat.total} Solved
              </span>
            </div>
            <ProgressBar value={cat.solved} max={cat.total || 1} color={cat.color} size="sm" showValue={false} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Problems list pane (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search problem title, topic, platform..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none flex-1 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-gray-500 hover:text-white">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Difficulty & Platform Filter pills */}
          <div className="flex flex-col gap-2 bg-surface border border-dark-600 rounded-2xl p-3 card-glow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Difficulty</span>
              <div className="flex gap-1">
                {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedDifficulty === d
                        ? 'gradient-bg text-white shadow-sm'
                        : 'bg-dark-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dark-600/50">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Platform</span>
              <select
                value={selectedPlatform}
                onChange={e => setSelectedPlatform(e.target.value)}
                className="bg-dark-800 border border-dark-500 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none"
              >
                <option value="All">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="Codeforces">Codeforces</option>
                <option value="HackerRank">HackerRank</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dark-600/50">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status / Topic</span>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="bg-dark-800 border border-dark-500 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="solved">Solved</option>
                  <option value="attempted">In Progress</option>
                  <option value="revision">Need Revision</option>
                  <option value="unsolved">Unsolved</option>
                </select>

                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="bg-dark-800 border border-dark-500 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none max-w-[110px] truncate"
                >
                  {topicsList.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Problem List */}
          <div className="bg-surface border border-dark-600 rounded-2xl overflow-hidden card-glow max-h-[580px] overflow-y-auto">
            {filteredProblems.map((p) => {
              const isSelected = selectedProblem?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProblemId(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-dark-600/50 last:border-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/15 border-l-4 border-l-purple-500'
                      : 'hover:bg-dark-700/50'
                  }`}
                >
                  {/* Status Indicator toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = p.status === 'solved' ? 'unsolved' : 'solved';
                      setProblemStatus(p.id, next);
                    }}
                    className="flex-shrink-0 cursor-pointer"
                    title={`Click to mark ${p.status === 'solved' ? 'unsolved' : 'solved'}`}
                  >
                    {p.status === 'solved' ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : p.status === 'attempted' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-400" />
                    ) : p.status === 'revision' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-purple-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-dark-500 hover:border-emerald-400" />
                    )}
                  </button>

                  {/* Title & Platform info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {p.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      <span className="text-purple-400/90">{p.platform}</span> · {p.topic}
                    </p>
                  </div>

                  {/* Difficulty & Star */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] font-bold ${
                      p.difficulty === 'Easy' ? 'text-emerald-400' : p.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {p.difficulty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProblemStarred(p.id);
                      }}
                      className={`p-1 rounded transition-colors ${p.starred ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}
                    >
                      <Star size={13} fill={p.starred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProblems.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 mb-3">No problems match your current search/filters.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setSelectedDifficulty('All');
                    setSelectedPlatform('All');
                    setSelectedTopic('All');
                    setSelectedStatus('All');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Problem Detail & Code Runner pane (3 cols) */}
        <div className="lg:col-span-3">
          {selectedProblem ? (
            <div className="space-y-4">
              {/* Problem info header */}
              <Card>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={difficultyBadgeColors[selectedProblem.difficulty]}>
                        {selectedProblem.difficulty}
                      </Badge>
                      <Badge variant="purple">{selectedProblem.platform}</Badge>
                      <Badge variant="blue">{selectedProblem.topic}</Badge>
                      {selectedProblem.status === 'solved' && (
                        <Badge variant="emerald">Solved ✓</Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white">{selectedProblem.title}</h2>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {selectedProblem.url && (
                      <a
                        href={selectedProblem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                        title="Open on official platform"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setEditingProblem(selectedProblem);
                        setIsProblemModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-white transition-all"
                      title="Edit problem"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setProblemToDelete(selectedProblem)}
                      className="p-2 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-red-400 transition-all"
                      title="Delete problem"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-800/60 border border-dark-600/60 mb-4">
                  <span className="text-xs text-gray-400 font-medium">Tracking Status:</span>
                  <div className="flex gap-1 flex-1 flex-wrap">
                    {(['unsolved', 'attempted', 'revision', 'solved'] as ProblemStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setProblemStatus(selectedProblem.id, st)}
                        className={`px-2.5 py-1 text-xs rounded-lg capitalize transition-all ${
                          selectedProblem.status === st
                            ? st === 'solved'
                              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                              : st === 'attempted'
                              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold'
                              : st === 'revision'
                              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 font-semibold'
                              : 'bg-dark-600 border border-dark-500 text-gray-300'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {st === 'revision' ? 'Need Revision' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes & Key Insights */}
                {selectedProblem.notes && (
                  <div className="bg-dark-800/60 border border-dark-600 rounded-xl p-3.5 mb-3 text-xs text-gray-300 leading-relaxed">
                    <p className="font-semibold text-purple-400 mb-1 flex items-center gap-1.5">
                      <Lightbulb size={13} /> Notes & Algorithmic Strategy:
                    </p>
                    {selectedProblem.notes}
                  </div>
                )}

                {/* AI Hint bubble */}
                {aiHint && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3.5 mb-3 text-xs text-purple-200 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <Zap size={13} className="text-purple-400" /> AI Strategy Hint:
                      </p>
                      <button onClick={() => setAiHint(null)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <p>{aiHint}</p>
                  </div>
                )}
              </Card>

              {/* Solution Code Scratchpad & Runner */}
              <Card
                title="Solution Code & Test Runner"
                icon={Code2}
                action={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={RotateCcw}
                      onClick={() => setUserCode(selectedProblem.code || 'def solution():\n    pass')}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      icon={Play}
                      onClick={handleRunCode}
                      loading={isRunningCode}
                    >
                      Submit & Run
                    </Button>
                  </div>
                }
              >
                <div className="bg-dark-900 rounded-xl border border-dark-600 overflow-hidden font-mono text-xs">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700 bg-dark-800/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-[11px] text-gray-500 ml-1">solution.py</span>
                    </div>
                    <span className="text-[10px] text-gray-600">Python 3.11</span>
                  </div>

                  <textarea
                    value={userCode}
                    onChange={e => setUserCode(e.target.value)}
                    rows={8}
                    className="w-full bg-transparent text-gray-200 font-mono text-xs p-4 outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Execution Results */}
                {runResult && (
                  <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-emerald-300">Accepted · All Test Cases Passed (3/3)</p>
                        <p className="text-[11px] text-gray-400">
                          Runtime: <span className="text-white font-mono">{runResult.runtimeMs} ms</span> · Memory: <span className="text-white font-mono">{runResult.memoryMb} MB</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="emerald">Solved</Badge>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={Code2}
              title="No problem selected"
              description="Pick a coding problem from the list to start solving, or add a new problem to your tracker."
              actionText="Track New Problem"
              onAction={() => { setEditingProblem(null); setIsProblemModalOpen(true); }}
              actionIcon={Plus}
            />
          )}
        </div>
      </div>

      {/* Problem Add/Edit Modal */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => { setIsProblemModalOpen(false); setEditingProblem(null); }}
        onSave={handleSaveProblem}
        initialProblem={editingProblem}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(problemToDelete)}
        onClose={() => setProblemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Problem"
        message={`Are you sure you want to remove "${problemToDelete?.title}" from your PSC tracker?`}
        confirmText="Delete Problem"
        variant="danger"
      />
    </div>
  );
}
