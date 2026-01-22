
import React from 'react';

interface ClutchConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  limit: number;
}

export const ClutchConfirmModal: React.FC<ClutchConfirmModalProps> = ({ isOpen, onConfirm, onCancel, limit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onCancel} />
      
      <div className="relative w-full max-w-sm bg-zinc-950 border-2 border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-[0_0_60px_rgba(250,204,21,0.25)] animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.4)]">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h2 className="text-yellow-400 text-2xl font-black uppercase tracking-tighter mb-4 px-2">
          Stay Focused?
        </h2>
        
        <p className="text-slate-200 text-lg font-medium leading-relaxed mb-6 px-2">
          It is the fourth quarter. We need you to be clutch. Are you sure?
        </p>

        <div className="mb-8 p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 w-full">
          <p className="text-xs text-yellow-400 font-black uppercase tracking-[0.2em]">
            Daily Activation Limit: {limit}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Quitting results in a loss.
          </p>
        </div>

        <div className="flex flex-col w-full gap-4">
          <button 
            onClick={onCancel}
            className="w-full py-5 bg-yellow-400 text-black font-black rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg uppercase tracking-widest text-xs"
          >
            Stay Focused
          </button>
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-600 hover:text-rose-500 hover:border-rose-500/50 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
          >
            Give Up
          </button>
        </div>
      </div>
    </div>
  );
};
