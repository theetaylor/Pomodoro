
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className={`text-sm font-bold uppercase tracking-wider transition-colors ${isOpen ? 'text-rose-500' : 'text-slate-300 group-hover:text-slate-100'}`}>
          {question}
        </span>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
      >
        <div className="text-slate-400 text-sm leading-relaxed font-medium">
          {answer}
        </div>
      </div>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  return (
    <div className="w-full mt-12 bg-slate-800/80 border border-slate-700 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
      <div className="mb-8">
        <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mb-2">What's Going On Here?</h3>
      </div>

      <div className="flex flex-col">
        <FAQItem 
          question="What is the Pomodoro Technique?" 
          answer="The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. It's designed to reduce the impact of internal and external interruptions on focus and flow."
        />
        <FAQItem 
          question="What is lock-in mode?" 
          answer={
            <>
              Lock-in mode (Neuro-Lock) is a cognitive priming ritual designed to physically anchor your attention. By fixating your gaze on a central point while remaining completely still, you trigger a physiological shift that transitions your brain from a scattered state into one of deep concentration. 
              <a 
                href="https://ai.hubermanlab.com/s/9yTJ8zYb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-1 text-rose-500 hover:text-rose-400 font-bold underline decoration-rose-500/30 underline-offset-4 transition-colors"
              >
                Learn more about the science of focus
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>.
            </>
          }
        />
        <FAQItem 
          question="What is Clutch Mode?" 
          answer="Clutch Mode (our '4th Quarter' mode) is a high-stakes focus session designed for when you absolutely must deliver. You only get two activations per day, so use them wisely. When active, the UI hardens: break types are locked out until completion, and quitting triggers a 'surrender' confirmation. It is designed to build the mental resilience required to perform under pressure."
        />
        <FAQItem 
          question="What is Zen Mode?" 
          answer="Zen Mode (found in the upper right by the Settings button) is our extreme focus interface. It strips away the entire UI, leaving only a massive, high-contrast timer in the center of your screen. By removing all visual noise—including tasks, stats, and headers—it creates a digital environment that demands singular attention."
        />
        <FAQItem 
          question="What is the focus heat map, and how it works?" 
          answer="The Focus Momentum heat map is a visual representation of your consistency over the year. Each square represents a single day. As you complete more work sessions, the color of the day transitions from a deep, muted rose to a bright, vibrant crimson. The subtle 'FOCUS' watermark in the background serves as a visual anchor—a reminder of the mental clarity you are building day by day."
        />
        <FAQItem 
          question="Why use the Task Randomizer?" 
          answer="If you're feeling overwhelmed by a long list of tasks, analysis paralysis can prevent you from starting at all. The randomizer takes the burden of choice off your shoulders, giving you a clear reason to just pick one thing and get moving. Movement is the best cure for procrastination."
        />
        <FAQItem 
          question="Why an 'Earned Break' instead of a Long Break?" 
          answer="Language matters. By reframing a long break as 'Earned', we reinforce the psychological reward for completing a cycle of deep work. It shifts the mindset from 'taking time off' to 'recovering for the next peak performance'."
        />
      </div>
    </div>
  );
};
