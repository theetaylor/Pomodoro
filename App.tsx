
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SessionType, TimerSettings, SessionRecord, Task, DailyStats } from './types';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { TaskCoach } from './components/TaskCoach';
import { SettingsModal } from './components/SettingsModal';
import { HistoryPanel } from './components/HistoryPanel';
import { TaskList } from './components/TaskList';
import { ZenOverlay } from './components/ZenOverlay';
import { NeuroLockOverlay } from './components/NeuroLockOverlay';
import { Heatmap } from './components/Heatmap';
import { FAQSection } from './components/FAQSection';
import { ClutchConfirmModal } from './components/ClutchConfirmModal';

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  ritualTime: 30
};

const CLUTCH_LIMIT_PER_DAY = 2;

interface TimerState {
  timeLeft: number;
  isActive: boolean;
  isClutch?: boolean;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SessionType>(SessionType.WORK);
  const [isClutchModeEnabled, setIsClutchModeEnabled] = useState(false);
  const [showClutchConfirm, setShowClutchConfirm] = useState(false);
  const [pendingClutchAction, setPendingClutchAction] = useState<'toggle' | 'reset' | null>(null);
  
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoro_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [history, setHistory] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem('pomodoro_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime)
        }));
      } catch (e) {
        console.error("Failed to parse history", e);
        return [];
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    const saved = localStorage.getItem('pomodoro_active_task_id');
    return saved || null;
  });

  const [dailyStats, setDailyStats] = useState<Record<string, DailyStats>>(() => {
    const saved = localStorage.getItem('pomoDailyStats');
    return saved ? JSON.parse(saved) : {};
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRitualMode, setIsRitualMode] = useState(false);
  const [currentTaskInput, setCurrentTaskInput] = useState('');

  const todayKey = new Date().toLocaleDateString('en-CA');
  const todayEntry = dailyStats[todayKey] || { work: 0, short_break: 0, earned_break: 0, clutch_activations: 0 };
  const clutchUsesRemaining = Math.max(0, CLUTCH_LIMIT_PER_DAY - todayEntry.clutch_activations);

  const [timerStates, setTimerStates] = useState<Record<SessionType, TimerState>>(() => {
    const savedSettings = localStorage.getItem('pomodoro_settings');
    const s = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    return {
      [SessionType.WORK]: { timeLeft: s.workTime * 60, isActive: false },
      [SessionType.SHORT_BREAK]: { timeLeft: s.shortBreak * 60, isActive: false },
      [SessionType.EARNED_BREAK]: { timeLeft: s.longBreak * 60, isActive: false },
    };
  });

  // A clutch session is "locked" if either the toggle is ON (prep) or a clutch timer is ACTIVE.
  const isCurrentSessionClutch = timerStates[activeTab].isClutch;
  const isClutchLocked = activeTab === SessionType.WORK && (isClutchModeEnabled || isCurrentSessionClutch);
  const isVisualClutchMode = activeTab === SessionType.WORK && (isClutchModeEnabled || isCurrentSessionClutch);

  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem('pomodoro_active_task_id', activeTaskId);
    } else {
      localStorage.removeItem('pomodoro_active_task_id');
    }
  }, [activeTaskId]);

  useEffect(() => {
    localStorage.setItem('pomoDailyStats', JSON.stringify(dailyStats));
  }, [dailyStats]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getInitialTime = (type: SessionType, s: TimerSettings) => {
    switch (type) {
      case SessionType.WORK: return s.workTime * 60;
      case SessionType.SHORT_BREAK: return s.shortBreak * 60;
      case SessionType.EARNED_BREAK: return s.longBreak * 60;
    }
  };

  useEffect(() => {
    const currentState = timerStates[activeTab];
    const minutes = Math.floor(currentState.timeLeft / 60);
    const seconds = currentState.timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    let label = isVisualClutchMode && currentState.isClutch ? 'CLUTCH' : 'Focus Time';
    if (activeTab === SessionType.SHORT_BREAK) label = 'Short Break';
    if (activeTab === SessionType.EARNED_BREAK) label = 'Earned Break';

    document.title = `${isVisualClutchMode && currentState.isClutch ? '🏆 ' : ''}(${timeStr}) ${label} | Pomodoro.work`;
    
    return () => {
      document.title = 'Pomodoro.work | Focus Better';
    };
  }, [timerStates, activeTab, isVisualClutchMode]);

  const incrementClutchActivation = useCallback(() => {
    const dateKey = new Date().toLocaleDateString('en-CA');
    setDailyStats(prev => {
      const current = prev[dateKey] || { work: 0, short_break: 0, earned_break: 0, clutch_activations: 0 };
      return {
        ...prev,
        [dateKey]: {
          ...current,
          clutch_activations: current.clutch_activations + 1
        }
      };
    });
  }, []);

  const handleSessionComplete = useCallback((type: SessionType) => {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {});

    const explicitTask = tasks.find(t => t.id === activeTaskId)?.text;
    const fallbackTask = tasks.find(t => !t.completed)?.text;
    const taskText = explicitTask || fallbackTask;

    const currentIsClutch = timerStates[type].isClutch;

    const newRecord: SessionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      startTime: new Date(Date.now() - (getInitialTime(type, settings) * 1000)),
      endTime: new Date(),
      completed: true,
      task: type === SessionType.WORK ? taskText : undefined,
      isClutch: currentIsClutch
    };

    setHistory(prev => [newRecord, ...prev]);

    const dateKey = new Date().toLocaleDateString('en-CA');
    setDailyStats(prev => {
      const current = prev[dateKey] || { work: 0, short_break: 0, earned_break: 0, clutch_activations: 0 };
      
      const updated = {
        ...current,
        work: type === SessionType.WORK ? current.work + 1 : current.work,
        short_break: type === SessionType.SHORT_BREAK ? current.short_break + 1 : current.short_break,
        earned_break: type === SessionType.EARNED_BREAK ? current.earned_break + 1 : current.earned_break,
      };

      return { ...prev, [dateKey]: updated };
    });

    setTimerStates(prev => ({
      ...prev,
      [type]: { 
        timeLeft: getInitialTime(type, settings), 
        isActive: false,
        isClutch: false 
      }
    }));
  }, [settings, tasks, timerStates, activeTaskId]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimerStates(prev => {
        const next = { ...prev };
        let stateChanged = false;

        Object.keys(next).forEach((key) => {
          const type = key as SessionType;
          if (next[type].isActive) {
            if (next[type].timeLeft > 0) {
              next[type] = { ...next[type], timeLeft: next[type].timeLeft - 1 };
              stateChanged = true;
            } else {
              handleSessionComplete(type);
              stateChanged = true;
            }
          }
        });

        return stateChanged ? next : prev;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleSessionComplete]);

  const toggleTimer = () => {
    const currentState = timerStates[activeTab];
    const isStoppingClutch = currentState.isActive && currentState.isClutch;

    if (isStoppingClutch) {
      setPendingClutchAction('toggle');
      setShowClutchConfirm(true);
      return;
    }

    const startingNewSession = !currentState.isActive;
    const willBeClutch = startingNewSession && isClutchModeEnabled && activeTab === SessionType.WORK;

    if (willBeClutch && clutchUsesRemaining <= 0) {
      alert("Daily limit for Clutch Mode reached (2/2). Rest up for tomorrow.");
      return;
    }

    if (willBeClutch) {
      incrementClutchActivation();
    }

    setTimerStates(prev => {
      const current = prev[activeTab];
      return {
        ...prev,
        [activeTab]: { 
          ...current, 
          isActive: !current.isActive,
          isClutch: willBeClutch || current.isClutch
        }
      };
    });
    
    // Once started, disable the toggle prep state
    if (startingNewSession && willBeClutch) {
      setIsClutchModeEnabled(false);
    }
  };

  const resetTimer = () => {
    const currentState = timerStates[activeTab];
    if (currentState.isActive && currentState.isClutch) {
      setPendingClutchAction('reset');
      setShowClutchConfirm(true);
      return;
    }

    setTimerStates(prev => ({
      ...prev,
      [activeTab]: { 
        timeLeft: getInitialTime(activeTab, settings), 
        isActive: false,
        isClutch: false
      }
    }));
  };

  const handleClutchSurrender = () => {
    if (pendingClutchAction === 'toggle') {
      setTimerStates(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          timeLeft: getInitialTime(activeTab, settings),
          isActive: false,
          isClutch: false
        }
      }));
    } else if (pendingClutchAction === 'reset') {
      setTimerStates(prev => ({
        ...prev,
        [activeTab]: { 
          timeLeft: getInitialTime(activeTab, settings), 
          isActive: false,
          isClutch: false
        }
      }));
    }
    setShowClutchConfirm(false);
    setPendingClutchAction(null);
    setIsClutchModeEnabled(false);
  };

  const startRitual = () => {
    if (isClutchModeEnabled && clutchUsesRemaining <= 0) {
      alert("Daily limit for Clutch Mode reached (2/2). Rest up for tomorrow.");
      return;
    }
    setIsRitualMode(true);
  };

  const completeRitual = () => {
    if (isClutchModeEnabled) {
      incrementClutchActivation();
    }
    setIsRitualMode(false);
    setTimerStates(prev => ({
      ...prev,
      [activeTab]: { 
        ...prev[activeTab], 
        isActive: true,
        isClutch: isClutchModeEnabled
      }
    }));
    setIsClutchModeEnabled(false);
  };

  const skipTimer = () => {
    handleSessionComplete(activeTab);
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    setTimerStates(prev => {
      const next = { ...prev };
      Object.values(SessionType).forEach(type => {
        if (!next[type].isActive) {
          next[type] = { ...next[type], timeLeft: getInitialTime(type, newSettings) };
        }
      });
      return next;
    });
  };

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTaskInput.trim()) {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        text: currentTaskInput.trim(),
        completed: false
      };
      setTasks(prev => [...prev, newTask]);
      if (tasks.length === 0) setActiveTaskId(newTask.id);
      setCurrentTaskInput('');
    }
  };

  const shuffleTasks = () => {
    setTasks(prev => {
      const newTasks = [...prev];
      for (let i = newTasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newTasks[i], newTasks[j]] = [newTasks[j], newTasks[i]];
      }
      return newTasks;
    });
  };

  const moveTask = (id: string, direction: 'up' | 'down') => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === -1) return prev;
      const newTasks = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newTasks.length) return prev;
      [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
      return newTasks;
    });
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(tasks.find(t => t.id !== id && !t.completed)?.id || null);
    }
  };

  const getThemeColor = (type: SessionType) => {
    if (isVisualClutchMode) return 'bg-yellow-400';
    switch (type) {
      case SessionType.WORK: return 'bg-rose-500';
      case SessionType.SHORT_BREAK: return 'bg-teal-500';
      case SessionType.EARNED_BREAK: return 'bg-sky-500';
    }
  };

  const getActiveTabColorClass = () => {
    if (isVisualClutchMode) return 'text-yellow-400';
    switch (activeTab) {
      case SessionType.WORK: return 'text-rose-500';
      case SessionType.SHORT_BREAK: return 'text-teal-500';
      case SessionType.EARNED_BREAK: return 'text-sky-500';
    }
  };

  const getBgColor = () => {
    if (isVisualClutchMode) return 'bg-black';
    switch (activeTab) {
      case SessionType.WORK: return 'bg-rose-900/10';
      case SessionType.SHORT_BREAK: return 'bg-teal-900/10';
      case SessionType.EARNED_BREAK: return 'bg-sky-900/10';
    }
  };

  const handleRefresh = () => {
    localStorage.clear();
    window.location.reload();
  };

  const currentCoachTask = tasks.find(t => t.id === activeTaskId && !t.completed)?.text || tasks.find(t => !t.completed)?.text;

  return (
    <div className={`min-h-screen ${getBgColor()} transition-colors duration-1000 flex flex-col items-center py-12 px-4 relative`}>
      
      {isZenMode && (
        <ZenOverlay 
          timeLeft={timerStates[activeTab].timeLeft} 
          onExit={() => setIsZenMode(false)} 
        />
      )}

      {isRitualMode && (
        <NeuroLockOverlay 
          onComplete={completeRitual}
          onCancel={() => setIsRitualMode(false)}
          durationSeconds={settings.ritualTime}
        />
      )}

      <ClutchConfirmModal 
        isOpen={showClutchConfirm}
        onConfirm={handleClutchSurrender}
        onCancel={() => { setShowClutchConfirm(false); setPendingClutchAction(null); }}
        limit={CLUTCH_LIMIT_PER_DAY}
      />

      <header className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
        <h1 
          onClick={handleRefresh}
          className="text-2xl font-bold tracking-tight text-slate-100 cursor-pointer hover:opacity-80 transition-opacity select-none"
        >
          pomodoro<span className={getActiveTabColorClass()}>.work</span>
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsZenMode(true)}
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all border border-slate-700 group"
            title="Zen Mode (Esc)"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all border border-slate-700"
            title="Open Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="w-full max-w-xl flex flex-col items-center gap-8 relative z-10">
        <div className={`w-full ${isVisualClutchMode ? 'bg-zinc-950 border-yellow-400/50' : 'bg-slate-800/80'} backdrop-blur-2xl border rounded-3xl p-8 pb-10 flex flex-col items-center shadow-2xl relative overflow-hidden transition-all duration-700`}>
          <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl mb-8">
            {Object.values(SessionType).map((type) => (
              <button
                key={type}
                disabled={isClutchLocked}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === type 
                    ? `${getThemeColor(type)} ${isVisualClutchMode ? 'text-black font-black' : 'text-white'} shadow-lg` 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                } ${isClutchLocked && type !== SessionType.WORK ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={isClutchLocked && type !== SessionType.WORK ? "Break sessions locked during 4th Quarter" : ""}
              >
                {type === SessionType.WORK ? 'Focus' : 
                 type === SessionType.SHORT_BREAK ? 'Short Break' : 'Earned Break'}
                {timerStates[type].isActive && (
                   <span className={`absolute -top-1 -right-1 w-2 h-2 ${isVisualClutchMode ? 'bg-yellow-400' : 'bg-white'} rounded-full animate-ping`}></span>
                )}
              </button>
            ))}
          </div>

          <TimerDisplay 
            timeLeft={timerStates[activeTab].timeLeft} 
            totalTime={getInitialTime(activeTab, settings)}
            colorClass={getActiveTabColorClass()}
            isClutch={isVisualClutchMode && isCurrentSessionClutch}
          />

          <div className="w-full flex flex-col items-center gap-6 mb-4">
            {activeTab === SessionType.WORK && (
              <button 
                onClick={timerStates[activeTab].isActive ? undefined : startRitual}
                className={`group flex items-center justify-center gap-3 px-10 py-3.5 rounded-2xl transition-all shadow-xl relative overflow-hidden ${
                  timerStates[activeTab].isActive 
                    ? (isVisualClutchMode 
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 cursor-default shadow-none' 
                        : 'bg-rose-500/20 text-rose-500 border border-rose-500/30 cursor-default shadow-none')
                    : (isVisualClutchMode 
                        ? 'bg-yellow-400 text-black font-black hover:brightness-110 active:scale-95' 
                        : 'bg-rose-500 text-white hover:brightness-110 active:scale-95')
                }`}
              >
                {!timerStates[activeTab].isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                <svg className={`w-5 h-5 ${!timerStates[activeTab].isActive ? 'group-hover:rotate-12 transition-transform' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   {timerStates[activeTab].isActive ? (
                     // CLOSED LOCK
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   ) : (
                     // OPEN LOCK
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                   )}
                </svg>
                <span className="font-black uppercase tracking-[0.2em] text-xs">
                  {timerStates[activeTab].isActive ? 'Locked In' : 'Lock-in'}
                </span>
              </button>
            )}

            <Controls 
              isActive={timerStates[activeTab].isActive} 
              onToggle={toggleTimer} 
              onReset={resetTimer} 
              onSkip={skipTimer}
              themeColor={getThemeColor(activeTab)}
              isClutchModeEnabled={isClutchModeEnabled}
              onClutchToggle={() => setIsClutchModeEnabled(!isClutchModeEnabled)}
              currentIsClutch={isCurrentSessionClutch}
              clutchUsesRemaining={clutchUsesRemaining}
              showClutchToggle={activeTab === SessionType.WORK}
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="What are you working on today? (Hit Enter to add)"
            value={currentTaskInput}
            onChange={(e) => setCurrentTaskInput(e.target.value)}
            onKeyDown={handleAddTask}
            className={`w-full ${isVisualClutchMode ? 'bg-zinc-950 border-yellow-400/20 focus:ring-yellow-400/50' : 'bg-slate-800/80 border-slate-700 focus:ring-rose-500/50'} border rounded-2xl px-6 py-4 text-lg focus:outline-none transition-all placeholder:text-slate-500 text-slate-100 shadow-inner`}
          />
          
          <TaskList 
            tasks={tasks} 
            activeTaskId={activeTaskId}
            onToggleTask={toggleTask} 
            onDeleteTask={deleteTask}
            onShuffleTasks={shuffleTasks}
            onMoveTask={moveTask}
            onReorderTasks={reorderTasks}
            onSelectTask={setActiveTaskId}
            clutchMode={isVisualClutchMode}
          />

          {currentTaskInput || tasks.length > 0 ? (
            <TaskCoach task={currentCoachTask || ""} />
          ) : null}
        </div>

        <HistoryPanel history={history} />
        
        <div className={`w-full ${isVisualClutchMode ? 'bg-zinc-950 border-yellow-400/20' : 'bg-slate-800/50 border-slate-700'} border rounded-2xl p-6 flex flex-col gap-4 shadow-lg backdrop-blur-md`}>
           <div className="flex items-center justify-between">
              <h4 className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Today's Output</h4>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest">{todayKey}</span>
           </div>
           <div className="flex gap-2">
              <div className={`flex-1 ${isVisualClutchMode ? 'bg-yellow-400/5 border-yellow-400/10' : 'bg-rose-500/10 border-rose-500/20'} border rounded-xl p-3 flex flex-col items-center`}>
                 <span className={`${isVisualClutchMode ? 'text-yellow-400' : 'text-rose-500'} text-xl font-black`}>{todayEntry.work}</span>
                 <span className={`text-[8px] ${isVisualClutchMode ? 'text-yellow-400/60' : 'text-rose-400'} uppercase font-black tracking-widest mt-1`}>Focus</span>
              </div>
              <div className="flex-1 bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 flex flex-col items-center">
                 <span className="text-teal-500 text-xl font-black">{todayEntry.short_break}</span>
                 <span className={`text-[8px] text-teal-400 uppercase font-black tracking-widest mt-1`}>Short Break</span>
              </div>
              <div className="flex-1 bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 flex flex-col items-center">
                 <span className="text-sky-500 text-xl font-black">{todayEntry.earned_break}</span>
                 <span className={`text-[8px] text-sky-400 uppercase font-black tracking-widest mt-1`}>Earned Break</span>
              </div>
           </div>
        </div>

        <Heatmap stats={dailyStats} />

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          settings={settings} 
          onSave={updateSettings} 
        />

        <FAQSection />
      </main>

      <footer className="mt-auto pt-12 text-slate-500 text-sm font-medium relative z-10">
        &copy; {new Date().getFullYear()} pomodoro.work — built for focus.
      </footer>
    </div>
  );
};

export default App;
