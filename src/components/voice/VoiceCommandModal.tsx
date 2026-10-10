import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Zap,
  CheckCircle2,
  AlertCircle,
  Command,
  ArrowRight,
  Clock,
  Code2,
  CalendarDays,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { parseAndExecuteVoiceCommand } from '../../utils/voiceCommands';
import type { CommandExecutionResult } from '../../utils/voiceCommands';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceCommandModal({ isOpen, onClose }: VoiceCommandModalProps) {
  const navigate = useNavigate();
  const appContext = useApp();
  const { showToast, settings } = appContext;

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<CommandExecutionResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
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
        handleExecute(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

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
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      if (!isListening) {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          const sample = 'Create task Dynamic Programming practice on Thursday';
          setInput(sample);
          handleExecute(sample);
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
        setLastResult(null);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleExecute = (cmdText?: string) => {
    const toRun = cmdText || input;
    if (!toRun.trim()) return;

    setIsExecuting(true);

    const result = parseAndExecuteVoiceCommand(toRun, {
      ...appContext,
      navigate,
    });

    setLastResult(result);
    setIsExecuting(false);
    speakText(result.spokenResponse);

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Voice Action Executed',
        message: result.message.split('\n')[0],
      });
      // If navigation or note creation happened, auto close modal after brief visual confirmation
      if (result.targetRoute) {
        setTimeout(() => {
          onClose();
        }, 900);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const sampleCommands = [
    { label: 'Start focus timer', cmd: 'Start focus timer', icon: Clock },
    { label: 'Add task for Tuesday', cmd: 'Create task Graph BFS Algorithms on Tuesday', icon: CalendarDays },
    { label: 'Check DSA progress', cmd: 'Check DSA progress', icon: Code2 },
    { label: 'Create new note', cmd: 'Create note Dynamic Programming Cheatsheet', icon: FileText },
    { label: 'Find pending tasks', cmd: 'Find pending tasks', icon: Zap },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice & Text Command Center"
      subtitle="Speak or type commands to control DevFlow AI instantly"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Voice visualizer header */}
        <div className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
          isListening
            ? 'bg-red-500/10 border-red-500/40 animate-pulse'
            : 'bg-dark-800/80 border-dark-600'
        }`}>
          <button
            onClick={toggleListening}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'gradient-bg text-white shadow-md'
            }`}
            title={isListening ? 'Stop Listening' : 'Click to Speak'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">
              {isListening ? '🎙️ Listening to your voice...' : 'Speak or type any command below'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {isListening ? 'Say "Create task...", "Start timer...", "Check DSA stats"' : 'Voice recognition active & ready'}
            </p>
          </div>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
            }}
            className="p-2 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white"
            title={isMuted ? 'Unmute voice responses' : 'Mute voice responses'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-purple-400" />}
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-dark-900 border border-dark-500 focus-within:border-purple-500/70 rounded-xl p-2 transition-colors">
          <Command size={16} className="text-purple-400 ml-2 flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or speak a command (e.g. 'start timer', 'go to analytics')..."
            className="bg-transparent text-xs text-gray-200 placeholder-gray-500 outline-none flex-1 min-w-0 px-2 py-1"
            autoFocus
          />
          <button
            onClick={() => handleExecute()}
            disabled={!input.trim() || isExecuting}
            className="p-2 rounded-lg gradient-bg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>

        {/* Command Execution Result Card */}
        {lastResult && (
          <div className={`p-4 rounded-xl border animate-fadeIn ${
            lastResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-dark-800/90 border-dark-600 text-gray-300'
          }`}>
            <div className="flex items-start gap-2.5 mb-2">
              {lastResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white mb-1">
                  {lastResult.success ? 'Action Executed Successfully' : 'Command Not Recognized'}
                </p>
                <div className="text-xs leading-relaxed whitespace-pre-line text-gray-300">
                  {lastResult.message}
                </div>
              </div>
            </div>

            {lastResult.targetRoute && (
              <div className="flex justify-end pt-2">
                <span className="text-[11px] text-purple-400 flex items-center gap-1 font-semibold">
                  Redirecting to {lastResult.targetRoute} <ArrowRight size={11} />
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Quick Actions & Templates
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleCommands.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(item.cmd);
                  handleExecute(item.cmd);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-600 hover:border-purple-500/50 text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <item.icon size={12} className="text-purple-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
