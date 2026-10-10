import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Bold,
  Italic,
  List,
  Code,
  Link,
  Image,
  Heading1,
  Heading2,
  Maximize2,
  Minimize2,
  Download,
  Eye,
  Edit3,
  Columns,
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Pin,
  Trash2,
  Search,
  Tag,
  Copy,
  Check,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CategoryModal from '../components/notes/CategoryModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import type { SmartNote } from '../types';

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-purple-300 mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-5 mb-2.5 border-b border-dark-600 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold gradient-text mt-0 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-purple-200">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-dark-900 border border-dark-600 rounded-xl p-4 overflow-x-auto my-3"><code class="text-xs text-gray-200 font-mono whitespace-pre">$2</code></pre>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-purple-500 pl-3.5 py-1 text-gray-300 italic my-2.5 bg-purple-500/5 rounded-r-lg">$1</blockquote>')
    .replace(/^\| (.+) \|$/gm, (m) => {
      const cells = m.split('|').filter(c => c.trim() && !c.match(/^[-\s]+$/));
      return `<div class="flex gap-0">${cells.map(c => `<div class="flex-1 border border-dark-600 px-3 py-1.5 text-xs text-gray-300 bg-dark-800/40">${c.trim()}</div>`).join('')}</div>`;
    })
    .replace(/^\|[-\s|]+\|$/gm, '')
    .replace(/^- (.+)$/gm, '<li class="text-gray-300 text-xs ml-4 list-disc mb-1">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 text-xs ml-4 list-decimal mb-1">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-purple-400 hover:text-purple-300 underline font-medium">$1</a>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 text-xs leading-relaxed mb-3">')
    .replace(/^(?!<[h|b|p|l|c|d|u])(.+)$/gm, '<p class="text-gray-300 text-xs leading-relaxed mb-2">$1</p>');
}

type ViewMode = 'editor' | 'preview' | 'split';

