
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onShuffleTasks?: () => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  onReorderTasks: (startIndex: number, endIndex: number) => void;
  onSelectTask: (id: string) => void;
  clutchMode?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  activeTaskId,
  onToggleTask, 
  onDeleteTask, 
  onShuffleTasks,
  onMoveTask,
  onReorderTasks,
  onSelectTask,
  clutchMode
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (tasks.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Add a visual ghosting effect by setting a data transfer image if needed, 
    // but the default browser behavior is fine for this clean UI.
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderTasks(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex justify-between items-center px-1 mb-1">
        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] select-none">Current Backlog</h4>
        <div className="flex gap-2">
          {tasks.length > 1 && onShuffleTasks && (
            <button 
              onClick={onShuffleTasks}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${clutchMode ? 'bg-zinc-900 border-yellow-400/20 hover:border-yellow-400/50 text-yellow-400' : 'bg-slate-800/40 border-slate-700 hover:border-rose-500/30 hover:bg-slate-800 text-slate-400 hover:text-rose-400'} transition-all text-[10px] font-black uppercase tracking-widest group`}
            >
              <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Randomize
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task, index) => {
          const isActive = activeTaskId === task.id;
          const isBeingDragged = draggedIndex === index;
          const isBeingDraggedOver = dragOverIndex === index;

          return (
            <div 
              key={task.id}
              draggable={!task.completed} // Only uncompleted tasks are draggable for cleaner UX
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectTask(task.id)}
              className={`flex items-center gap-3 p-4 border rounded-2xl transition-all group shadow-sm cursor-pointer relative ${
                task.completed ? 'bg-slate-900/20 border-emerald-500/10 opacity-40' : 
                isActive 
                  ? `${clutchMode ? 'bg-yellow-400/5 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-rose-500/5 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}` 
                  : `${clutchMode ? 'bg-zinc-950 border-yellow-400/10 hover:border-yellow-400/30' : 'bg-slate-800/60 border-slate-700 hover:border-slate-500/50'}`
              } ${isBeingDragged ? 'opacity-30 border-dashed scale-95' : ''} ${
                isBeingDraggedOver && !isBeingDragged ? (clutchMode ? 'border-t-yellow-400 border-t-2' : 'border-t-rose-500 border-t-2') : ''
              }`}
            >
              {/* Drag Handle */}
              {!task.completed && (
                <div 
                  className={`cursor-grab active:cursor-grabbing p-1 -ml-2 text-slate-600 hover:text-slate-400 transition-colors`}
                  title="Drag to reorder"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              )}

              {/* Checkbox */}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  task.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-600 hover:border-emerald-500 text-transparent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <span className={`text-slate-100 transition-all font-medium truncate ${task.completed ? 'line-through text-slate-600' : ''} ${isActive ? (clutchMode ? 'text-yellow-400' : 'text-rose-400') : ''}`}>
                  {task.text}
                </span>
                {isActive && !task.completed && (
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 ${clutchMode ? 'text-yellow-400/60' : 'text-rose-500/60'}`}>Active Task</span>
                )}
              </div>

              {/* Controls (Hidden unless hovered) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Traditional Move buttons kept for accessibility, but minimized */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveTask(task.id, 'up'); }}
                  disabled={index === 0}
                  className={`p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-all hidden sm:flex ${index === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-all ml-1"
                  title="Delete Task"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
