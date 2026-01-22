
import React, { useMemo, useState } from 'react';
import { DailyStats } from '../types';

interface DayData {
  count: number;
  date: Date;
}

interface HeatmapProps {
  stats: Record<string, DailyStats | number>;
}

export const Heatmap: React.FC<HeatmapProps> = ({ stats }) => {
  // 0 = Jan-Jun, 1 = Jul-Dec
  const [viewIndex, setViewIndex] = useState(() => {
    const month = new Date().getMonth();
    return month > 5 ? 1 : 0;
  });

  const currentYear = new Date().getFullYear();

  /**
   * Identifies if a specific grid coordinate is part of the 'FOCUS' watermark.
   */
  const isFocusPixel = (colIndex: number, rowIndex: number): boolean => {
    const startCol = 4; 
    const c = colIndex - startCol;
    const r = rowIndex;

    // F (Relative Column 0-2)
    if (c >= 0 && c <= 2) {
      if (c === 0) return true;
      if (r === 0 || r === 3) return true;
    }
    // O (Relative Column 4-6)
    if (c >= 4 && c <= 6) {
      if (c === 4 || c === 6) return true;
      if (r === 0 || r === 6) return true;
    }
    // C (Relative Column 8-10)
    if (c >= 8 && c <= 10) {
      if (c === 8) return true;
      if (r === 0 || r === 6) return true;
    }
    // U (Relative Column 12-14)
    if (c >= 12 && c <= 14) {
      if (c === 12 || c === 14) return true;
      if (r === 6) return true;
    }
    // S (Relative Column 16-18)
    if (c >= 16 && c <= 18) {
      if (r === 0 || r === 3 || r === 6) return true;
      if (c === 16 && r < 3) return true;
      if (c === 18 && r > 3) return true;
    }
    return false;
  };

  const dataForYear = useMemo(() => {
    const dayList: DayData[] = [];
    
    const startOfYear = new Date(currentYear, 0, 1);
    const startDate = new Date(startOfYear);
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const endOfYear = new Date(currentYear, 11, 31);
    const endDate = new Date(endOfYear);
    while (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toLocaleDateString('en-CA');
      const entry = stats[dateKey];
      
      // Extract focus/work count only for heatmap visualization
      const workCount = (typeof entry === 'object' && entry !== null)
        ? entry.work
        : (typeof entry === 'number' ? entry : 0);

      dayList.push({
        date: new Date(current),
        count: workCount
      });
      current.setDate(current.getDate() + 1);
    }
    
    return dayList;
  }, [stats, currentYear]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const allWeeks = useMemo(() => {
    const result: DayData[][] = [];
    for (let i = 0; i < dataForYear.length; i += 7) {
      const week = dataForYear.slice(i, i + 7);
      if (week.length > 0) result.push(week);
    }
    return result;
  }, [dataForYear]);

  const visibleWeeks = useMemo(() => {
    const half = Math.ceil(allWeeks.length / 2);
    return viewIndex === 0 ? allWeeks.slice(0, half) : allWeeks.slice(half);
  }, [allWeeks, viewIndex]);

  const getColorClass = (count: number, col: number, row: number) => {
    if (count > 0) {
      if (count <= 2) return 'bg-rose-900';
      if (count <= 5) return 'bg-rose-700';
      return 'bg-rose-500';
    }
    if (isFocusPixel(col, row)) {
      return 'bg-slate-400/20';
    }
    return 'bg-slate-900/40';
  };

  return (
    <div className="w-full mt-2 relative">
      <div className="flex justify-between items-center mb-5">
        <div className="flex flex-col">
          <h3 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
            Focus Momentum
            <span className="bg-rose-500 text-white text-[7px] px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
          </h3>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/50">
            {viewIndex === 0 ? 'Jan — Jun' : 'Jul — Dec'} {currentYear}
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setViewIndex(0)}
              disabled={viewIndex === 0}
              className={`p-1.5 rounded-lg transition-all ${viewIndex === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setViewIndex(1)}
              disabled={viewIndex === 1}
              className={`p-1.5 rounded-lg transition-all ${viewIndex === 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-6 pb-2 relative shadow-2xl transition-all duration-500 hover:border-rose-500/20">
        <div className="flex gap-1 justify-start">
          <div className="flex gap-1 min-w-max px-2">
            {/* Day labels (Y-axis) */}
            <div className="flex flex-col gap-1.5 mr-4 text-[9px] text-slate-600 font-black uppercase select-none sticky left-0 bg-slate-900/0 backdrop-blur-sm pr-2 z-10">
              <div className="h-4"></div>
              <div className="h-3 flex items-center">S</div>
              <div className="h-3 flex items-center">M</div>
              <div className="h-3 flex items-center">T</div>
              <div className="h-3 flex items-center">W</div>
              <div className="h-3 flex items-center">T</div>
              <div className="h-3 flex items-center">F</div>
              <div className="h-3 flex items-center">S</div>
            </div>

            {/* Grid columns */}
            <div className="flex gap-1">
              {visibleWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1.5 shrink-0">
                  <div className="h-4 text-[8px] text-slate-600 font-bold select-none text-center flex items-center justify-center">
                    {week[0].date.getDate() <= 7 ? months[week[0].date.getMonth()] : ''}
                  </div>
                  {week.map((day, dayIndex) => {
                    const isOutsideYear = day.date.getFullYear() !== currentYear;
                    const count = day.count;
                    
                    return (
                      <div
                        key={dayIndex}
                        title={isOutsideYear ? '' : `${day.date.toLocaleDateString()}: ${count} session${count !== 1 ? 's' : ''}`}
                        className={`w-3 h-3 rounded-[2px] transition-all duration-500 ${
                          isOutsideYear 
                            ? 'bg-transparent' 
                            : getColorClass(count, weekIndex, dayIndex)
                        } ${
                          !isOutsideYear && count > 0 ? 'shadow-[0_0_8px_rgba(244,63,94,0.15)] scale-110 z-10' : ''
                        } ${!isOutsideYear ? 'hover:scale-150 cursor-crosshair' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 mb-4 select-none">
          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mr-2">Intensity</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-[1px] bg-slate-900/40" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-rose-900" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-rose-700" />
            <div className="w-2.5 h-2.5 rounded-[1px] bg-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
