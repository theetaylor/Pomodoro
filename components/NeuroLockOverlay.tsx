
import React, { useState, useEffect, useRef } from 'react';

interface NeuroLockOverlayProps {
  onComplete: () => void;
  onCancel: () => void;
  durationSeconds?: number;
}

export const NeuroLockOverlay: React.FC<NeuroLockOverlayProps> = ({ 
  onComplete, 
  onCancel, 
  durationSeconds = 30 
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isResetting, setIsResetting] = useState(false);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRitual = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(durationSeconds);
    setProgress(0);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSuccess();
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => Math.min(100, prev + (100 / durationSeconds)));
    }, 1000);
  };

  const handleSuccess = () => {
    const audio = new Audio('https://actions.google.com/sounds/v1/foley/door_knock.ogg'); // Using a sharp "click" like sound
    audio.volume = 0.5;
    audio.play().catch(() => {});
    
    // Brief delay to show completion
    setTimeout(onComplete, 800);
  };

  const triggerReset = () => {
    if (isResetting) return;
    
    setIsResetting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Visual feedback for reset
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setIsResetting(false);
      startRitual();
    }, 1000);
  };

  useEffect(() => {
    startRitual();

    const handleMouseMove = (e: MouseEvent) => {
      if (lastMousePos.current) {
        const dx = Math.abs(e.clientX - lastMousePos.current.x);
        const dy = Math.abs(e.clientY - lastMousePos.current.y);
        // Sensitivity threshold: 10 pixels of movement resets it
        if (dx > 15 || dy > 15) {
          triggerReset();
        }
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerReset();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const size = 120;
  const center = size / 2;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-none transition-opacity duration-1000">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>

      {/* Ritual UI */}
      <div className="relative flex items-center justify-center transition-transform duration-500 scale-110">
        {/* Progress Ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: isResetting ? circumference : offset,
              transition: isResetting ? 'none' : 'stroke-dashoffset 1s linear'
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* The Dot */}
        <div className={`absolute w-1.5 h-1.5 bg-white rounded-full transition-all duration-300 ${isResetting ? 'scale-150 bg-rose-500' : 'scale-100'}`}>
          <div className={`absolute inset-0 bg-white rounded-full animate-ping opacity-20 ${isResetting ? 'hidden' : ''}`}></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-16 flex flex-col items-center text-center max-w-xs">
        <p className={`text-sm font-medium tracking-[0.3em] uppercase transition-all duration-500 ${isResetting ? 'text-rose-500 opacity-100' : 'text-slate-400 opacity-60'}`}>
          {isResetting ? 'Movement Detected' : 'Neuro-Lock Active'}
        </p>
        <p className={`mt-4 text-xl font-light tracking-wide text-white transition-opacity duration-700 ${isResetting ? 'opacity-20' : 'opacity-100'}`}>
          {isResetting ? 'Ritual reset. Recalibrating...' : 'Fixate on the center point. Do not move your eyes.'}
        </p>
        <div className="mt-8 h-8 flex items-center">
             <span className="text-slate-500 text-sm font-black tracking-[0.5em] tabular-nums">
               {isResetting ? '--' : timeLeft}
             </span>
        </div>
      </div>

      {/* Footer Exit */}
      <div className="absolute bottom-12 opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={onCancel}
          className="text-[10px] text-slate-500 tracking-[0.2em] uppercase border border-slate-800 px-4 py-1.5 rounded-full hover:border-slate-500 hover:text-white transition-all cursor-default"
        >
          Press ESC to abort ritual
        </button>
      </div>

      <style>{`
        @keyframes subtle-expand {
          0% { transform: scale(1); }
          100% { transform: scale(100); opacity: 0; }
        }
        .success-expand {
          animation: subtle-expand 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
