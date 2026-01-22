
import React from 'react';

interface ControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  themeColor: string;
  isClutchModeEnabled: boolean;
  onClutchToggle: () => void;
  currentIsClutch?: boolean;
  clutchUsesRemaining: number;
  showClutchToggle: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  isActive, 
  onToggle, 
  onReset, 
  onSkip, 
  themeColor, 
  isClutchModeEnabled, 
  onClutchToggle,
  currentIsClutch,
  clutchUsesRemaining,
  showClutchToggle
}) => {
  const isClutchActive = isActive && currentIsClutch;
  const limitReached = clutchUsesRemaining <= 0;

  return (
    <div className="flex items-center justify-between w-full max-w-xs sm:max-w-md gap-4">
      {/* LEFT: RESET BUTTON */}
      <div className="flex-1 flex justify-end">
        {!isClutchActive ? (
          <button 
            onClick={onReset}
            className="p-4 text-slate-500 hover:text-slate-100 transition-colors group"
            title="Reset Timer"
          >
            <svg className="w-7 h-7 group-hover:rotate-[-45deg] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : (
          <div className="w-14" /> /* Spacer when hidden */
        )}
      </div>

      {/* CENTER: POWER COLUMN (PLAY + CLUTCH) */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <button
            onClick={onToggle}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${themeColor === 'bg-yellow-400' ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 text-black border-4 border-yellow-100/30' : 'bg-rose-500 text-white'} ${themeColor} hover:brightness-110 ring-8 ring-transparent hover:ring-slate-800/50 z-10 relative`}
          >
            {isActive ? (
              isClutchActive ? (
                /* Stop/Quit Icon for Clutch Mode */
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              ) : (
                /* Standard Pause Icon */
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )
            ) : (
              /* Standard Play Icon */
              <svg className="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {isClutchActive && (
            <div className="absolute inset-0 w-28 h-28 rounded-full bg-yellow-400/20 blur-xl animate-pulse -z-0"></div>
          )}
        </div>

        {showClutchToggle && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex flex-col items-center">
              <button 
                onClick={onClutchToggle}
                disabled={isActive || (limitReached && !isClutchModeEnabled)}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all group ${
                  isClutchModeEnabled 
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-200 border-yellow-100 text-black shadow-[0_0_20px_rgba(251,191,36,0.6)]' 
                    : limitReached 
                      ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-slate-800/50 border-amber-400/40 text-amber-500 hover:text-yellow-400 hover:border-yellow-400/60 shadow-[0_0_10px_rgba(251,191,36,0.1)]'
                } ${isActive ? 'opacity-30 cursor-not-allowed scale-90' : ''}`}
                title={
                  isActive 
                    ? "Cannot change mode while timer is running" 
                    : limitReached && !isClutchModeEnabled 
                      ? "Daily Clutch limit reached" 
                      : isClutchModeEnabled 
                        ? "4th Quarter Mode Enabled" 
                        : "Enable 4th Quarter Mode"
                }
              >
                <span className={`text-xl font-black leading-none ${isClutchModeEnabled ? 'scale-110' : 'group-hover:scale-110'} transition-transform drop-shadow-sm ${isClutchModeEnabled ? 'text-black' : 'text-amber-500'}`}>
                  {clutchUsesRemaining}
                </span>
              </button>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isClutchModeEnabled ? 'text-yellow-400' : 'text-slate-600'}`}>
              {isClutchModeEnabled ? '4th Quarter' : 'Clutch'}
            </span>
          </div>
        )}
      </div>

      {/* RIGHT: SKIP BUTTON */}
      <div className="flex-1 flex justify-start">
        {!isClutchActive ? (
          <button 
            onClick={onSkip}
            className="p-4 text-slate-500 hover:text-slate-100 transition-colors group"
            title="Skip Session"
          >
            <svg className="w-7 h-7 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-14" /> /* Spacer when hidden */
        )}
      </div>
    </div>
  );
};
