import type { WeekDay, TaskType } from '../types';

export interface CommandExecutionResult {
  action: 'create_task' | 'list_tasks' | 'create_note' | 'search_notes' | 'timer_start' | 'timer_pause' | 'timer_reset' | 'check_dsa' | 'navigate' | 'unknown';
  success: boolean;
  message: string;
  spokenResponse: string;
  targetRoute?: string;
  data?: any;
}

export interface VoiceCommandContext {
  tasks: any[];
  problems: any[];
  notes: any[];
  focusSessions: any[];
  stats: any;
  pomodoroSecondsLeft: number;
  pomodoroMode: string;
  addTask: (task: any) => void;
  toggleTaskComplete: (id: string) => void;
  addNote: (note: any) => string;
  setSelectedNoteId: (id: string | null) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  switchPomodoroMode: (mode: any) => void;
  navigate: (route: string) => void;
  showToast: (toast: any) => void;
}

const WEEKDAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function parseAndExecuteVoiceCommand(
  rawInput: string,
  ctx: VoiceCommandContext
): CommandExecutionResult {
  const input = rawInput.trim().toLowerCase();

  // 1. Navigation Commands
  if (
    input.includes('go to') ||
    input.includes('navigate to') ||
    input.includes('open page') ||
    input.includes('open') ||
    input.includes('show page')
  ) {
    if (input.includes('dash') || input.includes('home')) {
      ctx.navigate('/dashboard');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Dashboard',
        spokenResponse: 'Opening your Dashboard.',
        targetRoute: '/dashboard',
      };
    }
    if (input.includes('study') || input.includes('plan') || input.includes('schedule')) {
      ctx.navigate('/study-planner');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Study Planner',
        spokenResponse: 'Opening your Study Planner.',
        targetRoute: '/study-planner',
      };
    }
    if (input.includes('dsa') || input.includes('problem') || input.includes('psc') || input.includes('practice') || input.includes('leetcode')) {
      ctx.navigate('/dsa-practice');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to DSA Practice',
        spokenResponse: 'Opening DSA Problem Tracker.',
        targetRoute: '/dsa-practice',
      };
    }
    if (input.includes('note') || input.includes('markdown') || input.includes('write')) {
      ctx.navigate('/markdown-focus');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Smart Notes & Focus Mode',
        spokenResponse: 'Opening Smart Notes and Focus Mode.',
        targetRoute: '/markdown-focus',
      };
    }
    if (input.includes('voice') || input.includes('assistant') || input.includes('ai') || input.includes('copilot')) {
      ctx.navigate('/voice-assistant');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Voice Command Center',
        spokenResponse: 'Opening Voice Command Center.',
        targetRoute: '/voice-assistant',
      };
    }
    if (input.includes('analytic') || input.includes('stat') || input.includes('chart') || input.includes('progress report')) {
      ctx.navigate('/analytics');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Analytics Dashboard',
        spokenResponse: 'Opening Performance Analytics.',
        targetRoute: '/analytics',
      };
    }
    if (input.includes('setting') || input.includes('profile') || input.includes('preference')) {
      ctx.navigate('/settings');
      return {
        action: 'navigate',
        success: true,
        message: 'Navigating to Settings',
        spokenResponse: 'Opening System Settings.',
        targetRoute: '/settings',
      };
    }
  }

  // 2. Focus Timer / Pomodoro Controls
  if (
    input.includes('timer') ||
    input.includes('pomodoro') ||
    input.includes('focus session') ||
    input.includes('break')
  ) {
    if (input.includes('start') || input.includes('resume') || input.includes('begin') || input.includes('play')) {
      ctx.startPomodoro();
      ctx.showToast({ type: 'success', title: 'Focus Timer Started', message: '25-minute Pomodoro session is now running' });
      return {
        action: 'timer_start',
        success: true,
        message: 'Started Pomodoro Focus Timer (25 min)',
        spokenResponse: 'Focus timer started. Time to get into deep work!',
      };
    }
    if (input.includes('pause') || input.includes('stop') || input.includes('hold')) {
      ctx.pausePomodoro();
      ctx.showToast({ type: 'info', title: 'Focus Timer Paused' });
      return {
        action: 'timer_pause',
        success: true,
        message: 'Paused Pomodoro Focus Timer',
        spokenResponse: 'Timer paused.',
      };
    }
    if (input.includes('reset') || input.includes('restart') || input.includes('clear timer')) {
      ctx.resetPomodoro();
      ctx.showToast({ type: 'info', title: 'Focus Timer Reset' });
      return {
        action: 'timer_reset',
        success: true,
        message: 'Reset Focus Timer',
        spokenResponse: 'Timer has been reset to default duration.',
      };
    }
    if (input.includes('short break') || input.includes('5 minute break') || input.includes('take a break')) {
      ctx.switchPomodoroMode('shortBreak');
      ctx.startPomodoro();
      ctx.showToast({ type: 'info', title: 'Short Break Started', message: '5 minutes timer running' });
      return {
        action: 'timer_start',
        success: true,
        message: 'Started 5-minute Short Break',
        spokenResponse: 'Short break started. Relax and grab some water!',
      };
    }
    if (input.includes('long break') || input.includes('15 minute break')) {
      ctx.switchPomodoroMode('longBreak');
      ctx.startPomodoro();
      ctx.showToast({ type: 'info', title: 'Long Break Started', message: '15 minutes timer running' });
      return {
        action: 'timer_start',
        success: true,
        message: 'Started 15-minute Long Break',
        spokenResponse: 'Long break started. Take a well deserved rest.',
      };
    }
  }

  // 3. Create Study Task Command
  if (
    input.startsWith('create task') ||
    input.startsWith('add task') ||
    input.startsWith('schedule task') ||
    input.startsWith('new task') ||
    input.startsWith('create study') ||
    input.startsWith('add study')
  ) {
    // Extract title
    let taskTitle = rawInput
      .replace(/^(create task|add task|schedule task|new task|create study session|add study session|create study|add study)\s+/i, '')
      .trim();

    // Check if a day is mentioned
    let targetDay: WeekDay = 'Mon';
    const dayMatch = taskTitle.match(/\b(on|for)\s+(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)\b/i);
    if (dayMatch) {
      const matchedWord = dayMatch[2].toLowerCase();
      if (matchedWord.startsWith('mon')) targetDay = 'Mon';
      else if (matchedWord.startsWith('tue')) targetDay = 'Tue';
      else if (matchedWord.startsWith('wed')) targetDay = 'Wed';
      else if (matchedWord.startsWith('thu')) targetDay = 'Thu';
      else if (matchedWord.startsWith('fri')) targetDay = 'Fri';
      else if (matchedWord.startsWith('sat')) targetDay = 'Sat';
      else if (matchedWord.startsWith('sun')) targetDay = 'Sun';

      taskTitle = taskTitle.replace(dayMatch[0], '').trim();
    } else {
      // Default to today's day
      const todayIdx = new Date().getDay();
      const mappedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
      targetDay = WEEKDAYS[mappedIdx] || 'Mon';
    }

    // Determine type
    let taskType: TaskType = 'DSA';
    if (input.includes('practice') || input.includes('leetcode')) taskType = 'Practice';
    else if (input.includes('interview') || input.includes('mock')) taskType = 'Interview';
    else if (input.includes('review')) taskType = 'Review';
    else if (input.includes('project')) taskType = 'Project';

    const cleanTitle = taskTitle || 'Focused Algorithm Practice';

    ctx.addTask({
      title: cleanTitle,
      day: targetDay,
      date: new Date().toISOString().slice(0, 10),
      durationMinutes: 90,
      durationLabel: '1.5h',
      type: taskType,
      priority: 'high',
      completed: false,
    });

    return {
      action: 'create_task',
      success: true,
      message: `Created task "${cleanTitle}" scheduled for ${targetDay} (1.5h)`,
      spokenResponse: `I scheduled "${cleanTitle}" for ${targetDay}.`,
      data: { title: cleanTitle, day: targetDay },
    };
  }

  // 4. Find / List Pending Tasks
  if (
    input.includes('pending task') ||
    input.includes('find task') ||
    input.includes('show task') ||
    input.includes('list task') ||
    input.includes('what are my goals') ||
    input.includes('what are my tasks') ||
    input.includes('tasks for today')
  ) {
    const pending = ctx.tasks.filter((t: any) => !t.completed);
    const summary = pending.slice(0, 4).map((t: any) => `• ${t.title} (${t.day}, ${t.durationLabel})`).join('\n');

    return {
      action: 'list_tasks',
      success: true,
      message: `Found ${pending.length} pending study tasks:\n${summary}`,
      spokenResponse: `You have ${pending.length} pending tasks. The next one is "${pending[0]?.title || 'none'}".`,
      data: pending,
    };
  }

  // 5. Create Note Command
  if (
    input.startsWith('create note') ||
    input.startsWith('new note') ||
    input.startsWith('add note') ||
    input.startsWith('write note')
  ) {
    const noteTitle = rawInput
      .replace(/^(create note|new note|add note|write note)\s+/i, '')
      .trim() || 'New Voice Note';

    const newId = ctx.addNote({
      title: noteTitle,
      content: `# ${noteTitle}\n\n*Created via DevFlow AI Voice Command Center on ${new Date().toLocaleDateString()}*\n\n- Key algorithmic takeaways\n- Edge cases and complexities\n`,
      category: 'Algorithms',
      tags: ['Voice Note'],
      pinned: false,
    });

    ctx.setSelectedNoteId(newId);
    ctx.navigate('/markdown-focus');

    return {
      action: 'create_note',
      success: true,
      message: `Created Smart Note "${noteTitle}" and opened editor`,
      spokenResponse: `Created note "${noteTitle}" and opened it in Markdown Focus mode.`,
      targetRoute: '/markdown-focus',
      data: { id: newId, title: noteTitle },
    };
  }

  // 6. Search Notes Command
  if (
    input.startsWith('search note') ||
    input.startsWith('find note') ||
    input.startsWith('search notes') ||
    input.startsWith('find notes')
  ) {
    const query = rawInput
      .replace(/^(search note|find note|search notes|find notes|look for note|open note)\s+/i, '')
      .trim().toLowerCase();

    const matches = ctx.notes.filter((n: any) =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.tags.some((t: string) => t.toLowerCase().includes(query))
    );

    if (matches.length > 0) {
      ctx.setSelectedNoteId(matches[0].id);
      ctx.navigate('/markdown-focus');
      return {
        action: 'search_notes',
        success: true,
        message: `Found ${matches.length} matching note(s). Opened "${matches[0].title}".`,
        spokenResponse: `Found note "${matches[0].title}". Opening it now.`,
        targetRoute: '/markdown-focus',
        data: matches,
      };
    } else {
      return {
        action: 'search_notes',
        success: false,
        message: `No notes found matching "${query}".`,
        spokenResponse: `I could not find any notes matching "${query}".`,
      };
    }
  }

  // 7. Check DSA / PSC Progress Command
  if (
    input.includes('dsa progress') ||
    input.includes('coding progress') ||
    input.includes('how many problems') ||
    input.includes('problems solved') ||
    input.includes('dsa stats') ||
    input.includes('check progress')
  ) {
    const solved = ctx.problems.filter((p: any) => p.status === 'solved');
    const easyCount = solved.filter((p: any) => p.difficulty === 'Easy').length;
    const medCount = solved.filter((p: any) => p.difficulty === 'Medium').length;
    const hardCount = solved.filter((p: any) => p.difficulty === 'Hard').length;
    const accuracy = ctx.stats.accuracyRate;

    const message = `DSA Progress Summary:\n• Total Solved: ${solved.length} / ${ctx.problems.length} problems (${accuracy}% completion rate)\n• Easy: ${easyCount} | Medium: ${medCount} | Hard: ${hardCount}\n• Active Streak: ${ctx.stats.currentStreak} Days 🔥`;
    const spoken = `You have solved ${solved.length} out of ${ctx.problems.length} problems with an accuracy of ${accuracy} percent. ${easyCount} Easy, ${medCount} Medium, and ${hardCount} Hard.`;

    return {
      action: 'check_dsa',
      success: true,
      message,
      spokenResponse: spoken,
      data: { total: ctx.problems.length, solved: solved.length, easyCount, medCount, hardCount, accuracy },
    };
  }

  // 8. Unknown / Informational Fallback
  return {
    action: 'unknown',
    success: false,
    message: `I didn't recognize that command. Try saying:\n• "Create task Binary Search practice on Wednesday"\n• "Find pending tasks"\n• "Create note Dynamic Programming Patterns"\n• "Start focus timer"\n• "Check DSA progress"\n• "Go to analytics"`,
    spokenResponse: "I didn't recognize that command. You can ask me to create tasks, start the timer, search notes, check DSA progress, or navigate.",
  };
}
