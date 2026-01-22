
import React from 'react';
import { SessionRecord, SessionType } from '../types';

interface HistoryPanelProps {
  history: SessionRecord[];
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs">Activity History</h3>
        <span className="text-slate-500 text-xs font-semibold">{history.length} sessions completed</span>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((record) => (
          <div 
            key={record.id}
            className={`border rounded-xl p-4 flex items-center justify-between group transition-all shadow-sm ${
              record.isClutch 
                ? 'bg-zinc-950 border-yellow-400/30 hover:border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.05)]' 
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                record.isClutch ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                record.type === SessionType.WORK ? 'bg-rose-500' : 
                record.type === SessionType.SHORT_BREAK ? 'bg-teal-500' : 'bg-sky-500'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${record.isClutch ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {record.task || (record.type === SessionType.WORK ? 'Deep Work' : 'Break Session')}
                  </p>
                  {record.isClutch && (
                    <span className="text-yellow-400" title="Clutch Session Champion">🏆</span>
                  )}
                </div>
                <p className="text-slate-500 text-xs font-semibold">
                  {record.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className={`text-xs font-bold tracking-tight ${record.isClutch ? 'text-yellow-400/70' : 'text-slate-400'}`}>
              {record.type.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