export default function MarkdownFocus() {
  const {
    notes,
    categories,
    selectedNoteId,
    setSelectedNoteId,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePinned,
    addCategory,
    focusSessions,
    pomodoroMode,
    pomodoroSecondsLeft,
    pomodoroIsRunning,
    pomodoroCompletedCount,
    startPomodoro,
    pausePomodoro,
    resumePomodoro,
    resetPomodoro,
    skipPomodoro,
    switchPomodoroMode,
    settings,
    updatePomodoroSettings,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [focusMode, setFocusMode] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<SmartNote | null>(null);

  // Active note
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');

  // Sync active note into local editor state
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
    }
  }, [activeNote]);

  // Debounced auto-save
  useEffect(() => {
    if (!activeNote) return;
    if (localTitle !== activeNote.title || localContent !== activeNote.content) {
      const handler = setTimeout(() => {
        updateNote(activeNote.id, {
          title: localTitle.trim() || 'Untitled Note',
          content: localContent,
        });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [localTitle, localContent, activeNote, updateNote]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (selectedCategory !== 'All' && note.category !== selectedCategory) return false;
      if (noteSearch.trim()) {
        const q = noteSearch.toLowerCase();
        const mTitle = note.title.toLowerCase().includes(q);
        const mContent = note.content.toLowerCase().includes(q);
        const mTag = note.tags.some(t => t.toLowerCase().includes(q));
        if (!mTitle && !mContent && !mTag) return false;
      }
      return true;
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [notes, selectedCategory, noteSearch]);

  const wordCount = useMemo(() => localContent.split(/\s+/).filter(Boolean).length, [localContent]);
  const charCount = localContent.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Toolbar action helpers
  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('md-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localContent.slice(start, end);
    const newContent = localContent.slice(0, start) + before + selected + after + localContent.slice(end);
    setLocalContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  const toolbarItems = [
    { icon: Heading1, action: () => insertText('# '), title: 'Heading 1' },
    { icon: Heading2, action: () => insertText('## '), title: 'Heading 2' },
    { icon: Bold, action: () => insertText('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*'), title: 'Italic' },
    { icon: Code, action: () => insertText('`', '`'), title: 'Inline Code' },
    { icon: List, action: () => insertText('- '), title: 'Bullet List' },
    { icon: Link, action: () => insertText('[', '](https://)'), title: 'Hyperlink' },
    { icon: Image, action: () => insertText('![alt](', ')'), title: 'Image' },
  ];

  const handleCreateNewNote = () => {
    const newId = addNote({
      title: 'Untitled Note',
      content: '# New Study Note\n\nStart writing notes, formulas, and code...',
      category: categories[0]?.name || 'General',
      tags: ['Study'],
      pinned: false,
    });
    setSelectedNoteId(newId);
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([localContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(localTitle || 'note').toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'Exported Note', message: 'Markdown file downloaded' });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(localContent);
    setCopied(true);
    showToast({ type: 'info', title: 'Copied to Clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 ${focusMode ? 'fixed inset-0 z-50 bg-dark-900 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      {/* Top Header */}
      {!focusMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Smart Notes & Focus Mode</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Distraction-free Markdown editor with integrated Pomodoro deep work timer
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopyMarkdown}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportMarkdown}>
              Export .md
            </Button>
            <Button size="sm" icon={Maximize2} onClick={() => setFocusMode(true)}>
              Full Focus Mode
            </Button>
          </div>
        </div>
      )}

      {/* Pomodoro Timer Bar */}
      <div className="bg-surface border border-dark-600 rounded-2xl p-4 sm:p-5 card-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-dark-800 p-1 rounded-xl border border-dark-600 self-start">
            <button
              onClick={() => switchPomodoroMode('focus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pomodoroMode === 'focus' ? 'gradient-bg text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Focus ({settings.pomodoro.focusDuration}m)
            </button>
            <button
              onClick={() => switchPomodoroMode('shortBreak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pomodoroMode === 'shortBreak' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Short Break ({settings.pomodoro.shortBreakDuration}m)
            </button>
            <button
              onClick={() => switchPomodoroMode('longBreak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pomodoroMode === 'longBreak' ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Long Break ({settings.pomodoro.longBreakDuration}m)
            </button>
          </div>

          {/* Big Timer Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-wider">
                {formatTimer(pomodoroSecondsLeft)}
              </span>
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                {pomodoroMode === 'focus' ? 'Deep Work' : 'Break Time'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              {pomodoroIsRunning ? (
                <button
                  onClick={pausePomodoro}
                  className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                  title="Pause Timer"
                >
                  <Pause size={18} />
                </button>
              ) : (
                <button
                  onClick={pomodoroSecondsLeft === 0 ? startPomodoro : resumePomodoro}
                  className="p-2.5 rounded-xl gradient-bg text-white shadow-lg shadow-purple-900/40 hover:opacity-90 transition-all cursor-pointer"
                  title="Start Timer"
                >
                  <Play size={18} />
                </button>
              )}

              <button
                onClick={resetPomodoro}
                className="p-2.5 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={skipPomodoro}
                className="p-2.5 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Skip to Next Mode"
              >
                <SkipForward size={16} />
              </button>

              <button
                onClick={() => updatePomodoroSettings({ soundEnabled: !settings.pomodoro.soundEnabled })}
                className="p-2.5 rounded-xl bg-dark-700 border border-dark-500 text-gray-400 hover:text-white transition-all"
                title={settings.pomodoro.soundEnabled ? 'Mute Alert Chime' : 'Unmute Alert Chime'}
              >
                {settings.pomodoro.soundEnabled ? <Volume2 size={16} className="text-purple-400" /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* Pomodoro Completed Stats */}
          <div className="flex items-center gap-3 bg-dark-800/80 border border-dark-600 rounded-xl px-3.5 py-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Flame size={15} className="text-orange-400" />
              <span className="font-bold text-white">{pomodoroCompletedCount}</span>
              <span className="text-gray-400">Pomodoros today</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes Library Sidebar (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <Card
            title="Smart Notes"
            subtitle={`${notes.length} total notes`}
            icon={FileText}
            action={
              <button
                onClick={handleCreateNewNote}
                className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                title="New Note"
              >
                <Plus size={16} />
              </button>
            }
            padding={false}
          >
            {/* Search & Category Filter */}
            <div className="p-3 border-b border-dark-600/60 space-y-2">
              <div className="flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-xl px-2.5 py-1.5">
                <Search size={13} className="text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={noteSearch}
                  onChange={e => setNoteSearch(e.target.value)}
                  className="bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none flex-1 min-w-0"
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center justify-between gap-1">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-dark-800 border border-dark-500 rounded-lg px-2 py-1 text-[11px] text-gray-300 outline-none flex-1"
                >
                  <option value="All">All Categories ({notes.length})</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-1.5 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white"
                  title="Add Category"
                >
                  <Tag size={12} />
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="divide-y divide-dark-600/40 max-h-[460px] overflow-y-auto">
              {filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 text-left transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-purple-500/15 border-l-2 border-l-purple-500'
                        : 'hover:bg-dark-700/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {note.pinned && <Pin size={11} className="text-purple-400 flex-shrink-0 rotate-45" />}
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {note.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotePinned(note.id);
                          }}
                          className={`p-1 rounded ${note.pinned ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}
                          title={note.pinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note);
                          }}
                          className="p-1 rounded text-gray-500 hover:text-red-400"
                          title="Delete note"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mb-1.5">
                      {note.content.replace(/[#*`_]/g, '').slice(0, 70)}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="text-purple-400/80 font-medium">{note.category}</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">
                  No notes match your filter.
                </div>
              )}
            </div>
          </Card>

          {/* Focus Session History Log */}
          <Card title="Focus History" subtitle="Recent completed Pomodoros" icon={Timer} padding={false}>
            <div className="divide-y divide-dark-600/40 max-h-48 overflow-y-auto p-2">
              {focusSessions.slice(0, 5).map((f) => (
                <div key={f.id} className="p-2 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-200">{f.taskTitle || 'Focus Session'}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(f.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant={f.mode === 'focus' ? 'purple' : 'cyan'} size="sm">
                    {f.durationMinutes}m {f.mode}
                  </Badge>
                </div>
              ))}
              {focusSessions.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No completed sessions yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Markdown Editor & Preview Pane (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          {activeNote ? (
            <div className="bg-surface border border-dark-600 rounded-2xl overflow-hidden card-glow flex flex-col flex-1">
              {/* Note Title & Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-dark-600/60 bg-dark-800/40 gap-3">
                <input
                  type="text"
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="bg-transparent text-base font-bold text-white outline-none flex-1 placeholder-gray-600"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={activeNote.category}
                    onChange={e => updateNote(activeNote.id, { category: e.target.value })}
                    className="bg-dark-800 border border-dark-500 rounded-lg px-2.5 py-1 text-xs text-gray-300 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-dark-600/60 flex-wrap bg-dark-800/20">
                {/* Format buttons */}
                <div className="flex items-center gap-0.5">
                  {toolbarItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      title={item.title}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                    >
                      <item.icon size={13} />
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-dark-500 mx-1.5" />

                {/* View Mode Toggle */}
                <div className="flex items-center bg-dark-800 rounded-lg p-0.5 border border-dark-600">
                  {([
                    { mode: 'editor' as ViewMode, icon: Edit3, label: 'Editor Only' },
                    { mode: 'split' as ViewMode, icon: Columns, label: 'Split View' },
                    { mode: 'preview' as ViewMode, icon: Eye, label: 'Preview Only' },
                  ]).map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      title={label}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === mode ? 'gradient-bg text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>

                <div className="flex-1" />

                {focusMode && (
                  <button
                    onClick={() => setFocusMode(false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-700 border border-dark-500 text-xs text-gray-300 hover:text-white"
                  >
                    <Minimize2 size={13} /> Exit Fullscreen
                  </button>
                )}
              </div>

              {/* Editor & Preview Panes */}
              <div className={`flex ${focusMode ? 'h-[600px]' : 'h-[460px]'} overflow-hidden divide-x divide-dark-600/60`}>
                {/* Editor textarea */}
                {(viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                    <textarea
                      id="md-editor"
                      value={localContent}
                      onChange={e => setLocalContent(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-gray-200 font-mono p-4 resize-none outline-none leading-relaxed placeholder-gray-700"
                      placeholder="Write your study notes using Markdown..."
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Preview renderer */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-dark-900/30 p-4`}>
                    <div
                      className="prose prose-invert max-w-none text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent) }}
                    />
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-dark-600/60 bg-dark-800/40 text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <FileText size={12} className="text-purple-400" />
                  <span className="truncate max-w-[150px]">{localTitle || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span>{wordCount} words</span>
                  <span>{charCount} chars</span>
                  <span>~{readTimeMin} min read</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Auto-saved</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No note selected"
              description="Create a note or select one from the sidebar to start writing study notes and documentation."
              actionText="Create New Note"
              onAction={handleCreateNewNote}
              actionIcon={Plus}
            />
          )}
        </div>
      </div>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={addCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title="Delete Smart Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
        confirmText="Delete Note"
        variant="danger"
      />
    </div>
  );
}
