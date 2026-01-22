
import React from 'react';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  colorClass: string;
  isClutch?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, colorClass, isClutch }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const size = 300;
  const center = size / 2;
  const strokeWidth = isClutch ? 14 : 10;
  const radius = (size / 2) - (strokeWidth * 2);
  const circumference = 2 * Math.PI * radius;
  
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center mb-8">
      {isClutch && (
        <div className="absolute inset-0 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
      )}
      
      <svg 
        width="288" 
        height="288" 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-72 h-72 overflow-visible z-10"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className={isClutch ? "text-zinc-900" : "text-slate-800"}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset, 
              transition: isClutch ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
            className={`${colorClass}`}
            strokeLinecap={isClutch ? "butt" : "round"}
          />
        </g>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={`text-7xl font-light tabular-nums tracking-tighter drop-shadow-sm ${isClutch ? 'text-yellow-400 font-bold' : 'text-slate-100'}`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        {isClutch && (
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400/60 mt-2 animate-pulse">4TH QUARTER</span>
        )}
      </div>
    </div>
  );
};
