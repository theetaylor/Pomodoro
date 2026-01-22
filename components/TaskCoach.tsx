
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice } from '../types';

interface TaskCoachProps {
  task: string;
}

export const TaskCoach: React.FC<TaskCoachProps> = ({ task }) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (!task || task.length < 5) return;
      
      setLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `I am working on this task: "${task}". Give me a short productivity tip, a strategy for the next 25 minutes, and a mantra to stay focused.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                tip: { type: Type.STRING },
                strategy: { type: Type.STRING },
                focusMantra: { type: Type.STRING }
              },
              required: ['tip', 'strategy', 'focusMantra']
            }
          }
        });

        const data = JSON.parse(response.text);
        setAdvice(data);
      } catch (error) {
        console.error("AI Coach Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAdvice, 1500);
    return () => clearTimeout(debounceTimer);
  }, [task]);

  if (loading) return (
    <div className="w-full p-4 bg-slate-900/30 border border-slate-800 rounded-2xl animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-800 rounded w-1/2"></div>
    </div>
  );

  if (!advice) return null;

  return (
    <div className="w-full p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-rose-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-1">Focus Strategy</p>
          <p className="text-slate-300 italic">"{advice.strategy}"</p>
        </div>
      </div>
      
      <div className="pt-3 border-t border-rose-500/10">
        <p className="text-xs text-slate-500 uppercase font-medium mb-1">Pro Tip</p>
        <p className="text-sm text-slate-400">{advice.tip}</p>
      </div>

      <div className="text-center py-2 px-4 bg-rose-500/5 rounded-lg">
        <p className="text-xs text-rose-400 font-bold uppercase tracking-[0.2em]">{advice.focusMantra}</p>
      </div>
    </div>
  );
};
