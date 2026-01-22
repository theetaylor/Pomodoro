
import React, { useState, useEffect } from 'react';
import { FeatureRequest } from '../types';

const INITIAL_FEATURES: FeatureRequest[] = [
  { id: '1', text: 'Spotify Integration for Deep Focus playlists', votes: 42, timestamp: Date.now() - 1000000, isInitial: true },
  { id: '2', text: 'Detailed productivity reports and export to PDF', votes: 28, timestamp: Date.now() - 2000000, isInitial: true },
  { id: '3', text: 'Team focused work rooms / Co-working sessions', votes: 15, timestamp: Date.now() - 3000000, isInitial: true },
];

interface FeatureBoardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureBoard: React.FC<FeatureBoardProps> = ({ isOpen, onClose }) => {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [hasVoted, setHasVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_features');
    if (saved) {
      setFeatures(JSON.parse(saved));
    } else {
      setFeatures(INITIAL_FEATURES);
    }
    
    const voted = localStorage.getItem('pomodoro_voted_features');
    if (voted) {
      setHasVoted(new Set(JSON.parse(voted)));
    }
  }, []);

  useEffect(() => {
    if (features.length > 0) {
      localStorage.setItem('pomodoro_features', JSON.stringify(features));
    }
  }, [features]);

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeature.trim()) return;

    const request: FeatureRequest = {
      id: Math.random().toString(36).substr(2, 9),
      text: newFeature.trim(),
      votes: 1,
      timestamp: Date.now()
    };

    setFeatures(prev => [request, ...prev]);
    setHasVoted(prev => {
      const next = new Set(prev).add(request.id);
      localStorage.setItem('pomodoro_voted_features', JSON.stringify(Array.from(next)));
      return next;
    });
    setNewFeature('');
  };

  const handleVote = (id: string) => {
    if (hasVoted.has(id)) return;

    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, votes: f.votes + 1 } : f
    ));
    
    setHasVoted(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem('pomodoro_voted_features', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  if (!isOpen) return null;

  const sortedFeatures = [...features].sort((a, b) => b.votes - a.votes);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-800/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Community Roadmap</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Shape the future of pomodoro.work</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-8 py-6 bg-slate-800/20">
          <form onSubmit={handleAddFeature} className="flex gap-3">
            <input 
              type="text"
              placeholder="What feature would improve your focus?"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-slate-600"
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg uppercase tracking-widest text-xs"
            >
              Suggest
            </button>
          </form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          <div className="space-y-3">
            {sortedFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="group flex items-center gap-6 p-5 bg-slate-800/30 border border-slate-800/50 rounded-3xl hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleVote(feature.id)}
                    disabled={hasVoted.has(feature.id)}
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      hasVoted.has(feature.id) 
                        ? 'bg-rose-500 text-white cursor-default' 
                        : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-rose-500/50'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-xs font-black">{feature.votes}</span>
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-slate-100 font-semibold tracking-tight">{feature.text}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {feature.isInitial && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest">Team Pick</span>
                    )}
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      {new Date(feature.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {hasVoted.has(feature.id) && (
                   <div className="text-emerald-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Voted</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
