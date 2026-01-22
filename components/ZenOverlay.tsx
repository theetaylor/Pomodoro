
import React, { useState, useEffect } from 'react';

interface ZenOverlayProps {
  timeLeft: number;
  onExit: () => void;
}

export const ZenOverlay: React.FC<ZenOverlayProps> = ({ timeLeft, onExit }) => {
  const [isHintVisible, setIsHintVisible] = useState(true);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Hide hint after 5 seconds
    const timer = setTimeout(() => {
      setIsHintVisible(false);
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none">
      {/* Large Timer - Dead centered */}
      <div className="text-[12rem] font-extralight text-white tabular-nums tracking-tighter leading-none select-none">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>

      {/* Simplified Hint - Positioned absolutely below the timer so it doesn't shift layout */}
      {isHintVisible && (
        <div 
          className="absolute top-[calc(50%+8rem)] text-slate-500 font-medium text-2xl tracking-wide select-none pointer-events-none animate-hint-fade"
        >
          Press esc to exit your zen
        </div>
      )}
      
      {/* Subtle Exit Button (reveals on hover near bottom) */}
      <button 
        onClick={onExit}
        className="absolute bottom-12 px-6 py-2 text-slate-500 hover:text-white border border-slate-800 hover:border-white rounded-full transition-all opacity-0 hover:opacity-100 cursor-default"
      >
        Exit Zen Mode (Esc)
      </button>

      <style>{`
        /* Simplified animation: straight fade in -> hold -> fade out */
        @keyframes hint-fade {
          0% { opacity: 0; transform: translateY(5px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }

        .animate-hint-fade {
          animation: hint-fade 5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
