
import React, { useState } from 'react';
import { TimerSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const ritualOptions = [30, 60, 90];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest text-[10px]">Session Lengths (minutes)</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/30">
                <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Focus</span>
                <input
                  type="number"
                  min="1"
                  value={localSettings.workTime}
                  onChange={(e) => setLocalSettings({...localSettings, workTime: parseInt(e.target.value) || 1})}
                  className="w-full bg-transparent text-xl font-semibold text-slate-100 focus:outline-none"
                />
              </div>
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/30">
                <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Short</span>
                <input
                  type="number"
                  min="1"
                  value={localSettings.shortBreak}
                  onChange={(e) => setLocalSettings({...localSettings, shortBreak: parseInt(e.target.value) || 1})}
                  className="w-full bg-transparent text-xl font-semibold text-slate-100 focus:outline-none"
                />
              </div>
              <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/30">
                <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Earned</span>
                <input
                  type="number"
                  min="1"
                  value={localSettings.longBreak}
                  onChange={(e) => setLocalSettings({...localSettings, longBreak: parseInt(e.target.value) || 1})}
                  className="w-full bg-transparent text-xl font-semibold text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest text-[10px]">Ritual Configuration</label>
            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Deep Focus Countdown</p>
              </div>
              <div className="flex gap-2">
                {ritualOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setLocalSettings({ ...localSettings, ritualTime: option })}
                    className={`px-4 py-1.5 rounded-xl border transition-all text-sm font-bold tracking-tight ${
                      localSettings.ritualTime === option
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
            className="w-full bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl hover:bg-white active:scale-[0.98] transition-all mt-4 shadow-xl"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};