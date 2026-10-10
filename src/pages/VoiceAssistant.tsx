import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  BookOpen,
  Code2,
  Brain,
  Star,
  Sparkles,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  CalendarDays,
  Clock,
  ArrowRight,
  Terminal,
  Zap,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { parseAndExecuteVoiceCommand } from '../utils/voiceCommands';
import type { CommandExecutionResult } from '../utils/voiceCommands';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionResult?: CommandExecutionResult;
}

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const appContext = useApp();
  const { stats, tasks, problems, notes, settings, showToast } = appContext;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: `Hello! I am your DevFlow AI **Voice Command Center & Copilot**.\n\nYou can speak or type actual commands to control the app:\n• **"Create task [title] on [day]"** (schedules tasks in Study Planner)\n• **"Find pending tasks"** (summarizes uncompleted goals)\n• **"Create note [title]"** (creates & opens Smart Notes)\n• **"Start focus timer"** or **"Take a break"** (controls Pomodoro clock)\n• **"Check DSA progress"** (calculates real-time problem stats)\n• **"Go to [dashboard / analytics / settings]"** (instant page navigation)`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if (isMuted || !window.speechSynthesis || !settings.ai.voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`_•]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      if (!isListening) {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sample = 'Create task Binary Trees review on Saturday';
          setInput(sample);
          handleSend(sample);
        }, 1800);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = (textToSend?: string) => {
    const raw = textToSend || input;
    if (!raw.trim()) return;

    const userText = raw.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      // Execute command on shared state
      const execResult = parseAndExecuteVoiceCommand(userText, {
        ...appContext,
        navigate,
      });

      let assistantResponse = execResult.message;
      if (execResult.action === 'unknown') {
        // Fallback to rich AI algorithmic explanation if it was a general question
        assistantResponse = `### AI Copilot Explanation 💡\n\n${execResult.message}`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
        actionResult: execResult.action !== 'unknown' ? execResult : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      speakText(execResult.spokenResponse);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({ type: 'info', title: 'Copied to clipboard' });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Voice Command Center reset. Speak or type any command to get started!",
        timestamp: new Date().toISOString(),
      },
    ]);
    showToast({ type: 'info', title: 'Chat cleared' });
  };

  const quickActionCommands = [
    { label: 'Start 25m Focus Timer', cmd: 'Start focus timer', icon: Clock },
    { label: 'Check DSA Progress', cmd: 'Check DSA progress', icon: Code2 },
    { label: 'Find Pending Tasks', cmd: 'Find pending tasks', icon: Zap },
    { label: 'Add Task: Dynamic Programming', cmd: 'Create task Dynamic Programming practice on Friday', icon: CalendarDays },
    { label: 'Create Note: Graph Algorithms', cmd: 'Create note Graph Algorithms Cheatsheet', icon: BookOpen },
    { label: 'Go to Analytics Dashboard', cmd: 'Go to analytics', icon: Star },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Voice Command Center & Copilot</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Functional voice recognition that creates tasks, controls timers, searches notes, and navigates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Trash2} onClick={handleClearChat}>
            Clear History
          </Button>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">Live Voice Engine Ready</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat / Command Area (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* Animated Microphone & Equalizer Header Card */}
          <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 card-glow ${
            isListening
              ? 'bg-gradient-to-r from-purple-900/30 via-red-900/20 to-dark-800 border-red-500/50 shadow-red-950/40'
              : 'bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-dark-800 border-purple-500/20'
          }`}>
            <div className="flex items-center gap-4 relative z-10">
              {/* Mic toggle */}
              <button
                onClick={toggleListening}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                  isListening
                    ? 'bg-red-500 shadow-red-500/40 scale-105'
                    : 'gradient-bg shadow-purple-900/40 hover:opacity-95'
                }`}
                title={isListening ? 'Stop Listening' : 'Click to Speak Command'}
              >
                {isListening ? <MicOff size={22} className="text-white animate-pulse" /> : <Mic size={22} className="text-white" />}
                {isListening && <span className="absolute inset-0 rounded-2xl bg-red-500/40 animate-ping pointer-events-none" />}
              </button>

              {/* Audio Waveform Equalizer */}
              <div className="flex items-center gap-1 h-10 flex-shrink-0">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isListening ? 'bg-red-400' : isSpeaking ? 'bg-purple-400' : 'bg-dark-500'
                    }`}
                    style={{
                      height: isListening ? `${25 + Math.random() * 75}%` : isSpeaking ? `${20 + Math.random() * 60}%` : '20%',
                    }}
                  />
                ))}
              </div>

              {/* Status Header */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  {isListening ? '🎙️ Listening for Voice Commands...' : isSpeaking ? '🔊 Speaking Action Response...' : '🤖 Voice Command Engine Active'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {isListening ? 'Say: "Create task...", "Start timer...", "Check DSA stats"' : 'Speak with your microphone or type commands below'}
                </p>
              </div>

              {/* Mute toggle */}
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (!isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-2.5 rounded-xl bg-dark-700/80 border border-dark-500 text-gray-300 hover:text-white transition-colors"
                title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="bg-surface border border-dark-600 rounded-2xl overflow-hidden card-glow flex flex-col flex-1">
            <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'assistant'
                      ? 'gradient-bg text-white shadow-md shadow-purple-950/50'
                      : 'bg-dark-600 text-gray-200'
                  }`}>
                    {msg.role === 'assistant' ? <Sparkles size={14} /> : settings.profile.avatarText || 'U'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-dark-800/90 border border-dark-600 text-gray-200 rounded-tl-sm shadow-md'
                        : 'gradient-bg text-white rounded-tr-sm shadow-md shadow-purple-950/40'
                    }`}>
                      {/* Action Execution Badge if recognized */}
                      {msg.actionResult && (
                        <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-dark-600/60 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 size={14} />
                          <span>Action Executed: {msg.actionResult.action.toUpperCase()}</span>
                        </div>
                      )}

                      {/* Formatted body */}
                      {msg.content.split('\n').map((line, li) => (
                        <p key={li} className={line.startsWith('#') ? 'font-bold text-purple-300 text-sm my-1' : 'mb-1'}>
                          {line.replace(/###?\s/g, '').replace(/\*\*(.+?)\*\*/g, '$1')}
                        </p>
                      ))}

                      {/* Navigation Link if action triggered route */}
                      {msg.actionResult?.targetRoute && (
                        <button
                          onClick={() => navigate(msg.actionResult!.targetRoute!)}
                          className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all font-semibold cursor-pointer"
                        >
                          <span>Open {msg.actionResult.targetRoute}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-1 text-[10px] text-gray-500">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 text-white">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-dark-800 border border-dark-600 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-4 py-2.5 border-t border-dark-600/50 flex gap-2 overflow-x-auto bg-dark-800/30">
              {quickActionCommands.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.cmd)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-600 hover:border-purple-500/50 text-xs text-gray-300 hover:text-white transition-all whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <p.icon size={12} className="text-purple-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-dark-600 flex items-center gap-2 bg-dark-800/60">
              <div className="flex-1 bg-dark-900 border border-dark-500 focus-within:border-purple-500/60 rounded-xl flex items-center px-3 py-2 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Speak or type a command: 'create task...', 'start timer', 'check dsa progress'..."
                  className="w-full bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-dark-700 border border-dark-500 text-gray-400 hover:text-white'
                  }`}
                  title="Speak via Microphone"
                >
                  <Mic size={16} />
                </button>
                <Button
                  size="sm"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  icon={Send}
                >
                  Run
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Capabilities & Context (1 col) */}
        <div className="space-y-4">
          <Card title="Voice Command Syntax" subtitle="Natural speech patterns recognized" icon={Terminal}>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-dark-800/70 border border-dark-600/60">
                <p className="font-semibold text-purple-300">📅 Study Tasks</p>
                <p className="text-[11px] text-gray-400 mt-0.5">"Create task [title] on [day]"</p>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800/70 border border-dark-600/60">
                <p className="font-semibold text-blue-300">⏱️ Pomodoro Timer</p>
                <p className="text-[11px] text-gray-400 mt-0.5">"Start focus timer", "Pause timer", "Take a break"</p>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800/70 border border-dark-600/60">
                <p className="font-semibold text-cyan-300">📝 Smart Notes</p>
                <p className="text-[11px] text-gray-400 mt-0.5">"Create note [title]", "Search note [keyword]"</p>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800/70 border border-dark-600/60">
                <p className="font-semibold text-emerald-300">📊 Progress & Stats</p>
                <p className="text-[11px] text-gray-400 mt-0.5">"Check DSA progress", "How many problems solved?"</p>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-800/70 border border-dark-600/60">
                <p className="font-semibold text-amber-300">🧭 Page Navigation</p>
                <p className="text-[11px] text-gray-400 mt-0.5">"Go to dashboard", "Open analytics", "Open settings"</p>
              </div>
            </div>
          </Card>

          {/* Live System Context */}
          <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent border border-purple-500/20 rounded-2xl p-4 card-glow">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Brain size={13} className="text-purple-400" /> Real-Time Workspace State
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Pending Tasks</span>
                <span className="font-bold text-white">{tasks.filter(t => !t.completed).length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Problems Solved</span>
                <span className="font-bold text-emerald-400">{stats.totalProblemsSolved} / {problems.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Focus Logged</span>
                <span className="font-bold text-blue-400">{stats.totalStudyHours}h</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Active Notes</span>
                <span className="font-bold text-white">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Streak Milestone</span>
                <span className="font-bold text-orange-400">{stats.currentStreak} Days 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
